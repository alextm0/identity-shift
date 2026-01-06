import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

/**
 * Life dimensions for the wheel of life review
 */
export const LIFE_DIMENSIONS = [
    "health",
    "mental_clarity",
    "career",
    "learning_building",
    "family_friends",
    "romance",
    "finances",
    "recreation",
] as const;

export type LifeDimension = typeof LIFE_DIMENSIONS[number];

/**
 * Dimension labels for display
 */
export const DIMENSION_LABELS: Record<LifeDimension, string> = {
    health: "Health",
    mental_clarity: "Mental Clarity",
    career: "Career",
    learning_building: "Learning & Building",
    family_friends: "Family & Friends",
    romance: "Romance",
    finances: "Finances",
    recreation: "Recreation",
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
    z.string().max(2000).optional().transform(val => val ? sanitizeText(val, 2000) : val) // ~200 words max
).refine(
    (data) => {
        const keys = Object.keys(data);
        return keys.every(key => LIFE_DIMENSIONS.includes(key as LifeDimension));
    },
    { message: "Invalid dimension key" }
);

export type WheelAudit = z.infer<typeof WheelAuditSchema>;

/**
 * Wins schema - flexible array of strings (no hard cap)
 */
export const WinsSchema = z.array(z.string().max(1000).transform(val => sanitizeText(val, 1000))).max(100); // Soft limit at 100 for safety

export type Wins = z.infer<typeof WinsSchema>;

/**
 * Yearly Review Form Schema (for saving progress)
 * All fields are optional to allow partial saves
 */
export const YearlyReviewFormSchema = z.object({
    year: z.number().int().min(2020).max(2100).optional(),
    currentStep: z.number().int().min(1).max(3).optional(), // Updated to 3 steps
    wheelRatings: WheelRatingsSchema.optional(),
    wheelWins: WheelAuditSchema.optional(),
    wheelGaps: WheelAuditSchema.optional(),
    wins: WinsSchema.optional(),
    otherDetails: z.string().max(5000).optional().transform(val => val ? sanitizeText(val, 5000) : val), // ~500 words max
});

export type YearlyReviewFormData = z.infer<typeof YearlyReviewFormSchema>;

/**
 * Complete Yearly Review Schema (for final submission)
 */
export const CompleteYearlyReviewSchema = YearlyReviewFormSchema.extend({
    wheelRatings: WheelRatingsSchema,
    wins: WinsSchema, // Required for completion (can be empty array)
    // otherDetails is optional
});

export type CompleteYearlyReviewData = z.infer<typeof CompleteYearlyReviewSchema>;

