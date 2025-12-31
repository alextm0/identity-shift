/**
 * Integration Tests for Daily Logs Actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveDailyAuditAction, deleteDailyLogAction } from '@/actions/daily-logs';
import { getRequiredSession } from '@/lib/auth/server';
import { getActiveSprint } from '@/data-access/sprints';
import { saveDailyAudit, getDailyLogById, deleteDailyLog } from '@/data-access/daily-logs';
import { createMockDailyLog, createMockSprint } from '@/__tests__/mocks/db';
import { BusinessRuleError, NotFoundError } from '@/lib/errors';
import { SprintWithDetails } from '@/lib/types';

// Mock dependencies
vi.mock('@/lib/auth/server', async () => {
  const actual = await vi.importActual('@/lib/auth/server');
  return {
    ...actual,
    getRequiredSession: vi.fn(),
  };
});
vi.mock('@/data-access/sprints');
vi.mock('@/data-access/daily-logs');
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{}]),
  },
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('saveDailyAuditAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as unknown as { user: { id: string } });
  });

  it('should save a new daily audit successfully', async () => {
    const activeSprint = createMockSprint({
      id: VALID_UUID,
      goals: [
        {
          id: VALID_UUID,
          sprintId: VALID_UUID,
          goalId: VALID_UUID,
          goalText: 'Test Goal',
          sortOrder: 0,
          promises: []
        } as unknown as SprintWithDetails['goals'][number]
      ]
    });
    vi.mocked(getActiveSprint).mockResolvedValue(activeSprint);
    vi.mocked(saveDailyAudit).mockResolvedValue('log-1');

    const formData = {
      date: new Date('2024-01-15'),
      energy: 3,
      mainGoalId: VALID_UUID,
      promiseCompletions: {
        [VALID_UUID]: true,
      },
    };

    const result = await saveDailyAuditAction(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toContain('successfully');
    }
    expect(saveDailyAudit).toHaveBeenCalled();
  });

  it('should throw error when no active sprint exists', async () => {
    vi.mocked(getActiveSprint).mockResolvedValue(undefined);

    const formData = {
      date: new Date('2024-01-15'),
      energy: 3,
      mainGoalId: VALID_UUID,
      promiseCompletions: {},
    };

    await expect(saveDailyAuditAction(formData)).rejects.toThrow(BusinessRuleError);
  });
});

describe('deleteDailyLogAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as unknown as { user: { id: string } });
  });

  it('should delete a daily log successfully', async () => {
    const log = createMockDailyLog({ id: 'log-1' });
    vi.mocked(getDailyLogById).mockResolvedValue(log);
    vi.mocked(deleteDailyLog).mockResolvedValue([log]);

    await deleteDailyLogAction(VALID_UUID);

    expect(deleteDailyLog).toHaveBeenCalledWith(VALID_UUID, 'user-1');
  });

  it('should throw NotFoundError when log does not exist', async () => {
    vi.mocked(getDailyLogById).mockResolvedValue(undefined);

    await expect(deleteDailyLogAction(VALID_UUID)).rejects.toThrow(NotFoundError);
  });
});

