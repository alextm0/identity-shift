/**
 * Unit Tests for Validators
 */

import { describe, it, expect } from 'vitest';
import {
  GoalSchema,
  SprintPrioritySchema,
  DailyLogFormSchema,
  SprintFormSchema,
  PlanningFormSchema,
  WeeklyReviewFormSchema,
  MonthlyReviewFormSchema,
} from '@/lib/validators';
import { SprintPriorityType, OneChangeOption } from '@/lib/enums';

describe('GoalSchema', () => {
  it('should validate a valid goal', () => {
    const goal = {
      area: 'Health',
      outcome: 'Lose 10 pounds',
      why: 'To feel better',
    };
    expect(() => GoalSchema.parse(goal)).not.toThrow();
  });

  it('should require area', () => {
    const goal = {
      outcome: 'Lose 10 pounds',
      why: 'To feel better',
    };
    expect(() => GoalSchema.parse(goal)).toThrow();
  });

  it('should require outcome', () => {
    const goal = {
      area: 'Health',
      why: 'To feel better',
    };
    expect(() => GoalSchema.parse(goal)).toThrow();
  });

  it('should require why', () => {
    const goal = {
      area: 'Health',
      outcome: 'Lose 10 pounds',
    };
    expect(() => GoalSchema.parse(goal)).toThrow();
  });

  it('should accept optional deadline', () => {
    const goal = {
      area: 'Health',
      outcome: 'Lose 10 pounds',
      why: 'To feel better',
      deadline: '2024-12-31',
    };
    expect(() => GoalSchema.parse(goal)).not.toThrow();
  });
});

describe('SprintPrioritySchema', () => {
  it('should validate a valid priority', () => {
    const priority = {
      key: 'priority-1',
      label: 'Exercise',
      type: SprintPriorityType.HABIT,
      weeklyTargetUnits: 5,
    };
    expect(() => SprintPrioritySchema.parse(priority)).not.toThrow();
  });

  it('should require label', () => {
    const priority = {
      key: 'priority-1',
      type: SprintPriorityType.HABIT,
      weeklyTargetUnits: 5,
    };
    expect(() => SprintPrioritySchema.parse(priority)).toThrow();
  });

  it('should require weeklyTargetUnits to be at least 1', () => {
    const priority = {
      key: 'priority-1',
      label: 'Exercise',
      type: SprintPriorityType.HABIT,
      weeklyTargetUnits: 0,
    };
    expect(() => SprintPrioritySchema.parse(priority)).toThrow();
  });

  it('should accept optional unitDefinition', () => {
    const priority = {
      key: 'priority-1',
      label: 'Exercise',
      type: SprintPriorityType.HABIT,
      weeklyTargetUnits: 5,
      unitDefinition: '30 minutes',
    };
    expect(() => SprintPrioritySchema.parse(priority)).not.toThrow();
  });
});

describe('DailyLogFormSchema', () => {
  it('should validate a valid daily log', () => {
    const log = {
      date: new Date(),
      mainGoalId: '550e8400-e29b-41d4-a716-446655440000',
      energy: 3,
      promiseCompletions: {
        'promise-1': true,
      },
    };
    expect(() => DailyLogFormSchema.parse(log)).not.toThrow();
  });

  it('should require mainGoalId', () => {
    const log = {
      date: new Date(),
      energy: 3,
      promiseCompletions: {},
    };
    expect(() => DailyLogFormSchema.parse(log)).toThrow();
  });

  it('should validate energy between 1 and 5', () => {
    const log = {
      date: new Date(),
      mainGoalId: '550e8400-e29b-41d4-a716-446655440000',
      energy: 0,
      promiseCompletions: {},
    };
    expect(() => DailyLogFormSchema.parse(log)).toThrow();

    const log2 = {
      date: new Date(),
      mainGoalId: '550e8400-e29b-41d4-a716-446655440000',
      energy: 6,
      promiseCompletions: {},
    };
    expect(() => DailyLogFormSchema.parse(log2)).toThrow();
  });

  it('should accept optional note and blockerTag', () => {
    const log = {
      date: new Date(),
      mainGoalId: '550e8400-e29b-41d4-a716-446655440000',
      energy: 3,
      blockerTag: 'energy',
      note: 'Some notes',
      promiseCompletions: {},
    };
    expect(() => DailyLogFormSchema.parse(log)).not.toThrow();
  });
});

