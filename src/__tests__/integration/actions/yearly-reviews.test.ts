/**
 * Integration Tests for Yearly Review Actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getOrCreateYearlyReviewAction,
  saveYearlyReviewProgressAction,
  completeYearlyReviewAction,
  hasCompletedYearlyReviewAction,
  editYearlyReviewAction,
  deleteYearlyReviewAction
} from '@/actions/yearly-reviews';
import { getRequiredSession } from '@/lib/auth/server';
import {
  getOrCreateYearlyReview,
  getYearlyReviewById,
  updateYearlyReview,
  completeYearlyReview,
  getCompletedYearlyReview,
  deleteYearlyReview
} from '@/data-access/yearly-reviews';
import { NotFoundError } from '@/lib/errors';
import type { YearlyReview } from '@/lib/types';

// Mock dependencies
vi.mock('@/lib/auth/server', async () => {
  const actual = await vi.importActual('@/lib/auth/server');
  return {
    ...actual,
    getRequiredSession: vi.fn(),
  };
});
vi.mock('@/data-access/yearly-reviews');
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

function createMockYearlyReview(overrides?: Partial<YearlyReview>): YearlyReview {
  return {
    id: 'yearly-review-1',
    userId: 'user-1',
    year: 2025,
    status: 'draft',
    currentStep: 1,
    wheelRatings: null,
    wheelWins: null,
    wheelGaps: null,
    wins: null,
    otherDetails: null,
    completedAt: null,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    ...overrides,
  };
}

describe('getOrCreateYearlyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should return existing yearly review', async () => {
    const existingReview = createMockYearlyReview({
      id: 'review-1',
      currentStep: 2,
      status: 'draft',
    });
    vi.mocked(getOrCreateYearlyReview).mockResolvedValue(existingReview);

    const result = await getOrCreateYearlyReviewAction(2025);

    expect(result.success).toBe(true);
    expect(result.data?.reviewId).toBe('review-1');
    expect(result.data?.currentStep).toBe(2);
    expect(result.data?.status).toBe('draft');
  });

  it('should create new yearly review if none exists', async () => {
    const newReview = createMockYearlyReview({
      id: 'new-review',
      currentStep: 1,
      status: 'draft',
    });
    vi.mocked(getOrCreateYearlyReview).mockResolvedValue(newReview);

    const result = await getOrCreateYearlyReviewAction(2025);

    expect(result.success).toBe(true);
    expect(result.data?.reviewId).toBe('new-review');
    expect(result.data?.currentStep).toBe(1);
  });
});

describe('saveYearlyReviewProgressAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should save yearly review progress successfully', async () => {
    const existingReview = createMockYearlyReview({ id: 'review-1' });
    vi.mocked(getYearlyReviewById).mockResolvedValue(existingReview);
    vi.mocked(updateYearlyReview).mockResolvedValue(undefined);

    const saveAction = saveYearlyReviewProgressAction('review-1');
    const result = await saveAction({
      wheelRatings: {
        health: 7,
        training: 6,
        mental: 8,
        learning: 5,
        technical: 9,
        creativity: 6,
        relationships: 7,
        income: 5,
      },
      currentStep: 2,
    });

    expect(result.success).toBe(true);
    expect(result.data?.reviewId).toBe('review-1');
    expect(updateYearlyReview).toHaveBeenCalled();
  });

  it('should throw NotFoundError when review does not exist', async () => {
    vi.mocked(getYearlyReviewById).mockResolvedValue(undefined);

    const saveAction = saveYearlyReviewProgressAction('non-existent');

    await expect(saveAction({
      currentStep: 2,
    })).rejects.toThrow(NotFoundError);
  });

  it('should sanitize text inputs', async () => {
    const existingReview = createMockYearlyReview({ id: 'review-1' });
    vi.mocked(getYearlyReviewById).mockResolvedValue(existingReview);
    vi.mocked(updateYearlyReview).mockResolvedValue(undefined);

    const saveAction = saveYearlyReviewProgressAction('review-1');
    await saveAction({
      otherDetails: '<script>alert("xss")</script>Good decision',
      wins: ['<b>Win 1</b>', 'Win 2'],
    });

    expect(updateYearlyReview).toHaveBeenCalled();
    const updateCall = vi.mocked(updateYearlyReview).mock.calls[0];
    expect(updateCall[2].otherDetails).not.toContain('<script>');
  });
});

describe('completeYearlyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should complete yearly review successfully', async () => {
    const existingReview = createMockYearlyReview({ id: 'review-1', status: 'draft' });
    vi.mocked(getYearlyReviewById).mockResolvedValue(existingReview);
    vi.mocked(updateYearlyReview).mockResolvedValue(undefined);
    vi.mocked(completeYearlyReview).mockResolvedValue({ ...existingReview, status: 'completed' });

    const completeAction = completeYearlyReviewAction('review-1');
    const result = await completeAction({
      wheelRatings: {
        health: 7,
        training: 6,
        mental: 8,
        learning: 5,
        technical: 9,
        creativity: 6,
        relationships: 7,
        income: 5,
      },
      wins: ['Achieved goal 1', 'Learned new skill', 'Built good habits'],
      currentStep: 3,
    });

    expect(result.success).toBe(true);
    expect(result.data?.reviewId).toBe('review-1');
    expect(updateYearlyReview).toHaveBeenCalledWith(
      'review-1',
      'user-1',
      expect.objectContaining({ status: 'completed' })
    );
  });

  it('should throw NotFoundError when review does not exist', async () => {
    vi.mocked(getYearlyReviewById).mockResolvedValue(undefined);

    const completeAction = completeYearlyReviewAction('non-existent');

    await expect(completeAction({
      wheelRatings: {
        health: 5,
        training: 5,
        mental: 5,
        learning: 5,
        technical: 5,
        creativity: 5,
        relationships: 5,
        income: 5,
      },
      wins: ['Test win'],
      currentStep: 3,
    })).rejects.toThrow(NotFoundError);
  });
});

describe('hasCompletedYearlyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should return true when review is completed', async () => {
    const completedReview = createMockYearlyReview({ status: 'completed' });
    vi.mocked(getCompletedYearlyReview).mockResolvedValue(completedReview);

    const result = await hasCompletedYearlyReviewAction(2025);

    expect(result.success).toBe(true);
    expect(result.data?.hasCompleted).toBe(true);
  });

  it('should return false when no completed review exists', async () => {
    vi.mocked(getCompletedYearlyReview).mockResolvedValue(undefined);

    const result = await hasCompletedYearlyReviewAction(2025);

    expect(result.success).toBe(true);
    expect(result.data?.hasCompleted).toBe(false);
  });
});

describe('editYearlyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should unlock review for editing', async () => {
    const completedReview = createMockYearlyReview({ id: 'review-1', status: 'completed' });
    vi.mocked(getYearlyReviewById).mockResolvedValue(completedReview);
    vi.mocked(updateYearlyReview).mockResolvedValue(undefined);

    const result = await editYearlyReviewAction('review-1');

    expect(result.success).toBe(true);
    expect(result.data?.reviewId).toBe('review-1');
    expect(updateYearlyReview).toHaveBeenCalledWith(
      'review-1',
      'user-1',
      expect.objectContaining({ status: 'draft' })
    );
  });

  it('should throw NotFoundError when review does not exist', async () => {
    vi.mocked(getYearlyReviewById).mockResolvedValue(undefined);

    await expect(editYearlyReviewAction('non-existent')).rejects.toThrow(NotFoundError);
  });
});

describe('deleteYearlyReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRequiredSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as any);
  });

  it('should delete yearly review successfully', async () => {
    const existingReview = createMockYearlyReview({ id: 'review-1' });
    vi.mocked(getYearlyReviewById).mockResolvedValue(existingReview);
    vi.mocked(deleteYearlyReview).mockResolvedValue(undefined);

    const result = await deleteYearlyReviewAction('review-1');

    expect(result.success).toBe(true);
    expect(deleteYearlyReview).toHaveBeenCalledWith('review-1', 'user-1');
  });

  it('should throw NotFoundError when review does not exist', async () => {
    vi.mocked(getYearlyReviewById).mockResolvedValue(undefined);

    await expect(deleteYearlyReviewAction('non-existent')).rejects.toThrow(NotFoundError);
  });
});

