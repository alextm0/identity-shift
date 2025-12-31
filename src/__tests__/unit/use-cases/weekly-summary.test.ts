/**
 * Unit Tests for Weekly Summary Use Case
 */

import { describe, it, expect } from 'vitest';
import { calculateWeeklySummary } from '@/use-cases/weekly-summary';
import { createMockDailyLog, createMockSprint } from '@/__tests__/mocks/db';

describe('calculateWeeklySummary', () => {
  it('should calculate priority summary correctly', () => {
    const sprint = {
      ...createMockSprint(),
      goals: [
        {
          id: 'goal-1',
          goalText: 'Goal 1',
          promises: [
            {
              id: 'promise-1',
              text: 'Promise 1',
              type: 'daily',
              scheduleDays: [1, 2, 3, 4, 5], // 5 days
            },
            {
              id: 'promise-2',
              text: 'Promise 2',
              type: 'weekly',
              weeklyTarget: 3,
            },
          ],
        },
      ],
    } as any;

    const promiseLogs = [
      { id: 'pl-1', promiseId: 'promise-1', completed: true, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
      { id: 'pl-2', promiseId: 'promise-1', completed: true, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
      { id: 'pl-3', promiseId: 'promise-1', completed: true, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
      { id: 'pl-4', promiseId: 'promise-2', completed: true, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
      { id: 'pl-5', promiseId: 'promise-2', completed: true, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
    ] as any;

    const logs = [
      createMockDailyLog({ energy: 3 }),
      createMockDailyLog({ energy: 4 }),
    ];

    const summary = calculateWeeklySummary(logs, sprint, promiseLogs);

    expect(summary.prioritySummary['promise-1']).toEqual(expect.objectContaining({
      label: 'Promise 1',
      actual: 3,
      target: 5,
      ratio: 0.6,
    }));

    const p2 = summary.prioritySummary['promise-2'];
    expect(p2.label).toBe('Promise 2');
    expect(p2.actual).toBe(2);
    expect(p2.target).toBe(3);
    expect(p2.ratio).toBeCloseTo(0.666, 2);
    expect(p2.status).toBeDefined();
  });

  it('should calculate average energy correctly', () => {
    const sprint = { ...createMockSprint(), goals: [] } as any;
    const logs = [
      createMockDailyLog({ energy: 3 }),
      createMockDailyLog({ energy: 4 }),
      createMockDailyLog({ energy: 5 }),
    ];

    const summary = calculateWeeklySummary(logs, sprint, []);
    expect(summary.avgEnergy).toBe(4);
  });

  it('should calculate total actual units', () => {
    const sprint = { ...createMockSprint(), goals: [] } as any;
    const promiseLogs = [
      { id: 'pl-1', promiseId: 'p1', completed: true, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
      { id: 'pl-2', promiseId: 'p2', completed: true, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
      { id: 'pl-3', promiseId: 'p3', completed: false, date: new Date(), createdAt: new Date(), userId: 'test-user', dailyLogId: null },
    ] as any;
    const logs = [createMockDailyLog()];

    const summary = calculateWeeklySummary(logs, sprint, promiseLogs);
    expect(summary.totalActualUnits).toBe(2);
  });

  it('should return correct logs count', () => {
    const sprint = { ...createMockSprint(), goals: [] } as any;
    const logs = Array(5).fill(null).map(() => createMockDailyLog());

    const summary = calculateWeeklySummary(logs, sprint, []);
    expect(summary.logsCount).toBe(5);
  });
});

