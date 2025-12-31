import { DailyLog, SprintWithDetails, PromiseLog } from "@/lib/types";
import { startOfWeek, differenceInDays } from "date-fns";

export interface PromiseSummary {
  promiseId: string;
  label: string;
  actual: number;
  target: number;
  ratio: number;
  status: 'on-track' | 'at-risk' | 'missed';
  type: 'daily' | 'weekly';
  goalId: string;
  goalText: string;
}

export interface GoalSummary {
  goalId: string;
  goalText: string;
  promises: PromiseSummary[];
  totalKept: number;
  totalTarget: number;
  ratio: number;
}

function calculatePromiseStatus(
  actual: number,
  target: number,
  _promiseType: 'daily' | 'weekly',
  weekProgress: number // 0-1 (how much of the week has passed)
): 'on-track' | 'at-risk' | 'missed' {
  const ratio = actual / target;

  // If we've already hit the target, we're on track
  if (ratio >= 1) return 'on-track';

  // If the week is over (or nearly over), check if we missed
  if (weekProgress > 0.85) {
    return ratio < 0.7 ? 'missed' : 'at-risk';
  }

  // For ongoing week, check if we're on pace
  // Expected progress = weekProgress * target
  const expectedProgress = weekProgress * target;

  if (actual >= expectedProgress * 0.8) return 'on-track';
  return 'at-risk';
}

function calculatePrioritySummary(promiseLogs: PromiseLog[], sprint: SprintWithDetails): Record<string, PromiseSummary> {
  const allPromises = (sprint.goals?.flatMap((goal) =>
    goal.promises?.map((p) => ({ ...p, goalText: goal.goalText, goalId: goal.id })) || []
  ) || []).filter(p => p && p.id && p.text); // Filter out null/undefined promises

  // Calculate week progress (0-1)
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const daysSinceWeekStart = differenceInDays(now, weekStart);
  const weekProgress = Math.min(1, daysSinceWeekStart / 7);

  return allPromises.reduce((acc, promise) => {
    const completionsThisWeek = promiseLogs.filter(log =>
      log.promiseId === promise.id && log.completed
    ).length;

    const weeklyTarget = promise.type === 'weekly'
      ? (promise.weeklyTarget || 3)
      : (promise.scheduleDays?.length || 7);
    const ratio = Math.min(1, completionsThisWeek / weeklyTarget);

    const status = calculatePromiseStatus(
      completionsThisWeek,
      weeklyTarget,
      promise.type as 'daily' | 'weekly',
      weekProgress
    );

    return {
      ...acc,
      [promise.id]: {
        promiseId: promise.id,
        label: promise.text,
        actual: completionsThisWeek,
        target: weeklyTarget,
        ratio,
        status,
        type: promise.type as 'daily' | 'weekly',
        goalId: promise.goalId,
        goalText: promise.goalText
      }
    };
  }, {} as Record<string, PromiseSummary>);
}

function groupPromisesByGoal(promiseSummary: Record<string, PromiseSummary>): GoalSummary[] {
  const goalMap = new Map<string, GoalSummary>();

  Object.values(promiseSummary).forEach(promise => {
    if (!goalMap.has(promise.goalId)) {
      goalMap.set(promise.goalId, {
        goalId: promise.goalId,
        goalText: promise.goalText,
        promises: [],
        totalKept: 0,
        totalTarget: 0,
        ratio: 0
      });
    }

    const goal = goalMap.get(promise.goalId)!;
    goal.promises.push(promise);
    goal.totalKept += promise.actual;
    goal.totalTarget += promise.target;
  });

  // Calculate ratios for each goal
  goalMap.forEach(goal => {
    goal.ratio = goal.totalTarget > 0 ? goal.totalKept / goal.totalTarget : 0;
  });

  return Array.from(goalMap.values());
}

function calculateAverageEnergy(logs: DailyLog[]): number {
  // Note: Returns 0 for empty logs. UI should check logsCount to distinguish "no data" from "0 average"
  return logs.length > 0
    ? logs.reduce((acc, log) => acc + log.energy, 0) / logs.length
    : 0;
}

function calculateUnitMetrics(promiseLogs: PromiseLog[]): { totalActualUnits: number; actionUnits: number; motionUnits: number } {
  const totalCompleted = promiseLogs.filter(l => l.completed).length;

  // For now, in the new system, we treat all kept promises as Action Units
  // until we have a way to distinguish them in the schema.
  return {
    totalActualUnits: totalCompleted,
    actionUnits: totalCompleted,
    motionUnits: 0,
  };
}

export function calculateWeeklySummary(logs: DailyLog[], sprint: SprintWithDetails, promiseLogs: PromiseLog[]) {
  const prioritySummary = calculatePrioritySummary(promiseLogs, sprint);
  const goalSummaries = groupPromisesByGoal(prioritySummary);
  const avgEnergy = calculateAverageEnergy(logs);
  const { totalActualUnits, actionUnits, motionUnits } = calculateUnitMetrics(promiseLogs);

  // Calculate total promises kept and total target across all goals
  const totalPromisesKept = goalSummaries.reduce((sum, goal) => sum + goal.totalKept, 0);
  const totalPromisesTarget = goalSummaries.reduce((sum, goal) => sum + goal.totalTarget, 0);

  // Count promises at risk
  const promisesAtRisk = Object.values(prioritySummary).filter(p => p.status === 'at-risk').length;

  return {
    prioritySummary,
    goalSummaries,
    avgEnergy,
    totalActualUnits,
    actionUnits,
    motionUnits,
    logsCount: logs.length,
    totalPromisesKept,
    totalPromisesTarget,
    promisesAtRisk
  };
}

