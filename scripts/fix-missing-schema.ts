
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("DATABASE_URL is not defined");
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
    console.log("Starting schema fix for missing 'year' column and indexes...");

    try {
        // 1. Fix 'planning' table
        console.log("Adding 'year' column to planning table...");
        await (sql as any).query(`
            ALTER TABLE "planning" 
            ADD COLUMN IF NOT EXISTS "year" integer NOT NULL DEFAULT 2026;
        `);

        console.log("Adding unique index on planning(userId, year)...");
        // We use IF NOT EXISTS logic by catching duplicate error or just checking
        // But pure SQL 'CREATE INDEX IF NOT EXISTS' works in Postgres 9.5+
        await (sql as any).query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "planning_userId_year_idx" ON "planning" ("userId", "year");
        `);

        // 2. Fix 'sprint' table indexes
        console.log("Adding indexes to sprint table...");
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "sprint_userId_active_idx" ON "sprint" ("userId", "active");
        `);
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "sprint_userId_startDate_idx" ON "sprint" ("userId", "startDate");
        `);

        // 3. Fix 'dailyLog' table indexes
        console.log("Adding indexes to dailyLog table...");
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "dailyLog_sprintId_date_idx" ON "dailyLog" ("sprintId", "date");
        `);

        // 4. Fix 'weeklyReview' table indexes
        console.log("Adding indexes to weeklyReview table...");
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "weeklyReview_userId_weekEndDate_idx" ON "weeklyReview" ("userId", "weekEndDate");
        `);
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "weeklyReview_sprintId_idx" ON "weeklyReview" ("sprintId");
        `);

        // 5. Fix 'monthlyReview' table indexes
        console.log("Adding indexes to monthlyReview table...");
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "monthlyReview_userId_createdAt_idx" ON "monthlyReview" ("userId", "createdAt");
        `);
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "monthlyReview_sprintId_idx" ON "monthlyReview" ("sprintId");
        `);

        // 6. Fix 'auditLog' table indexes
        console.log("Adding indexes to auditLog table...");
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "auditLog_userId_createdAt_idx" ON "auditLog" ("userId", "createdAt");
        `);
        await (sql as any).query(`
            CREATE INDEX IF NOT EXISTS "auditLog_entityType_entityId_idx" ON "auditLog" ("entityType", "entityId");
        `);

        console.log("Schema fix completed successfully.");

    } catch (error) {
        console.error("Failed to apply schema fixes:", error);
        process.exit(1);
    }
}

main();
