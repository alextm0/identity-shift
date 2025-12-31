/**
 * Integration Tests for Review Actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createWeeklyReviewAction, 
  updateWeeklyReviewAction,
  createMonthlyReviewAction,
  updateMonthlyReviewAction 
} from '@/actions/reviews';
import { getRequiredSession } from '@/lib/auth/server';
import { 
  createWeeklyReview, 
  getWeeklyReviewById,
  updateWeeklyReview,
  createMonthlyReview,
  getMonthlyReviewById,
  updateMonthlyReview
} from '@/data-access/reviews';
import { getSprintById } from '@/data-access/sprints';
import { createMockSprint, createMockWeeklyReview, createMockMonthlyReview } from '@/__tests__/mocks/db';
import { NotFoundError } from '@/lib/errors';
import { OneChangeOption } from '@/lib/enums';

// Valid UUIDs for testing
const TEST_SPRINT_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

// Mock dependencies
vi.mock('@/lib/auth/server', async () => {
  const actual = await vi.importActual('@/lib/auth/server');
  return {
    ...actual,
    getRequiredSession: vi.fn(),
  };
});
vi.mock('@/data-access/reviews');
vi.mock('@/data-access/sprints');
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('createWeeklyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: TEST_USER_ID },
    } as any);
  });

  it('should create a weekly review successfully', async () => {
    const sprint = createMockSprint({ id: TEST_SPRINT_ID, userId: TEST_USER_ID });
    vi.mocked(getSprintById).mockResolvedValue(sprint);
    vi.mocked(createWeeklyReview).mockResolvedValue([]);

    const formData = {
      sprintId: TEST_SPRINT_ID,
      weekEndDate: new Date('2024-01-14'),
      progressRatios: { 'priority-1': 0.8 },
      evidenceRatio: 75,
      antiBullshitScore: 80,
      alerts: ['Low energy detected'],
      oneChange: OneChangeOption.KEEP_SAME,
      changeReason: 'Everything is working well',
    };

    const result = await createWeeklyReviewAction(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBeDefined();
    }
    expect(createWeeklyReview).toHaveBeenCalled();
  });

  it('should sanitize alert messages', async () => {
    const sprint = createMockSprint({ id: TEST_SPRINT_ID, userId: TEST_USER_ID });
    vi.mocked(getSprintById).mockResolvedValue(sprint);
    vi.mocked(createWeeklyReview).mockResolvedValue([]);

    const formData = {
      sprintId: TEST_SPRINT_ID,
      weekEndDate: new Date('2024-01-14'),
      progressRatios: { 'priority-1': 0.8 },
      evidenceRatio: 75,
      antiBullshitScore: 80,
      alerts: ['<script>alert("xss")</script>Valid alert'],
      oneChange: OneChangeOption.KEEP_SAME,
    };

    await createWeeklyReviewAction(formData);

    const createCall = vi.mocked(createWeeklyReview).mock.calls[0][0];
    expect((createCall.alerts as string[])[0]).not.toContain('<script>');
  });
});

describe('updateWeeklyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should update a weekly review successfully', async () => {
    const existingReview = createMockWeeklyReview({ id: 'review-1', userId: 'user-1' });
    vi.mocked(getWeeklyReviewById).mockResolvedValue(existingReview);
    vi.mocked(updateWeeklyReview).mockResolvedValue([]);

    const updateAction = updateWeeklyReviewAction('review-1');
    const result = await updateAction({
      oneChange: OneChangeOption.ADD_RECOVERY,
      changeReason: 'Need more rest',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('review-1');
    }
    expect(updateWeeklyReview).toHaveBeenCalled();
  });

  it('should throw NotFoundError when review does not exist', async () => {
    vi.mocked(getWeeklyReviewById).mockResolvedValue(undefined);

    const updateAction = updateWeeklyReviewAction('non-existent');
    
    await expect(updateAction({
      oneChange: OneChangeOption.KEEP_SAME,
    })).rejects.toThrow(NotFoundError);
  });
});

describe('createMonthlyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: TEST_USER_ID },
    } as any);
  });

  it('should create a monthly review successfully', async () => {
    const sprint = createMockSprint({ id: TEST_SPRINT_ID, userId: TEST_USER_ID });
    vi.mocked(getSprintById).mockResolvedValue(sprint);
    vi.mocked(createMonthlyReview).mockResolvedValue([]);

    const formData = {
      sprintId: TEST_SPRINT_ID,
      month: '2024-01',
      whoWereYou: 'I was focused and disciplined',
      desiredIdentity: 'yes' as const,
      perceivedProgress: { 'priority-1': 7 },
      actualProgress: { progressRatio: 0.7, evidenceRatio: 70 },
      oneChange: 'Continue with current approach',
    };

    const result = await createMonthlyReviewAction(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBeDefined();
    }
    expect(createMonthlyReview).toHaveBeenCalled();
  });
});

describe('updateMonthlyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should update a monthly review successfully', async () => {
    const existingReview = createMockMonthlyReview({ id: 'monthly-1', userId: 'user-1' });
    vi.mocked(getMonthlyReviewById).mockResolvedValue(existingReview);
    vi.mocked(updateMonthlyReview).mockResolvedValue([]);

    const updateAction = updateMonthlyReviewAction('monthly-1');
    const result = await updateAction({
      oneChange: 'Updated change for next month',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('monthly-1');
    }
    expect(updateMonthlyReview).toHaveBeenCalled();
  });

  it('should throw NotFoundError when review does not exist', async () => {
    vi.mocked(getMonthlyReviewById).mockResolvedValue(undefined);

    const updateAction = updateMonthlyReviewAction('non-existent');
    
    await expect(updateAction({
      oneChange: 'Test change',
    })).rejects.toThrow(NotFoundError);
  });
});

