import { DailyLog, SprintWithDetails, PromiseLog } from "@/lib/types";
import { eachWeekOfInterval, endOfWeek, isSameDay, differenceInCalendarDays } from "date-fns";
import { GoalSummary } from "./weekly-summary";

export interface WeeklySummaryForMonth {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  kept: number;
  committed: number;
  ratio: number;
}

export interface CalendarDayData {
  date: Date;
  hasLog: boolean;
  kept: number;
  committed: number;
  ratio: number;
}

export interface MonthlyGoalSummary extends GoalSummary {
  trend: 'up' | 'down' | 'stable';
}

function calculateLongestStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;

  const sortedDates = logs.map(log => new Date(log.date)).sort((a, b) => a.getTime() - b.getTime());
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = differenceInCalendarDays(sortedDates[i], sortedDates[i - 1]);
    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

function calculateWeeklySummaries(
  promiseLogs: PromiseLog[],
  sprint: SprintWithDetails,
  monthStart: Date,
  monthEnd: Date
): WeeklySummaryForMonth[] {
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  );

  const totalPromisesPerDay = (sprint.goals?.flatMap(g => g.promises || []) || []).length;

  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekPromiseLogs = promiseLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    const keptThisWeek = weekPromiseLogs.filter(p => p.completed).length;
    const committedThisWeek = totalPromisesPerDay * 7; // Assume all promises scheduled daily for simplicity

    return {
      weekNumber: index + 1,
      weekStart,
      weekEnd,
      kept: keptThisWeek,
      committed: committedThisWeek,
      ratio: committedThisWeek > 0 ? keptThisWeek / committedThisWeek : 0
    };
  });
}

function calculateCalendarData(
  monthlyLogs: DailyLog[],
  promiseLogs: PromiseLog[],
  sprint: SprintWithDetails,
  monthStart: Date,
  monthEnd: Date
): CalendarDayData[] {
  const days: CalendarDayData[] = [];
  const totalPromisesPerDay = (sprint.goals?.flatMap(g => g.promises || []) || []).length;

  const currentDate = new Date(monthStart);
  while (currentDate <= monthEnd) {
    const dayLogs = monthlyLogs.filter(log => isSameDay(new Date(log.date), currentDate));
    const dayPromises = promiseLogs.filter(log => isSameDay(new Date(log.date), currentDate));

    const kept = dayPromises.filter(p => p.completed).length;
    const committed = totalPromisesPerDay;

    days.push({
      date: new Date(currentDate),
      hasLog: dayLogs.length > 0,
      kept,
      committed,
      ratio: committed > 0 ? kept / committed : 0
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

function calculateGoalSummaries(
  promiseLogs: PromiseLog[],
  sprint: SprintWithDetails
): MonthlyGoalSummary[] {
  const goalMap = new Map<string, MonthlyGoalSummary>();

  const allPromises = (sprint.goals?.flatMap((goal) =>
    goal.promises?.map((p) => ({ ...p, goalText: goal.goalText, goalId: goal.id })) || []
  ) || []).filter(p => p && p.id && p.text);

  allPromises.forEach(promise => {
    const goalId = promise.goalId;

    if (!goalMap.has(goalId)) {
      goalMap.set(goalId, {
        goalId,
        goalText: promise.goalText,
        promises: [],
        totalKept: 0,
        totalTarget: 0,
        ratio: 0,
        trend: 'stable'
      });
    }

    const goal = goalMap.get(goalId)!;
    const completionsThisMonth = promiseLogs.filter(log =>
      log.promiseId === promise.id && log.completed
    ).length;

    const monthlyTarget = promise.type === 'weekly'
      ? (promise.weeklyTarget || 3) * 4
      : (promise.scheduleDays?.length || 7) * 4;

    goal.totalKept += completionsThisMonth;
    goal.totalTarget += monthlyTarget;
  });

  goalMap.forEach(goal => {
    goal.ratio = goal.totalTarget > 0 ? goal.totalKept / goal.totalTarget : 0;
    // For now, trend is based on ratio (could be enhanced with historical data)
    goal.trend = goal.ratio >= 0.8 ? 'up' : goal.ratio < 0.5 ? 'down' : 'stable';
  });

  return Array.from(goalMap.values());
}

export function calculateMonthlySummary(
  logs: DailyLog[],
  sprint: SprintWithDetails,
  promiseLogs: PromiseLog[],
  monthStart: Date,
  monthEnd: Date
) {
  const totalPromisesKept = promiseLogs.filter(p => p.completed).length;
  const totalPromisesTarget = (sprint.goals?.flatMap(g => g.promises || []) || []).length *
    differenceInCalendarDays(monthEnd, monthStart) + 1;

  const weeklySummaries = calculateWeeklySummaries(promiseLogs, sprint, monthStart, monthEnd);
  const calendarData = calculateCalendarData(logs, promiseLogs, sprint, monthStart, monthEnd);
  const goalSummaries = calculateGoalSummaries(promiseLogs, sprint);

  const longestStreak = calculateLongestStreak(logs);
  const daysLogged = logs.length;
  const totalDaysInMonth = differenceInCalendarDays(monthEnd, monthStart) + 1;

  const avgEnergy = logs.length > 0
    ? logs.reduce((sum, log) => sum + log.energy, 0) / logs.length
    : 0;

  return {
    totalPromisesKept,
    totalPromisesTarget,
    promisesKeptRatio: totalPromisesTarget > 0 ? totalPromisesKept / totalPromisesTarget : 0,
    daysLogged,
    totalDaysInMonth,
    longestStreak,
    avgEnergy,
    weeklySummaries,
    calendarData,
    goalSummaries
  };
}
