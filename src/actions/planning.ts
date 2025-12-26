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
import { upsertPlanning } from "@/data-access/planning";
import { PlanningFormSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";
import { ActionResult, success } from "@/lib/actions/result";
import { withAuth, withValidation, withErrorHandling } from "@/lib/actions/middleware";
import { randomUUID } from "crypto";

export async function savePlanningAction(formData: unknown): Promise<ActionResult<{ saved: boolean }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            PlanningFormSchema,
            withAuth(
                async (userId, validated) => {
                    // Sanitize text inputs
                    const sanitizedGoals = validated.goals2026.map(goal => ({
                        ...goal,
                        area: sanitizeText(goal.area, 200),
                        outcome: sanitizeText(goal.outcome, 500),
                        why: sanitizeText(goal.why, 1000),
                        deadline: goal.deadline ? sanitizeText(goal.deadline, 50) : undefined,
                    }));

                    const data = {
                        userId,
                        currentSelf: sanitizeText(validated.currentSelf, 5000),
                        desiredSelf: sanitizeText(validated.desiredSelf, 5000),
                        goals2026: sanitizedGoals,
                        wheelOfLife: validated.wheelOfLife,
                        id: randomUUID(), // Only used for new. DAL handles upsert by userId.
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    await upsertPlanning(data);

                    revalidatePath("/planning");
                    revalidatePath("/dashboard");
                    revalidatePath("/dashboard/identity");
                    
                    return success(
                        { saved: true },
                        { 
                            message: "Planning data saved successfully",
                            redirect: "dashboard"
                        }
                    );
                },
                {
                    rateLimit: { key: 'save-planning', limit: 10, windowMs: 60000 }
                }
            )
        ),
        "Failed to save planning data. Please try again."
    );
    
    return await wrappedAction(formData);
}

// Alias for consistency with UI terminology
export async function solidifyPlanAction(formData: unknown): Promise<ActionResult<{ saved: boolean }>> {
    return savePlanningAction(formData);
}

