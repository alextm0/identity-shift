/**
 * Rate limiting utilities for server actions.
 * 
 * Uses Postgres 'rateLimit' table for persistence across serverless instances.
 */

import { RateLimitError } from "@/lib/errors";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

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
        // 1. Get current entry
        const existing = await db.select().from(rateLimit).where(eq(rateLimit.key, key)).limit(1);
        const entry = existing[0];

        // 2. If no entry or expired, reset
        if (!entry || Number(entry.resetAt) < now) {
            const resetAt = now + windowMs;

            // Upsert mechanism
            await db.insert(rateLimit)
                .values({
                    key,
                    count: 1,
                    resetAt: BigInt(resetAt),
                })
                .onConflictDoUpdate({
                    target: rateLimit.key,
                    set: {
                        count: 1,
                        resetAt: BigInt(resetAt),
                    }
                });

            return {
                allowed: true,
                remaining: limit - 1,
                resetAt,
            };
        }

        // 3. If within window but limit reached
        if (entry.count >= limit) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: Number(entry.resetAt),
            };
        }

        // 4. Increment count
        await db.update(rateLimit)
            .set({ count: sql`${rateLimit.count} + 1` })
            .where(eq(rateLimit.key, key));

        return {
            allowed: true,
            remaining: limit - (entry.count + 1),
            resetAt: Number(entry.resetAt),
        };
    } catch (error) {
        // Fallback for DB errors to allow traffic (fail open) but log error
        console.error("Rate limit check failed:", error);
        return { allowed: true, remaining: 1, resetAt: now + windowMs };
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
