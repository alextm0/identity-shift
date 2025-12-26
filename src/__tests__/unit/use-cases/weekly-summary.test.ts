/**
 * Unit Tests for Weekly Summary Use Case
 */

import { describe, it, expect } from 'vitest';
import { calculateWeeklySummary } from '@/use-cases/weekly-summary';
import { createMockDailyLog, createMockSprint } from '@/__tests__/mocks/db';

describe('calculateWeeklySummary', () => {
  it('should calculate priority summary correctly', () => {
    const sprint = createMockSprint({
      priorities: [
        {
          key: 'priority-1',
          label: 'Priority 1',
          type: 'habit',
          weeklyTargetUnits: 10,
        },
        {
          key: 'priority-2',
          label: 'Priority 2',
          type: 'work',
          weeklyTargetUnits: 5,
        },
      ],
    });

    const logs = [
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 3 },
          'priority-2': { done: true, units: 2 },
        },
      }),
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 4 },
          'priority-2': { done: true, units: 1 },
        },
      }),
    ];

    const summary = calculateWeeklySummary(logs, sprint);

    expect(summary.prioritySummary['priority-1']).toEqual({
      label: 'Priority 1',
      actual: 7,
      target: 10,
      ratio: 0.7,
    });

    expect(summary.prioritySummary['priority-2']).toEqual({
      label: 'Priority 2',
      actual: 3,
      target: 5,
      ratio: 0.6,
    });
  });

  it('should cap ratio at 1.0 when actual exceeds target', () => {
    const sprint = createMockSprint({
      priorities: [
        {
          key: 'priority-1',
          label: 'Priority 1',
          type: 'habit',
          weeklyTargetUnits: 5,
        },
      ],
    });

    const logs = [
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 10 },
        },
      }),
    ];

    const summary = calculateWeeklySummary(logs, sprint);
    expect(summary.prioritySummary['priority-1'].ratio).toBe(1.0);
  });

  it('should calculate average energy correctly', () => {
    const sprint = createMockSprint();
    const logs = [
      createMockDailyLog({ energy: 3 }),
      createMockDailyLog({ energy: 4 }),
      createMockDailyLog({ energy: 5 }),
    ];

    const summary = calculateWeeklySummary(logs, sprint);
    expect(summary.avgEnergy).toBe(4);
  });

  it('should return 0 for average energy when no logs', () => {
    const sprint = createMockSprint();
    const logs: any[] = [];

    const summary = calculateWeeklySummary(logs, sprint);
    expect(summary.avgEnergy).toBe(0);
  });

  it('should calculate total actual units', () => {
    const sprint = createMockSprint();
    const logs = [
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 5 },
          'priority-2': { done: true, units: 3 },
        },
      }),
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 2 },
        },
      }),
    ];

    const summary = calculateWeeklySummary(logs, sprint);
    expect(summary.totalActualUnits).toBe(10);
  });

  it('should calculate action units (units >= 2)', () => {
    const sprint = createMockSprint();
    const logs = [
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 5 }, // action
          'priority-2': { done: true, units: 1 }, // motion
        },
      }),
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 3 }, // action
          'priority-2': { done: true, units: 2 }, // action
        },
      }),
    ];

    const summary = calculateWeeklySummary(logs, sprint);
    expect(summary.actionUnits).toBe(10); // 5 + 3 + 2
  });

  it('should calculate motion units (units === 1)', () => {
    const sprint = createMockSprint();
    const logs = [
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 1 }, // motion
          'priority-2': { done: true, units: 1 }, // motion
        },
      }),
      createMockDailyLog({
        priorities: {
          'priority-1': { done: true, units: 2 }, // action
        },
      }),
    ];

    const summary = calculateWeeklySummary(logs, sprint);
    expect(summary.motionUnits).toBe(2); // only units === 1
  });

  it('should return correct logs count', () => {
    const sprint = createMockSprint();
    const logs = Array(5).fill(null).map(() => createMockDailyLog());

    const summary = calculateWeeklySummary(logs, sprint);
    expect(summary.logsCount).toBe(5);
  });
});

