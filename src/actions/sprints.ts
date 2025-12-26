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

import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/lib/auth/server";
import { createSprint, deactivateAllSprints, getSprintById, updateSprint, deleteSprint, closeSprintById, getActiveSprint } from "@/data-access/sprints";
import { SprintFormSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

export async function startSprintAction(formData: unknown) {
    try {
        // Verify session - throws if not authenticated
        const session = await getRequiredSession();
        
        // Rate limit: 5 sprint creations per hour per user
        enforceRateLimit(`create-sprint:${session.user.id}`, 5, 3600000);
        
        const validated = SprintFormSchema.parse(formData);

        // Validate dates
        if (validated.endDate <= validated.startDate) {
            throw new Error("End date must be after start date");
        }

        // Validate priorities
        if (!validated.priorities || validated.priorities.length === 0) {
            throw new Error("At least one priority is required");
        }

        // Ensure all priorities have required fields and clean up data
        const cleanedPriorities = validated.priorities.map(priority => ({
            ...priority,
            label: sanitizeText(priority.label.trim(), 200),
            unitDefinition: priority.unitDefinition ? sanitizeText(priority.unitDefinition.trim(), 200) : undefined,
        }));

        // 1. Deactivate current active sprints
        await deactivateAllSprints(session.user.id);

        // 2. Create new sprint
        await createSprint({
            id: randomUUID(),
            userId: session.user.id,
            name: sanitizeText(validated.name.trim(), 200),
            startDate: validated.startDate,
            endDate: validated.endDate,
            priorities: cleanedPriorities,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/sprint", "layout");
        revalidatePath("/sprints", "layout");
    } catch (error) {
        console.error("Error in startSprintAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to start sprint. Please try again.");
    }
}

export async function updateSprintAction(sprintId: string, formData: unknown) {
    try {
        const session = await getRequiredSession();
        
        // Rate limit: 10 updates per minute per user
        enforceRateLimit(`update-sprint:${session.user.id}`, 10, 60000);
        
        // Verify ownership
        const sprint = await getSprintById(sprintId, session.user.id);
        if (!sprint) {
            throw new Error("Sprint not found");
        }

        const validated = SprintFormSchema.partial().parse(formData);

        // If updating dates, validate them
        if (validated.endDate && validated.startDate && validated.endDate <= validated.startDate) {
            throw new Error("End date must be after start date");
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

        await updateSprint(sprintId, session.user.id, updateData);

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/sprint", "layout");
        revalidatePath("/sprints", "layout");
    } catch (error) {
        console.error("Error in updateSprintAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to update sprint. Please try again.");
    }
}

export async function deleteSprintAction(sprintId: string) {
    try {
        const session = await getRequiredSession();
        
        // Rate limit: 5 deletions per hour per user
        enforceRateLimit(`delete-sprint:${session.user.id}`, 5, 3600000);
        
        // Verify ownership
        const sprint = await getSprintById(sprintId, session.user.id);
        if (!sprint) {
            throw new Error("Sprint not found");
        }

        // Prevent deleting active sprint
        if (sprint.active) {
            throw new Error("Cannot delete an active sprint. Deactivate it first.");
        }

        await deleteSprint(sprintId, session.user.id);

        revalidatePath("/dashboard", "layout");
        revalidatePath("/sprints", "layout");
        revalidatePath("/dashboard/sprint", "layout");
    } catch (error) {
        console.error("Error in deleteSprintAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to delete sprint. Please try again.");
    }
}

export async function closeSprintAction(sprintId: string) {
    try {
        const session = await getRequiredSession();
        
        // Rate limit: 10 closes per hour per user
        enforceRateLimit(`close-sprint:${session.user.id}`, 10, 3600000);
        
        // Verify ownership
        const sprint = await getSprintById(sprintId, session.user.id);
        if (!sprint) {
            throw new Error("Sprint not found");
        }

        if (!sprint.active) {
            throw new Error("Sprint is already inactive");
        }

        await closeSprintById(sprintId, session.user.id);

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/sprint", "layout");
        revalidatePath("/sprints", "layout");
    } catch (error) {
        console.error("Error in closeSprintAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to close sprint. Please try again.");
    }
}

export async function getActiveSprintAction() {
    try {
        const session = await getRequiredSession();
        const activeSprint = await getActiveSprint(session.user.id);
        return { success: true, sprint: activeSprint || null };
    } catch (error) {
        console.error("Error in getActiveSprintAction:", error);
        return { success: false, sprint: null };
    }
}

