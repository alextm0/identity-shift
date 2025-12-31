import { db } from "@/lib/db";
import { sprintGoal, promise, sprint } from "@/lib/db/schema";
import { eq, asc, and, inArray } from "drizzle-orm";
import { PromiseType, CreateSprintGoalData, PromiseData } from "@/lib/validators";
import { deleteTodayPromiseLog } from "./promises";
import { randomUUID } from "crypto";
import { NotFoundError } from "@/lib/errors";
import { unstable_cache } from "next/cache";
import type { SprintGoal, SprintPromise } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbInstance = any; // Can be PgTransaction or typeof db

/**
 * Data Access for Sprint Goals and Promises
 */


export const getSprintGoals = unstable_cache(
    async (sprintId: string) => {
        return await db.query.sprintGoal.findMany({
            where: eq(sprintGoal.sprintId, sprintId),
            with: {
                promises: {
                    orderBy: asc(promise.sortOrder),
                },
            },
            orderBy: asc(sprintGoal.sortOrder),
        });
    },
    ['sprint-goals-list'],
    { tags: ['active-sprint'] }
);

/**
 * Creates a new sprint goal and its associated promises.
 *
 * IMPORTANT: This function performs multiple sequential database operations
 * and MUST be called within a transaction to ensure atomicity. If an error
 * occurs during promise creation, the entire operation will be rolled back.
 *
 * @param sprintId The ID of the sprint
 * @param goalId The ID of the parent goal
 * @param goalText The text description of the goal
 * @param sortOrder The display order for the goal
 * @param promisesData List of promises to create for this goal
 * @param tx Drizzle transaction object (required for atomicity)
 */
export async function createSprintGoalWithPromises(
    sprintId: string,
    goalId: string,
    goalText: string,
    sortOrder: number,
    promisesData: {
        text: string;
        type: PromiseType;
        scheduleDays?: number[];
        weeklyTarget?: number;
    }[],
    tx: DbInstance // Required transaction object
) {
    const database = tx;

    // 1. Create Sprint Goal
    const [newGoal] = await database.insert(sprintGoal).values({
        id: randomUUID(),
        sprintId,
        goalId,
        goalText,
        sortOrder,
    }).returning();

    // 2. Create Promises
    if (promisesData.length > 0) {
        await database.insert(promise).values(
            promisesData.map((p, index) => ({
                id: randomUUID(),
                sprintId,
                sprintGoalId: newGoal.id,
                text: p.text,
                type: p.type,
                scheduleDays: p.scheduleDays || null,
                weeklyTarget: p.weeklyTarget || null,
                sortOrder: index,
            }))
        );
    }

    return newGoal;
}

/**
 * Synchronizes sprint goals and their associated promises with the database.
 *
 * IMPORTANT: This function performs multiple sequential database operations
 * and MUST be called within a transaction to ensure atomicity. If an error
 * occurs mid-sync, all changes will be rolled back.
 *
 * SECURITY: Validates that the sprint belongs to the user to prevent IDOR attacks.
 *
 * @param sprintId The ID of the sprint to sync goals for
 * @param userId The ID of the user owning the sprint
 * @param goals The list of goals and promises to synchronize
 * @param tx Drizzle transaction object (required for atomicity)
 */
export async function syncSprintGoalsWithPromises(
    sprintId: string,
    userId: string,
    goals: CreateSprintGoalData[],
    tx: DbInstance // Required transaction object
) {
    const database = tx;

    // CRITICAL: Validate sprint ownership to prevent IDOR vulnerability
    const sprintRecord = await database.query.sprint.findFirst({
        where: and(
            eq(sprint.id, sprintId),
            eq(sprint.userId, userId)
        ),
        columns: { id: true }
    });

    if (!sprintRecord) {
        throw new NotFoundError("Sprint not found or access denied");
    }

    // 1. Fetch current state
    const currentGoals = await database.query.sprintGoal.findMany({
        where: eq(sprintGoal.sprintId, sprintId),
        with: { promises: true }
    });

    const incomingGoalIds = goals.map(g => g.id).filter(Boolean) as string[];

    // 2. Delete goals not in incoming (batched for performance)
    const goalsToDelete = currentGoals
        .filter((cg: SprintGoal) => !incomingGoalIds.includes(cg.id))
        .map((cg: SprintGoal) => cg.id);

    if (goalsToDelete.length > 0) {
        await database.delete(sprintGoal)
            .where(inArray(sprintGoal.id, goalsToDelete));
    }

    // 3. Update or Create goals
    for (let i = 0; i < goals.length; i++) {
        const g = goals[i];
        let dbGoalId = g.id;

        if (dbGoalId) {
            // Update goal
            await database.update(sprintGoal)
                .set({
                    goalId: g.goalId,
                    goalText: g.goalText,
                    sortOrder: i
                })
                .where(eq(sprintGoal.id, dbGoalId));
        } else {
            // Create goal
            const [newGoal] = await database.insert(sprintGoal)
                .values({
                    id: randomUUID(),
                    sprintId,
                    goalId: g.goalId,
                    goalText: g.goalText,
                    sortOrder: i
                })
                .returning();
            dbGoalId = newGoal.id;
        }

        // Sync promises for this goal
        const currentGoal = currentGoals.find((cg: SprintGoal & { promises: SprintPromise[] }) => cg.id === dbGoalId);
        const currentPromises = currentGoal?.promises || [];
        const incomingPromiseIds = g.promises.map((p: PromiseData) => p.id).filter(Boolean) as string[];

        // Delete promises not in incoming (batched for performance)
        const promisesToDelete = currentPromises
            .filter((cp: SprintPromise) => !incomingPromiseIds.includes(cp.id))
            .map((cp: SprintPromise) => cp.id);

        if (promisesToDelete.length > 0) {
            await database.delete(promise)
                .where(inArray(promise.id, promisesToDelete));
        }

        // Update or Create promises (batch inserts for performance)
        const promisesToInsert = [];

        for (let j = 0; j < g.promises.length; j++) {
            const p = g.promises[j];

            // Validate promise type constraints
            if (p.type === 'daily' && (!p.scheduleDays || p.scheduleDays.length === 0)) {
                throw new Error(`Promise "${p.text}" has type 'daily' but no scheduleDays specified`);
            }
            if (p.type === 'weekly' && (!p.weeklyTarget || p.weeklyTarget < 1)) {
                throw new Error(`Promise "${p.text}" has type 'weekly' but no valid weeklyTarget specified`);
            }

            const pData = {
                text: p.text,
                type: p.type,
                scheduleDays: p.scheduleDays || null,
                weeklyTarget: p.weeklyTarget || null,
                sortOrder: j,
                updatedAt: new Date()
            };

            if (p.id) {
                // Update existing promise
                const cp = currentPromises.find((currP: SprintPromise) => currP.id === p.id);
                const changed = cp && (
                    cp.text !== p.text ||
                    cp.type !== p.type ||
                    JSON.stringify(cp.scheduleDays) !== JSON.stringify(p.scheduleDays) ||
                    cp.weeklyTarget !== p.weeklyTarget
                );

                if (changed) {
                    await deleteTodayPromiseLog(p.id, userId, database);
                }

                await database.update(promise)
                    .set(pData)
                    .where(eq(promise.id, p.id));
            } else {
                // Collect new promise for batch insert
                promisesToInsert.push({
                    id: randomUUID(),
                    sprintId,
                    sprintGoalId: dbGoalId,
                    ...pData
                });
            }
        }

        // Batch insert all new promises for this goal
        if (promisesToInsert.length > 0) {
            await database.insert(promise).values(promisesToInsert);
        }
    }
}

