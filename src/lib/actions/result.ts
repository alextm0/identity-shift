/**
 * ActionResult Type
 * 
 * Provides structured response types for server actions.
 * All actions should return ActionResult<T> for consistent error handling.
 */

/**
 * Result type for server actions
 * 
 * @template T - The type of data returned on success
 */
export type ActionResult<T> =
    | { success: true; data: T; message?: string; redirect?: string }
    | { success: false; error: string; code: string; statusCode?: number };

/**
 * Creates a successful action result
 */
export function success<T>(
    data: T,
    options?: { message?: string; redirect?: string }
): ActionResult<T> {
    return {
        success: true,
        data,
        ...options,
    };
}

/**
 * Creates a failed action result
 */
export function failure(
    error: string,
    code: string,
    statusCode?: number
): ActionResult<never> {
    return {
        success: false,
        error,
        code,
        statusCode,
    };
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(result: ActionResult<T>): result is { success: true; data: T; message?: string; redirect?: string } {
    return result.success === true;
}

/**
 * Type guard to check if result is a failure
 */
export function isFailure<T>(result: ActionResult<T>): result is { success: false; error: string; code: string; statusCode?: number } {
    return result.success === false;
}

