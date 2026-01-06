/**
 * Unit Tests for Rate Limiting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitError } from '@/lib/errors';

// 1. Define the mock store
const mockStore = new Map<string, any>();

// 2. Mock Drizzle/DB dependencies
vi.mock('@/lib/db/schema', () => ({
  rateLimit: {
    key: 'key',
    count: 'count',
    resetAt: 'resetAt',
  }
}));

vi.mock('drizzle-orm', () => ({
  eq: (col: any, val: any) => ({ col, val }),
  sql: (strings: any, ...args: any[]) => 'SQL_MOCK',
}));

vi.mock('@/lib/db', () => {
  return {
    db: {
      select: () => ({
        from: () => ({
          where: (condition: any) => ({
            limit: async () => {
              const key = condition.val;
              const entry = mockStore.get(key);
              return entry ? [entry] : [];
            }
          })
        })
      }),
      insert: () => ({
        values: (vals: any) => ({
          onConflictDoUpdate: (config: any) => ({
            returning: async () => {
              const now = Date.now();
              const existing = mockStore.get(vals.key);

              let entry;
              if (existing) {
                // Handle update case with CASE logic
                const isExpired = existing.resetAt < now;
                entry = {
                  key: vals.key,
                  count: isExpired ? 1 : existing.count + 1,
                  resetAt: isExpired ? vals.resetAt : existing.resetAt
                };
              } else {
                // Handle insert case
                entry = {
                  key: vals.key,
                  count: vals.count,
                  resetAt: vals.resetAt
                };
              }

              mockStore.set(vals.key, entry);
              return [entry];
            }
          })
        })
      }),
      update: () => ({
        set: (vals: any) => ({
          where: async (condition: any) => {
            const key = condition.val;
            const entry = mockStore.get(key);
            if (entry) {
              mockStore.set(key, { ...entry, count: entry.count + 1 });
            }
          }
        })
      })
    }
  };
});

// 3. Import the module under test
import { checkRateLimit, enforceRateLimit } from '@/lib/rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const result = await checkRateLimit('test-user', 10, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should track multiple requests', async () => {
      const identifier = 'test-user-2';

      // First request
      const result1 = await checkRateLimit(identifier, 10, 60000);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(9);

      // Second request
      const result2 = await checkRateLimit(identifier, 10, 60000);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(8);
    });

    it('should deny requests exceeding limit', async () => {
      const identifier = 'test-user-3';
      const limit = 3;

      // Make requests up to limit
      for (let i = 0; i < limit; i++) {
        const result = await checkRateLimit(identifier, limit, 60000);
        expect(result.allowed).toBe(true);
      }

      // Next request should be denied
      const result = await checkRateLimit(identifier, limit, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-user-4';
      const limit = 2;
      const windowMs = 100; // Very short window for testing

      // Make requests up to limit
      await checkRateLimit(identifier, limit, windowMs);
      await checkRateLimit(identifier, limit, windowMs);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, windowMs + 10));

      // Should be allowed again
      const result = await checkRateLimit(identifier, limit, windowMs);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(limit - 1);
    });
  });

  describe('enforceRateLimit', () => {
    it('should not throw when limit not exceeded', async () => {
      await expect(enforceRateLimit('test-user-5', 10, 60000)).resolves.not.toThrow();
    });

    it('should throw RateLimitError when limit exceeded', async () => {
      const identifier = 'test-user-6';
      const limit = 2;

      // Make requests up to limit
      await enforceRateLimit(identifier, limit, 60000);
      await enforceRateLimit(identifier, limit, 60000);

      // Next request should throw
      await expect(enforceRateLimit(identifier, limit, 60000)).rejects.toThrow(RateLimitError);
    });

    it('should include reset time in error message', async () => {
      const identifier = 'test-user-7';
      const limit = 1;

      await enforceRateLimit(identifier, limit, 60000);

      try {
        await enforceRateLimit(identifier, limit, 60000);
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).message).toContain('seconds');
      }
    });
  });
});

