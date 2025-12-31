import { db } from "@/lib/db";
import { dailyLog, promiseLog } from "@/lib/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { DailyLog } from "@/lib/types";
import { ProofOfWork } from "@/lib/validators";
import { normalizeDate, getDayRange, createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { randomUUID } from "crypto";

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

export async function getCurrentWeekLogs(userId: string): Promise<DailyLog[]> {
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
            const weekEnd = normalizeDate(sunday);

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
}

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

            // 1. Upsert Daily Log
            const existing = await db.query.dailyLog.findFirst({
                where: and(
                    eq(dailyLog.userId, userId),
                    eq(dailyLog.date, normalizedDate)
                ),
            });

            let dailyLogId: string;

            if (existing) {
                dailyLogId = existing.id;
                await db.update(dailyLog).set({
                    mainGoalId: data.mainGoalId,
                    energy: data.energy !== undefined ? data.energy : 3,
                    blockerTag: data.blockerTag,
                    note: data.note,
                    proofOfWork: data.proofOfWork,
                    updatedAt: new Date(),
                }).where(eq(dailyLog.id, dailyLogId));
            } else {
                const [newLog] = await db.insert(dailyLog).values({
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
                dailyLogId = newLog.id;
            }

            // 2. Upsert Promise Logs with error handling
            const promiseIds = Object.keys(data.promiseCompletions);
            const failedPromises: Array<{ promiseId: string; error: string }> = [];

            for (const pid of promiseIds) {
                try {
                    await db.insert(promiseLog).values({
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
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    failedPromises.push({ promiseId: pid, error: errorMessage });
                    console.error(`Failed to save promise log for ${pid}:`, error);
                }
            }

            // If some promises failed but at least one succeeded, log warning
            // If all failed and there were promises to save, throw error
            if (failedPromises.length > 0) {
                if (failedPromises.length === promiseIds.length && promiseIds.length > 0) {
                    throw new Error(`Failed to save all promise logs: ${failedPromises.map(f => f.promiseId).join(', ')}`);
                } else {
                    console.warn(`Partial save: ${failedPromises.length} of ${promiseIds.length} promise logs failed`, failedPromises);
                }
            }

            return dailyLogId;
        },
        "Failed to save daily audit"
    );
}

