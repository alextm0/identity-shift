import { db } from "@/lib/db";
import { sprintGoal, promise } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { PromiseType, CreateSprintGoalData, PromiseData } from "@/lib/validators";
import { deleteTodayPromiseLog } from "./promises";
import { randomUUID } from "crypto";

export async function getSprintGoals(sprintId: string) {
    return await db.query.sprintGoal.findMany({
        where: eq(sprintGoal.sprintId, sprintId),
        with: {
            promises: {
                orderBy: asc(promise.sortOrder),
            },
        },
        orderBy: asc(sprintGoal.sortOrder),
    });
}

export async function createSprintGoalWithPromises(
    sprintId: string,
    goalId: string,
    goalText: string,
    sortOrder: number,
    promisesData: {
        text: string;
        type: PromiseType; // Use the enum type
        scheduleDays?: number[];
        weeklyTarget?: number;
    }[]
) {
    // Neon HTTP driver doesn't support transactions. 
    // We'll perform sequential inserts. Since this is only called during sprint creation, 
    // partial failure is unlikely but the overall action will handle the error.

    // 1. Create Sprint Goal
    const [newGoal] = await db.insert(sprintGoal).values({
        id: randomUUID(),
        sprintId,
        goalId,
        goalText,
        sortOrder,
    }).returning();

    // 2. Create Promises
    if (promisesData.length > 0) {
        await db.insert(promise).values(
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

export async function syncSprintGoalsWithPromises(
    sprintId: string,
    goals: CreateSprintGoalData[]
) {
    // 1. Fetch current state
    const currentGoals = await db.query.sprintGoal.findMany({
        where: eq(sprintGoal.sprintId, sprintId),
        with: { promises: true }
    });

    const incomingGoalIds = goals.map(g => g.id).filter(Boolean) as string[];

    // 2. Delete goals not in incoming
    for (const cg of currentGoals) {
        if (!incomingGoalIds.includes(cg.id)) {
            await db.delete(sprintGoal).where(eq(sprintGoal.id, cg.id));
        }
    }

    // 3. Update or Create goals
    for (let i = 0; i < goals.length; i++) {
        const g = goals[i];
        let dbGoalId = g.id;

        if (dbGoalId) {
            // Update goal
            await db.update(sprintGoal)
                .set({
                    goalId: g.goalId,
                    goalText: g.goalText,
                    sortOrder: i
                })
                .where(eq(sprintGoal.id, dbGoalId));
        } else {
            // Create goal
            const [newGoal] = await db.insert(sprintGoal)
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
        const currentGoal = currentGoals.find(cg => cg.id === dbGoalId);
        const currentPromises = currentGoal?.promises || [];
        const incomingPromiseIds = g.promises.map((p: PromiseData) => p.id).filter(Boolean) as string[];

        // Delete promises not in incoming
        for (const cp of currentPromises) {
            if (!incomingPromiseIds.includes(cp.id)) {
                await db.delete(promise).where(eq(promise.id, cp.id));
            }
        }

        // Update or Create promises
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
                // Check if changed
                const cp = currentPromises.find(currP => currP.id === p.id);
                const changed = cp && (
                    cp.text !== p.text ||
                    cp.type !== p.type ||
                    JSON.stringify(cp.scheduleDays) !== JSON.stringify(p.scheduleDays) ||
                    cp.weeklyTarget !== p.weeklyTarget
                );

                if (changed) {
                    await deleteTodayPromiseLog(p.id);
                }

                await db.update(promise)
                    .set(pData)
                    .where(eq(promise.id, p.id));
            } else {
                // Create new promise
                await db.insert(promise)
                    .values({
                        id: randomUUID(),
                        sprintId,
                        sprintGoalId: dbGoalId,
                        ...pData
                    });
            }
        }
    }
}
