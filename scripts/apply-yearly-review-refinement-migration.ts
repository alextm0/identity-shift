/**
 * Script to apply the yearly review refinement migration (0008)
 * Adds wins and otherDetails columns to yearlyReview table
 * Run with: npx tsx scripts/apply-yearly-review-refinement-migration.ts
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
    const migrationFile = path.join(process.cwd(), 'drizzle', '0008_thin_paper_doll.sql');
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
            console.log(`✓ Applied: ${statement.substring(0, 80)}...`);
        } catch (error: any) {
            // Ignore "already exists" errors for columns
            if (error.message?.includes('already exists') || 
                error.code === '42P07' ||
                error.message?.includes('duplicate column') ||
                error.code === '42701') {
                console.log(`⚠ Column already exists, skipping: ${statement.substring(0, 80)}...`);
            } else {
                console.error(`✗ Error applying statement: ${statement.substring(0, 80)}...`);
                console.error(error.message);
                throw error;
            }
        }
    }
    
    console.log('✓ Migration applied successfully!');
}

applyMigration().catch(console.error);



