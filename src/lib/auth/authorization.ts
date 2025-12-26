/**
 * Authorization utilities to ensure users can only access their own data.
 * 
 * These functions provide additional safety checks beyond the middleware
 * to prevent unauthorized access to user-specific resources.
 */

import { getRequiredSession } from "./server";

/**
 * Ensures that the authenticated user matches the requested userId.
 * Throws an error if the user tries to access another user's data.
 * 
 * @param requestedUserId - The userId from the request/route parameter
 * @throws Error if the authenticated user doesn't match the requested userId
 */
export async function ensureUserOwnership(requestedUserId: string): Promise<void> {
    const session = await getRequiredSession();
    const authenticatedUserId = session.user.id;

    if (authenticatedUserId !== requestedUserId) {
        throw new Error("Unauthorized: You can only access your own data");
    }
}

/**
 * Gets the authenticated user's ID and ensures it matches the requested userId.
 * 
 * @param requestedUserId - The userId from the request/route parameter
 * @returns The authenticated user's ID
 * @throws Error if the authenticated user doesn't match the requested userId
 */
export async function getAuthenticatedUserId(requestedUserId?: string): Promise<string> {
    const session = await getRequiredSession();
    const authenticatedUserId = session.user.id;

    // If a specific userId was requested, ensure it matches the authenticated user
    if (requestedUserId && authenticatedUserId !== requestedUserId) {
        throw new Error("Unauthorized: You can only access your own data");
    }

    return authenticatedUserId;
}

/**
 * Validates that a resource belongs to the authenticated user.
 * 
 * @param resourceUserId - The userId associated with the resource
 * @throws Error if the resource doesn't belong to the authenticated user
 */
export async function validateResourceOwnership(resourceUserId: string): Promise<void> {
    const session = await getRequiredSession();
    const authenticatedUserId = session.user.id;

    if (resourceUserId !== authenticatedUserId) {
        throw new Error("Unauthorized: You can only access your own resources");
    }
}