describe('SprintFormSchema', () => {
  it('should validate a valid sprint', () => {
    const sprint = {
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
    expect(() => SprintFormSchema.parse(sprint)).not.toThrow();
  });

  it('should require at least one goal', () => {
    const sprint = {
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      goals: [],
    };
    expect(() => SprintFormSchema.parse(sprint)).toThrow();
  });

  it('should limit to maximum 3 goals', () => {
    const sprint = {
      name: 'Test Sprint',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      goals: Array(4).fill({
        goalId: '550e8400-e29b-41d4-a716-446655440000',
        goalText: 'Goal',
        promises: [{ text: 'Promise', type: 'daily', scheduleDays: [1] }],
      }),
    };
    expect(() => SprintFormSchema.parse(sprint)).toThrow();
  });

  it('should require name to be at least 3 characters', () => {
    const sprint = {
      name: 'Te',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      goals: [
        {
          goalId: '550e8400-e29b-41d4-a716-446655440000',
          goalText: 'Health Goal',
          promises: [{ text: 'Gym', type: 'daily', scheduleDays: [1] }],
        },
      ],
    };
    expect(() => SprintFormSchema.parse(sprint)).toThrow();
  });
});

describe('PlanningFormSchema', () => {
  it('should validate a valid planning form', () => {
    const planning = {
      futureIdentity: 'I am the kind of person who achieves their goals',
      goals: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          text: 'Lose 10 pounds',
          category: 'health',
          createdAt: new Date(),
        },
      ],
      wheelOfLife: {
        healthEnergy: 5,
        physical: 5,
        mental: 5,
      },
    };
    expect(() => PlanningFormSchema.parse(planning)).not.toThrow();
  });

  it('should accept empty planning form (all fields optional)', () => {
    // The new planning schema makes most fields optional for partial saves
    const planning = {
      wheelOfLife: {},
    };
    expect(() => PlanningFormSchema.parse(planning)).not.toThrow();
  });

  it('should accept planning with new wizard fields', () => {
    const planning = {
      brainDump: 'My thoughts and ideas for the year',
      futureIdentity: 'I am the kind of person who achieves their goals',
      currentStep: 2,
      currentModule: 1,
      wheelOfLife: {},
    };
    expect(() => PlanningFormSchema.parse(planning)).not.toThrow();
  });
});

describe('WeeklyReviewFormSchema', () => {
  it('should validate a valid weekly review', () => {
    const review = {
      sprintId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
      weekEndDate: new Date('2024-01-14'),
      progressRatios: {
        'priority-1': 0.8,
      },
      evidenceRatio: 75,
      antiBullshitScore: 80,
      alerts: [],
      oneChange: OneChangeOption.KEEP_SAME,
    };
    expect(() => WeeklyReviewFormSchema.parse(review)).not.toThrow();
  });

  it('should require progressRatios values between 0 and 1', () => {
    const review = {
      sprintId: '123e4567-e89b-12d3-a456-426614174000',
      weekEndDate: new Date('2024-01-14'),
      progressRatios: {
        'priority-1': 1.5,
      },
      evidenceRatio: 75,
      antiBullshitScore: 80,
      alerts: [],
      oneChange: OneChangeOption.KEEP_SAME,
    };
    expect(() => WeeklyReviewFormSchema.parse(review)).toThrow();
  });

  it('should require evidenceRatio between 0 and 100', () => {
    const review = {
      sprintId: '123e4567-e89b-12d3-a456-426614174000',
      weekEndDate: new Date('2024-01-14'),
      progressRatios: {},
      evidenceRatio: 150,
      antiBullshitScore: 80,
      alerts: [],
      oneChange: OneChangeOption.KEEP_SAME,
    };
    expect(() => WeeklyReviewFormSchema.parse(review)).toThrow();
  });
});

describe('MonthlyReviewFormSchema', () => {
  it('should validate a valid monthly review', () => {
    const review = {
      sprintId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
      month: '2024-01',
      perceivedProgress: {
        'priority-1': 7,
      },
      actualProgress: {
        progressRatio: 0.7,
        evidenceRatio: 70,
      },
    };
    expect(() => MonthlyReviewFormSchema.parse(review)).not.toThrow();
  });

  it('should require month in YYYY-MM format', () => {
    const review = {
      sprintId: '123e4567-e89b-12d3-a456-426614174000',
      month: '2024/01',
      perceivedProgress: {},
      actualProgress: {
        progressRatio: 0.7,
        evidenceRatio: 70,
      },
    };
    expect(() => MonthlyReviewFormSchema.parse(review)).toThrow();
  });

  it('should require perceivedProgress values between 1 and 10', () => {
    const review = {
      sprintId: '123e4567-e89b-12d3-a456-426614174000',
      month: '2024-01',
      perceivedProgress: {
        'priority-1': 11,
      },
      actualProgress: {
        progressRatio: 0.7,
        evidenceRatio: 70,
      },
    };
    expect(() => MonthlyReviewFormSchema.parse(review)).toThrow();
  });
});

