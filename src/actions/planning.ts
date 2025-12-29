'use server';

/**
 * Server Actions for Planning
 * 
 * Following Next.js authentication patterns:
 * https://nextjs.org/docs/app/guides/authentication
 * 
 * Security:
 * - Verifies user session before proceeding
 * - Ensures user can only save their own planning data
 * - All data is filtered by authenticated userId
 */

import { revalidatePath } from "next/cache";
import { getOrCreatePlanning, updatePlanning, completePlanning, getPlanningById } from "@/data-access/planning";
import { PlanningFormSchema, CompletePlanningSchema, type PlanningFormData, type CompletePlanningData } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";
import { ActionResult, success } from "@/lib/actions/result";
import { withAuth, withValidation, withErrorHandling } from "@/lib/actions/middleware";
import { NotFoundError } from "@/lib/errors";
import { randomUUID } from "crypto";

/**
 * Get or create planning for current user
 */
export async function getOrCreatePlanningAction(): Promise<ActionResult<{ planningId: string; currentModule: number; currentStep: number; status: string }>> {
    const wrappedAction = withErrorHandling(
        withAuth(
            async (userId) => {
                const planning = await getOrCreatePlanning(userId);

                return success(
                    {
                        planningId: planning.id,
                        currentModule: planning.currentModule || 1,
                        currentStep: planning.currentStep || 1,
                        status: planning.status || 'draft',
                    },
                    { message: "Planning loaded successfully" }
                );
            },
            {
                rateLimit: { key: 'get-planning', limit: 10, windowMs: 60000 }
            }
        ),
        "Failed to load planning. Please try again."
    );

    return await wrappedAction();
}

/**
 * Save planning progress (auto-save)
 */
export async function savePlanningProgressAction(planningId: string, formData: unknown): Promise<ActionResult<{ planningId: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            PlanningFormSchema.partial(),
            withAuth(
                async (userId, validated: Partial<PlanningFormData>) => {
                    // Verify ownership
                    const existing = await getPlanningById(planningId, userId);
                    if (!existing) {
                        throw new NotFoundError("Planning not found");
                    }

                    // Sanitize text inputs
                    const updateData: any = {
                        ...validated,
                        updatedAt: new Date(),
                    };

                    // Sanitize Step 1 fields
                    if (validated.brainDump) {
                        updateData.brainDump = sanitizeText(validated.brainDump, 5000);
                    }
                    if (validated.futureIdentity) {
                        updateData.futureIdentity = sanitizeText(validated.futureIdentity, 1000);
                    }

                    // Sanitize Step 2 fields
                    if (validated.wheelVisionStatements) {
                        const sanitized: Record<string, string> = {};
                        Object.entries(validated.wheelVisionStatements).forEach(([key, value]) => {
                            sanitized[key] = sanitizeText(value as string, 500);
                        });
                        updateData.wheelVisionStatements = sanitized;
                    }

                    // Sanitize Step 3 fields
                    if (validated.futureYouLetter) {
                        updateData.futureYouLetter = sanitizeText(validated.futureYouLetter, 2000);
                    }

                    // Sanitize goals if present
                    if (validated.goals) {
                        updateData.goals = validated.goals.map((goal: any) => ({
                            ...goal,
                            text: goal.text ? sanitizeText(goal.text, 500) : goal.text,
                        }));
                    }

                    if (validated.annualGoals) {
                        updateData.annualGoals = validated.annualGoals.map((goal: any) => ({
                            ...goal,
                            text: goal.text ? sanitizeText(goal.text, 500) : goal.text,
                            definitionOfDone: goal.definitionOfDone ? sanitizeText(goal.definitionOfDone, 1000) : goal.definitionOfDone,
                            progressSignal: goal.progressSignal ? sanitizeText(goal.progressSignal, 500) : goal.progressSignal,
                            whyMatters: goal.whyMatters ? sanitizeText(goal.whyMatters, 1000) : goal.whyMatters,
                        }));
                    }

                    // Sanitize Step 7 fields
                    if (validated.antiVision) {
                        updateData.antiVision = sanitizeText(validated.antiVision, 2000);
                    }
                    if (validated.antiGoals) {
                        updateData.antiGoals = validated.antiGoals.map((antiGoal: any) => ({
                            ...antiGoal,
                            text: antiGoal.text ? sanitizeText(antiGoal.text, 500) : antiGoal.text,
                        }));
                    }

                    // Sanitize Step 8 fields
                    if (validated.commitmentStatement) {
                        updateData.commitmentStatement = sanitizeText(validated.commitmentStatement, 1000);
                    }
                    if (validated.signatureName) {
                        updateData.signatureName = sanitizeText(validated.signatureName, 200);
                    }
                    if (validated.signatureImage) {
                        // Basic length check for base64
                        updateData.signatureImage = validated.signatureImage.substring(0, 500000); // 500KB limit roughly
                    }

                    // Sanitize previousIdentity if present
                    if (validated.previousIdentity) {
                        updateData.previousIdentity = sanitizeText(validated.previousIdentity, 2000);
                    }

                    // Legacy support: sanitize activeGoals if present (for backward compatibility)
                    if (validated.activeGoals) {
                        updateData.activeGoals = validated.activeGoals.map((goal: any) => ({
                            ...goal,
                            text: goal.text || goal.originalText ? sanitizeText(goal.text || goal.originalText, 500) : undefined,
                            whyMatters: goal.whyMatters ? sanitizeText(goal.whyMatters, 1000) : goal.whyMatters,
                        }));
                    }

                    await updatePlanning(planningId, userId, updateData);

                    revalidatePath("/dashboard/planning");

                    return success(
                        { planningId },
                        { message: "Progress saved" }
                    );
                },
                {
                    rateLimit: { key: 'save-planning', limit: 20, windowMs: 60000 }
                }
            )
        ),
        "Failed to save progress. Please try again."
    );

    return await wrappedAction(formData);
}

