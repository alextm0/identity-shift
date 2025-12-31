/**
 * Integration Tests for Sprint Actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startSprintAction, closeSprintAction } from '@/actions/sprints';
import { getRequiredSession } from '@/lib/auth/server';
import { createSprint, deactivateAllSprints, getSprintById, closeSprintById } from '@/data-access/sprints';
import { createMockSprint, createMockSprintWithPriorities } from '@/__tests__/mocks/db';
import { NotFoundError } from '@/lib/errors';
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
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('startSprintAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as unknown as { user: { id: string } });
  });

  it('should create a new sprint successfully', async () => {
    const newSprint = createMockSprintWithPriorities({ id: 'sprint-1' });
    vi.mocked(deactivateAllSprints).mockResolvedValue([]);
    vi.mocked(createSprint).mockResolvedValue(newSprint);

    const formData = {
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      goals: [
        {
          goalId: '550e8400-e29b-41d4-a716-446655440000',
          goalText: 'Health Goal',
          promises: [
            {
              text: 'Gym',
              type: 'daily' as const,
              scheduleDays: [1, 3, 5],
            },
          ],
        },
      ],
    };

    const result = await startSprintAction(formData);

    expect(result.success).toBe(true);
    expect(deactivateAllSprints).toHaveBeenCalledWith('user-1');
    expect(createSprint).toHaveBeenCalled();
  });

  it('should deactivate existing active sprint before creating new one', async () => {
    const newSprint = createMockSprintWithPriorities({ id: 'sprint-2' });
    vi.mocked(deactivateAllSprints).mockResolvedValue([]);
    vi.mocked(createSprint).mockResolvedValue(newSprint);

    const formData = {
      name: 'New Sprint',
      startDate: '2024-01-15',
      endDate: '2024-01-28',
      goals: [
        {
          goalId: '550e8400-e29b-41d4-a716-446655440000',
          goalText: 'Work Goal',
          promises: [
            {
              text: 'Focus session',
              type: 'daily' as const,
              scheduleDays: [1, 2, 3, 4, 5],
            },
          ],
        },
      ],
    };

    await startSprintAction(formData);

    expect(deactivateAllSprints).toHaveBeenCalled();
    expect(createSprint).toHaveBeenCalled();
  });
});

describe('closeSprintAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as unknown as { user: { id: string } });
  });

  it('should close a sprint successfully', async () => {
    const sprint = createMockSprint({ id: 'sprint-1', active: true });
    vi.mocked(getSprintById).mockResolvedValue(sprint as SprintWithDetails);
    vi.mocked(closeSprintById).mockResolvedValue([{ ...sprint, active: false }]);

    await closeSprintAction('sprint-1');

    expect(closeSprintById).toHaveBeenCalledWith('sprint-1', 'user-1');
  });

  it('should throw NotFoundError when sprint does not exist', async () => {
    vi.mocked(getSprintById).mockResolvedValue(undefined);

    await expect(closeSprintAction('non-existent')).rejects.toThrow(NotFoundError);
  });
});

