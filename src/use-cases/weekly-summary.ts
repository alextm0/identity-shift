import { DailyLog, SprintWithPriorities } from "@/lib/types";
import { toDailyLogWithTypedFields } from "@/lib/type-helpers";
import { ACTION_UNIT_THRESHOLD, MOTION_UNIT_VALUE } from "@/lib/constants/thresholds";

function calculatePrioritySummary(logs: DailyLog[], priorities: Array<{ key: string; label: string; weeklyTargetUnits: number }>) {
  const priorityKeys = priorities.map(p => p.key);
  
  return priorityKeys.reduce((acc, key) => {
    const priority = priorities.find(p => p.key === key);
    const weeklyTarget = priority?.weeklyTargetUnits || 1;
    
    const actualUnits = logs.reduce((total, log) => {
      const typedLog = toDailyLogWithTypedFields(log);
      return total + (typedLog.priorities[key]?.units || 0);
    }, 0);
    
    return {
      ...acc,
      [key]: {
        label: priority?.label || key,
        actual: actualUnits,
        target: weeklyTarget,
        ratio: Math.min(1, actualUnits / weeklyTarget)
      }
    };
  }, {} as Record<string, { label: string, actual: number, target: number, ratio: number }>);
}

function calculateAverageEnergy(logs: DailyLog[]): number {
  return logs.length > 0 
    ? logs.reduce((acc, log) => acc + log.energy, 0) / logs.length 
    : 0;
}

function calculateUnitMetrics(logs: DailyLog[]): { totalActualUnits: number; actionUnits: number; motionUnits: number } {
  return logs.reduce((acc, log) => {
    const typedLog = toDailyLogWithTypedFields(log);
    const logUnits = Object.values(typedLog.priorities);
    
    const totalUnits = logUnits.reduce((t, p) => t + (p.units || 0), 0);
    const actionUnits = logUnits.reduce((t, p) => t + (p.units >= ACTION_UNIT_THRESHOLD ? p.units : 0), 0);
    const motionUnits = logUnits.reduce((t, p) => t + (p.units === MOTION_UNIT_VALUE ? p.units : 0), 0);
    
    return {
      totalActualUnits: acc.totalActualUnits + totalUnits,
      actionUnits: acc.actionUnits + actionUnits,
      motionUnits: acc.motionUnits + motionUnits,
    };
  }, { totalActualUnits: 0, actionUnits: 0, motionUnits: 0 });
}

export function calculateWeeklySummary(logs: DailyLog[], sprint: SprintWithPriorities) {
  const priorities = sprint.priorities;
  
  const prioritySummary = calculatePrioritySummary(logs, priorities);
  const avgEnergy = calculateAverageEnergy(logs);
  const { totalActualUnits, actionUnits, motionUnits } = calculateUnitMetrics(logs);

  return {
    prioritySummary,
    avgEnergy,
    totalActualUnits,
    actionUnits,
    motionUnits,
    logsCount: logs.length
  };
}

