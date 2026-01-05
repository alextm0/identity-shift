import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

import { env } from "@/env";

if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

/**
 * Neon serverless client with WebSocket support.
 * This supports transactions which are required for certain operations.
 * The Pool handles connection management efficiently for serverless environments.
 */
const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from './schema';

