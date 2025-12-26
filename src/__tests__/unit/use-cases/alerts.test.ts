/**
 * Unit Tests for Alerts Use Case
 */

import { describe, it, expect } from 'vitest';
import { generateAlerts } from '@/use-cases/alerts';
import { createMockDailyLog, createMockSprint } from '@/__tests__/mocks/db';
import { OneChangeOption } from '@/lib/enums';

describe('generateAlerts', () => {
  it('should generate critical energy alert when average energy is below 3', () => {
    const logs = [
      createMockDailyLog({ energy: 2 }),
      createMockDailyLog({ energy: 2 }),
      createMockDailyLog({ energy: 2 }),
    ];
    const sprint = createMockSprint();
    const summary = {
      avgEnergy: 2,
      motionUnits: 5,
      actionUnits: 10,
      totalActualUnits: 15,
      prioritySummary: {},
    };

    const alerts = generateAlerts(logs, summary);
    expect(alerts).toContainEqual(
      expect.stringContaining('CRITICAL_ENERGY_LEVEL')
    );
  });

  it('should not generate energy alert with less than 3 logs', () => {
    const logs = [
      createMockDailyLog({ energy: 1 }),
      createMockDailyLog({ energy: 1 }),
    ];
    const sprint = createMockSprint();
    const summary = {
      avgEnergy: 1,
      motionUnits: 5,
      actionUnits: 10,
      totalActualUnits: 15,
      prioritySummary: {},
    };

    const alerts = generateAlerts(logs, summary);
    expect(alerts).not.toContainEqual(
      expect.stringContaining('CRITICAL_ENERGY_LEVEL')
    );
  });

  it('should generate simulation trap alert when motion exceeds action', () => {
    const logs = Array(5).fill(null).map(() => createMockDailyLog());
    const sprint = createMockSprint();
    const summary = {
      avgEnergy: 3,
      motionUnits: 10,
      actionUnits: 5,
      totalActualUnits: 15,
      prioritySummary: {},
    };

    const alerts = generateAlerts(logs, summary);
    expect(alerts).toContainEqual(
      expect.stringContaining('SIMULATION_TRAP')
    );
  });

  it('should generate visibility gap alert when less than 5 days logged', () => {
    const logs = [
      createMockDailyLog(),
      createMockDailyLog(),
      createMockDailyLog(),
    ];
    const sprint = createMockSprint();
    const summary = {
      avgEnergy: 3,
      motionUnits: 5,
      actionUnits: 10,
      totalActualUnits: 15,
      prioritySummary: {},
    };

    const alerts = generateAlerts(logs, summary);
    expect(alerts).toContainEqual(
      expect.stringContaining('VISIBILITY_GAP')
    );
  });

  it('should generate scope overload alert when multiple priorities missed', () => {
    const logs = Array(7).fill(null).map(() => createMockDailyLog());
    const sprint = createMockSprint();
    const summary = {
      avgEnergy: 3,
      motionUnits: 5,
      actionUnits: 10,
      totalActualUnits: 15,
      prioritySummary: {
        'priority-1': { ratio: 0.3 },
        'priority-2': { ratio: 0.4 },
        'priority-3': { ratio: 0.8 },
      },
    };

    const alerts = generateAlerts(logs, summary);
    expect(alerts).toContainEqual(
      expect.stringContaining('SCOPE_OVERLOAD')
    );
  });

  it('should return empty array when no alerts are needed', () => {
    const logs = Array(7).fill(null).map(() => createMockDailyLog({ energy: 4 }));
    const sprint = createMockSprint();
    const summary = {
      avgEnergy: 4,
      motionUnits: 5,
      actionUnits: 10,
      totalActualUnits: 15,
      prioritySummary: {
        'priority-1': { ratio: 0.8 },
      },
    };

    const alerts = generateAlerts(logs, summary);
    expect(alerts.length).toBe(0);
  });
});

