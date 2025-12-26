import { db } from "@/lib/db";
import { planning } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NewPlanning, Planning } from "@/lib/types";
import { createOwnershipCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";

/**
 * Data Access Layer for Planning
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

export async function getPlanningByUserId(userId: string): Promise<Planning | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.select()
                .from(planning)
                .where(createOwnershipCondition(planning.userId, userId));
            return result[0];
        },
        "Failed to fetch planning by user ID"
    );
}

export async function upsertPlanning(data: NewPlanning) {
    return await withDatabaseErrorHandling(
        async () => {
            // Check if exists first (userId has a unique constraint in the schema - 1:1 relationship)
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
        },
        "Failed to upsert planning"
    );
}

