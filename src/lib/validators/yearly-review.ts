import { z } from "zod";

/**
 * Life dimensions for the wheel of life review
 */
export const LIFE_DIMENSIONS = [
    "health",
    "training",
    "mental",
    "learning",
    "technical",
    "creativity",
    "relationships",
    "income",
] as const;

export type LifeDimension = typeof LIFE_DIMENSIONS[number];

/**
 * Dimension labels for display
 */
export const DIMENSION_LABELS: Record<LifeDimension, string> = {
    health: "Health & Energy",
    training: "Physical Training",
    mental: "Mental Wellbeing",
    learning: "Learning & Growth",
    technical: "Technical Depth",
    creativity: "Creativity & Joy",
    relationships: "Relationships",
    income: "Income & Security",
};

/**
 * Yearly Review Status
 */
export enum YearlyReviewStatus {
    DRAFT = "draft",
    COMPLETED = "completed",
}

/**
 * Wheel ratings schema - 1-10 for each dimension
 * Made lenient for partial saves - only validates provided keys
 */
export const WheelRatingsSchema = z.record(
    z.string(),
    z.number().min(1).max(10)
).refine(
    (data) => {
        // Only validate keys that are actually LIFE_DIMENSIONS
        const keys = Object.keys(data);
        return keys.every(key => LIFE_DIMENSIONS.includes(key as LifeDimension));
    },
    { message: "Invalid dimension key" }
);

export type WheelRatings = z.infer<typeof WheelRatingsSchema>;

/**
 * Wheel wins/gaps schema - text per dimension
 * Made lenient for partial saves
 */
export const WheelAuditSchema = z.record(
    z.string(),
    z.string().max(2000).optional() // ~200 words max
).refine(
    (data) => {
        const keys = Object.keys(data);
        return keys.every(key => LIFE_DIMENSIONS.includes(key as LifeDimension));
    },
    { message: "Invalid dimension key" }
);

export type WheelAudit = z.infer<typeof WheelAuditSchema>;

/**
 * Big Three Wins schema - array of 3 strings
 * Made lenient for partial saves - allows empty strings
 */
export const BigThreeWinsSchema = z.tuple([
    z.string().max(1000), // ~100 words max, can be empty
    z.string().max(1000),
    z.string().max(1000),
]);

export type BigThreeWins = z.infer<typeof BigThreeWinsSchema>;

/**
 * Yearly Review Form Schema (for saving progress)
 * All fields are optional to allow partial saves
 */
export const YearlyReviewFormSchema = z.object({
    year: z.number().int().min(2020).max(2100).optional(),
    currentStep: z.number().int().min(1).max(6).optional(),
    wheelRatings: WheelRatingsSchema.optional(),
    wheelWins: WheelAuditSchema.optional(),
    wheelGaps: WheelAuditSchema.optional(),
    bigThreeWins: z.array(z.string().max(1000)).length(3).optional(), // Allow partial array
    damnGoodDecision: z.string().max(3000).optional(), // ~300 words max
    generatedNarrative: z.string().max(5000).optional(),
});

export type YearlyReviewFormData = z.infer<typeof YearlyReviewFormSchema>;

/**
 * Complete Yearly Review Schema (for final submission)
 */
export const CompleteYearlyReviewSchema = YearlyReviewFormSchema.extend({
    wheelRatings: WheelRatingsSchema,
    wheelWins: WheelAuditSchema,
    wheelGaps: WheelAuditSchema,
    bigThreeWins: BigThreeWinsSchema,
    damnGoodDecision: z.string().min(1).max(3000),
    generatedNarrative: z.string().min(1).max(5000),
});

export type CompleteYearlyReviewData = z.infer<typeof CompleteYearlyReviewSchema>;

