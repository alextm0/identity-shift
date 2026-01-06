/**
 * Type helper functions for safely parsing JSON fields from database.
 * 
 * These functions help convert database JSON fields to properly typed objects.
 */

import type { DailyLog, Planning, WeeklyReview, MonthlyReview, YearlyReview, Sprint } from '@/lib/types';
import type { DailyPriorityLog, ProofOfWork, WheelOfLife, PlanningGoal, SimplifiedGoal, AnnualGoal, SprintPriority, AntiGoal } from '@/lib/validators';
import type { DailyLogWithTypedFields, PlanningWithTypedFields, WeeklyReviewWithTypedFields, MonthlyReviewWithTypedFields, YearlyReviewWithTypedFields, SprintWithPriorities } from '@/lib/types';
import { createJsonParser } from '@/lib/utils/json-parser';


/**
 * Safely parses sprint priorities from JSON field.
 */
const parseSprintPrioritiesInternal = createJsonParser<SprintPriority[]>({ defaultValue: [], context: 'parseSprintPriorities', isArray: true });
export function parseSprintPriorities(sprint: { priorities?: unknown } | null | undefined): SprintPriority[] {
    if (!sprint) return [];
    return parseSprintPrioritiesInternal(sprint.priorities);
}

/**
 * Converts a Sprint to SprintWithPriorities with typed JSON fields.
 */
export function toSprintWithPriorities(sprint: Sprint & { priorities?: unknown }): SprintWithPriorities {
    return {
        ...sprint,
        priorities: parseSprintPriorities(sprint),
    };
}

/**
 * Safely parses daily log priorities from JSON field.
 */
const parseDailyLogPrioritiesInternal = createJsonParser<Record<string, DailyPriorityLog>>({ defaultValue: {}, context: 'parseDailyLogPriorities' });
export function parseDailyLogPriorities(log: DailyLog): Record<string, DailyPriorityLog> {
    return parseDailyLogPrioritiesInternal(log.priorities);
}

/**
 * Safely parses proof of work from JSON field.
 */
