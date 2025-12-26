/**
 * Type helper functions for safely parsing JSON fields from database.
 * 
 * These functions help convert database JSON fields to properly typed objects.
 */

import type { Sprint, DailyLog, Planning, WeeklyReview, MonthlyReview } from '@/lib/types';
import type { SprintPriority, DailyPriorityLog, ProofOfWork, Goal, WheelOfLife } from '@/lib/validators';
import type { SprintWithPriorities, DailyLogWithTypedFields, PlanningWithTypedFields, WeeklyReviewWithTypedFields, MonthlyReviewWithTypedFields } from '@/lib/types';

/**
 * Safely parses sprint priorities from JSON field.
 */
export function parseSprintPriorities(sprint: Sprint): SprintPriority[] {
    if (!sprint.priorities) return [];
    
    if (Array.isArray(sprint.priorities)) {
        return sprint.priorities as SprintPriority[];
    }
    
    // Handle case where it might be a string
    if (typeof sprint.priorities === 'string') {
        try {
            return JSON.parse(sprint.priorities) as SprintPriority[];
        } catch {
            return [];
        }
    }
    
    return [];
}

/**
 * Converts a Sprint to SprintWithPriorities with typed priorities.
 */
export function toSprintWithPriorities(sprint: Sprint): SprintWithPriorities {
    return {
        ...sprint,
        priorities: parseSprintPriorities(sprint),
    };
}

/**
 * Safely parses daily log priorities from JSON field.
 */
export function parseDailyLogPriorities(log: DailyLog): Record<string, DailyPriorityLog> {
    if (!log.priorities) return {};
    
    if (typeof log.priorities === 'object' && !Array.isArray(log.priorities)) {
        return log.priorities as Record<string, DailyPriorityLog>;
    }
    
    if (typeof log.priorities === 'string') {
        try {
            return JSON.parse(log.priorities) as Record<string, DailyPriorityLog>;
        } catch {
            return {};
        }
    }
    
    return {};
}

/**
 * Safely parses proof of work from JSON field.
 */
export function parseProofOfWork(log: DailyLog): ProofOfWork[] {
    if (!log.proofOfWork) return [];
    
    if (Array.isArray(log.proofOfWork)) {
        return log.proofOfWork as ProofOfWork[];
    }
    
    if (typeof log.proofOfWork === 'string') {
        try {
            return JSON.parse(log.proofOfWork) as ProofOfWork[];
        } catch {
            return [];
        }
    }
    
    return [];
}

/**
 * Converts a DailyLog to DailyLogWithTypedFields with typed JSON fields.
 */
export function toDailyLogWithTypedFields(log: DailyLog): DailyLogWithTypedFields {
    return {
        ...log,
        priorities: parseDailyLogPriorities(log),
        proofOfWork: parseProofOfWork(log),
    };
}

/**
 * Safely parses planning goals from JSON field.
 */
export function parsePlanningGoals(planning: Planning): Goal[] {
    if (!planning.goals2026) return [];
    
    if (Array.isArray(planning.goals2026)) {
        return planning.goals2026 as Goal[];
    }
    
    if (typeof planning.goals2026 === 'string') {
        try {
            return JSON.parse(planning.goals2026) as Goal[];
        } catch {
            return [];
        }
    }
    
    return [];
}

/**
 * Safely parses wheel of life from JSON field.
 */
export function parseWheelOfLife(planning: Planning): WheelOfLife {
    if (!planning.wheelOfLife) return {};
    
    if (typeof planning.wheelOfLife === 'object' && !Array.isArray(planning.wheelOfLife)) {
        return planning.wheelOfLife as WheelOfLife;
    }
    
    if (typeof planning.wheelOfLife === 'string') {
        try {
            return JSON.parse(planning.wheelOfLife) as WheelOfLife;
        } catch {
            return {};
        }
    }
    
    return {};
}

/**
 * Converts a Planning to PlanningWithTypedFields with typed JSON fields.
 */
export function toPlanningWithTypedFields(planning: Planning): PlanningWithTypedFields {
    return {
        ...planning,
        goals2026: parsePlanningGoals(planning),
        wheelOfLife: parseWheelOfLife(planning),
    };
}

/**
 * Safely parses weekly review progress ratios from JSON field.
 */
export function parseProgressRatios(review: WeeklyReview): Record<string, number> {
    if (!review.progressRatios) return {};
    
    if (typeof review.progressRatios === 'object' && !Array.isArray(review.progressRatios)) {
        return review.progressRatios as Record<string, number>;
    }
    
    if (typeof review.progressRatios === 'string') {
        try {
            return JSON.parse(review.progressRatios) as Record<string, number>;
        } catch {
            return {};
        }
    }
    
    return {};
}

/**
 * Safely parses weekly review alerts from JSON field.
 */
export function parseAlerts(review: WeeklyReview): string[] {
    if (!review.alerts) return [];
    
    if (Array.isArray(review.alerts)) {
        return review.alerts as string[];
    }
    
    if (typeof review.alerts === 'string') {
        try {
            return JSON.parse(review.alerts) as string[];
        } catch {
            return [];
        }
    }
    
    return [];
}

/**
 * Converts a WeeklyReview to WeeklyReviewWithTypedFields with typed JSON fields.
 */
export function toWeeklyReviewWithTypedFields(review: WeeklyReview): WeeklyReviewWithTypedFields {
    return {
        ...review,
        progressRatios: parseProgressRatios(review),
        alerts: parseAlerts(review),
    };
}

/**
 * Safely parses monthly review perceived progress from JSON field.
 */
export function parsePerceivedProgress(review: MonthlyReview): Record<string, number> {
    if (!review.perceivedProgress) return {};
    
    if (typeof review.perceivedProgress === 'object' && !Array.isArray(review.perceivedProgress)) {
        return review.perceivedProgress as Record<string, number>;
    }
    
    if (typeof review.perceivedProgress === 'string') {
        try {
            return JSON.parse(review.perceivedProgress) as Record<string, number>;
        } catch {
            return {};
        }
    }
    
    return {};
}

/**
 * Safely parses monthly review actual progress from JSON field.
 */
export function parseActualProgress(review: MonthlyReview): { progressRatio: number; evidenceRatio: number } {
    if (!review.actualProgress) {
        return { progressRatio: 0, evidenceRatio: 0 };
    }
    
    if (typeof review.actualProgress === 'object' && !Array.isArray(review.actualProgress)) {
        const progress = review.actualProgress as { progressRatio?: number; evidenceRatio?: number };
        return {
            progressRatio: progress.progressRatio ?? 0,
            evidenceRatio: progress.evidenceRatio ?? 0,
        };
    }
    
    if (typeof review.actualProgress === 'string') {
        try {
            const parsed = JSON.parse(review.actualProgress) as { progressRatio?: number; evidenceRatio?: number };
            return {
                progressRatio: parsed.progressRatio ?? 0,
                evidenceRatio: parsed.evidenceRatio ?? 0,
            };
        } catch {
            return { progressRatio: 0, evidenceRatio: 0 };
        }
    }
    
    return { progressRatio: 0, evidenceRatio: 0 };
}

/**
 * Converts a MonthlyReview to MonthlyReviewWithTypedFields with typed JSON fields.
 */
export function toMonthlyReviewWithTypedFields(review: MonthlyReview): MonthlyReviewWithTypedFields {
    return {
        ...review,
        perceivedProgress: parsePerceivedProgress(review),
        actualProgress: parseActualProgress(review),
    };
}

