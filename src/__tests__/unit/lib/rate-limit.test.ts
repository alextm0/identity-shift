/**
 * Unit Tests for Rate Limiting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, enforceRateLimit } from '@/lib/rate-limit';
import { RateLimitError } from '@/lib/errors';

describe('rate limiting', () => {
  beforeEach(() => {
    // Rate limit store is in-memory, so we need to wait for cleanup
    // In a real scenario, you might want to expose a reset function
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('test-user', 10, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should track multiple requests', () => {
      const identifier = 'test-user-2';
      
      // First request
      const result1 = checkRateLimit(identifier, 10, 60000);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(9);
      
      // Second request
      const result2 = checkRateLimit(identifier, 10, 60000);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(8);
    });

    it('should deny requests exceeding limit', () => {
      const identifier = 'test-user-3';
      const limit = 3;
      
      // Make requests up to limit
      for (let i = 0; i < limit; i++) {
        const result = checkRateLimit(identifier, limit, 60000);
        expect(result.allowed).toBe(true);
      }
      
      // Next request should be denied
      const result = checkRateLimit(identifier, limit, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-user-4';
      const limit = 2;
      const windowMs = 100; // Very short window for testing
      
      // Make requests up to limit
      checkRateLimit(identifier, limit, windowMs);
      checkRateLimit(identifier, limit, windowMs);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, windowMs + 10));
      
      // Should be allowed again
      const result = checkRateLimit(identifier, limit, windowMs);
      expect(result.allowed).toBe(true);
    });
  });

  describe('enforceRateLimit', () => {
    it('should not throw when limit not exceeded', () => {
      expect(() => {
        enforceRateLimit('test-user-5', 10, 60000);
      }).not.toThrow();
    });

    it('should throw RateLimitError when limit exceeded', () => {
      const identifier = 'test-user-6';
      const limit = 2;
      
      // Make requests up to limit
      enforceRateLimit(identifier, limit, 60000);
      enforceRateLimit(identifier, limit, 60000);
      
      // Next request should throw
      expect(() => {
        enforceRateLimit(identifier, limit, 60000);
      }).toThrow(RateLimitError);
    });

    it('should include reset time in error message', () => {
      const identifier = 'test-user-7';
      const limit = 1;
      
      enforceRateLimit(identifier, limit, 60000);
      
      try {
        enforceRateLimit(identifier, limit, 60000);
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).message).toContain('seconds');
      }
    });
  });
});

