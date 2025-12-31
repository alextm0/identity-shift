import { z } from "zod";
import { OneChangeOption, SprintPriorityType, DesiredIdentityStatus } from "@/lib/enums";
export { OneChangeOption, SprintPriorityType, DesiredIdentityStatus };

// --- Validations for JSON columns ---

// Planning: Goals
export const GoalSchema = z.object({
    id: z.string().uuid().optional(),
    area: z.string().min(1, "Area is required"),
    outcome: z.string().min(1, "Outcome outcome is required"),
    why: z.string().min(1, "Why is required"),
    deadline: z.string().optional(), // YYYY-MM-DD or similar
});
export type Goal = z.infer<typeof GoalSchema>;

// Planning: Wheel of Life
export const WheelOfLifeSchema = z.record(z.string(), z.number().min(1).max(10));
export type WheelOfLife = z.infer<typeof WheelOfLifeSchema>;

// Sprint: Priorities
export const SprintPriorityTypeSchema = z.nativeEnum(SprintPriorityType);

export const SprintPrioritySchema = z.object({
    key: z.string(),
    label: z.string().min(1, "Label is required"),
    type: SprintPriorityTypeSchema,
    weeklyTargetUnits: z.number().min(1, "Target must be at least 1"),
    unitDefinition: z.string().optional(),
});
export type SprintPriority = z.infer<typeof SprintPrioritySchema>;

// Daily Log: Priorities (The actual logging of them)
export const DailyPriorityLogSchema = z.object({
    done: z.boolean(),
    units: z.number(),
    deepWorkMin: z.number().optional(),
    autonomyLevel: z.number().optional(), // 1-5?
});
export type DailyPriorityLog = z.infer<typeof DailyPriorityLogSchema>;

// Daily Log: Proof of Work
export const ProofOfWorkSchema = z.object({
    type: z.string(),
    value: z.string(),
    url: z.string().url().optional().or(z.literal("")),
});
export type ProofOfWork = z.infer<typeof ProofOfWorkSchema>;

// --- Form Schemas (Server Actions) ---

// Promise type enum
export enum PromiseType {
    DAILY = 'daily',   // Scheduled on specific days (e.g., Mon-Fri)
    WEEKLY = 'weekly', // Target X times per week, any day
}

// Blocker tags (single-select)
export enum BlockerTag {
    ENERGY = 'energy',
    TIME = 'time',
    EXTERNAL = 'external',
    MOTIVATION = 'motivation',
    NONE = 'none',
}

// Promise display status (consistent across all UI)
export enum PromiseDisplayStatus {
    DONE = 'done',
    NOT_DONE = 'not_done',
    NA = 'na', // Not scheduled for this day
}

// Sprint review: promise disposition
export enum PromiseDisposition {
    KEEP = 'keep',
    ADJUST = 'adjust',
    CUT = 'cut',
}

// Sprint review: confidence status (optional 1-tap)
export enum SprintConfidenceStatus {
    ON_TRACK = 'on_track',
    AT_RISK = 'at_risk',
    OFF_TRACK = 'off_track',
}

// Promise schema (binary only - no numeric tracking)
export const PromiseSchema = z.object({
    id: z.string().uuid().optional(),
    text: z.string().min(1).max(200),
    type: z.nativeEnum(PromiseType),
    scheduleDays: z.array(z.number().min(0).max(6)).optional(), // For daily: 0=Sun, 1=Mon...6=Sat
    weeklyTarget: z.number().min(1).max(7).optional(),          // For weekly: e.g., 3 for "gym 3x/week"
});
export type PromiseData = z.infer<typeof PromiseSchema>;

// Sprint Goal schema
export const SprintGoalSchema = z.object({
    id: z.string().uuid().optional(),
    goalId: z.string().uuid(),       // References annualGoals[].id from planning
    goalText: z.string(),
    promises: z.array(PromiseSchema).min(1).max(4),
});
export type SprintGoalData = z.infer<typeof SprintGoalSchema>;

// Promise Log schema (date-based)
export const PromiseLogSchema = z.object({
    promiseId: z.string().uuid(),
    date: z.date(),
    completed: z.boolean(),
});
export type PromiseLogData = z.infer<typeof PromiseLogSchema>;

// Daily Audit schema
export const DailyAuditSchema = z.object({
    date: z.date(),
    mainGoalId: z.string().uuid(),  // Required: today's focus goal
    promiseCompletions: z.record(z.string(), z.boolean()), // {promiseId: completed}
    energy: z.number().min(1).max(5).optional(),
    blockerTag: z.nativeEnum(BlockerTag).nullish(),
    note: z.string().max(140).optional(),
});
export type DailyAuditData = z.infer<typeof DailyAuditSchema>;

