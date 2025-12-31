/**
 * Server action wrapper utilities for safe, authorized actions.
 * 
 * These wrappers ensure that:
 * 1. User is authenticated
 * 2. User can only modify their own data
 * 3. All mutations include userId validation
 */

import { getRequiredSession } from "./server";
import { ensureUserOwnership, validateResourceOwnership } from "./authorization";

/**
 * Wraps a server action to ensure the authenticated user matches the requested userId.
 * 
 * Use this when an action receives a userId parameter and you need to ensure
 * the user can only perform actions on their own data.
 * 
 * @example
 * ```typescript
 * export const updateSprintAction = withUserOwnership(async (userId, sprintId, data) => {
 *   return await updateSprint(sprintId, userId, data);
 * });
 * ```
 */
export function withUserOwnership<T extends unknown[]>(
    action: (userId: string, ...args: T) => Promise<unknown>
) {
    return async (requestedUserId: string, ...args: T) => {
        // Ensure user is authenticated
        const session = await getRequiredSession();
        const authenticatedUserId = session.user.id;

        // Ensure the requested userId matches the authenticated user
        await ensureUserOwnership(requestedUserId);

        // Execute the action with the authenticated userId
        return await action(authenticatedUserId, ...args);
    };
}

/**
 * Wraps a server action to automatically inject the authenticated userId.
 * 
 * Use this when an action doesn't receive userId as a parameter but needs it.
 * 
 * @example
 * ```typescript
 * export const getMySprintsAction = withAuthenticatedUser(async (userId) => {
 *   return await getSprints(userId);
 * });
 * ```
 */
export function withAuthenticatedUser<T extends unknown[]>(
    action: (userId: string, ...args: T) => Promise<unknown>
) {
    return async (...args: T) => {
        // Ensure user is authenticated and get their ID
        const session = await getRequiredSession();
        const userId = session.user.id;

        // Execute the action with the authenticated userId
        return await action(userId, ...args);
    };
}

/**
 * Validates that a resource belongs to the authenticated user before executing an action.
 * 
 * Use this when you need to check resource ownership before performing an action.
 * 
 * @example
 * ```typescript
 * export const deleteSprintAction = withResourceOwnership(
 *   async (sprintId) => {
 *     const sprint = await getSprintById(sprintId);
 *     if (!sprint) throw new Error("Sprint not found");
 *     await validateResourceOwnership(sprint.userId);
 *     return await deleteSprint(sprintId);
 *   }
 * );
 * ```
 */
export function withResourceOwnership<T extends unknown[]>(
    action: (...args: T) => Promise<unknown>,
    getResourceUserId: (...args: T) => Promise<string>
) {
    return async (...args: T) => {
        // Ensure user is authenticated
        await getRequiredSession();

        // Get the resource's userId
        const resourceUserId = await getResourceUserId(...args);

        // Validate ownership
        await validateResourceOwnership(resourceUserId);

        // Execute the action
        return await action(...args);
    };
}

