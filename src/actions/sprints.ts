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

import { revalidatePath, revalidateTag } from "next/cache";
import { createSprint, deactivateAllSprints, getSprintById, updateSprint, deleteSprint, closeSprintById, getActiveSprint } from "@/data-access/sprints";
import { SprintFormSchema } from "@/lib/validators";
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

        // Validate priorities
        if (!validated.priorities || validated.priorities.length === 0) {
            throw new BusinessRuleError("At least one priority is required");
        }

        // Ensure all priorities have required fields and clean up data
        const cleanedPriorities = validated.priorities.map(priority => ({
            ...priority,
            label: sanitizeText(priority.label.trim(), 200),
            unitDefinition: priority.unitDefinition ? sanitizeText(priority.unitDefinition.trim(), 200) : undefined,
        }));

        // 1. Deactivate current active sprints
        await deactivateAllSprints(userId);

        // 2. Create new sprint
        const sprintId = randomUUID();
        await createSprint({
            id: sprintId,
            userId,
            name: sanitizeText(validated.name.trim(), 200),
            startDate: validated.startDate,
            endDate: validated.endDate,
            priorities: cleanedPriorities,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
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
    SprintFormSchema.partial(),
    async (userId, sprintId: string, validated) => {
        // Verify ownership
        const sprint = await getSprintById(sprintId, userId);
        if (!sprint) {
            throw new NotFoundError("Sprint not found");
        }

        // If updating dates, validate them
        if (validated.endDate && validated.startDate && validated.endDate <= validated.startDate) {
            throw new BusinessRuleError("End date must be after start date");
        }

        // Clean up priorities if present
        const updateData: Partial<typeof validated> = { ...validated };
        if (validated.priorities) {
            updateData.priorities = validated.priorities.map(p => ({
                ...p,
                label: sanitizeText(p.label.trim(), 200),
                unitDefinition: p.unitDefinition ? sanitizeText(p.unitDefinition.trim(), 200) : undefined,
            }));
        }
        if (validated.name) {
            updateData.name = sanitizeText(validated.name.trim(), 200);
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

        // Prevent deleting active sprint
        if (sprint.active) {
            throw new BusinessRuleError("Cannot delete an active sprint. Deactivate it first.");
        }

        await deleteSprint(sprintId, userId);

        revalidateSprintPaths();

        return success(
            { deleted: true },
            {
                message: "Sprint deleted successfully",
                redirect: "dashboard"
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
                redirect: "dashboard"
            }
        );
    },
    {
        rateLimit: { key: 'close-sprint', limit: 10, windowMs: 3600000 },
        errorMessage: "Failed to close sprint. Please try again."
    }
);

export const getActiveSprintAction = createActionWithoutValidation(
    async (userId) => {
        const activeSprint = await getActiveSprint(userId);
        return success({ sprint: activeSprint || null });
    },
    {
        errorMessage: "Failed to get active sprint"
    }
);


function revalidateSprintPaths() {
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/sprint", "layout");
    revalidatePath("/sprints", "layout");

}
