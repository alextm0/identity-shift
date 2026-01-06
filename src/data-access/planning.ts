import { db } from "@/lib/db";
import { planning, yearlyReview } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NewPlanning, Planning } from "@/lib/types";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { randomUUID } from "crypto";
import { unstable_cache } from "next/cache";
import { toPlanningWithTypedFields } from "@/lib/type-helpers";
import { PlanningWithTypedFields } from "@/lib/types";
import { NotFoundError } from "@/lib/errors";
import { getCurrentReviewAndPlanningYears } from "@/lib/date-utils";

/**
 * Data Access Layer for Planning
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

const _toTypedPlanning = (p: Planning): PlanningWithTypedFields => toPlanningWithTypedFields(p);


/**
 * Get planning by user ID and year
 */
const fetchPlanningByUserIdAndYear = async (userId: string, year: number): Promise<PlanningWithTypedFields | undefined> => {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.select()
                .from(planning)
                .where(and(
                    createOwnershipCondition(planning.userId, userId),
                    eq(planning.year, year)
                ));
            return result[0] ? _toTypedPlanning(result[0]) : undefined;
        },
        "Failed to fetch planning by user ID and year"
    );
};

const getPlanningByUserIdAndYearCached = unstable_cache(
    fetchPlanningByUserIdAndYear,
    ['planning-by-year'],
    { tags: ['planning'] }
);

export const getPlanningByUserIdAndYear = async (userId: string, year: number): Promise<PlanningWithTypedFields | undefined> => {
    try {
        return await getPlanningByUserIdAndYearCached(userId, year);
    } catch (error) {
        console.warn("Cache failed for getPlanningByUserIdAndYear, falling back to direct fetch", error);
        return await fetchPlanningByUserIdAndYear(userId, year);
    }
};

export async function getPlanningById(id: string, userId: string): Promise<PlanningWithTypedFields | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = (await db.select()
                .from(planning)
                .where(createOwnershipAndIdCondition(planning.id, id, planning.userId, userId))
                .limit(1))[0];
            return result ? _toTypedPlanning(result) : undefined;
        },
        "Failed to fetch planning by ID"
    );
}

/**
 * Get or create planning for a user for a specific year
 * Defaults to next year (planning is typically for the upcoming year)
 */
export async function getOrCreatePlanning(userId: string, year?: number): Promise<PlanningWithTypedFields> {
    // Default to the correct planning year based on current date
    const { planningYear: defaultYear } = getCurrentReviewAndPlanningYears();
    const planningYear = year ?? defaultYear;

    return await withDatabaseErrorHandling(
        async () => {
            const existing = await getPlanningByUserIdAndYear(userId, planningYear);

            // Determine previous year relative to the planning year
            const previousYear = planningYear - 1;

            // Try to find completed review for the previous year
            const previousReview = await db.select()
                .from(yearlyReview)
                .where(and(
                    eq(yearlyReview.userId, userId),
                    eq(yearlyReview.year, previousYear),
                    eq(yearlyReview.status, 'completed')
                ))
                .limit(1)
                .then(res => res[0]);

            const defaultWheel = {
                health: 5,
                mental_clarity: 5,
                career: 5,
                learning_building: 5,
                family_friends: 5,
                romance: 5,
                finances: 5,
                recreation: 5
            };

            const seedWheel = previousReview?.wheelRatings || defaultWheel;

            if (existing) {
                // If existing planning has no wheelOfLife yet, but we found a review, update it
                // We check if it's strictly null or an empty object (serialized as such in some cases)
                const isWheelEmpty = !existing.wheelOfLife || Object.keys(existing.wheelOfLife).length === 0;

                if (isWheelEmpty && previousReview) {
                    const result = await db.update(planning)
                        .set({
                            wheelOfLife: seedWheel,
                            updatedAt: new Date()
                        })
                        .where(eq(planning.id, existing.id))
                        .returning();
                    return _toTypedPlanning(result[0]);
                }
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
                wheelOfLife: seedWheel,
                lastArchiveReviewDate: null,
                completedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Try to insert with ON CONFLICT DO NOTHING to handle race conditions
            const result = await db.insert(planning)
                .values(newPlanning)
                .onConflictDoNothing({
                    target: [planning.userId, planning.year],
                })
                .returning();

            if (result.length > 0) {
                return _toTypedPlanning(result[0]);
            }

            // If we're here, it means the insert was skipped because of a conflict.
            // This implies another request created the record concurrently.
            // We should fetch and return that existing record.
            const racedExisting = await fetchPlanningByUserIdAndYear(userId, planningYear);
            if (!racedExisting) {
                throw new Error("Failed to get or create planning: race condition detected but record not found.");
            }
            return racedExisting;
        },
        "Failed to get or create planning"
    );
}

/**
 * Upsert planning for a specific user and year.
 * Uses getPlanningByUserIdAndYear to ensure we're updating the correct year's plan.
 */
export async function upsertPlanning(data: NewPlanning & { year: number }) {
    return await withDatabaseErrorHandling(
        async () => {
            // Check if exists for the specific year
            const existing = await getPlanningByUserIdAndYear(data.userId, data.year);

            if (existing) {
                const updated = await db.update(planning)
                    .set({
                        ...data,
                        updatedAt: new Date(),
                    })
                    .where(eq(planning.id, existing.id))
                    .returning();
                return updated.map(_toTypedPlanning);
            } else {
                const inserted = await db.insert(planning).values(data).returning();
                return inserted.map(_toTypedPlanning);
            }
        },
        "Failed to upsert planning"
    );
}

/**
 * Update planning progress
 */
export async function updatePlanning(id: string, userId: string, data: Partial<NewPlanning>): Promise<PlanningWithTypedFields> {
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
                throw new NotFoundError("Planning not found");
            }
            return _toTypedPlanning(result[0]);
        },
        "Failed to update planning"
    );
}

/**
 * Complete planning (mark as completed)
 */
export async function completePlanning(id: string, userId: string): Promise<PlanningWithTypedFields> {
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
                throw new NotFoundError("Planning not found");
            }
            return _toTypedPlanning(result[0]);
        },
        "Failed to complete planning"
    );
}

