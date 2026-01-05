import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import {
    users,
    authUser,
    session,
    planning,
    sprint,
    dailyLog,
    weeklyReview,
    monthlyReview,
    yearlyReview,
    sprintGoal,
    promise,
    promiseLog
} from '@/lib/db/schema';
import type { WheelOfLife, SprintPriority, DailyPriorityLog, ProofOfWork, PlanningGoal, SimplifiedGoal, AnnualGoal, AntiGoal } from '@/lib/validators';

// --- DB Types ---
export type User = InferSelectModel<typeof users>;
export type AuthUser = InferSelectModel<typeof authUser>;
export type NewUser = InferInsertModel<typeof users>;
export type Session = InferSelectModel<typeof session>;

export type Planning = InferSelectModel<typeof planning>;
export type NewPlanning = InferInsertModel<typeof planning>;

export type Sprint = InferSelectModel<typeof sprint>;
export type NewSprint = InferInsertModel<typeof sprint>;

export type SprintGoal = InferSelectModel<typeof sprintGoal>;
export type NewSprintGoal = InferInsertModel<typeof sprintGoal>;

export type SprintPromise = InferSelectModel<typeof promise>;
export type NewSprintPromise = InferInsertModel<typeof promise>;

export type PromiseLog = InferSelectModel<typeof promiseLog>;
export type NewPromiseLog = InferInsertModel<typeof promiseLog>;



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
export interface PlanningWithTypedFields extends Omit<Planning, 'wheelOfLife' | 'activeGoals' | 'backlogGoals' | 'archivedGoals' | 'annualGoals' | 'targetWheelOfLife' | 'wheelVisionStatements' | 'goals' | 'annualGoalIds' | 'antiGoals'> {
    wheelOfLife: WheelOfLife;
    activeGoals: PlanningGoal[];
    backlogGoals: unknown[];
    archivedGoals: unknown[];
    annualGoals: AnnualGoal[];
    targetWheelOfLife: WheelOfLife | null;
    wheelVisionStatements: Record<string, string> | null;
    goals: SimplifiedGoal[] | null;
    annualGoalIds: string[] | null;
    antiGoals: AntiGoal[] | null;
}

/**
 * Sprint with properly typed priorities
 */
export interface SprintWithPriorities extends Omit<Sprint, 'priorities'> {
    priorities: SprintPriority[];
}

export interface SprintWithDetails extends SprintWithPriorities {
    goals: (SprintGoal & { promises: SprintPromise[] })[];
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
    wins: string[]; // Flexible wins array
    otherDetails?: string; // Freeform field
}
