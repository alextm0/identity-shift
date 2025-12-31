import { db } from "@/lib/db";
import { promise, promiseLog } from "@/lib/db/schema";
import { eq, and, asc, gte, lte, inArray } from "drizzle-orm";
import { startOfWeek, endOfWeek } from "date-fns";
import { normalizeDate } from "@/lib/data-access/base";
import { randomUUID } from "crypto";

export async function getPromisesForSprint(sprintId: string) {
    return await db.query.promise.findMany({
        where: eq(promise.sprintId, sprintId),
        with: {
            sprintGoal: true,
        },
        orderBy: asc(promise.sortOrder),
    });
}

export async function getScheduledPromisesForDate(sprintId: string, date: Date) {
    // Fetch all promises for the sprint
    const normalizedDate = normalizeDate(date);

    return await db.query.promise.findMany({
        where: eq(promise.sprintId, sprintId),
        with: {
            sprintGoal: true,
            logs: {
                where: eq(promiseLog.date, normalizedDate), // Ensure we only get log for this day
                limit: 1,
            }
        },
        orderBy: asc(promise.sortOrder),
    });
}

export async function logPromiseCompletion(
    promiseId: string,
    date: Date,
    completed: boolean,
    userId: string,
    dailyLogId?: string
) {
    const normalizedDate = normalizeDate(date);

    await db.insert(promiseLog).values({
        id: randomUUID(),
        userId,
        promiseId,
        date: normalizedDate,
        dailyLogId: dailyLogId ?? null,
        completed,
    })
        .onConflictDoUpdate({
            target: [promiseLog.promiseId, promiseLog.date],
            set: {
                completed,
                dailyLogId: dailyLogId ?? null
            }
        });
}

export async function getPromiseLogsForWeek(promiseId: string, weekStart: Date) {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 });
    const end = endOfWeek(weekStart, { weekStartsOn: 1 });
    return await db.query.promiseLog.findMany({
        where: and(
            eq(promiseLog.promiseId, promiseId),
            gte(promiseLog.date, start),
            lte(promiseLog.date, end)
        )
    });
}

export async function getPromiseLogsForSprint(sprintId: string) {
    // Get all promises for sprint first
    const promises = await db.query.promise.findMany({
        where: eq(promise.sprintId, sprintId),
        columns: { id: true }
    });

    if (promises.length === 0) return [];

    const promiseIds = promises.map(p => p.id);

    return await db.query.promiseLog.findMany({
        where: inArray(promiseLog.promiseId, promiseIds),
        orderBy: asc(promiseLog.date)
    });
}

export async function deleteTodayPromiseLog(promiseId: string) {
    const normalizedDate = normalizeDate(new Date());
    return await db.delete(promiseLog)
        .where(
            and(
                eq(promiseLog.promiseId, promiseId),
                eq(promiseLog.date, normalizedDate)
            )
        );
}

export async function getPromiseLogsForDateRange(userId: string, startDate: Date, endDate: Date) {
    return await db.query.promiseLog.findMany({
        where: and(
            eq(promiseLog.userId, userId),
            gte(promiseLog.date, startDate),
            lte(promiseLog.date, endDate)
        ),
        orderBy: asc(promiseLog.date)
    });
}
