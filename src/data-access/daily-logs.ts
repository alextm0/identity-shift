import { db } from "@/lib/db";
import { dailyLog } from "@/lib/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { DailyLog, NewDailyLog } from "@/lib/types";
import { normalizeDate, getDayRange, createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";

/**
 * Data Access Layer for Daily Logs
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

export async function getDailyLogs(userId: string, limit = 30): Promise<DailyLog[]> {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.select()
                .from(dailyLog)
                .where(createOwnershipCondition(dailyLog.userId, userId))
                .orderBy(desc(dailyLog.date))
                .limit(limit);
        },
        "Failed to fetch daily logs"
    );
}

export async function getDailyLogByDate(userId: string, date: Date): Promise<DailyLog | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const normalizedDate = normalizeDate(date);
            return (await db.select()
                .from(dailyLog)
                .where(and(
                    createOwnershipCondition(dailyLog.userId, userId),
                    eq(dailyLog.date, normalizedDate)
                ))
                .limit(1))[0];
        },
        "Failed to fetch daily log by date"
    );
}

export async function getDailyLogById(id: string, userId: string): Promise<DailyLog | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            return (await db.select()
                .from(dailyLog)
                .where(createOwnershipAndIdCondition(dailyLog.id, id, dailyLog.userId, userId))
                .limit(1))[0];
        },
        "Failed to fetch daily log by ID"
    );
}

export async function getTodayLogForUser(userId: string, date: Date): Promise<DailyLog | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const normalizedDate = normalizeDate(date);
            return (await db.select()
                .from(dailyLog)
                .where(and(
                    eq(dailyLog.userId, userId),
                    eq(dailyLog.date, normalizedDate)
                ))
                .limit(1))[0];
        },
        "Failed to fetch daily log by user ID and date"
    );
}

export async function upsertDailyLog(data: NewDailyLog) {
    return await withDatabaseErrorHandling(
        async () => {
            // Normalize date to midnight for consistent comparison
            const targetDate = normalizeDate(data.date);
            
            const existing = await getTodayLogForUser(data.userId, targetDate);

            if (existing) {
                return await db.update(dailyLog)
                    .set({
                        ...data,
                        date: targetDate,
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
        },
        "Failed to upsert daily log"
    );
}

export async function deleteDailyLog(id: string, userId: string) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.delete(dailyLog)
                .where(createOwnershipAndIdCondition(dailyLog.id, id, dailyLog.userId, userId))
                .returning();
        },
        "Failed to delete daily log"
    );
}

export async function getLast7DaysLogs(userId: string): Promise<DailyLog[]> {
    return await withDatabaseErrorHandling(
        async () => {
            const { end: today } = getDayRange(new Date());
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { start: startDate } = getDayRange(sevenDaysAgo);
            
            return await db.select()
                .from(dailyLog)
                .where(and(
                    eq(dailyLog.userId, userId),
                    gte(dailyLog.date, startDate),
                    lte(dailyLog.date, today)
                ))
                .orderBy(desc(dailyLog.date))
                .limit(7);
        },
        "Failed to fetch last 7 days logs"
    );
}