// Update Daily Log schema (for editing existing logs)
export const UpdateDailyLogSchema = z.object({
    logId: z.string().uuid(),
    energy: z.number().min(1).max(5).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    mainFocusCompleted: z.boolean().optional(),
    morningGapMin: z.number().min(0).max(1440).optional(),
    distractionMin: z.number().min(0).max(1440).optional(),
    priorities: z.record(z.string(), DailyPriorityLogSchema).optional(),
    proofOfWork: z.array(ProofOfWorkSchema).optional(),
    win: z.string().max(500).optional(),
    drain: z.string().max(500).optional(),
    note: z.string().max(500).optional(),
});
export type UpdateDailyLogData = z.infer<typeof UpdateDailyLogSchema>;

// Quick promise log (for logging weekly promises without full audit)
export const QuickPromiseLogSchema = z.object({
    promiseId: z.string().uuid(),
    date: z.date(),
    completed: z.boolean(),
});
export type QuickPromiseLogData = z.infer<typeof QuickPromiseLogSchema>;

// Input Schemas for Forms
export const CreatePromiseSchema = PromiseSchema; // ID is now optional
export type CreatePromiseData = z.infer<typeof CreatePromiseSchema>;

export const CreateSprintGoalSchema = SprintGoalSchema; // ID is now optional
export type CreateSprintGoalData = z.infer<typeof CreateSprintGoalSchema>;

// Sprint Form
export const SprintFormSchema = z.object({
    name: z.string().min(3, "Sprint name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    goals: z.array(CreateSprintGoalSchema)
        .min(1, "At least one goal is required")
        .max(3, "Focus on no more than 3 goals per sprint"),
}).refine(
    (data) => {
        // Ensure endDate is after startDate
        if (!data.startDate || !data.endDate) return true;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
    },
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);
export type SprintFormData = z.infer<typeof SprintFormSchema>;

// Daily Log Form
export const DailyLogFormSchema = z.object({
    date: z.date(),
    mainGoalId: z.string().uuid(),
    energy: z.number().min(1).max(5).optional(),
    blockerTag: z.nativeEnum(BlockerTag).nullish(),
    note: z.string().optional(),
    promiseCompletions: z.record(z.string(), z.boolean()), // {promiseId: boolean}
    proofOfWork: z.array(ProofOfWorkSchema).optional(), // Kept for legacy compatibility
});
export type DailyLogFormData = z.infer<typeof DailyLogFormSchema>;

// Weekly Review Form
export const WeeklyReviewFormSchema = z.object({
    sprintId: z.string().uuid(),
    weekEndDate: z.date(),
    progressRatios: z.record(z.string(), z.number().min(0).max(1)), // {priorityKey: ratio}
    evidenceRatio: z.number().min(0).max(100),
    antiBullshitScore: z.number().min(0).max(100),
    alerts: z.array(z.string()),
    oneChange: z.nativeEnum(OneChangeOption),
    changeReason: z.string().optional(),
});
export type WeeklyReviewFormData = z.infer<typeof WeeklyReviewFormSchema>;

// Monthly Review Form
export const MonthlyReviewFormSchema = z.object({
    sprintId: z.string().uuid(),
    month: z.string().regex(/^\d{4}-\d{2}$/).refine((val) => {
        const month = parseInt(val.split('-')[1], 10);
        return month >= 1 && month <= 12;
    }, { message: "Month must be between 01 and 12" }), // YYYY-MM format with valid month
    whoWereYou: z.string().optional(),
    desiredIdentity: z.nativeEnum(DesiredIdentityStatus).optional(),
    perceivedProgress: z.record(z.string(), z.number().min(1).max(10)), // {priorityKey: 1-10}
    actualProgress: z.object({
        progressRatio: z.number().min(0).max(1),
        evidenceRatio: z.number().min(0).max(100),
    }),
    oneChange: z.string().optional(),
});
export type MonthlyReviewFormData = z.infer<typeof MonthlyReviewFormSchema>;

// Yearly Review - re-export from dedicated file
export {
    YearlyReviewFormSchema,
    CompleteYearlyReviewSchema,
    WheelRatingsSchema,
    WheelAuditSchema,
    BigThreeWinsSchema,
    LIFE_DIMENSIONS,
    DIMENSION_LABELS,
    YearlyReviewStatus,
    type YearlyReviewFormData,
    type CompleteYearlyReviewData,
    type WheelRatings,
    type WheelAudit,
    type BigThreeWins,
    type LifeDimension,
} from "./validators/yearly-review";

// Planning - re-export from dedicated file
export {
    PlanningFormSchema,
    CompletePlanningSchema,
    PlanningGoalSchema,
    SimplifiedGoalSchema,
    AnnualGoalSchema,
    AntiGoalSchema,
    CommitmentSchema,
    PlanningStatus,
    WheelOfLifeCategorySchema,
    type PlanningFormData,
    type CompletePlanningData,
    type PlanningGoal,
    type SimplifiedGoal,
    type AnnualGoal,
    type AntiGoal,
    type Commitment,
    type WheelOfLifeCategory,
    type DraftAnnualGoal,
} from "./validators/planning";