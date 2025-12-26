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
import { getRequiredSession } from "@/lib/auth/server";
import { upsertPlanning } from "@/data-access/planning";
import { PlanningFormSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

export async function savePlanningAction(formData: unknown) {
    try {
        // Verify session - throws if not authenticated
        const session = await getRequiredSession();
        
        // Rate limit: 10 saves per minute per user
        enforceRateLimit(`save-planning:${session.user.id}`, 10, 60000);

        const validated = PlanningFormSchema.parse(formData);

        // Sanitize text inputs
        const sanitizedGoals = validated.goals2026.map(goal => ({
            ...goal,
            area: sanitizeText(goal.area, 200),
            outcome: sanitizeText(goal.outcome, 500),
            why: sanitizeText(goal.why, 1000),
            deadline: goal.deadline ? sanitizeText(goal.deadline, 50) : undefined,
        }));

        const data = {
            userId: session.user.id,
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
        
        return { success: true, message: "Planning data saved successfully" };
    } catch (error) {
        console.error("Error in savePlanningAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to save planning data. Please try again.");
    }
}

// Alias for consistency with UI terminology
export async function solidifyPlanAction(formData: unknown) {
    return savePlanningAction(formData);
}

