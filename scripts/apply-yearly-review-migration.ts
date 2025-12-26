/**
 * Script to apply the yearlyReview table migration
 * Run with: npx tsx scripts/apply-yearly-review-migration.ts
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
    const migrationFile = path.join(process.cwd(), 'drizzle', '0005_next_toad.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');
    
    // Split by statement breakpoints
    const statements = migrationSQL
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Applying ${statements.length} statements...`);
    
    for (const statement of statements) {
        try {
            await sql.query(statement);
            console.log('✓ Applied statement');
        } catch (error: any) {
            // Ignore "already exists" errors
            if (error.message?.includes('already exists') || error.code === '42P07') {
                console.log('⚠ Table/index already exists, skipping...');
            } else {
                throw error;
            }
        }
    }
    
    console.log('✓ Migration applied successfully!');
}

applyMigration().catch(console.error);

