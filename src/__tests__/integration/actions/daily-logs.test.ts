/**
 * Integration Tests for Daily Logs Actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveDailyLogAction, deleteDailyLogAction, updateDailyLogByIdAction } from '@/actions/daily-logs';
import { getRequiredSession } from '@/lib/auth/server';
import { getActiveSprint } from '@/data-access/sprints';
import { upsertDailyLog, getDailyLogById, deleteDailyLog, getTodayLogBySprintId } from '@/data-access/daily-logs';
import { createMockDailyLog, createMockSprint } from '@/__tests__/mocks/db';
import { BusinessRuleError, NotFoundError } from '@/lib/errors';

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
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('saveDailyLogAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should save a new daily log successfully', async () => {
    const activeSprint = createMockSprint({ id: 'sprint-1' });
    vi.mocked(getActiveSprint).mockResolvedValue(activeSprint);
    vi.mocked(getTodayLogBySprintId).mockResolvedValue(undefined);
    vi.mocked(upsertDailyLog).mockResolvedValue([createMockDailyLog()]);

    const formData = {
      date: new Date('2024-01-15'),
      energy: 3,
      mainFocusCompleted: true,
      priorities: {
        'priority-1': { done: true, units: 5 },
      },
      proofOfWork: [],
    };

    const result = await saveDailyLogAction(formData);

    expect(result.success).toBe(true);
    expect(result.message).toContain('successfully');
    expect(upsertDailyLog).toHaveBeenCalled();
  });

  it('should throw BusinessRuleError when no active sprint exists', async () => {
    vi.mocked(getActiveSprint).mockResolvedValue(undefined);

    const formData = {
      date: new Date('2024-01-15'),
      energy: 3,
      mainFocusCompleted: true,
      priorities: {},
      proofOfWork: [],
    };

    await expect(saveDailyLogAction(formData)).rejects.toThrow(BusinessRuleError);
  });

  it('should update existing log when log for date already exists', async () => {
    const activeSprint = createMockSprint({ id: 'sprint-1' });
    const existingLog = createMockDailyLog({ id: 'log-1' });
    
    vi.mocked(getActiveSprint).mockResolvedValue(activeSprint);
    vi.mocked(getTodayLogBySprintId).mockResolvedValue(existingLog);
    vi.mocked(upsertDailyLog).mockResolvedValue([existingLog]);

    const formData = {
      date: new Date('2024-01-15'),
      energy: 4,
      mainFocusCompleted: true,
      priorities: {},
      proofOfWork: [],
    };

    const result = await saveDailyLogAction(formData);

    expect(result.success).toBe(true);
    expect(upsertDailyLog).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'log-1',
      })
    );
  });
});

describe('deleteDailyLogAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should delete a daily log successfully', async () => {
    const log = createMockDailyLog({ id: 'log-1' });
    vi.mocked(getDailyLogById).mockResolvedValue(log);
    vi.mocked(deleteDailyLog).mockResolvedValue([log]);

    await deleteDailyLogAction('log-1');

    expect(deleteDailyLog).toHaveBeenCalledWith('log-1', 'user-1');
  });

  it('should throw NotFoundError when log does not exist', async () => {
    vi.mocked(getDailyLogById).mockResolvedValue(undefined);

    await expect(deleteDailyLogAction('non-existent')).rejects.toThrow(NotFoundError);
  });
});

describe('updateDailyLogByIdAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should update a daily log successfully', async () => {
    const existingLog = createMockDailyLog({ id: 'log-1', sprintId: 'sprint-1' });
    vi.mocked(getDailyLogById).mockResolvedValue(existingLog);
    vi.mocked(upsertDailyLog).mockResolvedValue([existingLog]);

    const formData = {
      date: new Date('2024-01-15'),
      energy: 4,
      mainFocusCompleted: true,
      priorities: {},
      proofOfWork: [],
    };

    const result = await updateDailyLogByIdAction('log-1', formData);

    expect(result.success).toBe(true);
    expect(upsertDailyLog).toHaveBeenCalled();
  });

  it('should throw NotFoundError when log does not exist', async () => {
    vi.mocked(getDailyLogById).mockResolvedValue(undefined);

    const formData = {
      date: new Date('2024-01-15'),
      energy: 3,
      mainFocusCompleted: true,
      priorities: {},
      proofOfWork: [],
    };

    await expect(updateDailyLogByIdAction('non-existent', formData)).rejects.toThrow(NotFoundError);
  });
});

