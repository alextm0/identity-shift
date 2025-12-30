
import { db } from "@/lib/db";
import { sprint, sprintPriority } from "@/lib/db/schema";
import { eq, and, desc, not, notInArray } from "drizzle-orm";
import { Sprint, NewSprint, SprintWithPriorities } from "@/lib/types";
import { SprintPriority, SprintPriorityType } from "@/lib/validators";
import { createOwnershipCondition, createOwnershipAndIdCondition, withDatabaseErrorHandling } from "@/lib/data-access/base";
import { v4 as uuidv4 } from 'uuid';
import { unstable_cache } from 'next/cache';

/**
 * Extended NewSprint type that includes priorities for create/update operations
 */
type NewSprintWithPriorities = NewSprint & {
    priorities: SprintPriority[];
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

export async function createSprint(data: NewSprintWithPriorities): Promise<SprintWithPriorities> {
    return await withDatabaseErrorHandling(
        async () => {
            // Extract priorities from data (handled separately in relational table)
            const { priorities: sprintPriorities, ...insertData } = data;

            // Insert sprint (without transaction - HTTP driver doesn't support it)
            const [newSprint] = await db.insert(sprint).values(insertData).returning();

            if (!newSprint) {
                throw new Error("Failed to create sprint");
            }

            // Insert priorities sequentially
            const prioritiesToInsert = sprintPriorities;
            if (Array.isArray(prioritiesToInsert) && prioritiesToInsert.length > 0) {
                try {
                    await db.insert(sprintPriority).values(prioritiesToInsert.map(p => ({
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
                } catch (error) {
                    // If priorities insert fails, attempt to clean up the sprint
                    // Note: Without transactions, this isn't atomic, but we try our best
                    try {
                        await db.delete(sprint).where(eq(sprint.id, newSprint.id));
                    } catch (cleanupError) {
                        // Structured error logging for monitoring
                        const errorContext = {
                            operation: 'sprint_creation_cleanup',
                            sprintId: newSprint.id,
                            userId: newSprint.userId,
                            error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
                            originalError: error instanceof Error ? error.message : String(error),
                            timestamp: new Date().toISOString()
                        };
                        console.error('Failed to cleanup sprint after priorities insert failure. Orphaned sprint detected:', JSON.stringify(errorContext));
                    }
                    throw error;
                }
            }

            // Return complete object
            const result = await db.query.sprint.findFirst({
                where: eq(sprint.id, newSprint.id),
                with: { priorities: true }
            });

            if (!result) throw new Error("Failed to retrieve created sprint");
            return mapToSprintWithPriorities(result);
        },
        "Failed to create sprint"
    );
}

export async function updateSprint(id: string, userId: string, data: Partial<NewSprintWithPriorities>): Promise<SprintWithPriorities> {
    return await withDatabaseErrorHandling(
        async () => {
            const updateData: Partial<NewSprint> = { ...data, updatedAt: new Date() };

            // Remove priorities from updateData (handled separately)
            // Type assertion needed because priorities is not in NewSprint type
            delete (updateData as any).priorities;

            // Update sprint (without transaction - HTTP driver doesn't support it)
            const [updatedSprint] = await db.update(sprint)
                .set(updateData)
                .where(createOwnershipAndIdCondition(sprint.id, id, sprint.userId, userId))
                .returning();

            if (!updatedSprint) {
                throw new Error("Sprint not found or access denied");
            }

            if (data.priorities !== undefined) {
                try {
                    const priorities = data.priorities;
                    
                    // Delete old priorities FIRST to avoid race condition
                    // This ensures we don't have duplicate priorities during the update window
                    await db.delete(sprintPriority)
                        .where(eq(sprintPriority.sprintId, id));

                    // Insert new priorities after deletion
                    // Since all priorities get new UUIDs, this is effectively a full replace operation
                    if (Array.isArray(priorities) && priorities.length > 0) {
                        const newPriorityRecords = priorities.map(p => ({
                            id: uuidv4(), // Generate new UUID for each new priority
                            sprintId: id,
                            priorityKey: p.key,
                            label: p.label,
                            type: p.type,
                            weeklyTargetUnits: p.weeklyTargetUnits,
                            unitDefinition: p.unitDefinition,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }));
                        await db.insert(sprintPriority).values(newPriorityRecords);
                    }
                } catch (error) {
                    // If priorities update fails, we can't rollback the sprint update
                    // Structured error logging for monitoring
                    const errorContext = {
                        operation: 'sprint_priority_update',
                        sprintId: id,
                        userId: updatedSprint.userId,
                        error: error instanceof Error ? error.message : String(error),
                        timestamp: new Date().toISOString()
                    };
                    console.error("Failed to update sprint priorities:", JSON.stringify(errorContext));
                    throw error;
                }
            }

            // Return complete object
            const result = await db.query.sprint.findFirst({
                where: eq(sprint.id, id),
                with: { priorities: true }
            });

            if (!result) throw new Error("Failed to retrieve updated sprint");
            return mapToSprintWithPriorities(result);
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
