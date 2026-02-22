'use server';

/**
 * Server Actions for Sprints
 * 
 * Following Next.js authentication patterns:
 * https://nextjs.org/docs/app/guides/authentication
 * 
 * Security:
 * - Verifies user session before proceeding
 * - Ensures user can only create/manage their own sprints
 * - All data is filtered by authenticated userId
 */
import { revalidateDashboard } from "@/lib/revalidate";
import { createSprint, getSprintById, updateSprint, deleteSprint, closeSprintById } from "@/data-access/sprints";
import { SprintFormSchema, BaseSprintFormSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";
import { NotFoundError, BusinessRuleError } from "@/lib/errors";
import { success } from "@/lib/actions/result";
import { createAction, createActionWithParam, createActionWithoutValidation } from "@/lib/actions/middleware";
import { randomUUID } from "crypto";

export const startSprintAction = createAction(
    SprintFormSchema,
    async (userId, validated) => {
        // Validate dates
        if (validated.endDate <= validated.startDate) {
            throw new BusinessRuleError("End date must be after start date");
        }

        // Validate goals
        if (!validated.goals || validated.goals.length === 0) {
            throw new BusinessRuleError("At least one goal is required");
        }


        // 2 & 3. Create new sprint with goals and promises
        const sprintId = randomUUID();
        await createSprint({
            id: sprintId,
            userId,
            name: sanitizeText(validated.name.trim(), 200),
            startDate: new Date(validated.startDate),
            endDate: new Date(validated.endDate),
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            goals: (validated.goals || []).map(g => ({
                ...g,
                goalText: sanitizeText(g.goalText || "", 500),
                promises: (g.promises || []).map(p => ({
                    ...p,
                    text: sanitizeText(p.text, 200)
                }))
            }))
        });

        revalidateSprintPaths();

        return success(
            { id: sprintId },
            {
                message: "Sprint started successfully",
                redirect: "sprint"
            }
        );
    },
    {
        rateLimit: { key: 'create-sprint', limit: 5, windowMs: 3600000 },
        errorMessage: "Failed to start sprint. Please try again."
    }
);

export const updateSprintAction = createActionWithParam(
    BaseSprintFormSchema.partial(),
    async (userId, sprintId: string, validated) => {
        // Verify ownership
        const sprint = await getSprintById(sprintId, userId);
        if (!sprint) {
            throw new NotFoundError("Sprint not found");
        }

        // If updating dates, validate them
        if (validated.endDate && validated.startDate && new Date(validated.endDate) <= new Date(validated.startDate)) {
            throw new BusinessRuleError("End date must be after start date");
        }

        // Clean up and sanitize data
        const updateData: Record<string, unknown> = {};
        if (validated.name) {
            updateData.name = sanitizeText(validated.name.trim(), 200);
        }

        if (validated.startDate) {
            updateData.startDate = new Date(validated.startDate);
        }

        if (validated.endDate) {
            updateData.endDate = new Date(validated.endDate);
        }

        if (validated.goals) {
            updateData.goals = validated.goals.map(g => ({
                ...g,
                goalText: sanitizeText(g.goalText || "", 500),
                promises: (g.promises || []).map(p => ({
                    ...p,
                    text: sanitizeText(p.text, 200)
                }))
            }));
        }

        await updateSprint(sprintId, userId, updateData);

        revalidateSprintPaths();

        return success(
            { id: sprintId },
            {
                message: "Sprint updated successfully",
                redirect: "sprint"
            }
        );
    },
    {
        rateLimit: { key: 'update-sprint', limit: 10, windowMs: 60000 },
        errorMessage: "Failed to update sprint. Please try again."
    }
);

export const deleteSprintAction = createActionWithoutValidation(
    async (userId, sprintId: string) => {
        // Verify ownership
        const sprint = await getSprintById(sprintId, userId);
        if (!sprint) {
            throw new NotFoundError("Sprint not found");
        }

        await deleteSprint(sprintId, userId);

        revalidateSprintPaths();

        return success(
            { deleted: true },
            {
                message: "Sprint deleted successfully",
                redirect: "dashboard/sprint" // Redirect back to sprint control
            }
        );
    },
    {
        rateLimit: { key: 'delete-sprint', limit: 5, windowMs: 3600000 },
        errorMessage: "Failed to delete sprint. Please try again."
    }
);

export const closeSprintAction = createActionWithoutValidation(
    async (userId, sprintId: string) => {
        // Verify ownership
        const sprint = await getSprintById(sprintId, userId);
        if (!sprint) {
            throw new NotFoundError("Sprint not found");
        }

        if (!sprint.active) {
            throw new BusinessRuleError("Sprint is already inactive");
        }

        await closeSprintById(sprintId, userId);

        revalidateSprintPaths();

        return success(
            { id: sprintId },
            {
                message: "Sprint closed successfully",
                redirect: "dashboard/sprint"
            }
        );
    },
    {
        rateLimit: { key: 'close-sprint', limit: 10, windowMs: 3600000 },
        errorMessage: "Failed to close sprint. Please try again."
    }
);



function revalidateSprintPaths() {
    revalidateDashboard();
    // Also revalidate the specialized sprint cache
    import('next/cache').then(({ revalidateTag }) => {
        revalidateTag('sprints', 'max');
        revalidateTag('active-sprint', 'max');
    });
}
