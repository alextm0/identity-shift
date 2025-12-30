import { z } from "zod";
import { LIFE_DIMENSIONS, type LifeDimension } from "./yearly-review";
import { sanitizeText } from "@/lib/sanitize";

/**
 * Planning Status
 */
export enum PlanningStatus {
    DRAFT = "draft",
    COMPLETED = "completed",
}

/**
 * Wheel of Life Category (for goal categorization)
 */
export const WheelOfLifeCategorySchema = z.enum(LIFE_DIMENSIONS as unknown as [LifeDimension, ...LifeDimension[]]);
export type WheelOfLifeCategory = z.infer<typeof WheelOfLifeCategorySchema>;

/**
 * Annual Goal Schema (Strict)
 * Goals with definition of done, progress signal, and optional why
 */
export const AnnualGoalSchema = z.object({
    id: z.string().uuid(),
    text: z.string().min(1, "Goal text is required").max(500).transform(val => sanitizeText(val, 500)),
    category: WheelOfLifeCategorySchema.optional(),
    definitionOfDone: z.string().min(1, "Definition of done is required").max(1000).transform(val => sanitizeText(val, 1000)),
    progressSignal: z.string().max(500).optional().transform(val => val ? sanitizeText(val, 500) : val),
    whyMatters: z.string().max(1000).optional().transform(val => val ? sanitizeText(val, 1000) : val),
    createdAt: z.date().or(z.string().transform(str => new Date(str))),
    updatedAt: z.date().or(z.string().transform(str => new Date(str))).optional(),
});
export type AnnualGoal = z.infer<typeof AnnualGoalSchema>;

/**
 * Draft Annual Goal Schema (Lenient)
 * Allows incomplete goal details during planning flow
 */
export const DraftAnnualGoalSchema = AnnualGoalSchema.extend({
    definitionOfDone: z.string().max(1000).optional().transform(val => val ? sanitizeText(val, 1000) : val),
    progressSignal: z.string().max(500).optional().transform(val => val ? sanitizeText(val, 500) : val),
    whyMatters: z.string().max(1000).optional().transform(val => val ? sanitizeText(val, 1000) : val),
});
export type DraftAnnualGoal = z.infer<typeof DraftAnnualGoalSchema>;

/**
 * Simplified Goal Schema (for backlog)
 * Just the essentials: text and category
 */
export const SimplifiedGoalSchema = z.object({
    id: z.string().uuid(),
    text: z.string().min(1, "Goal text is required").max(500).transform(val => sanitizeText(val, 500)),
    category: WheelOfLifeCategorySchema.optional(),
    createdAt: z.date().or(z.string().transform(str => new Date(str))),
    updatedAt: z.date().or(z.string().transform(str => new Date(str))).optional(),
});
export type SimplifiedGoal = z.infer<typeof SimplifiedGoalSchema>;

/**
 * Anti-Goal Schema
 * What the user wants to avoid becoming (unlimited)
 */
export const AntiGoalSchema = z.object({
    id: z.string().uuid(),
    text: z.string().min(1, "Anti-goal text is required").max(500).transform(val => sanitizeText(val, 500)),
    createdAt: z.date().or(z.string().transform(str => new Date(str))).optional(),
});
export type AntiGoal = z.infer<typeof AntiGoalSchema>;

/**
 * Commitment Schema
 * Signature and oath for the year plan
 */
export const CommitmentSchema = z.object({
    commitmentStatement: z.string().max(1000).optional().transform(val => val ? sanitizeText(val, 1000) : val),
    signatureName: z.string().min(1, "Signature name is required").max(200).transform(val => sanitizeText(val, 200)),
    signatureImage: z.string().optional().transform(val => val ? val.substring(0, 500000) : val), // 500KB limit for base64
    signedAt: z.date().or(z.string().transform(str => new Date(str))),
});
export type Commitment = z.infer<typeof CommitmentSchema>;

/**
 * Planning Goal Schema (for backward compatibility)
 * Simplified version - only requires text and category
 */
export const PlanningGoalSchema = SimplifiedGoalSchema.extend({
    specific: z.string().min(1, "Specific is required").max(500).optional().transform(val => val ? sanitizeText(val, 500) : val),
    emotionalWhy: z.string().min(1, "Emotional Why is required").max(1000).optional().transform(val => val ? sanitizeText(val, 1000) : val),
    antiGoal: z.string().max(500).optional().transform(val => val ? sanitizeText(val, 500) : val),
});
export type PlanningGoal = z.infer<typeof PlanningGoalSchema>;

