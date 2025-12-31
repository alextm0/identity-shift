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
import { getOrCreatePlanning, updatePlanning, getPlanningById } from "@/data-access/planning";
import { PlanningFormSchema, CompletePlanningSchema, type PlanningFormData, type CompletePlanningData, PlanningStatus } from "@/lib/validators";
import { success } from "@/lib/actions/result";
import { createActionWithParam, createActionWithoutValidation } from "@/lib/actions/middleware";
import { NotFoundError } from "@/lib/errors";

/**
 * Get or create planning for current user
 */
export const getOrCreatePlanningAction = createActionWithoutValidation(
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
        rateLimit: { key: 'get-planning', limit: 10, windowMs: 60000 },
        errorMessage: "Failed to load planning. Please try again."
    }
);

/**
 * Save planning progress (auto-save)
 */
export const savePlanningProgressAction = createActionWithParam(
    PlanningFormSchema.partial(),
    async (userId, planningId: string, validated: Partial<PlanningFormData>) => {
        // Verify ownership
        const existing = await getPlanningById(planningId, userId);
        if (!existing) {
            throw new NotFoundError("Planning not found");
        }

        // Data is already sanitized by Zod schema transforms
        const updateData = {
            ...validated,
            updatedAt: new Date(),
        };

        await updatePlanning(planningId, userId, updateData);

        revalidatePath("/dashboard/planning");

        return success(
            { planningId },
            { message: "Progress saved" }
        );
    },
    {
        rateLimit: { key: 'save-planning', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to save progress. Please try again."
    }
);

/**
 * Complete planning (mark as completed)
 */
export const completePlanningAction = createActionWithParam(
    CompletePlanningSchema,
    async (userId, planningId: string, validated: CompletePlanningData) => {
        // Verify ownership
        const existing = await getPlanningById(planningId, userId);
        if (!existing) {
            throw new NotFoundError("Planning not found");
        }

        // Data is already sanitized by Zod schema transforms
        const updateData = {
            ...validated,
            status: PlanningStatus.COMPLETED,
            completedAt: new Date(),
            updatedAt: new Date(),
        };

        await updatePlanning(planningId, userId, updateData);

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
        rateLimit: { key: 'complete-planning', limit: 5, windowMs: 3600000 },
        errorMessage: "Failed to complete planning. Please try again."
    }
);


