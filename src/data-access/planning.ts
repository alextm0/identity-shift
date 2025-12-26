import { db } from "@/lib/db";
import { planning } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NewPlanning, Planning } from "@/lib/types";

/**
 * Data Access Layer for Planning
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

export async function getPlanningByUserId(userId: string): Promise<Planning | undefined> {
    const result = await db.select().from(planning).where(eq(planning.userId, userId));
    return result[0];
}

export async function upsertPlanning(data: NewPlanning) {
    // Check if exists first or use onConflictDoUpdate if PG constraint exists?
    // User ID is unique in practice for this table (1:1), but schema doesn't strictly enforce generic unique constraint on userId unless I added it.
    // Wait, schema says: userId references user.id. Does it say unique?
    // No, schema doesn't have .unique() on userId in planning table. 
    // But logically it's 1 per user.
    // I'll check existence or just do insert.

    const existing = await getPlanningByUserId(data.userId);

    if (existing) {
        return await db.update(planning)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(planning.id, existing.id))
            .returning();
    } else {
        return await db.insert(planning).values(data).returning();
    }
}

