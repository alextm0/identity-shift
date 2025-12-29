/**
 * Database Mocks
 * 
 * Provides mocked database functions for testing
 */

import { vi } from 'vitest';
import type { DailyLog, Sprint, SprintWithPriorities, Planning, WeeklyReview, MonthlyReview, YearlyReview } from '@/lib/types';

// Mock the database module
export const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  limit: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
};

// Mock data factories
export function createMockDailyLog(overrides?: Partial<DailyLog>): DailyLog {
  return {
    id: 'log-1',
    userId: 'user-1',
    sprintId: 'sprint-1',
    date: new Date('2024-01-15'),
    energy: 3,
    sleepHours: 7,
    mainFocusCompleted: true,
    morningGapMin: 30,
    distractionMin: 15,
    priorities: {
      'priority-1': { done: true, units: 5 },
    },
    proofOfWork: [],
    win: 'Test win',
    drain: null,
    note: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    ...overrides,
  };
}

export function createMockSprint(overrides?: Partial<SprintWithPriorities>): SprintWithPriorities {
  return {
    id: 'sprint-1',
    userId: 'user-1',
    name: 'Test Sprint',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-14'),
    priorities: [
      {
        key: 'priority-1',
        label: 'Test Priority',
        type: 'habit' as const,
        weeklyTargetUnits: 5,
      },
    ],
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockPlanning(overrides?: Partial<Planning>): Planning {
  return {
    id: 'planning-1',
    userId: 'user-1',
    year: new Date().getFullYear() + 1,
    futureIdentity: 'I am becoming the person who achieves their goals',
    goals: [],
    annualGoals: [],
    wheelOfLife: {
      healthEnergy: 5,
      physical: 5,
      mental: 5,
    },
    status: 'draft',
    currentModule: 1,
    currentStep: 1,
    currentGoalIndex: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockWeeklyReview(overrides?: Partial<WeeklyReview>): WeeklyReview {
  return {
    id: 'review-1',
    userId: 'user-1',
    sprintId: 'sprint-1',
    weekEndDate: new Date('2024-01-14'),
    progressRatios: {
      'priority-1': 0.8,
    },
    evidenceRatio: 75,
    antiBullshitScore: 80,
    alerts: [],
    oneChange: 'KEEP_SAME',
    changeReason: null,
    createdAt: new Date('2024-01-14'),
    ...overrides,
  };
}

export function createMockMonthlyReview(overrides?: Partial<MonthlyReview>): MonthlyReview {
  return {
    id: 'monthly-review-1',
    userId: 'user-1',
    sprintId: 'sprint-1',
    month: '2024-01',
    whoWereYou: null,
    desiredIdentity: null,
    perceivedProgress: {
      'priority-1': 7,
    },
    actualProgress: {
      progressRatio: 0.7,
      evidenceRatio: 70,
    },
    oneChange: null,
    createdAt: new Date('2024-01-31'),
    ...overrides,
  };
}

export function createMockYearlyReview(overrides?: Partial<YearlyReview>): YearlyReview {
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

