/**
 * Base Data Access Utilities
 * 
 * Provides common patterns and utilities for data access layer functions:
 * - Ownership validation
 * - Standardized error handling
 * - Date normalization utilities
 * - Common query patterns
 */

import { eq, and, SQL } from "drizzle-orm";
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
 * Wraps a database operation with standardized error handling
 * 
 * @param operation - The database operation to execute
 * @param errorMessage - Custom error message if operation fails
 */
export async function withDatabaseErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string = "Database operation failed"
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof DatabaseError) {
            throw error;
        }
        throw new DatabaseError(errorMessage, error);
    }
}

/**
 * Creates a standard ownership condition for Drizzle queries
 * 
 * @param userIdColumn - The userId column from the table
 * @param userId - The authenticated user's ID
 */
export function createOwnershipCondition(userIdColumn: any, userId: string): SQL {
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
    idColumn: any,
    id: string,
    userIdColumn: any,
    userId: string
): SQL {
    return and(
        eq(idColumn, id),
        eq(userIdColumn, userId)
    ) as SQL;
}