/**
 * Complete planning (mark as completed)
 */
export async function completePlanningAction(planningId: string, formData: unknown): Promise<ActionResult<{ planningId: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            CompletePlanningSchema,
            withAuth(
                async (userId, validated: CompletePlanningData) => {
                    // Verify ownership
                    const existing = await getPlanningById(planningId, userId);
                    if (!existing) {
                        throw new NotFoundError("Planning not found");
                    }

                    // Sanitize and prepare update data
                    const updateData: any = {
                        ...validated,
                        status: 'completed',
                        completedAt: new Date(),
                        updatedAt: new Date(),
                    };

                    // Sanitize Step 1 fields
                    if (validated.brainDump) {
                        updateData.brainDump = sanitizeText(validated.brainDump, 5000);
                    }
                    if (validated.futureIdentity) {
                        updateData.futureIdentity = sanitizeText(validated.futureIdentity, 1000);
                    }

                    // Sanitize Step 2 fields
                    if (validated.wheelVisionStatements) {
                        const sanitized: Record<string, string> = {};
                        Object.entries(validated.wheelVisionStatements).forEach(([key, value]) => {
                            sanitized[key] = sanitizeText(value as string, 500);
                        });
                        updateData.wheelVisionStatements = sanitized;
                    }

                    // Sanitize Step 3 fields
                    if (validated.futureYouLetter) {
                        updateData.futureYouLetter = sanitizeText(validated.futureYouLetter, 2000);
                    }

                    // Sanitize goals
                    if (validated.goals) {
                        updateData.goals = validated.goals.map((goal: any) => ({
                            ...goal,
                            text: sanitizeText(goal.text, 500),
                        }));
                    }

                    if (validated.annualGoals) {
                        updateData.annualGoals = validated.annualGoals.map((goal: any) => ({
                            ...goal,
                            text: sanitizeText(goal.text, 500),
                            definitionOfDone: sanitizeText(goal.definitionOfDone, 1000),
                            progressSignal: goal.progressSignal ? sanitizeText(goal.progressSignal, 500) : undefined,
                            whyMatters: goal.whyMatters ? sanitizeText(goal.whyMatters, 1000) : undefined,
                        }));
                    }

                    // Sanitize Step 7 fields
                    if (validated.antiVision) {
                        updateData.antiVision = sanitizeText(validated.antiVision, 2000);
                    }
                    if (validated.antiGoals) {
                        updateData.antiGoals = validated.antiGoals.map((antiGoal: any) => ({
                            ...antiGoal,
                            text: sanitizeText(antiGoal.text, 500),
                        }));
                    }

                    // Sanitize Step 8 fields
                    if (validated.commitmentStatement) {
                        updateData.commitmentStatement = sanitizeText(validated.commitmentStatement, 1000);
                    }
                    if (validated.signatureName) {
                        updateData.signatureName = sanitizeText(validated.signatureName, 200);
                    }
                    if (validated.signatureImage) {
                        updateData.signatureImage = validated.signatureImage.substring(0, 500000);
                    }

                    if (validated.previousIdentity) {
                        updateData.previousIdentity = sanitizeText(validated.previousIdentity, 2000);
                    }

                    // Legacy support: sanitize activeGoals if present
                    if (validated.activeGoals) {
                        updateData.activeGoals = validated.activeGoals.map((goal: any) => ({
                            ...goal,
                            text: goal.text || goal.originalText ? sanitizeText(goal.text || goal.originalText, 500) : undefined,
                            whyMatters: goal.whyMatters ? sanitizeText(goal.whyMatters, 1000) : undefined,
                        }));
                    }

                    await updatePlanning(planningId, userId, updateData);
                    await completePlanning(planningId, userId);

                    revalidatePath("/dashboard/planning");
                    revalidatePath("/dashboard");

                    return success(
                        { planningId },
                        {
                            message: "Planning completed successfully",
                            redirect: "/dashboard/planning/view"
                        }
                    );
                },
                {
                    rateLimit: { key: 'complete-planning', limit: 5, windowMs: 3600000 }
                }
            )
        ),
        "Failed to complete planning. Please try again."
    );

    return await wrappedAction(formData);
}

/**
 * Legacy: Save planning action (for backward compatibility)
 */
export async function savePlanningAction(formData: unknown): Promise<ActionResult<{ saved: boolean }>> {
    // This is a legacy action - redirect to new wizard flow
    return success(
        { saved: false },
        {
            message: "Please use the planning wizard",
            redirect: "/dashboard/planning"
        }
    );
}

// Alias for consistency with UI terminology
export async function solidifyPlanAction(formData: unknown): Promise<ActionResult<{ saved: boolean }>> {
    return savePlanningAction(formData);
}

