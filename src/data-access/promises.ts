import { db } from "@/lib/db";
import { promise, promiseLog, sprint } from "@/lib/db/schema";
import { eq, and, asc, gte, lte, inArray } from "drizzle-orm";
import { startOfWeek, endOfWeek } from "date-fns";
import { normalizeDate } from "@/lib/data-access/base";
import { randomUUID } from "crypto";
import { unstable_cache } from "next/cache";
import { NotFoundError, AuthorizationError } from "@/lib/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbInstance = any; // Can be PgTransaction or typeof db

export const getPromisesForSprint = unstable_cache(
    async (sprintId: string) => {
        return await db.query.promise.findMany({
            where: eq(promise.sprintId, sprintId),
            with: {
                sprintGoal: true,
            },
            orderBy: asc(promise.sortOrder),
        });
    },
    ['promises-for-sprint'],
    { tags: ['active-sprint'] }
);

export const getScheduledPromisesForDate = unstable_cache(
    async (sprintId: string, date: Date) => {
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
    },
    ['scheduled-promises-for-date'],
    { tags: ['active-sprint', 'daily-logs'] }
);

export async function logPromiseCompletion(
    promiseId: string,
    date: Date,
    completed: boolean,
    userId: string,
    dailyLogId?: string
) {
    // Validate that the promise exists and belongs to a sprint owned by the user
    const promiseWithSprint = await db
        .select({
            promiseId: promise.id,
            sprintUserId: sprint.userId,
        })
        .from(promise)
        .innerJoin(sprint, eq(promise.sprintId, sprint.id))
        .where(eq(promise.id, promiseId))
        .limit(1);

    if (promiseWithSprint.length === 0) {
        throw new NotFoundError("Promise not found");
    }

    if (promiseWithSprint[0].sprintUserId !== userId) {
        throw new AuthorizationError("You do not have permission to log this promise");
    }

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

export const getPromiseLogsForWeek = unstable_cache(
    async (promiseId: string, weekStart: Date) => {
        const start = startOfWeek(weekStart, { weekStartsOn: 1 });
        const end = endOfWeek(weekStart, { weekStartsOn: 1 });
        return await db.query.promiseLog.findMany({
            where: and(
                eq(promiseLog.promiseId, promiseId),
                gte(promiseLog.date, start),
                lte(promiseLog.date, end)
            )
        });
    },
    ['promise-logs-for-week'],
    { tags: ['active-sprint', 'daily-logs'] }
);

export const getPromiseLogsForSprint = unstable_cache(
    async (sprintId: string) => {
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
    },
    ['promise-logs-for-sprint'],
    { tags: ['active-sprint'] }
);

/**
 * Deletes today's promise log for a specific promise and user.
 *
 * SECURITY: Properly scopes deletion to the specific userId to prevent unauthorized deletions.
 *
 * @param promiseId The ID of the promise
 * @param userId The ID of the user (for authorization)
 * @param tx Drizzle transaction object (required when called within a transaction)
 */
export async function deleteTodayPromiseLog(promiseId: string, userId: string, tx: DbInstance) {
    const database = tx;
    const normalizedDate = normalizeDate(new Date());
    return await database.delete(promiseLog)
        .where(
            and(
                eq(promiseLog.promiseId, promiseId),
                eq(promiseLog.userId, userId),
                eq(promiseLog.date, normalizedDate)
            )
        );
}

export const getPromiseLogsForDateRange = unstable_cache(
    async (userId: string, startDate: Date, endDate: Date) => {
        return await db.query.promiseLog.findMany({
            where: and(
                eq(promiseLog.userId, userId),
                gte(promiseLog.date, startDate),
                lte(promiseLog.date, endDate)
            ),
            orderBy: asc(promiseLog.date)
        });
    },
    ['promise-logs-for-date-range'],
    { tags: ['active-sprint', 'daily-logs'] }
);
