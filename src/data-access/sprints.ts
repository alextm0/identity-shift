import { db } from "@/lib/db";
import { sprint } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Sprint, NewSprint } from "@/lib/types";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";

/**
 * Data Access Layer for Sprints
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

export async function getActiveSprint(userId: string): Promise<Sprint | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(sprint)
                .where(and(
                    createOwnershipCondition(sprint.userId, userId),
                    eq(sprint.active, true)
                ))
                .limit(1))[0];
        },
        "Failed to fetch active sprint"
    );
}

export async function getSprints(userId: string): Promise<Sprint[]> {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.select()
                .from(sprint)
                .where(createOwnershipCondition(sprint.userId, userId))
                .orderBy(desc(sprint.startDate));
        },
        "Failed to fetch sprints"
    );
}

export async function getSprintById(id: string, userId: string): Promise<Sprint | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(sprint)
                .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                .limit(1))[0];
        },
        "Failed to fetch sprint by ID"
    );
}

export async function createSprint(data: NewSprint) {
    return await withDatabaseErrorHandling(
        async () => {
            // Ensure priorities is a plain array/object (not a SQL template)
            // Drizzle's json() column type should handle serialization automatically
            const insertData: NewSprint = {
                ...data,
                priorities: Array.isArray(data.priorities) 
                    ? data.priorities 
                    : (typeof data.priorities === 'string' ? JSON.parse(data.priorities) : data.priorities),
            };
            
            return await db.insert(sprint).values(insertData).returning();
        },
        "Failed to create sprint"
    );
}

export async function updateSprint(id: string, userId: string, data: Partial<NewSprint>) {
    return await withDatabaseErrorHandling(
        async () => {
            const updateData: Partial<NewSprint> = { ...data, updatedAt: new Date() };
            
            // Ensure priorities is properly formatted if present
            if (data.priorities !== undefined) {
                updateData.priorities = Array.isArray(data.priorities) 
                    ? data.priorities 
                    : (typeof data.priorities === 'string' ? JSON.parse(data.priorities) : data.priorities);
            }
            
            return await db.update(sprint)
                .set(updateData)
                .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                .returning();
        },
        "Failed to update sprint"
    );
}

export async function deactivateAllSprints(userId: string) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.update(sprint)
                .set({ active: false, updatedAt: new Date() })
                .where(createOwnershipCondition(sprint.userId, userId));
        },
        "Failed to deactivate sprints"
    );
}

export async function deleteSprint(id: string, userId: string) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.delete(sprint)
                .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                .returning();
        },
        "Failed to delete sprint"
    );
}

export async function closeSprintById(id: string, userId: string) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.update(sprint)
                .set({ active: false, updatedAt: new Date() })
                .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                .returning();
        },
        "Failed to close sprint"
    );
}

