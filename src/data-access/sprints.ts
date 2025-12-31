
import { db } from "@/lib/db";
import { sprint, sprintPriority, sprintGoal, promise } from "@/lib/db/schema";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import { NewSprint, SprintWithPriorities, SprintWithDetails } from "@/lib/types";
import { SprintPriority, SprintPriorityType, CreateSprintGoalData } from "@/lib/validators";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { randomUUID } from "crypto";
import { unstable_cache } from 'next/cache';
import { syncSprintGoalsWithPromises, createSprintGoalWithPromises } from "./sprint-goals";

/**
 * Extended NewSprint type that includes priorities for create/update operations
 */
type NewSprintWithPriorities = NewSprint & {
    priorities?: SprintPriority[];
    goals?: CreateSprintGoalData[];
};

/**
 * Data Access Layer for Sprints
 * 
 * Direct database operations using Drizzle ORM.
 * Implements normalization pattern: reads from relational tables.
 */

interface SprintRow {
    id: string;
    userId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    priorities?: Array<{
        priorityKey: string;
        label: string;
        type: string;
        weeklyTargetUnits: number;
        unitDefinition: string | null;
    }>;
    goals?: SprintWithDetails['goals'];
}

function mapToSprintWithPriorities(row: SprintRow): SprintWithPriorities {
    // row is { ...sprintFields, priorities: [ { ...priorityFields } ] }
    const priorities = (row.priorities || []).map((p) => ({
        key: p.priorityKey,
        label: p.label,
        type: p.type as SprintPriorityType,
        weeklyTargetUnits: p.weeklyTargetUnits,
        unitDefinition: p.unitDefinition ?? undefined // Convert null to undefined
    }));

    return {
        ...row,
        priorities
    } as SprintWithPriorities;
}

function mapToSprintWithDetails(row: SprintRow): SprintWithDetails {
    const basic = mapToSprintWithPriorities(row);
    // goals should be populated by Drizzle if requested
    // If not, default to empty array
    return {
        ...basic,
        goals: row.goals || []
    } as SprintWithDetails;
}

export async function getActiveSprint(userId: string): Promise<SprintWithDetails | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.query.sprint.findFirst({
                where: and(
                    createOwnershipCondition(sprint.userId, userId),
                    eq(sprint.active, true)
                ),
                with: {
                    priorities: true,
                    goals: {
                        orderBy: asc(sprintGoal.sortOrder),
                        with: {
                            promises: {
                                orderBy: asc(promise.sortOrder)
                            }
                        }
                    }
                }
            });
            return result ? mapToSprintWithDetails(result) : undefined;
        },
        "Failed to fetch active sprint"
    );
}

export const getActiveSprintCached = unstable_cache(
    async (userId: string) => getActiveSprint(userId),
    ['active-sprint'],
    {
        tags: ['active-sprint'],
        revalidate: 60, // Revalidate every minute
    }
);

export const getSprints = unstable_cache(
    async (userId: string): Promise<SprintWithDetails[]> => {
        return await withDatabaseErrorHandling(
            async () => {
                const results = await db.query.sprint.findMany({
                    where: createOwnershipCondition(sprint.userId, userId),
                    orderBy: desc(sprint.startDate),
                    with: {
                        priorities: true,
                        goals: {
                            orderBy: asc(sprintGoal.sortOrder),
                            with: {
                                promises: {
                                    orderBy: asc(promise.sortOrder)
                                }
                            }
                        }
                    }
                });

                return results.map(mapToSprintWithDetails);
            },
            "Failed to fetch sprints"
        );
    },
    ['sprints-list'],
    { tags: ['active-sprint'] }
);

export const getSprintById = unstable_cache(
    async (id: string, userId: string): Promise<SprintWithDetails | undefined> => {
        return await withDatabaseErrorHandling(
            async () => {
                const result = await db.query.sprint.findFirst({
                    where: createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId),
                    with: {
                        priorities: true,
                        goals: {
                            orderBy: asc(sprintGoal.sortOrder),
                            with: {
                                promises: {
                                    orderBy: asc(promise.sortOrder)
                                }
                            }
                        }
                    }
                });
                return result ? mapToSprintWithDetails(result) : undefined;
            },
            "Failed to fetch sprint by ID"
        );
    },
    ['sprint-by-id'],
    { tags: ['active-sprint'] }
);

