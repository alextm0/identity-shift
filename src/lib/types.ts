
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import {
    user,
    session,
    planning,
    sprint,
    dailyLog,
    weeklyReview,
    monthlyReview,
    yearlyReview
} from '@/lib/db/schema';
import type { Goal, WheelOfLife, SprintPriority, DailyPriorityLog, ProofOfWork, PlanningGoal, SimplifiedGoal, AntiGoal, CrystalBallFailures, AnnualGoal } from '@/lib/validators';

// --- DB Types ---
export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;

export type Planning = InferSelectModel<typeof planning>;
export type NewPlanning = InferInsertModel<typeof planning>;

export type Sprint = InferSelectModel<typeof sprint>;
export type NewSprint = InferInsertModel<typeof sprint>;

export type DailyLog = InferSelectModel<typeof dailyLog>;
export type NewDailyLog = InferInsertModel<typeof dailyLog>;

export type WeeklyReview = InferSelectModel<typeof weeklyReview>;
export type NewWeeklyReview = InferInsertModel<typeof weeklyReview>;

export type MonthlyReview = InferSelectModel<typeof monthlyReview>;
export type NewMonthlyReview = InferInsertModel<typeof monthlyReview>;

export type YearlyReview = InferSelectModel<typeof yearlyReview>;
export type NewYearlyReview = InferInsertModel<typeof yearlyReview>;

// --- Typed Extensions for JSON Columns ---

/**
 * Planning with properly typed JSON fields
 */
export interface PlanningWithTypedFields extends Omit<Planning, 'wheelOfLife' | 'activeGoals' | 'backlogGoals' | 'archivedGoals' | 'goals' | 'quarterlyGoalIds' | 'annualGoalIds' | 'targetWheelOfLife' | 'focusAreas' | 'wheelVisionStatements' | 'crystalBallFailures' | 'antiGoals' | 'antiVision' | 'driftResponse' | 'brainDump' | 'futureIdentity' | 'futureYouLetter' | 'commitmentStatement' | 'signatureName' | 'signatureImage' | 'signedAt' | 'currentModule'> {
    wheelOfLife?: WheelOfLife;
    activeGoals?: PlanningGoal[]; // Legacy - use goals instead
    backlogGoals?: unknown[]; // Legacy - deprecated
    archivedGoals?: unknown[]; // Legacy - deprecated
    // Step 1: Empty Your Head + Future Identity
    brainDump?: string;
    futureIdentity?: string;
    // Step 2: Wheel of Life Vision
    targetWheelOfLife?: Record<string, number>;
    focusAreas?: string[];
    wheelVisionStatements?: Record<string, string>;
    // Step 3: Letter from Future You
    futureYouLetter?: string;
    // Step 4-6: Goals
    goals?: SimplifiedGoal[];
    quarterlyGoalIds?: string[]; // Legacy
    annualGoalIds?: string[];
    annualGoals?: AnnualGoal[]; // Goals with details (definitionOfDone, progressSignal, etc.)
    // Step 7: Anti-Vision + Anti-Goals
    antiVision?: string;
    antiGoals?: AntiGoal[];
    driftResponse?: string;
    // Step 8: Commitment
    commitmentStatement?: string;
    signatureName?: string;
    signatureImage?: string;
    signedAt?: Date | string;
    // Legacy fields
    crystalBallFailures?: CrystalBallFailures;
    // Progress tracking
    currentStep?: number;
    currentModule?: number | null; // Legacy - can be null from DB
    currentGoalIndex?: number; // Legacy
}

/**
 * Sprint with properly typed priorities
 */
export interface SprintWithPriorities extends Omit<Sprint, 'priorities'> {
    priorities: SprintPriority[];
}

/**
 * DailyLog with properly typed JSON fields
 */
export interface DailyLogWithTypedFields extends Omit<DailyLog, 'priorities' | 'proofOfWork'> {
    priorities: Record<string, DailyPriorityLog>;
    proofOfWork: ProofOfWork[];
}

/**
 * WeeklyReview with properly typed JSON fields
 */
export interface WeeklyReviewWithTypedFields extends Omit<WeeklyReview, 'progressRatios' | 'alerts'> {
    progressRatios: Record<string, number>;
    alerts: string[];
}

/**
 * MonthlyReview with properly typed JSON fields
 */
export interface MonthlyReviewWithTypedFields extends Omit<MonthlyReview, 'perceivedProgress' | 'actualProgress'> {
    perceivedProgress: Record<string, number>;
    actualProgress: {
        progressRatio: number;
        evidenceRatio: number;
    };
}

/**
 * YearlyReview with properly typed JSON fields
 */
export interface YearlyReviewWithTypedFields extends Omit<YearlyReview, 'wheelRatings' | 'wheelWins' | 'wheelGaps' | 'wins' | 'otherDetails'> {
    wheelRatings: Record<string, number>;
    wheelWins: Record<string, string>;
    wheelGaps: Record<string, string>;
    wins?: string[]; // Flexible wins array
    otherDetails?: string; // Freeform field
}
