import { startOfWeek, endOfWeek, isWithinInterval, addWeeks } from 'date-fns';

// Promise completion value: binary 0 or 1
export function getPromiseCompletion(completed: boolean): number {
    return completed ? 1 : 0;
}

// Goal Proof Score for a day (average of SCHEDULED promise completions)
// Only counts promises that were scheduled for this day
export function calculateGoalDailyScore(
    scheduledPromiseCompletions: boolean[]
): number {
    if (scheduledPromiseCompletions.length === 0) return 0;
    const sum = scheduledPromiseCompletions.reduce((acc, c) => acc + (c ? 1 : 0), 0);
    return sum / scheduledPromiseCompletions.length;
}

// Daily Integrity Score (Main Goal weighted higher)
export function calculateDailyIntegrity(
    mainGoalScore: number,
    secondaryScores: number[],
    mainGoalWeight = 0.7
): number {
    if (secondaryScores.length === 0) {
        return mainGoalScore; // Only main goal, full weight
    }
    const secondaryWeight = (1 - mainGoalWeight) / secondaryScores.length;
    const secondarySum = secondaryScores.reduce((acc, s) => acc + s * secondaryWeight, 0);
    return mainGoalScore * mainGoalWeight + secondarySum;
}

// Weekly promise progress (counter: current/target)
// Uses calendar week boundaries: Monday to Sunday
export function getWeeklyPromiseProgress(
    promiseLogs: { date: Date; completed: boolean }[],
    weeklyTarget: number,
    referenceDate: Date = new Date()
): { current: number; target: number; ratio: number; weekStart: Date; weekEnd: Date } {
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });     // Sunday

    const completedThisWeek = promiseLogs.filter(log =>
        log.completed &&
        isWithinInterval(log.date, { start: weekStart, end: weekEnd })
    ).length;

    return {
        current: completedThisWeek,
        target: weeklyTarget,
        ratio: Math.min(1, completedThisWeek / weeklyTarget),
        weekStart,
        weekEnd,
    };
}

// Check if a daily promise is scheduled for a given date
export function isPromiseScheduledForDay(
    scheduleDays: number[] | null | undefined, // 0=Sun, 1=Mon, ..., 6=Sat
    date: Date
): boolean {
    if (!Array.isArray(scheduleDays)) return false;
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return scheduleDays.includes(dayOfWeek);
}

// Get promise display status for a given date
export function getPromiseDisplayStatus(
    promise: { type: 'daily' | 'weekly'; scheduleDays?: number[] | null },
    date: Date,
    completed: boolean | null
): 'done' | 'not_done' | 'na' {
    if (promise.type === 'weekly') {
        // Weekly promises don't have N/A - they're always applicable within the week
        return completed ? 'done' : 'not_done';
    }
    // Daily promise
    const isScheduled = isPromiseScheduledForDay(promise.scheduleDays || [], date);
    if (!isScheduled) return 'na';
    return completed ? 'done' : 'not_done';
}

// Get days left in current calendar week (for "X days left" hint)
export function getDaysLeftInWeek(referenceDate: Date = new Date()): number {
    const dayOfWeek = referenceDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    // Week is Mon(1) to Sun(0), so: Mon=6 days left, Tue=5, ..., Sun=0
    return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
}

// Sprint-level promise completion rate
export function calculateSprintPromiseRate(
    totalScheduled: number,
    totalCompleted: number
): number {
    if (totalScheduled === 0) return 0;
    return totalCompleted / totalScheduled;
}

// Sprint review: aggregate weekly promises across overlapped calendar weeks
// Returns average of weekly completion ratios (not prorated)
export function calculateSprintWeeklyPromiseRate(
    weeklyRatios: number[] // Array of completion ratios per calendar week
): number {
    if (weeklyRatios.length === 0) return 0;
    const sum = weeklyRatios.reduce((acc, r) => acc + r, 0);
    return sum / weeklyRatios.length;
}

// Get all calendar weeks that overlap with a sprint
export function getSprintCalendarWeeks(
    sprintStart: Date,
    sprintEnd: Date
): { weekStart: Date; weekEnd: Date }[] {
    const weeks: { weekStart: Date; weekEnd: Date }[] = [];
    let current = startOfWeek(sprintStart, { weekStartsOn: 1 });
    const end = endOfWeek(sprintEnd, { weekStartsOn: 1 });

    while (current <= end) {
        weeks.push({
            weekStart: current,
            weekEnd: endOfWeek(current, { weekStartsOn: 1 }),
        });
        current = addWeeks(current, 1);
    }
    return weeks;
}
