/**
 * Server Action Middleware Factories
 * 
 * Provides reusable middleware functions to reduce duplication in server actions:
 * - withAuth: Handles authentication and optional rate limiting
 * - withValidation: Handles input validation
 * - withErrorHandling: Handles error catching and structured responses
 */

import { ZodSchema } from "zod";
import { headers } from "next/headers";
import { getRequiredSession } from "@/lib/auth/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { validateAndParse } from "@/lib/validators/utils";
import { AppError, getErrorMessage, getErrorCode } from "@/lib/errors";
import { ActionResult } from "./result";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
    key: string;
    limit: number;
    windowMs: number;
}

/**
 * Options for withAuth middleware
 */
export interface AuthOptions {
    rateLimit?: RateLimitConfig;
}

/**
 * Options for createAction factory
 */
export interface CreateActionOptions extends AuthOptions {
    errorMessage?: string;
}

/**
 * Wraps a server action with authentication and optional rate limiting
 * 
 * @param action - The action function that receives userId as first parameter
 * @param options - Optional configuration including rate limiting
 * @returns Wrapped action that handles authentication
 * 
 * @example
 * ```typescript
 * export const myAction = withAuth(async (userId, data) => {
 *   // userId is automatically injected
 *   return await doSomething(userId, data);
 * }, {
 *   rateLimit: { key: 'my-action', limit: 10, windowMs: 60000 }
 * });
 * ```
 */
export function withAuth<TArgs extends unknown[], TReturn>(
    action: (userId: string, ...args: TArgs) => Promise<TReturn>,
    options?: AuthOptions
) {
    return async (...args: TArgs): Promise<TReturn> => {
        // CSRF Protection: Validate Origin header used in Server Actions
        const headerList = await headers();
        const origin = headerList.get("origin");
        const host = headerList.get("host");

        // If Origin is present (browsers send this for POST), it MUST match Host
        if (origin && host) {
            // Strip protocol (http:// or https://) for comparison
            const originHost = origin.replace(/^https?:\/\//, "");

            if (originHost !== host) {
                console.error(`[Security] CSRF Blocked: Origin ${origin} does not match Host ${host}`);
                throw new AppError("Cross-Site Request Forgery attempt detected", "CSRF_ERROR");
            }
        }
        // Verify session - throws if not authenticated
        const session = await getRequiredSession();
        const userId = session.user.id;

        // Apply rate limiting if configured
        if (options?.rateLimit) {
            const { key, limit, windowMs } = options.rateLimit;
            const rateLimitKey = `${key}:${userId}`;
            await enforceRateLimit(rateLimitKey, limit, windowMs);
        }

        // Execute action with userId injected
        return await action(userId, ...args);
    };
}

/**
 * Wraps a server action with input validation
 * 
 * @param schema - Zod schema to validate against
 * @param action - The action function that receives validated data
 * @returns Wrapped action that validates input before execution
 * 
 * @example
 * ```typescript
 * export const myAction = withValidation(MySchema, async (validatedData) => {
 *   // validatedData is guaranteed to match schema
 *   return await processData(validatedData);
 * });
 * ```
 */
export function withValidation<TInput, TOutput>(
    schema: ZodSchema<TInput>,
    action: (data: TInput) => Promise<TOutput>
) {
    return async (data: unknown): Promise<TOutput> => {
        // Validate and parse input
        const validated = validateAndParse(schema, data);

        // Execute action with validated data
        return await action(validated);
    };
}

/**
 * Wraps a server action with error handling and structured responses
 * 
 * @param action - The action function to wrap
 * @param defaultErrorMessage - Default error message if action fails
 * @returns Wrapped action that handles errors
 * 
 * @example
 * ```typescript
 * export const myAction = withErrorHandling(async () => {
 *   const result = await doSomething();
 *   return success(result, { message: "Success!" });
 * }, "Failed to perform action");
 * ```
 */
export function withErrorHandling<TArgs extends unknown[], TReturn>(
    action: (...args: TArgs) => Promise<TReturn>,
    defaultErrorMessage: string = "An error occurred"
): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
        try {
            return await action(...args);
        } catch (error) {
            // Re-throw AppError instances as-is (they're already structured)
            if (error instanceof AppError) {
                throw error;
            }

            // Wrap unknown errors
            const message = getErrorMessage(error) || defaultErrorMessage;
            const code = getErrorCode(error) || "UNKNOWN_ERROR";

            throw new AppError(message, code);
        }
    };
}

