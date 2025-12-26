/**
 * Rate limiting utilities for server actions.
 * 
 * This is a simple in-memory rate limiter. For production, consider using
 * a more robust solution like Upstash Redis or similar.
 */

import { RateLimitError } from "@/lib/errors";

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store (clears on server restart)
// For production, use Redis or similar persistent store
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Checks if a request should be rate limited.
 * 
 * @param identifier - Unique identifier (e.g., userId or IP)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const key = identifier;
    
    const entry = rateLimitStore.get(key);
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
        for (const [k, v] of rateLimitStore.entries()) {
            if (v.resetAt < now) {
                rateLimitStore.delete(k);
            }
        }
    }
    
    if (!entry || entry.resetAt < now) {
        // Create new entry
        const newEntry: RateLimitEntry = {
            count: 1,
            resetAt: now + windowMs,
        };
        rateLimitStore.set(key, newEntry);
        return {
            allowed: true,
            remaining: limit - 1,
            resetAt: newEntry.resetAt,
        };
    }
    
    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);
    
    if (entry.count > limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
        };
    }
    
    return {
        allowed: true,
        remaining: limit - entry.count,
        resetAt: entry.resetAt,
    };
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
export function enforceRateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
): void {
    const result = checkRateLimit(identifier, limit, windowMs);
    
    if (!result.allowed) {
        const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000);
        throw new RateLimitError(
            `Rate limit exceeded. Please try again in ${resetIn} seconds.`
        );
    }
}

