import { db } from "@/lib/db";
import { weeklyReview, monthlyReview } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { WeeklyReview, NewWeeklyReview, MonthlyReview, NewMonthlyReview } from "@/lib/types";

/**
 * Data Access Layer for Reviews
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

// Weekly Reviews
export async function getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
    return await db.select()
        .from(weeklyReview)
        .where(eq(weeklyReview.userId, userId))
        .orderBy(desc(weeklyReview.weekEndDate));
}

export async function getWeeklyReviewById(id: string, userId: string): Promise<WeeklyReview | undefined> {
    return (await db.select()
        .from(weeklyReview)
        .where(and(
            eq(weeklyReview.id, id),
            eq(weeklyReview.userId, userId)
        ))
        .limit(1))[0];
}

export async function createWeeklyReview(data: NewWeeklyReview) {
    return await db.insert(weeklyReview).values(data).returning();
}

export async function updateWeeklyReview(id: string, userId: string, data: Partial<NewWeeklyReview>) {
    return await db.update(weeklyReview)
        .set(data)
        .where(and(
            eq(weeklyReview.id, id),
            eq(weeklyReview.userId, userId)
        ))
        .returning();
}

// Monthly Reviews
export async function getMonthlyReviews(userId: string): Promise<MonthlyReview[]> {
    return await db.select()
        .from(monthlyReview)
        .where(eq(monthlyReview.userId, userId))
        .orderBy(desc(monthlyReview.createdAt));
}

export async function getMonthlyReviewById(id: string, userId: string): Promise<MonthlyReview | undefined> {
    return (await db.select()
        .from(monthlyReview)
        .where(and(
            eq(monthlyReview.id, id),
            eq(monthlyReview.userId, userId)
        ))
        .limit(1))[0];
}

export async function createMonthlyReview(data: NewMonthlyReview) {
    return await db.insert(monthlyReview).values(data).returning();
}

export async function updateMonthlyReview(id: string, userId: string, data: Partial<NewMonthlyReview>) {
    return await db.update(monthlyReview)
        .set(data)
        .where(and(
            eq(monthlyReview.id, id),
            eq(monthlyReview.userId, userId)
        ))
        .returning();
}

