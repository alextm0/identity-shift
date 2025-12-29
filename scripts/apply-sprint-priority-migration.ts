
/**
 * Script to apply the sprint priority migration
 * Run with: npx tsx scripts/apply-sprint-priority-migration.ts
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const sql = neon(DATABASE_URL);

async function applyMigration() {
    const migrationFile = path.join(process.cwd(), 'drizzle', '0009_dusty_fenris.sql');

    if (!fs.existsSync(migrationFile)) {
        throw new Error(`Migration file not found at ${migrationFile}`);
    }

    const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');

    // Split by statement breakpoints
    const statements = migrationSQL
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Applying ${statements.length} statements from 0009_dusty_fenris.sql...`);

    for (const statement of statements) {
        try {
            await (sql as any).query(statement);
            console.log('✓ Applied statement');
        } catch (error: any) {
            // Ignore "already exists" errors
            if (error.message?.includes('already exists') ||
                error.code === '42P07' || // Table/relation already exists
                error.code === '42701') { // Column already exists
                console.log('⚠ Entity already exists, skipping...');
                console.log(`  Query: ${statement.substring(0, 50)}...`);
            } else {
                console.error('Error executing statement:', statement);
                throw error;
            }
        }
    }

    console.log('✓ Migration applied successfully!');
}

applyMigration().catch((err) => {
    console.error(err);
    process.exit(1);
});
