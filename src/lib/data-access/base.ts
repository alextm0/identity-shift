/**
 * Base Data Access Utilities
 * 
 * Provides common patterns and utilities for data access layer functions:
 * - Ownership validation
 * - Standardized error handling
 * - Date normalization utilities
 * - Common query patterns
 */

import { eq, and, SQL, AnyColumn } from "drizzle-orm";
import { NotFoundError, DatabaseError } from "@/lib/errors";

/**
 * Normalizes a date to midnight (00:00:00.000) for consistent date comparisons
 */
export function normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

/**
 * Creates a date range for a specific day (start and end of day)
 */
export function getDayRange(date: Date): { start: Date; end: Date } {
    const start = normalizeDate(date);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

/**
 * Wraps a data access function to ensure ownership check
 * 
 * @param fn - The data access function to wrap
 * @param getUserId - Function to extract userId from the resource
 * @param expectedUserId - The expected userId (from authenticated session)
 */
export async function withOwnershipCheck<T>(
    fn: () => Promise<T | undefined>,
    getUserId: (result: T) => string,
    expectedUserId: string
): Promise<T> {
    const result = await fn();

    if (!result) {
        throw new NotFoundError("Resource not found");
    }

    const resourceUserId = getUserId(result);
    if (resourceUserId !== expectedUserId) {
        throw new NotFoundError("Resource not found");
    }

    return result;
}

/**
 * Wraps a database operation with standardized error handling and retry logic
 * 
 * @param operation - The database operation to execute
 * @param errorMessage - Custom error message if operation fails
 * @param maxRetries - Maximum number of retries for transient errors
 */
export async function withDatabaseErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string = "Database operation failed",
    maxRetries: number = 3
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: unknown) {
            lastError = error;

            // Don't retry non-database errors or specific app errors
            if (error instanceof NotFoundError) {
                throw error;
            }

            // Check if error is transient/retryable (Neon/Postgres)
            const err = error as { message?: string; code?: string };
            const isTransient =
                err.message?.includes('pool') ||
                err.message?.includes('timeout') ||
                err.message?.includes('connection') ||
                err.code === '57P01' || // admin_shutdown
                err.code === '57P02' || // crash_shutdown
                err.code === '57P03';   // cannot_connect_now

            if (!isTransient || attempt === maxRetries) {
                break;
            }

            // Exponential backoff: 100ms, 200ms, 400ms...
            const delay = Math.pow(2, attempt) * 100;
            console.warn(`Transient database error, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`, err.message);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    if (lastError instanceof DatabaseError) {
        throw lastError;
    }
    throw new DatabaseError(errorMessage, lastError);
}


/**
 * Creates a standard ownership condition for Drizzle queries
 * 
 * @param userIdColumn - The userId column from the table
 * @param userId - The authenticated user's ID
 */
export function createOwnershipCondition(userIdColumn: AnyColumn, userId: string): SQL {
    return eq(userIdColumn, userId);
}

/**
 * Creates a standard ownership + ID condition for Drizzle queries
 * 
 * @param idColumn - The id column from the table
 * @param id - The resource ID
 * @param userIdColumn - The userId column from the table
 * @param userId - The authenticated user's ID
 */
export function createOwnershipAndIdCondition(
    idColumn: AnyColumn,
    id: string,
    userIdColumn: AnyColumn,
    userId: string
): SQL {
    return and(
        eq(idColumn, id),
        eq(userIdColumn, userId)
    ) as SQL;
}


