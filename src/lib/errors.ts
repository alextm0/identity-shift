/**
 * Custom Error Classes
 * 
 * Provides structured error handling with specific error types
 * for better error classification and handling throughout the application.
 */

/**
 * Base class for all application errors
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error
 * Thrown when input validation fails (e.g., Zod schema validation)
 */
export class ValidationError extends AppError {
    constructor(message: string, public readonly issues?: unknown[]) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

/**
 * Authorization Error
 * Thrown when a user is not authorized to perform an action
 */
export class AuthorizationError extends AppError {
    constructor(message: string = "You are not authorized to perform this action") {
        super(message, 'AUTHORIZATION_ERROR', 403);
    }
}

/**
 * Not Found Error
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 'NOT_FOUND_ERROR', 404);
    }
}

/**
 * Database Error
 * Thrown when a database operation fails
 */
export class DatabaseError extends AppError {
    constructor(message: string, public readonly originalError?: unknown) {
        super(message, 'DATABASE_ERROR', 500);
    }
}

/**
 * Business Rule Error
 * Thrown when a business rule or constraint is violated
 */
export class BusinessRuleError extends AppError {
    constructor(message: string) {
        super(message, 'BUSINESS_RULE_ERROR', 400);
    }
}

/**
 * Rate Limit Error
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends AppError {
    constructor(message: string = "Rate limit exceeded") {
        super(message, 'RATE_LIMIT_ERROR', 429);
    }
}

/**
 * Helper function to check if an error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Helper function to extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
}

/**
 * Helper function to extract error code from unknown error
 */
export function getErrorCode(error: unknown): string | undefined {
    if (error instanceof AppError) {
        return error.code;
    }
    return undefined;
}

