import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

// Using Pool instead of neon(url) to support transactions in serverless environment
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from './schema';
