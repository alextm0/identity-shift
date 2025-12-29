/**
 * Type helper functions for safely parsing JSON fields from database.
 * 
 * These functions help convert database JSON fields to properly typed objects.
 */

import type { Sprint, DailyLog, Planning, WeeklyReview, MonthlyReview, YearlyReview } from '@/lib/types';
import type { SprintPriority, DailyPriorityLog, ProofOfWork, Goal, WheelOfLife, PlanningGoal, SimplifiedGoal } from '@/lib/validators';
import type { SprintWithPriorities, DailyLogWithTypedFields, PlanningWithTypedFields, WeeklyReviewWithTypedFields, MonthlyReviewWithTypedFields, YearlyReviewWithTypedFields } from '@/lib/types';

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
 * Safely parses active goals from JSON field.
 */
export function parseActiveGoals(planning: Planning): PlanningGoal[] {
    if (!planning.activeGoals) return [];

    if (Array.isArray(planning.activeGoals)) {
        return planning.activeGoals as PlanningGoal[];
    }

    if (typeof planning.activeGoals === 'string') {
        try {
            return JSON.parse(planning.activeGoals) as PlanningGoal[];
        } catch {
            return [];
        }
    }

    return [];
}

/**
 * Safely parses backlog goals from JSON field (legacy - deprecated).
 */
export function parseBacklogGoals(planning: Planning): any[] {
    if (!planning.backlogGoals) return [];

    if (Array.isArray(planning.backlogGoals)) {
        return planning.backlogGoals;
    }

    if (typeof planning.backlogGoals === 'string') {
        try {
            return JSON.parse(planning.backlogGoals);
        } catch {
            return [];
        }
    }

    return [];
}

/**
 * Safely parses archived goals from JSON field (legacy - deprecated).
 */
export function parseArchivedGoals(planning: Planning): any[] {
    if (!planning.archivedGoals) return [];

    if (Array.isArray(planning.archivedGoals)) {
        return planning.archivedGoals;
    }

    if (typeof planning.archivedGoals === 'string') {
        try {
            return JSON.parse(planning.archivedGoals);
        } catch {
            return [];
        }
    }

    return [];
}

/**
 * Safely parses annual goals from JSON field.
 */
export function parseAnnualGoals(planning: Planning): any[] {
    // @ts-ignore - annualGoals is freshly added to schema
    if (!planning.annualGoals) return [];

    // @ts-ignore
    if (Array.isArray(planning.annualGoals)) {
        return planning.annualGoals;
    }

    // @ts-ignore
    if (typeof planning.annualGoals === 'string') {
        try {
            // @ts-ignore
            return JSON.parse(planning.annualGoals);
        } catch {
            return [];
        }
    }

    return [];
}

/**
 * Converts a Planning to PlanningWithTypedFields with typed JSON fields.
 */
export function toPlanningWithTypedFields(planning: Planning): PlanningWithTypedFields {
    return {
        ...planning,
        goals2026: parsePlanningGoals(planning),
        wheelOfLife: parseWheelOfLife(planning),
        activeGoals: parseActiveGoals(planning),
        backlogGoals: parseBacklogGoals(planning),
        archivedGoals: parseArchivedGoals(planning),
        // Convert null to undefined for new fields
        brainDump: planning.brainDump ?? undefined,
        futureIdentity: planning.futureIdentity ?? undefined,
        targetWheelOfLife: planning.targetWheelOfLife ? (planning.targetWheelOfLife as Record<string, number>) : undefined,
        wheelVisionStatements: planning.wheelVisionStatements ? (planning.wheelVisionStatements as Record<string, string>) : undefined,
        futureYouLetter: planning.futureYouLetter ?? undefined,
        goals: planning.goals ? (planning.goals as any) : undefined,
        annualGoalIds: planning.annualGoalIds ? (planning.annualGoalIds as string[]) : undefined,
        annualGoals: parseAnnualGoals(planning),
        antiVision: planning.antiVision ?? undefined,
        antiGoals: planning.antiGoals ? (planning.antiGoals as any) : undefined,
        themeWord: planning.themeWord ?? undefined,
        commitmentStatement: planning.commitmentStatement ?? undefined,
        signatureName: planning.signatureName ?? undefined,
        signatureImage: planning.signatureImage ?? undefined,
        signedAt: planning.signedAt ?? undefined,
        currentModule: planning.currentModule ?? undefined,
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

/**
 * Safely parses yearly review wheel ratings from JSON field.
 */
export function parseWheelRatings(review: YearlyReview): Record<string, number> {
    if (!review.wheelRatings) return {};

    if (typeof review.wheelRatings === 'object' && !Array.isArray(review.wheelRatings)) {
        return review.wheelRatings as Record<string, number>;
    }

    if (typeof review.wheelRatings === 'string') {
        try {
            return JSON.parse(review.wheelRatings) as Record<string, number>;
        } catch {
            return {};
        }
    }

    return {};
}

/**
 * Safely parses yearly review wheel wins from JSON field.
 */
export function parseWheelWins(review: YearlyReview): Record<string, string> {
    if (!review.wheelWins) return {};

    if (typeof review.wheelWins === 'object' && !Array.isArray(review.wheelWins)) {
        return review.wheelWins as Record<string, string>;
    }

    if (typeof review.wheelWins === 'string') {
        try {
            return JSON.parse(review.wheelWins) as Record<string, string>;
        } catch {
            return {};
        }
    }

    return {};
}

/**
 * Safely parses yearly review wheel gaps from JSON field.
 */
export function parseWheelGaps(review: YearlyReview): Record<string, string> {
    if (!review.wheelGaps) return {};

    if (typeof review.wheelGaps === 'object' && !Array.isArray(review.wheelGaps)) {
        return review.wheelGaps as Record<string, string>;
    }

    if (typeof review.wheelGaps === 'string') {
        try {
            return JSON.parse(review.wheelGaps) as Record<string, string>;
        } catch {
            return {};
        }
    }

    return {};
}

/**
 * Safely parses yearly review big three wins from JSON field.
 */
export function parseBigThreeWins(review: YearlyReview): [string, string, string] {
    if (!review.bigThreeWins) return ["", "", ""];

    if (Array.isArray(review.bigThreeWins) && review.bigThreeWins.length === 3) {
        return review.bigThreeWins as [string, string, string];
    }

    if (typeof review.bigThreeWins === 'string') {
        try {
            const parsed = JSON.parse(review.bigThreeWins);
            if (Array.isArray(parsed) && parsed.length === 3) {
                return parsed as [string, string, string];
            }
        } catch {
            return ["", "", ""];
        }
    }

    return ["", "", ""];
}

/**
 * Converts a YearlyReview to YearlyReviewWithTypedFields with typed JSON fields.
 */
export function toYearlyReviewWithTypedFields(review: YearlyReview): YearlyReviewWithTypedFields {
    return {
        ...review,
        wheelRatings: parseWheelRatings(review),
        wheelWins: parseWheelWins(review),
        wheelGaps: parseWheelGaps(review),
        bigThreeWins: parseBigThreeWins(review),
    };
}

/**
 * Calculates the total units from a daily log's priorities.
 * Returns 0 for missing/invalid logs or priorities.
 */
export function getTotalUnits(log: DailyLog | null | undefined): number {
    if (!log) return 0;

    const priorities = parseDailyLogPriorities(log);
    if (!priorities || typeof priorities !== 'object') return 0;

    const prioritiesRecord = priorities as Record<string, { units?: number }>;
    return Object.values(prioritiesRecord).reduce((sum: number, p) => sum + (p?.units ?? 0), 0);
}

