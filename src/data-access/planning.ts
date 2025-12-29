import { db } from "@/lib/db";
import { planning } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NewPlanning, Planning } from "@/lib/types";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { randomUUID } from "crypto";

/**
 * Data Access Layer for Planning
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

/**
 * Get planning by user ID (returns the most recent/current year's plan)
 * @deprecated Use getPlanningByUserIdAndYear for explicit year handling
 */
export async function getPlanningByUserId(userId: string): Promise<Planning | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.select()
                .from(planning)
                .where(createOwnershipCondition(planning.userId, userId))
                .orderBy(desc(planning.year));
            return result[0];
        },
        "Failed to fetch planning by user ID"
    );
}

/**
 * Get planning by user ID and year
 */
export async function getPlanningByUserIdAndYear(userId: string, year: number): Promise<Planning | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.select()
                .from(planning)
                .where(and(
                    createOwnershipCondition(planning.userId, userId),
                    eq(planning.year, year)
                ));
            return result[0];
        },
        "Failed to fetch planning by user ID and year"
    );
}

export async function getPlanningById(id: string, userId: string): Promise<Planning | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(planning)
                .where(createOwnershipAndIdCondition(planning.id, id, planning.userId, userId))
                .limit(1))[0];
        },
        "Failed to fetch planning by ID"
    );
}

/**
 * Get or create planning for a user for a specific year
 * Defaults to next year (planning is typically for the upcoming year)
 */
export async function getOrCreatePlanning(userId: string, year?: number): Promise<Planning> {
    // Default to next year for planning (e.g., in 2025, plan for 2026)
    const planningYear = year ?? new Date().getFullYear() + 1;

    return await withDatabaseErrorHandling(
        async () => {
            const existing = await getPlanningByUserIdAndYear(userId, planningYear);

            if (existing) {
                return existing;
            }

            // Create new planning for the specified year
            const newPlanning: NewPlanning = {
                id: randomUUID(),
                userId,
                year: planningYear,
                activeGoals: null,
                backlogGoals: null,
                archivedGoals: null,
                currentModule: 1,
                currentStep: 1,
                currentGoalIndex: 0,
                status: 'draft',
                previousIdentity: null,
                wheelOfLife: null,
                lastArchiveReviewDate: null,
                completedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await db.insert(planning).values(newPlanning).returning();
            return result[0];
        },
        "Failed to get or create planning"
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

/**
 * Update planning progress
 */
export async function updatePlanning(id: string, userId: string, data: Partial<NewPlanning>): Promise<Planning> {
    return await withDatabaseErrorHandling(
        async () => {
            const updateData = {
                ...data,
                updatedAt: new Date(),
            };
            const result = await db.update(planning)
                .set(updateData)
                .where(createOwnershipAndIdCondition(planning.id, id, planning.userId, userId))
                .returning();

            if (result.length === 0) {
                throw new Error("Planning not found");
            }
            return result[0];
        },
        "Failed to update planning"
    );
}

/**
 * Complete planning (mark as completed)
 */
export async function completePlanning(id: string, userId: string): Promise<Planning> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.update(planning)
                .set({
                    status: 'completed',
                    completedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(createOwnershipAndIdCondition(planning.id, id, planning.userId, userId))
                .returning();

            if (result.length === 0) {
                throw new Error("Planning not found");
            }
            return result[0];
        },
        "Failed to complete planning"
    );
}