/**
 * Planning Form Schema (for saving progress)
 * All fields optional to allow partial saves during wizard flow
 */
export const PlanningFormSchema = z.object({
    // Step 1: Empty Your Head + Future Identity
    brainDump: z.string().max(5000).optional().transform(val => val ? sanitizeText(val, 5000) : val),
    futureIdentity: z.string().max(1000).optional().transform(val => val ? sanitizeText(val, 1000) : val),

    // Step 2: Wheel of Life Vision
    targetWheelOfLife: z.record(z.string(), z.number().min(1).max(10)).optional(),
    focusAreas: z.array(z.string()).max(3).optional(),
    wheelVisionStatements: z.record(z.string(), z.string().max(500)).optional().transform(val => {
        if (!val) return val;
        const sanitized: Record<string, string> = {};
        Object.entries(val).forEach(([key, value]) => {
            sanitized[key] = sanitizeText(value, 500);
        });
        return sanitized;
    }),

    // Step 3: Letter from Future You
    futureYouLetter: z.string().max(2000).optional().transform(val => val ? sanitizeText(val, 2000) : val),

    // Step 4-6: Goals
    goals: z.array(SimplifiedGoalSchema).optional(), // Full backlog
    annualGoalIds: z.array(z.string().uuid()).optional(), // Selected annual goals
    annualGoals: z.array(DraftAnnualGoalSchema).optional(), // Detailed annual goals with definition of done

    // Step 7: Anti-Vision + Anti-Goals
    antiVision: z.string().max(2000).optional().transform(val => val ? sanitizeText(val, 2000) : val), // Failure narrative
    antiGoals: z.array(AntiGoalSchema).optional(), // Unlimited list
    driftResponse: z.string().max(140).optional().transform(val => val ? sanitizeText(val, 140) : val), // Optional if/then response

    // Step 8: Commitment
    commitmentStatement: z.string().max(1000).optional().transform(val => val ? sanitizeText(val, 1000) : val),
    signatureName: z.string().max(200).optional().transform(val => val ? sanitizeText(val, 200) : val),
    signatureImage: z.string().optional().transform(val => val ? val.substring(0, 500000) : val).refine(
        (val) => !val || val.startsWith("data:image/"),
        { message: "Invalid signature format. Must be a data URL." }
    ), // 500KB limit for base64
    signedAt: z.date().or(z.string().transform(str => new Date(str))).optional(),

    // Progress Tracking
    currentStep: z.number().int().min(1).max(9).optional(),
    status: z.nativeEnum(PlanningStatus).optional(),


    // From Review (for reference)
    previousIdentity: z.string().max(2000).optional().transform(val => val ? sanitizeText(val, 2000) : val),
    wheelOfLife: z.record(z.string(), z.number().min(1).max(10)).optional(),

    // Legacy fields (for backward compatibility)
    activeGoals: z.array(SimplifiedGoalSchema).optional(),
    backlogGoals: z.array(z.unknown()).optional(),
    archivedGoals: z.array(z.unknown()).optional(),
    quarterlyGoalIds: z.array(z.string().uuid()).optional(),
    crystalBallFailures: z.unknown().optional(),
    currentModule: z.number().int().min(1).max(8).optional(),
    currentGoalIndex: z.number().int().min(0).optional(),
});
export type PlanningFormData = z.infer<typeof PlanningFormSchema>;

/**
 * Complete Planning Schema (for final submission)
 * Requires annual goals, anti-vision, anti-goals, and signature
 */
export const CompletePlanningSchema = PlanningFormSchema.extend({
    futureIdentity: z.string().min(1, "Future identity is required").max(1000),
    targetWheelOfLife: z.record(z.string(), z.number().min(1).max(10)).refine(
        (val) => Object.keys(val).length > 0,
        { message: "At least one wheel dimension required" }
    ),
    annualGoalIds: z.array(z.string().uuid()).min(1, "At least one annual goal required"),
    antiVision: z.string().max(2000).optional(),
    antiGoals: z.array(AntiGoalSchema).min(3, "At least 3 anti-goals required"),
    signatureName: z.string().min(1, "Signature name is required").max(200),
    signatureImage: z.string().min(1, "Signature is required"),
    signedAt: z.date().or(z.string().transform(str => new Date(str))),
    status: z.literal(PlanningStatus.COMPLETED),
    // Enforce strict annual goal validation only on completion
    annualGoals: z.array(AnnualGoalSchema).optional(),
});
export type CompletePlanningData = z.infer<typeof CompletePlanningSchema>;
