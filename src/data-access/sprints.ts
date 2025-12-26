import { db } from "@/lib/db";
import { sprint } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Sprint, NewSprint } from "@/lib/types";

/**
 * Data Access Layer for Sprints
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

export async function getActiveSprint(userId: string): Promise<Sprint | undefined> {
    return (await db.select()
        .from(sprint)
        .where(and(
            eq(sprint.userId, userId),
            eq(sprint.active, true)
        ))
        .limit(1))[0];
}

export async function getSprints(userId: string): Promise<Sprint[]> {
    return await db.select()
        .from(sprint)
        .where(eq(sprint.userId, userId))
        .orderBy(desc(sprint.startDate));
}

export async function getSprintById(id: string, userId: string): Promise<Sprint | undefined> {
    return (await db.select()
        .from(sprint)
        .where(and(
            eq(sprint.id, id),
            eq(sprint.userId, userId)
        ))
        .limit(1))[0];
}

export async function createSprint(data: NewSprint) {
    try {
        // Ensure priorities is a plain array/object (not a SQL template)
        // Drizzle's json() column type should handle serialization automatically
        const insertData: NewSprint = {
            ...data,
            priorities: Array.isArray(data.priorities) 
                ? data.priorities 
                : (typeof data.priorities === 'string' ? JSON.parse(data.priorities) : data.priorities),
        };
        
        return await db.insert(sprint).values(insertData).returning();
    } catch (error: any) {
        console.error('Failed to create sprint:', error);
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            detail: error?.detail,
            constraint: error?.constraint,
            stack: error?.stack,
        });
        console.error('Data being inserted:', JSON.stringify(data, null, 2));
        console.error('Priorities type:', typeof data.priorities);
        console.error('Priorities value:', data.priorities);
        throw error;
    }
}

export async function updateSprint(id: string, userId: string, data: Partial<NewSprint>) {
    try {
        const updateData: Partial<NewSprint> = { ...data, updatedAt: new Date() };
        
        // Ensure priorities is properly formatted if present
        if (data.priorities !== undefined) {
            updateData.priorities = Array.isArray(data.priorities) 
                ? data.priorities 
                : (typeof data.priorities === 'string' ? JSON.parse(data.priorities) : data.priorities);
        }
        
        return await db.update(sprint)
            .set(updateData)
            .where(and(eq(sprint.id, id), eq(sprint.userId, userId)))
            .returning();
    } catch (error: any) {
        console.error('Failed to update sprint:', error);
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            detail: error?.detail,
            constraint: error?.constraint,
            stack: error?.stack,
        });
        console.error('Data:', JSON.stringify(data, null, 2));
        throw error;
    }
}

export async function deactivateAllSprints(userId: string) {
    return await db.update(sprint)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(sprint.userId, userId));
}

export async function deleteSprint(id: string, userId: string) {
    return await db.delete(sprint)
        .where(and(
            eq(sprint.id, id),
            eq(sprint.userId, userId)
        ))
        .returning();
}

export async function closeSprintById(id: string, userId: string) {
    return await db.update(sprint)
        .set({ active: false, updatedAt: new Date() })
        .where(and(
            eq(sprint.id, id),
            eq(sprint.userId, userId)
        ))
        .returning();
}

