
import { db } from "@/lib/db";
import { sprint, sprintPriority } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Sprint, NewSprint, SprintWithPriorities } from "@/lib/types";
import { SprintPriority, SprintPriorityType } from "@/lib/validators";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { v4 as uuidv4 } from 'uuid';
import { unstable_cache } from 'next/cache';

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
}

function mapToSprintWithPriorities(row: SprintRow): SprintWithPriorities {
    // row is { ...sprintFields, priorities: [ { ...priorityFields } ] }
    const priorities = (row.priorities || []).map((p) => ({
        key: p.priorityKey,
        label: p.label,
        type: p.type as SprintPriorityType,
        weeklyTargetUnits: p.weeklyTargetUnits,
        unitDefinition: p.unitDefinition
    }));

    return {
        ...row,
        priorities
    };
}

export async function getActiveSprint(userId: string): Promise<SprintWithPriorities | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.query.sprint.findFirst({
                where: and(
                    createOwnershipCondition(sprint.userId, userId),
                    eq(sprint.active, true)
                ),
                with: {
                    priorities: true
                }
            });
            return result ? mapToSprintWithPriorities(result) : undefined;
        },
        "Failed to fetch active sprint"
    );
}

export const getActiveSprintCached = unstable_cache(
    async (userId: string) => getActiveSprint(userId),
    ['active-sprint'],
    {
        tags: ['active-sprint'],
        revalidate: 3600, // Revalidate every hour
    }
);

export async function getSprints(userId: string): Promise<SprintWithPriorities[]> {
    return await withDatabaseErrorHandling(
        async () => {
            const results = await db.query.sprint.findMany({
                where: createOwnershipCondition(sprint.userId, userId),
                orderBy: desc(sprint.startDate),
                with: {
                    priorities: true
                }
            });

            return results.map(mapToSprintWithPriorities);
        },
        "Failed to fetch sprints"
    );
}

export async function getSprintById(id: string, userId: string): Promise<SprintWithPriorities | undefined> {
    return await withDatabaseErrorHandling(
        async () => {
            const result = await db.query.sprint.findFirst({
                where: createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId),
                with: {
                    priorities: true
                }
            });
            return result ? mapToSprintWithPriorities(result) : undefined;
        },
        "Failed to fetch sprint by ID"
    );
}

export async function createSprint(data: NewSprint): Promise<SprintWithPriorities> {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.transaction(async (tx) => {
                // Extract priorities from data (handled separately in relational table)
                const { priorities: sprintPriorities, ...insertData } = data;

                const [newSprint] = await tx.insert(sprint).values(insertData).returning();

                // Insert priorities
                const prioritiesToInsert = sprintPriorities as SprintPriority[];
                if (Array.isArray(prioritiesToInsert) && prioritiesToInsert.length > 0) {
                    await tx.insert(sprintPriority).values(prioritiesToInsert.map(p => ({
                        id: uuidv4(),
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

                // Return complete object
                const result = await tx.query.sprint.findFirst({
                    where: eq(sprint.id, newSprint.id),
                    with: { priorities: true }
                });

                if (!result) throw new Error("Failed to retrieve created sprint");
                return mapToSprintWithPriorities(result);
            });
        },
        "Failed to create sprint"
    );
}

export async function updateSprint(id: string, userId: string, data: Partial<NewSprint>): Promise<SprintWithPriorities> {
    return await withDatabaseErrorHandling(
        async () => {
            return await db.transaction(async (tx) => {
                const updateData: Partial<NewSprint> = { ...data, updatedAt: new Date() };

                // Remove priorities from updateData (handled separately)
                delete updateData.priorities;

                const [updatedSprint] = await tx.update(sprint)
                    .set(updateData)
                    .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                    .returning();

                if (!updatedSprint) {
                    // If update failed (e.g. not found), we should throw or return nothing.
                    // But Drizzle returns [] if not found.
                    // createOwnershipAndIdCondition handles the check somewhat, but here we might just get undefined.
                    throw new Error("Sprint not found or access denied");
                }

                if (data.priorities !== undefined) {
                    // Update priorities: Delete all and re-insert
                    await tx.delete(sprintPriority).where(eq(sprintPriority.sprintId, id));

                    const priorities = data.priorities as SprintPriority[];
                    if (Array.isArray(priorities) && priorities.length > 0) {
                        await tx.insert(sprintPriority).values(priorities.map(p => ({
                            id: uuidv4(),
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
                }

                // Return complete object
                const result = await tx.query.sprint.findFirst({
                    where: eq(sprint.id, id),
                    with: { priorities: true }
                });

                if (!result) throw new Error("Failed to retrieve updated sprint");
                return mapToSprintWithPriorities(result);
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
                .where(createOwnershipCondition(sprint.userId, userId));
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
