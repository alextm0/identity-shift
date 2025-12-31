import { db } from "@/lib/db";
import { dailyLog, promiseLog } from "@/lib/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { DailyLog } from "@/lib/types";
import { ProofOfWork } from "@/lib/validators";
import { normalizeDate, getDayRange, createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { randomUUID } from "crypto";
import { unstable_cache } from "next/cache";

/**
 * Data Access Layer for Daily Logs
 * 
 * Direct database operations using Drizzle ORM.
 * No business logic - just CRUD operations.
 */

export const getDailyLogs = unstable_cache(
    async (userId: string, limit = 30): Promise<DailyLog[]> => {
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
    },
    ['daily-logs-list'],
    { tags: ['daily-logs'] }
);

export const getDailyLogByDate = unstable_cache(
    async (userId: string, date: Date): Promise<DailyLog | undefined> => {
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
    },
    ['daily-log-by-date'],
    { tags: ['daily-logs'] }
);

export const getDailyLogById = unstable_cache(
    async (id: string, userId: string): Promise<DailyLog | undefined> => {
        return await withDatabaseErrorHandling(
            async () => {
                return (await db.select()
                    .from(dailyLog)
                    .where(createOwnershipAndIdCondition(dailyLog.id, id, dailyLog.userId, userId))
                    .limit(1))[0];
            },
            "Failed to fetch daily log by ID"
        );
    },
    ['daily-log-by-id'],
    { tags: ['daily-logs'] }
);

export const getTodayLogForUser = unstable_cache(
    async (userId: string, date: Date): Promise<DailyLog | undefined> => {
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
    },
    ['today-log'],
    { tags: ['daily-logs'] }
);


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

export const getLast7DaysLogs = unstable_cache(
    async (userId: string): Promise<DailyLog[]> => {
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
    },
    ['last-7-days-logs'],
    { tags: ['daily-logs'] }
);

export const getCurrentWeekLogs = unstable_cache(
    async (userId: string): Promise<DailyLog[]> => {
        return await withDatabaseErrorHandling(
            async () => {
                // Get current week boundaries (Monday to Sunday)
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days; otherwise, calculate diff to Monday

                const monday = new Date(today);
                monday.setDate(today.getDate() + diffToMonday);
                monday.setHours(0, 0, 0, 0);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                const weekStart = normalizeDate(monday);
                const weekEnd = sunday; // Keep end-of-day timestamp to include full Sunday range

                return await db.select()
                    .from(dailyLog)
                    .where(and(
                        eq(dailyLog.userId, userId),
                        gte(dailyLog.date, weekStart),
                        lte(dailyLog.date, weekEnd)
                    ))
                    .orderBy(desc(dailyLog.date));
            },
            "Failed to fetch current week logs"
        );
    },
    ['current-week-logs'],
    { tags: ['daily-logs'] }
);

export async function saveDailyAudit(
    userId: string,
    sprintId: string,
    data: {
        date: Date;
        mainGoalId: string;
        energy?: number;
        blockerTag?: string;
        note?: string;
        promiseCompletions: Record<string, boolean>;
        proofOfWork?: ProofOfWork[];
    }
) {
    return await withDatabaseErrorHandling(
        async () => {
            const normalizedDate = normalizeDate(data.date);

            return await db.transaction(async (tx) => {
                // 1. Upsert Daily Log
                const existing = await tx.query.dailyLog.findFirst({
                    where: and(
                        eq(dailyLog.userId, userId),
                        eq(dailyLog.date, normalizedDate)
                    ),
                });

                let dailyLogId: string;

                if (existing) {
                    dailyLogId = existing.id;
                    await tx.update(dailyLog).set({
                        mainGoalId: data.mainGoalId,
                        energy: data.energy !== undefined ? data.energy : 3,
                        blockerTag: data.blockerTag,
                        note: data.note,
                        proofOfWork: data.proofOfWork,
                        updatedAt: new Date(),
                    }).where(eq(dailyLog.id, dailyLogId));
                } else {
                    const [newLog] = await tx.insert(dailyLog).values({
                        id: randomUUID(),
                        userId,
                        sprintId,
                        date: normalizedDate,
                        mainGoalId: data.mainGoalId,
                        energy: data.energy !== undefined ? data.energy : 3,
                        blockerTag: data.blockerTag,
                        note: data.note,
                        proofOfWork: data.proofOfWork,
                    }).returning();

                    if (!newLog) throw new Error("Failed to create daily log");
                    dailyLogId = newLog.id;
                }

                // 2. Upsert Promise Logs
                const promiseIds = Object.keys(data.promiseCompletions);

                if (promiseIds.length > 0) {
                    // We can use a batch insert or sequential. 
                    // For neon-http transactions, both are combined into one HTTP request.
                    // Let's use batching for better performance if possible, 
                    // but onConflictDoUpdate needs to handle it.

                    for (const pid of promiseIds) {
                        await tx.insert(promiseLog).values({
                            id: randomUUID(),
                            userId,
                            promiseId: pid,
                            date: normalizedDate,
                            dailyLogId: dailyLogId,
                            completed: data.promiseCompletions[pid],
                        }).onConflictDoUpdate({
                            target: [promiseLog.promiseId, promiseLog.date],
                            set: {
                                completed: data.promiseCompletions[pid],
                                dailyLogId: dailyLogId,
                            }
                        });
                    }
                }

                return dailyLogId;
            });
        },
        "Failed to save daily audit"
    );
}