/**
 * Combines multiple middleware functions
 * 
 * @param action - The action function
 * @param middlewares - Array of middleware functions to apply
 * @returns Wrapped action with all middlewares applied
 * 
 * @example
 * ```typescript
 * export const myAction = compose(
 *   async (userId, validatedData) => {
 *     return success(await doSomething(userId, validatedData));
 *   },
 *   [
 *     (fn) => withAuth(fn, { rateLimit: { key: 'action', limit: 10, windowMs: 60000 } }),
 *     (fn) => withValidation(MySchema, fn),
 *     (fn) => withErrorHandling(fn, "Failed")
 *   ]
 * );
 * ```
 */
export function compose<TArgs extends unknown[], TReturn>(
    action: (...args: TArgs) => Promise<TReturn>,
    middlewares: Array<(fn: (...args: TArgs) => Promise<TReturn>) => (...args: TArgs) => Promise<TReturn>>
): (...args: TArgs) => Promise<TReturn> {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), action);
}

/**
 * Creates a complete action wrapper with auth, validation, and error handling
 * 
 * @param schema - Zod schema for validation
 * @param action - The action function (userId, validatedData) => Promise<ActionResult<T>>
 * @param options - Optional configuration including custom error message
 * @returns Fully wrapped action
 * 
 * @example
 * ```typescript
 * export const saveDataAction = createAction(
 *   MySchema,
 *   async (userId, validatedData) => {
 *     const result = await saveData(userId, validatedData);
 *     return success(result, { message: "Saved!" });
 *   },
 *   {
 *     rateLimit: { key: 'save-data', limit: 20, windowMs: 60000 },
 *     errorMessage: "Failed to save data. Please try again."
 *   }
 * );
 * ```
 */
export function createAction<TInput, TOutput>(
    schema: ZodSchema<TInput>,
    action: (userId: string, data: TInput) => Promise<ActionResult<TOutput>>,
    options?: CreateActionOptions
) {
    return withErrorHandling(
        withValidation(
            schema,
            withAuth(
                action,
                options
            )
        ),
        options?.errorMessage || "Action failed"
    );
}

/**
 * Creates an action wrapper with auth and error handling (no validation)
 * Useful for actions that don't require input validation (e.g., delete, get)
 * 
 * @param action - The action function (userId, ...args) => Promise<ActionResult<T>>
 * @param options - Optional configuration including custom error message
 * @returns Fully wrapped action
 * 
 * @example
 * ```typescript
 * export const deleteItemAction = createActionWithoutValidation(
 *   async (userId, itemId: string) => {
 *     await deleteItem(itemId, userId);
 *     return success({ deleted: true });
 *   },
 *   {
 *     rateLimit: { key: 'delete-item', limit: 10, windowMs: 60000 },
 *     errorMessage: "Failed to delete item. Please try again."
 *   }
 * );
 * ```
 */
export function createActionWithoutValidation<TOutput, TArgs extends unknown[] = unknown[]>(
    action: (userId: string, ...args: TArgs) => Promise<ActionResult<TOutput>>,
    options?: CreateActionOptions
) {
    return withErrorHandling(
        withAuth(
            action,
            options
        ),
        options?.errorMessage || "Action failed"
    );
}

/**
 * Creates an action factory for actions that take additional parameters before formData
 * 
 * @param schema - Zod schema for validation
 * @param action - The action function (userId, param, validatedData) => Promise<ActionResult<T>>
 * @param options - Optional configuration
 * @returns Curried server action: (param) => (data) => Promise<ActionResult<T>>
 *          Can also be called directly: (param, data) => Promise<ActionResult<T>>
 */
export function createActionWithParam<TParam, TInput, TOutput>(
    schema: ZodSchema<TInput>,
    action: (userId: string, param: TParam, data: TInput) => Promise<ActionResult<TOutput>>,
    options?: CreateActionOptions
) {
    function curriedAction(param: TParam): (data: TInput) => Promise<ActionResult<TOutput>>;
    function curriedAction(param: TParam, data: TInput): Promise<ActionResult<TOutput>>;
    function curriedAction(param: TParam, data?: TInput): ((data: TInput) => Promise<ActionResult<TOutput>>) | Promise<ActionResult<TOutput>> {
        const execute = async (formData: TInput): Promise<ActionResult<TOutput>> => {
            return withErrorHandling(
                withValidation(
                    schema,
                    withAuth(
                        async (userId, validatedData) => action(userId, param, validatedData),
                        options
                    )
                ),
                options?.errorMessage || "Action failed"
            )(formData);
        };

        // If data is provided, execute immediately (direct call)
        if (data !== undefined) {
            return execute(data);
        }

        // Otherwise, return the curried function
        return execute;
    }

    return curriedAction;
}

