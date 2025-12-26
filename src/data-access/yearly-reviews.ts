import { db } from "@/lib/db";
import { yearlyReview } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { YearlyReview, NewYearlyReview } from "@/lib/types";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { randomUUID } from "crypto";

/**
 * Data Access Layer for Yearly Reviews
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

/**
 * Get all yearly reviews for a user
 */
export async function getYearlyReviews(userId: string): Promise<YearlyReview[]> {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.select()
                .from(yearlyReview)
                .where(createOwnershipCondition(yearlyReview.userId, userId))
                .orderBy(desc(yearlyReview.year));
        },
        "Failed to fetch yearly reviews"
    );
}

/**
 * Get a yearly review by ID
 */
export async function getYearlyReviewById(id: string, userId: string): Promise<YearlyReview | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(yearlyReview)
                .where(createOwnershipAndIdCondition(yearlyReview.id, id, yearlyReview.userId, userId))
                .limit(1))[0];
        },
        "Failed to fetch yearly review by ID"
    );
}

/**
 * Get or create a yearly review for a specific year
 */
export async function getOrCreateYearlyReview(userId: string, year: number): Promise<YearlyReview> {
    return await withDatabaseErrorHandling(
        async () => {
            // Try to find existing review
            const existing = await db.select()
                .from(yearlyReview)
                .where(and(
                    eq(yearlyReview.userId, userId),
                    eq(yearlyReview.year, year)
                ))
                .limit(1);

            if (existing.length > 0) {
                return existing[0];
            }

            // Create new review
            const newReview: NewYearlyReview = {
                id: randomUUID(),
                userId,
                year,
                status: 'draft',
                currentStep: 1,
                wheelRatings: null,
                wheelWins: null,
                wheelGaps: null,
                bigThreeWins: null,
                damnGoodDecision: null,
                generatedNarrative: null,
                completedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await db.insert(yearlyReview).values(newReview).returning();
            return result[0];
        },
        "Failed to get or create yearly review"
    );
}

/**
 * Get the latest yearly review for a user (by year)
 */
export async function getLatestYearlyReview(userId: string): Promise<YearlyReview | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(yearlyReview)
                .where(createOwnershipCondition(yearlyReview.userId, userId))
                .orderBy(desc(yearlyReview.year))
                .limit(1))[0];
        },
        "Failed to fetch latest yearly review"
    );
}

/**
 * Get completed yearly review for a specific year
 */
export async function getCompletedYearlyReview(userId: string, year: number): Promise<YearlyReview | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(yearlyReview)
                .where(and(
                    eq(yearlyReview.userId, userId),
                    eq(yearlyReview.year, year),
                    eq(yearlyReview.status, 'completed')
                ))
                .limit(1))[0];
        },
        "Failed to fetch completed yearly review"
    );
}

/**
 * Create a new yearly review
 */
export async function createYearlyReview(data: NewYearlyReview): Promise<YearlyReview> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.insert(yearlyReview).values(data).returning();
            return result[0];
        },
        "Failed to create yearly review"
    );
}

/**
 * Update a yearly review
 */
export async function updateYearlyReview(id: string, userId: string, data: Partial<NewYearlyReview>): Promise<YearlyReview> {
    return await withDatabaseErrorHandling(
        async () => {
            const updateData = {
                ...data,
                updatedAt: new Date(),
            };
            const result = await db.update(yearlyReview)
                .set(updateData)
                .where(createOwnershipAndIdCondition(yearlyReview.id, id, yearlyReview.userId, userId))
                .returning();
            
            if (result.length === 0) {
                throw new Error("Yearly review not found");
            }
            return result[0];
        },
        "Failed to update yearly review"
    );
}

/**
 * Complete a yearly review (mark as completed)
 */
export async function completeYearlyReview(id: string, userId: string): Promise<YearlyReview> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.update(yearlyReview)
                .set({
                    status: 'completed',
                    completedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(createOwnershipAndIdCondition(yearlyReview.id, id, yearlyReview.userId, userId))
                .returning();
            
            if (result.length === 0) {
                throw new Error("Yearly review not found");
            }
            return result[0];
        },
        "Failed to complete yearly review"
    );
}

