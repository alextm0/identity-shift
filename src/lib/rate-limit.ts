/**
 * Rate limiting utilities for server actions.
 * 
 * Uses Postgres 'rateLimit' table for persistence across serverless instances.
 */

import { RateLimitError } from "@/lib/errors";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { env } from "@/env";

/**
 * Checks if a request should be rate limited.
 * 
 * @param identifier - Unique identifier (e.g., userId or IP)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request should be allowed, false if rate limited
 */
export async function checkRateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const key = identifier;

    try {
        // Atomic UPSERT that handles both creation, reset (if expired), and incrementing
        const result = await db.insert(rateLimit)
            .values({
                key,
                count: 1,
                resetAt: now + windowMs,
            })
            .onConflictDoUpdate({
                target: rateLimit.key,
                set: {
                    count: sql`CASE 
                        WHEN ${rateLimit.resetAt} < ${now} THEN 1 
                        ELSE ${rateLimit.count} + 1 
                    END`,
                    resetAt: sql`CASE 
                        WHEN ${rateLimit.resetAt} < ${now} THEN ${now + windowMs} 
                        ELSE ${rateLimit.resetAt} 
                    END`,
                },
            })
            .returning();

        const entry = result[0];
        const allowed = entry.count <= limit;
        const remaining = Math.max(0, limit - entry.count);

        return {
            allowed,
            remaining,
            resetAt: entry.resetAt,
        };
    } catch (error) {
        /**
         * SECURITY TRADE-OFF: Fail-Closed (Default) vs Fail-Open
         * 
         * By default, we fail-closed (allowed: false) to prevent rate-limit bypass 
         * during database outages. This is the more secure approach for production 
         * systems.
         * 
         * Set RATE_LIMIT_FAIL_OPEN=true in your environment to allow traffic 
         * even if the database is unavailable (use only if availability > security).
         */
        const failOpen = env.RATE_LIMIT_FAIL_OPEN;

        console.error("[CRITICAL] Rate limit check failed. Database may be unavailable.", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            failOpen
        });

        return {
            allowed: failOpen,
            remaining: 0,
            resetAt: now + windowMs
        };
    }
}

/**
 * Rate limit wrapper for server actions.
 * Throws an error if rate limit is exceeded.
 * 
 * @param identifier - Unique identifier (e.g., userId)
 * @param limit - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 * @throws Error if rate limit exceeded
 */
export async function enforceRateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
): Promise<void> {
    const result = await checkRateLimit(identifier, limit, windowMs);

    if (!result.allowed) {
        const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000);
        throw new RateLimitError(
            `Rate limit exceeded. Please try again in ${resetIn} seconds.`
        );
    }
}
