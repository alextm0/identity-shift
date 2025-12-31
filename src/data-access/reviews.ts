import { db } from "@/lib/db";
import { weeklyReview, monthlyReview } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { WeeklyReview, NewWeeklyReview, MonthlyReview, NewMonthlyReview } from "@/lib/types";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";

/**
 * Data Access Layer for Reviews
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

// Weekly Reviews
export async function getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.select()
                .from(weeklyReview)
                .where(createOwnershipCondition(weeklyReview.userId, userId))
                .orderBy(desc(weeklyReview.weekEndDate));
        },
        "Failed to fetch weekly reviews"
    );
}

export async function getWeeklyReviewById(id: string, userId: string): Promise<WeeklyReview | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(weeklyReview)
                .where(createOwnershipAndIdCondition(weeklyReview.id, id, weeklyReview.userId, userId))
                .limit(1))[0];
        },
        "Failed to fetch weekly review by ID"
    );
}

export async function createWeeklyReview(data: NewWeeklyReview) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.insert(weeklyReview).values(data).returning();
        },
        "Failed to create weekly review"
    );
}

export async function updateWeeklyReview(id: string, userId: string, data: Partial<NewWeeklyReview>) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.update(weeklyReview)
                .set(data)
                .where(createOwnershipAndIdCondition(weeklyReview.id, id, weeklyReview.userId, userId))
                .returning();
        },
        "Failed to update weekly review"
    );
}

// Monthly Reviews
export async function getMonthlyReviews(userId: string): Promise<MonthlyReview[]> {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.select()
                .from(monthlyReview)
                .where(createOwnershipCondition(monthlyReview.userId, userId))
                .orderBy(desc(monthlyReview.createdAt));
        },
        "Failed to fetch monthly reviews"
    );
}

export async function getMonthlyReviewById(id: string, userId: string): Promise<MonthlyReview | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(monthlyReview)
                .where(createOwnershipAndIdCondition(monthlyReview.id, id, monthlyReview.userId, userId))
                .limit(1))[0];
        },
        "Failed to fetch monthly review by ID"
    );
}

export async function createMonthlyReview(data: NewMonthlyReview) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.insert(monthlyReview).values(data).returning();
        },
        "Failed to create monthly review"
    );
}

export async function updateMonthlyReview(id: string, userId: string, data: Partial<NewMonthlyReview>) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.update(monthlyReview)
                .set(data)
                .where(createOwnershipAndIdCondition(monthlyReview.id, id, monthlyReview.userId, userId))
                .returning();
        },
        "Failed to update monthly review"
    );
}