const parseProofOfWorkInternal = createJsonParser<ProofOfWork[]>({ defaultValue: [], context: 'parseProofOfWork', isArray: true });
export function parseProofOfWork(log: DailyLog): ProofOfWork[] {
    return parseProofOfWorkInternal(log.proofOfWork);
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
 * Safely parses wheel of life from JSON field.
 */
const parseWheelOfLifeInternal = createJsonParser<WheelOfLife>({ defaultValue: {}, context: 'parseWheelOfLife' });
export function parseWheelOfLife(planning: Planning): WheelOfLife {
    return parseWheelOfLifeInternal(planning.wheelOfLife);
}

/**
 * Safely parses active goals from JSON field.
 */
const parseActiveGoalsInternal = createJsonParser<PlanningGoal[]>({ defaultValue: [], context: 'parseActiveGoals', isArray: true });
export function parseActiveGoals(planning: Planning): PlanningGoal[] {
    return parseActiveGoalsInternal(planning.activeGoals);
}

/**
 * Safely parses backlog goals from JSON field (legacy - deprecated).
 */
const parseBacklogGoalsInternal = createJsonParser<unknown[]>({ defaultValue: [], context: 'parseBacklogGoals', isArray: true });
export function parseBacklogGoals(planning: Planning): unknown[] {
    return parseBacklogGoalsInternal(planning.backlogGoals);
}

/**
 * Safely parses archived goals from JSON field (legacy - deprecated).
 */
const parseArchivedGoalsInternal = createJsonParser<unknown[]>({ defaultValue: [], context: 'parseArchivedGoals', isArray: true });
export function parseArchivedGoals(planning: Planning): unknown[] {
    return parseArchivedGoalsInternal(planning.archivedGoals);
}

/**
 * Safely parses annual goals from JSON field.
 */
const parseAnnualGoalsInternal = createJsonParser<AnnualGoal[]>({ defaultValue: [], context: 'parseAnnualGoals', isArray: true });
export function parseAnnualGoals(planning: { annualGoals?: unknown } | null | undefined): AnnualGoal[] {
    if (!planning) return [];
    return parseAnnualGoalsInternal(planning.annualGoals);
}

/**
 * Safely parses target wheel of life from JSON field.
 */
const parseTargetWheelOfLifeInternal = createJsonParser<WheelOfLife | null>({ defaultValue: null, context: 'parseTargetWheelOfLife' });
export function parseTargetWheelOfLife(planning: Planning): WheelOfLife | null {
    return parseTargetWheelOfLifeInternal(planning.targetWheelOfLife);
}

/**
 * Converts a Planning to PlanningWithTypedFields with typed JSON fields.
 */
export function toPlanningWithTypedFields(planning: Planning): PlanningWithTypedFields {
    return {
        ...planning,
        wheelOfLife: parseWheelOfLife(planning),
        activeGoals: parseActiveGoals(planning),
        backlogGoals: parseBacklogGoals(planning),
        archivedGoals: parseArchivedGoals(planning),
        annualGoals: parseAnnualGoals(planning),
        targetWheelOfLife: parseTargetWheelOfLife(planning),
        wheelVisionStatements: planning.wheelVisionStatements as Record<string, string> | null,
        goals: planning.goals as SimplifiedGoal[] | null,
        annualGoalIds: planning.annualGoalIds as string[] | null,
        antiGoals: planning.antiGoals as AntiGoal[] | null,
    };
}

/**
 * Safely parses weekly review progress ratios from JSON field.
 */
const parseProgressRatiosInternal = createJsonParser<Record<string, number>>({ defaultValue: {}, context: 'parseProgressRatios' });
export function parseProgressRatios(review: WeeklyReview): Record<string, number> {
    return parseProgressRatiosInternal(review.progressRatios);
}

/**
 * Safely parses weekly review alerts from JSON field.
 */
const parseAlertsInternal = createJsonParser<string[]>({ defaultValue: [], context: 'parseAlerts', isArray: true });
export function parseAlerts(review: WeeklyReview): string[] {
    return parseAlertsInternal(review.alerts);
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
const parsePerceivedProgressInternal = createJsonParser<Record<string, number>>({ defaultValue: {}, context: 'parsePerceivedProgress' });
export function parsePerceivedProgress(review: MonthlyReview): Record<string, number> {
    return parsePerceivedProgressInternal(review.perceivedProgress);
}

/**
 * Safely parses monthly review actual progress from JSON field.
 */
const parseActualProgressInternal = createJsonParser<{ progressRatio: number; evidenceRatio: number }>({ defaultValue: { progressRatio: 0, evidenceRatio: 0 }, context: 'parseActualProgress' });
export function parseActualProgress(review: MonthlyReview): { progressRatio: number; evidenceRatio: number } {
    const result = parseActualProgressInternal(review.actualProgress);
    // Ensure structure if the parser returns the object but properties are missing
    return {
        progressRatio: result.progressRatio ?? 0,
        evidenceRatio: result.evidenceRatio ?? 0,
    };
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
const parseWheelRatingsInternal = createJsonParser<Record<string, number>>({ defaultValue: {}, context: 'parseWheelRatings' });
export function parseWheelRatings(review: YearlyReview): Record<string, number> {
    return parseWheelRatingsInternal(review.wheelRatings);
}

/**
 * Safely parses yearly review wheel wins from JSON field.
 */
const parseWheelWinsInternal = createJsonParser<Record<string, string>>({ defaultValue: {}, context: 'parseWheelWins' });
export function parseWheelWins(review: YearlyReview): Record<string, string> {
    return parseWheelWinsInternal(review.wheelWins);
}

/**
 * Safely parses yearly review wheel gaps from JSON field.
 */
const parseWheelGapsInternal = createJsonParser<Record<string, string>>({ defaultValue: {}, context: 'parseWheelGaps' });
export function parseWheelGaps(review: YearlyReview): Record<string, string> {
    return parseWheelGapsInternal(review.wheelGaps);
}

/**
 * Safely parses yearly review big wins from JSON field.
 */
const parseWinsInternal = createJsonParser<string[]>({ defaultValue: [], context: 'parseWins', isArray: true });
export function parseWins(review: YearlyReview): string[] {
    return parseWinsInternal(review.wins);
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
        wins: parseWins(review),
        otherDetails: review.otherDetails ?? undefined,
    };
}

/**
 * Calculates the total units from a daily log's priorities.
 * Returns 0 for missing/invalid logs or priorities.
 */
export function getTotalUnits(log: DailyLog | null | undefined): number {
    if (!log) return 0;

    const priorities = parseDailyLogPriorities(log);
    if (!priorities) return 0;

    const prioritiesRecord = priorities as Record<string, { units?: number }>;
    return Object.values(prioritiesRecord).reduce((sum: number, p) => sum + (p?.units ?? 0), 0);
}

