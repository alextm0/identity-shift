
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import {
    user,
    session,
    planning,
    sprint,
    dailyLog,
    weeklyReview,
    monthlyReview
} from '@/lib/db/schema';
import type { Goal, WheelOfLife, SprintPriority, DailyPriorityLog, ProofOfWork } from '@/lib/validators';

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

// --- Typed Extensions for JSON Columns ---

/**
 * Planning with properly typed JSON fields
 */
export interface PlanningWithTypedFields extends Omit<Planning, 'goals2026' | 'wheelOfLife'> {
    goals2026: Goal[];
    wheelOfLife: WheelOfLife;
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
