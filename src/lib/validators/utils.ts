/**
 * Validation Utilities
 * 
 * Provides helper functions for validating and parsing data with Zod schemas
 * and formatting validation errors in a user-friendly way.
 */

import { z, ZodError, ZodSchema } from "zod";
import { ValidationError } from "@/lib/errors";

/**
 * Validates and parses data against a Zod schema
 * Throws ValidationError if validation fails
 */
export function validateAndParse<T>(
    schema: ZodSchema<T>,
    data: unknown
): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError(
                formatZodError(error),
                error.issues
            );
        }
        throw error;
    }
}

/**
 * Safely parses data against a Zod schema
 * Returns a result object instead of throwing
 */
export function safeParseWithErrors<T>(
    schema: ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string; issues: z.ZodIssue[] } {
    const result = schema.safeParse(data);
    
    if (result.success) {
        return { success: true, data: result.data };
    }
    
    return {
        success: false,
        error: formatZodError(result.error),
        issues: result.error.issues,
    };
}

/**
 * Formats Zod validation errors into a user-friendly message
 */
export function formatZodError(error: ZodError): string {
    if (error.issues.length === 0) {
        return "Validation failed";
    }
    
    if (error.issues.length === 1) {
        const issue = error.issues[0];
        const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        return `${path}${issue.message}`;
    }
    
    // Multiple errors - format as a list
    const messages = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        return `${path}${issue.message}`;
    });
    
    return `Validation failed:\n${messages.join("\n")}`;
}

/**
 * Extracts the first validation error message
 */
export function getFirstError(error: ZodError): string {
    if (error.issues.length === 0) {
        return "Validation failed";
    }
    return error.issues[0].message;
}

/**
 * Checks if an error is a Zod validation error
 */
export function isZodError(error: unknown): error is ZodError {
    return error instanceof ZodError;
}