export async function createSprint(data: NewSprintWithPriorities): Promise<SprintWithDetails> {
    return await withDatabaseErrorHandling(
        async () => {
            const { priorities: sprintPriorities, ...insertData } = data;

            return await db.transaction(async (tx) => {
                // Insert sprint
                const [newSprint] = await tx.insert(sprint).values(insertData).returning();

                if (!newSprint) {
                    throw new Error("Failed to create sprint");
                }

                // Insert priorities
                if (Array.isArray(sprintPriorities) && sprintPriorities.length > 0) {
                    await tx.insert(sprintPriority).values(sprintPriorities.map(p => ({
                        id: randomUUID(),
                        sprintId: newSprint.id,
                        priorityKey: p.key,
                        label: p.label,
                        type: p.type,
                        weeklyTargetUnits: p.weeklyTargetUnits,
                        unitDefinition: p.unitDefinition,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })));
                }

                // Insert goals (if provided)
                if (Array.isArray(data.goals) && data.goals.length > 0) {
                    let sortOrder = 0;
                    for (const goal of data.goals) {
                        await createSprintGoalWithPromises(
                            newSprint.id,
                            goal.goalId,
                            goal.goalText,
                            sortOrder++,
                            goal.promises.map(p => ({
                                text: p.text,
                                type: p.type,
                                scheduleDays: p.scheduleDays,
                                weeklyTarget: p.weeklyTarget,
                            })),
                            tx
                        );
                    }
                }

                // Return complete object
                const result = await tx.query.sprint.findFirst({
                    where: eq(sprint.id, newSprint.id),
                    with: {
                        priorities: true,
                        goals: {
                            orderBy: asc(sprintGoal.sortOrder),
                            with: {
                                promises: {
                                    orderBy: asc(promise.sortOrder)
                                }
                            }
                        }
                    }
                });

                if (!result) throw new Error("Failed to retrieve created sprint");
                return mapToSprintWithDetails(result);
            });
        },
        "Failed to create sprint"
    );
}

export async function updateSprint(id: string, userId: string, data: Partial<NewSprintWithPriorities>): Promise<SprintWithDetails> {
    return await withDatabaseErrorHandling(
        async () => {
            const { ...sprintData } = data;
            const updateData: Partial<NewSprint> = { ...sprintData, updatedAt: new Date() };

            return await db.transaction(async (tx) => {
                // Update sprint
                const [updatedSprint] = await tx.update(sprint)
                    .set(updateData)
                    .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                    .returning();

                if (!updatedSprint) {
                    throw new Error("Sprint not found or access denied");
                }

                if (data.priorities !== undefined) {
                    // Fetch existing priorities
                    const existingPriorities = await tx.select().from(sprintPriority).where(eq(sprintPriority.sprintId, id));
                    const newPriorities = data.priorities;

                    // Use diff approach to minimize downtime window
                    const existingByKey = new Map(existingPriorities.map(p => [p.priorityKey, p]));
                    const newByKey = new Map((newPriorities || []).map(p => [p.key, p]));

                    // 1. Update existing priorities
                    for (const newP of (newPriorities || [])) {
                        const existing = existingByKey.get(newP.key);
                        if (existing) {
                            await tx.update(sprintPriority)
                                .set({
                                    label: newP.label,
                                    type: newP.type,
                                    weeklyTargetUnits: newP.weeklyTargetUnits,
                                    unitDefinition: newP.unitDefinition,
                                    updatedAt: new Date()
                                })
                                .where(eq(sprintPriority.id, existing.id));
                        }
                    }

                    // 2. Insert new priorities
                    const toInsert = (newPriorities || []).filter(p => !existingByKey.has(p.key));
                    if (toInsert.length > 0) {
                        await tx.insert(sprintPriority).values(toInsert.map(p => ({
                            id: randomUUID(),
                            sprintId: id,
                            priorityKey: p.key,
                            label: p.label,
                            type: p.type,
                            weeklyTargetUnits: p.weeklyTargetUnits,
                            unitDefinition: p.unitDefinition,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })));
                    }

                    // 3. Delete removed priorities
                    const toDelete = existingPriorities.filter(p => !newByKey.has(p.priorityKey));
                    if (toDelete.length > 0) {
                        const toDeleteIds = toDelete.map(p => p.id);
                        await tx.delete(sprintPriority)
                            .where(and(
                                eq(sprintPriority.sprintId, id),
                                inArray(sprintPriority.id, toDeleteIds)
                            ));
                    }
                }

                if (data.goals !== undefined) {
                    await syncSprintGoalsWithPromises(id, userId, data.goals, tx);
                }

                // Return complete object
                const result = await tx.query.sprint.findFirst({
                    where: eq(sprint.id, id),
                    with: {
                        priorities: true,
                        goals: {
                            orderBy: asc(sprintGoal.sortOrder),
                            with: {
                                promises: {
                                    orderBy: asc(promise.sortOrder)
                                }
                            }
                        }
                    }
                });

                if (!result) throw new Error("Failed to retrieve updated sprint");
                return mapToSprintWithDetails(result);
            });
        },
        "Failed to update sprint"
    );
}


export async function deactivateAllSprints(userId: string) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.update(sprint)
                .set({ active: false, updatedAt: new Date() })
                .where(and(
                    createOwnershipCondition(sprint.userId, userId),
                    eq(sprint.active, true)
                ))
                .returning();
        },
        "Failed to deactivate sprints"
    );
}

export async function deleteSprint(id: string, userId: string) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.delete(sprint)
                .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                .returning();
        },
        "Failed to delete sprint"
    );
}

export async function closeSprintById(id: string, userId: string) {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.update(sprint)
                .set({ active: false, updatedAt: new Date() })
                .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                .returning();
        },
        "Failed to close sprint"
    );
}
