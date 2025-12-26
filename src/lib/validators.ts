import { z } from "zod";

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
export const SprintPriorityTypeSchema = z.enum(["habit", "work"]);
export type SprintPriorityType = z.infer<typeof SprintPriorityTypeSchema>;

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
    units: z.number().default(0),
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

// Planning Form
export const PlanningFormSchema = z.object({
    currentSelf: z.string().min(10, "Describe your current self in more detail"),
    desiredSelf: z.string().min(10, "Describe your desired self in more detail"),
    goals2026: z.array(GoalSchema),
    wheelOfLife: WheelOfLifeSchema,
    wheelOfLifeTarget: WheelOfLifeSchema.optional(),
});
export type PlanningFormData = z.infer<typeof PlanningFormSchema>;

// Sprint Form
export const SprintFormSchema = z.object({
    name: z.string().min(3, "Sprint name is required"),
    startDate: z.date(),
    endDate: z.date(),
    priorities: z.array(SprintPrioritySchema)
        .min(1, "At least one priority is required")
        .max(3, "Focus on no more than 3 priorities per sprint"),
});
export type SprintFormData = z.infer<typeof SprintFormSchema>;

// Daily Log Form
export const DailyLogFormSchema = z.object({
    date: z.date(),
    energy: z.number().min(1).max(5),
    sleepHours: z.number().optional(),
    mainFocusCompleted: z.boolean(),
    morningGapMin: z.number().optional(),
    distractionMin: z.number().optional(),
    priorities: z.record(z.string(), DailyPriorityLogSchema),
    proofOfWork: z.array(ProofOfWorkSchema),
    win: z.string().optional(),
    drain: z.string().optional(),
    note: z.string().optional(),
});
export type DailyLogFormData = z.infer<typeof DailyLogFormSchema>;
