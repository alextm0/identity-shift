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
import { SprintPriorityType, OneChangeOption, DesiredIdentityStatus } from '@/lib/enums';

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
      energy: 3,
      mainFocusCompleted: true,
      priorities: {
        'priority-1': { done: true, units: 5 },
      },
      proofOfWork: [],
    };
    expect(() => DailyLogFormSchema.parse(log)).not.toThrow();
  });

  it('should require energy between 1 and 5', () => {
    const log = {
      date: new Date(),
      energy: 0,
      mainFocusCompleted: true,
      priorities: {},
      proofOfWork: [],
    };
    expect(() => DailyLogFormSchema.parse(log)).toThrow();

    const log2 = {
      date: new Date(),
      energy: 6,
      mainFocusCompleted: true,
      priorities: {},
      proofOfWork: [],
    };
    expect(() => DailyLogFormSchema.parse(log2)).toThrow();
  });

  it('should accept optional fields', () => {
    const log = {
      date: new Date(),
      energy: 3,
      mainFocusCompleted: true,
      sleepHours: 7,
      morningGapMin: 30,
      distractionMin: 15,
      priorities: {},
      proofOfWork: [],
      win: 'Great day',
      drain: 'Tired',
      note: 'Some notes',
    };
    expect(() => DailyLogFormSchema.parse(log)).not.toThrow();
  });
});

describe('SprintFormSchema', () => {
  it('should validate a valid sprint', () => {
    const sprint = {
      name: 'Test Sprint',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
      priorities: [
        {
          key: 'priority-1',
          label: 'Exercise',
          type: SprintPriorityType.HABIT,
          weeklyTargetUnits: 5,
        },
      ],
    };
    expect(() => SprintFormSchema.parse(sprint)).not.toThrow();
  });

  it('should require at least one priority', () => {
    const sprint = {
      name: 'Test Sprint',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
      priorities: [],
    };
    expect(() => SprintFormSchema.parse(sprint)).toThrow();
  });

  it('should limit to maximum 3 priorities', () => {
    const sprint = {
      name: 'Test Sprint',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
      priorities: Array(4).fill({
        key: 'priority-1',
        label: 'Exercise',
        type: SprintPriorityType.HABIT,
        weeklyTargetUnits: 5,
      }),
    };
    expect(() => SprintFormSchema.parse(sprint)).toThrow();
  });

  it('should require name to be at least 3 characters', () => {
    const sprint = {
      name: 'Te',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-14'),
      priorities: [
        {
          key: 'priority-1',
          label: 'Exercise',
          type: SprintPriorityType.HABIT,
          weeklyTargetUnits: 5,
        },
      ],
    };
    expect(() => SprintFormSchema.parse(sprint)).toThrow();
  });
});

describe('PlanningFormSchema', () => {
  it('should validate a valid planning form', () => {
    const planning = {
      currentSelf: 'I am currently working on improving my health',
      desiredSelf: 'I want to be healthier and more active',
      goals2026: [
        {
          area: 'Health',
          outcome: 'Lose 10 pounds',
          why: 'To feel better',
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

  it('should require currentSelf to be at least 10 characters', () => {
    const planning = {
      currentSelf: 'Short',
      desiredSelf: 'I want to be healthier',
      goals2026: [],
      wheelOfLife: {},
    };
    expect(() => PlanningFormSchema.parse(planning)).toThrow();
  });

  it('should require desiredSelf to be at least 10 characters', () => {
    const planning = {
      currentSelf: 'I am currently working on improving',
      desiredSelf: 'Short',
      goals2026: [],
      wheelOfLife: {},
    };
    expect(() => PlanningFormSchema.parse(planning)).toThrow();
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

