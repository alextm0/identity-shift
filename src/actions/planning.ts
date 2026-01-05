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

import { revalidateTag } from "next/cache";
import { getOrCreatePlanning, updatePlanning } from "@/data-access/planning";
import { PlanningFormSchema, CompletePlanningSchema, type PlanningFormData, type CompletePlanningData, PlanningStatus, DraftAnnualGoalSchema, type DraftAnnualGoal, type SimplifiedGoal } from "@/lib/validators";
import { success } from "@/lib/actions/result";
import { createActionWithParam, createActionWithoutValidation } from "@/lib/actions/middleware";
import { z } from "zod";

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
        // Data is already sanitized by Zod schema transforms
        const updateData = {
            ...validated,
            updatedAt: new Date(),
        };

        await updatePlanning(planningId, userId, updateData);

        // Tags-based revalidation (Standard Next.js API)
        revalidateTag("planning", "max");

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
        // Data is already sanitized by Zod schema transforms
        const updateData = {
            ...validated,
            status: PlanningStatus.COMPLETED,
            completedAt: new Date(),
            updatedAt: new Date(),
        };

        await updatePlanning(planningId, userId, updateData);

        // Tags-based revalidation (Standard Next.js API)
        revalidateTag("planning", "max");

        // Also revalidate dashboard if needed
        revalidateTag("dashboard", "max");

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



/**
 * Update a specific goal's details
 */
export const updateGoalDetailsAction = createActionWithParam(
    z.object({
        goalId: z.string().uuid(),
        updates: DraftAnnualGoalSchema.partial()
    }),
    async (userId, planningId: string, { goalId, updates }) => {
        const planning = await getOrCreatePlanning(userId);

        // Initialize annualGoals from fallback if empty
        let annualGoals = planning.annualGoals as DraftAnnualGoal[] || [];

        if (annualGoals.length === 0) {
            // Reconstruct annualGoals from goals + annualGoalIds if needed
            const goals = (planning.goals as SimplifiedGoal[] | undefined) || planning.activeGoals || [];
            const annualGoalIds = (planning.annualGoalIds as string[] | undefined) || [];

            annualGoals = goals
                .filter(g => annualGoalIds.includes(g.id))
                .map(g => ({
                    ...g,
                    definitionOfDone: "",
                    whyMatters: "",
                    progressSignal: ""
                }));
        }

        const goalIndex = annualGoals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) {
            return { success: false, error: "Goal not found" };
        }

        // Update the goal
        annualGoals[goalIndex] = {
            ...annualGoals[goalIndex],
            ...updates,
            updatedAt: new Date()
        };

        // Also update the summary in the main 'goals' list if text changed
        const allGoals = (planning.goals as SimplifiedGoal[] | undefined) || [];
        if (updates.text) {
            const allGoalsIndex = allGoals.findIndex(g => g.id === goalId);
            if (allGoalsIndex !== -1) {
                allGoals[allGoalsIndex] = {
                    ...allGoals[allGoalsIndex],
                    text: updates.text,
                    updatedAt: new Date()
                };
            }
        }

        await updatePlanning(planningId, userId, {
            annualGoals,
            goals: allGoals.length > 0 ? allGoals : undefined,
            updatedAt: new Date(),
        });

        revalidateTag("planning", "max");

        return success(
            { planningId },
            { message: "Goal updated successfully" }
        );
    },
    {
        rateLimit: { key: 'update-goal', limit: 50, windowMs: 60000 },
        errorMessage: "Failed to update goal. Please try again."
    }
);
