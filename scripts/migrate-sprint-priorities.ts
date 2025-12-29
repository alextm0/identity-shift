
import 'dotenv/config';
import { db } from "@/lib/db";
import { sprint, sprintPriority } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log("Starting data migration for sprint priorities...");

    const allSprints = await db.select().from(sprint);
    console.log(`Found ${allSprints.length} sprints.`);

    let migratedCount = 0;

    for (const s of allSprints) {
        // Parse priorities from JSON field (legacy column - will be removed after migration)
        let priorities: any[] = [];
        if ((s as any).priorities) {
            if (Array.isArray((s as any).priorities)) {
                priorities = (s as any).priorities;
            } else if (typeof (s as any).priorities === 'string') {
                try {
                    priorities = JSON.parse((s as any).priorities);
                } catch (error) {
                    console.error(`[migrate-sprint-priorities] Failed to parse JSON for sprint ${s.id}:`, error);
                    continue;
                }
            }
        }

        if (priorities.length === 0) {
            console.log(`Sprint ${s.id} has no priorities. Skipping.`);
            continue;
        }

        console.log(`Sprint ${s.id} has ${priorities.length} priorities. Migrating...`);

        for (const p of priorities) {
            await db.insert(sprintPriority).values({
                id: uuidv4(),
                sprintId: s.id,
                priorityKey: p.key,
                label: p.label,
                type: p.type,
                weeklyTargetUnits: p.weeklyTargetUnits,
                unitDefinition: p.unitDefinition,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        migratedCount++;
    }

    console.log(`Migration complete. Migrated priorities for ${migratedCount} sprints.`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
