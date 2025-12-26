import { DailyLog, Sprint } from "@/lib/types";
import { toSprintWithPriorities, toDailyLogWithTypedFields } from "@/lib/type-helpers";

export function calculateWeeklySummary(logs: DailyLog[], sprint: Sprint) {
  const sprintWithPriorities = toSprintWithPriorities(sprint);
  const priorities = sprintWithPriorities.priorities;
  const priorityKeys = priorities.map(p => p.key);
  
  const summary = priorityKeys.reduce((acc, key) => {
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

  const avgEnergy = logs.length > 0 
    ? logs.reduce((acc, log) => acc + log.energy, 0) / logs.length 
    : 0;

  const totalActualUnits = logs.reduce((total, log) => {
    const typedLog = toDailyLogWithTypedFields(log);
    return total + Object.values(typedLog.priorities).reduce((t, p) => t + (p.units || 0), 0);
  }, 0);

  const actionUnits = logs.reduce((total, log) => {
    const typedLog = toDailyLogWithTypedFields(log);
    return total + Object.values(typedLog.priorities).reduce((t, p) => t + (p.units >= 2 ? p.units : 0), 0);
  }, 0);

  const motionUnits = logs.reduce((total, log) => {
    const typedLog = toDailyLogWithTypedFields(log);
    return total + Object.values(typedLog.priorities).reduce((t, p) => t + (p.units === 1 ? p.units : 0), 0);
  }, 0);

  return {
    prioritySummary: summary,
    avgEnergy,
    totalActualUnits,
    actionUnits,
    motionUnits,
    logsCount: logs.length
  };
}

