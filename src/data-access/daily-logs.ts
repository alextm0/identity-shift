import { db } from "@/lib/db";
import { dailyLog } from "@/lib/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { DailyLog, NewDailyLog } from "@/lib/types";

/**
 * Data Access Layer for Daily Logs
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

export async function getDailyLogs(userId: string, limit = 30): Promise<DailyLog[]> {
    return await db.select()
        .from(dailyLog)
        .where(eq(dailyLog.userId, userId))
        .orderBy(desc(dailyLog.date))
        .limit(limit);
}

export async function getDailyLogByDate(userId: string, date: Date): Promise<DailyLog | undefined> {
    // Ensure date comparison ignores time if needed, or assume normalized input.
    // Drizzle/pg timestamp comparison: exact match.
    // Usually we create a range for "day" or ensure stored date is specific.
    // 'date' column is timestamp. Schema said "format: YYYY-MM-DD", probably meant to store midnight.

    return (await db.select()
        .from(dailyLog)
        .where(and(
            eq(dailyLog.userId, userId),
            eq(dailyLog.date, date)
        ))
        .limit(1))[0];
}

export async function getDailyLogById(id: string, userId: string): Promise<DailyLog | undefined> {
    return (await db.select()
        .from(dailyLog)
        .where(and(
            eq(dailyLog.id, id),
            eq(dailyLog.userId, userId)
        ))
        .limit(1))[0];
}

export async function upsertDailyLog(data: NewDailyLog) {
    // If log exists for this sprint+date, update it.
    // Check by sprintId and date to allow same-day edits
    const targetDate = new Date(data.date);
    targetDate.setHours(0, 0, 0, 0);
    
    const existing = await getTodayLogBySprintId(data.sprintId, targetDate);

    if (existing) {
        return await db.update(dailyLog)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(dailyLog.id, existing.id))
            .returning();
    } else {
        return await db.insert(dailyLog).values({
            ...data,
            date: targetDate,
        }).returning();
    }
}

export async function deleteDailyLog(id: string, userId: string) {
    return await db.delete(dailyLog)
        .where(and(
            eq(dailyLog.id, id),
            eq(dailyLog.userId, userId)
        ))
        .returning();
}

export async function getTodayLogBySprintId(sprintId: string, date: Date): Promise<DailyLog | undefined> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return (await db.select()
        .from(dailyLog)
        .where(and(
            eq(dailyLog.sprintId, sprintId),
            eq(dailyLog.date, targetDate)
        ))
        .limit(1))[0];
}

export async function getLast7DaysLogs(sprintId: string): Promise<DailyLog[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    return await db.select()
        .from(dailyLog)
        .where(and(
            eq(dailyLog.sprintId, sprintId),
            gte(dailyLog.date, sevenDaysAgo),
            lte(dailyLog.date, today)
        ))
        .orderBy(desc(dailyLog.date))
        .limit(7);
}

