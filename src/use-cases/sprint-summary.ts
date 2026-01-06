import { DailyLog, SprintWithDetails, PromiseLog } from "@/lib/types";
import { differenceInDays, startOfDay } from "date-fns";

export interface SprintPromiseSummary {
    promiseId: string;
    label: string;
    actual: number;
    target: number; // For whole sprint
    ratio: number;
    type: 'daily' | 'weekly';
    goalId: string;
    goalText: string;
}

export interface SprintGoalSummary {
    goalId: string;
    goalText: string;
    promises: SprintPromiseSummary[];
    totalKept: number;
    totalTarget: number;
    ratio: number;
}

export interface SprintSummary {
    goalSummaries: SprintGoalSummary[];
    avgEnergy: number;
    logsCount: number;
    totalPromisesKept: number;
    totalPromisesTarget: number;
    sprintDurationDays: number;
    elapsedDays: number;
    velocity: number; // promises per day
}

export function calculateSprintSummary(logs: DailyLog[], sprint: SprintWithDetails, promiseLogs: PromiseLog[]): SprintSummary {
    const sprintStart = startOfDay(new Date(sprint.startDate));
    const sprintEnd = startOfDay(new Date(sprint.endDate));
    const today = startOfDay(new Date());

    const sprintDurationDays = differenceInDays(sprintEnd, sprintStart) + 1;
    const elapsedDays = Math.min(sprintDurationDays, Math.max(0, differenceInDays(today, sprintStart) + 1));

    // 1. Calculate summaries for each promise
    const allPromises = (sprint.goals?.flatMap((goal) =>
        goal.promises?.map((p) => ({ ...p, goalText: goal.goalText, goalId: goal.id })) || []
    ) || []).filter(p => p && p.id);

    const promiseSummaries: Record<string, SprintPromiseSummary> = {};

    allPromises.forEach(promise => {
        const totalCompletions = promiseLogs.filter(log =>
            log.promiseId === promise.id && log.completed
        ).length;

        // Calculate target for whole sprint
        let totalTarget = 0;
        if (promise.type === 'weekly') {
            const weeks = sprintDurationDays / 7;
            totalTarget = Math.round(weeks * (promise.weeklyTarget || 3));
        } else {
            // Daily
            const daysToCount = promise.scheduleDays?.length || 7;
            const fullWeeks = Math.floor(sprintDurationDays / 7);
            const extraDays = sprintDurationDays % 7;

            totalTarget = fullWeeks * daysToCount;

            // Add extra days based on schedule
            if (promise.scheduleDays) {
                for (let i = 0; i < extraDays; i++) {
                    const checkDate = new Date(sprintStart);
                    checkDate.setDate(checkDate.getDate() + (fullWeeks * 7) + i);
                    if (promise.scheduleDays.includes(checkDate.getDay())) {
                        totalTarget++;
                    }
                }
            } else {
                totalTarget += extraDays;
            }
        }

        promiseSummaries[promise.id] = {
            promiseId: promise.id,
            label: promise.text,
            actual: totalCompletions,
            target: totalTarget,
            ratio: totalTarget > 0 ? totalCompletions / totalTarget : 0,
            type: promise.type as 'daily' | 'weekly',
            goalId: promise.goalId,
            goalText: promise.goalText
        };
    });

    // 2. Group by goal
    const goalMap = new Map<string, SprintGoalSummary>();
    Object.values(promiseSummaries).forEach(ps => {
        if (!goalMap.has(ps.goalId)) {
            goalMap.set(ps.goalId, {
                goalId: ps.goalId,
                goalText: ps.goalText,
                promises: [],
                totalKept: 0,
                totalTarget: 0,
                ratio: 0
            });
        }
        const g = goalMap.get(ps.goalId)!;
        g.promises.push(ps);
        g.totalKept += ps.actual;
        g.totalTarget += ps.target;
    });

    goalMap.forEach(g => {
        g.ratio = g.totalTarget > 0 ? g.totalKept / g.totalTarget : 0;
    });

    const goalSummaries = Array.from(goalMap.values());
    const totalPromisesKept = goalSummaries.reduce((sum, g) => sum + g.totalKept, 0);
    const totalPromisesTarget = goalSummaries.reduce((sum, g) => sum + g.totalTarget, 0);

    const avgEnergy = logs.length > 0
        ? logs.reduce((sum, l) => sum + l.energy, 0) / logs.length
        : 0;

    return {
        goalSummaries,
        avgEnergy,
        logsCount: logs.length,
        totalPromisesKept,
        totalPromisesTarget,
        sprintDurationDays,
        elapsedDays,
        velocity: elapsedDays > 0 ? totalPromisesKept / elapsedDays : 0
    };
}
