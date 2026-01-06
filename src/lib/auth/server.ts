import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Ensures the user exists in the application database.
 * 
 * This function synchronizes the user from Neon Auth to the application's user table.
 * It handles cases where the user is authenticated but doesn't exist in the database yet,
 * which can happen after database migrations or resets.
 * 
 * @param authUser The user object from Neon Auth
 */
async function ensureUserExists(authUser: { id: string; name?: string | null; email?: string | null; emailVerified?: boolean; image?: string | null }) {
    // Validate email before attempting creation
    if (!authUser.email || authUser.email.trim() === '') {
        throw new Error(`Cannot create user ${authUser.id}: email is required but was missing or empty`);
    }

    try {
        // Use atomic insert-if-not-exists to handle race conditions
        await db.insert(users)
            .values({
                id: authUser.id,
                name: authUser.name || authUser.email || 'User',
                email: authUser.email,
                image: authUser.image || null,
            })
            .onConflictDoNothing({ target: users.id });
    } catch (error) {
        // Log error safely without exposing sensitive data
        console.error("Failed to ensure user exists:", error instanceof Error ? error.message : "Unknown error");
        // Re-throw the error so that getSession knows the synchronization failed
        throw error;
    }
}

/**
 * Server-only utility to get the current user session.
 * 
 * Following Next.js authentication patterns:
 * https://nextjs.org/docs/app/guides/authentication
 * 
 * Uses neonAuth() helper which is specifically designed for server-side usage
 * and properly handles URL construction and cookie reading.
 * 
 * This function also ensures the user exists in the application database,
 * synchronizing Neon Auth users to prevent foreign key constraint violations.
 * 
 * @returns Session data with user if authenticated, null otherwise
 */
export async function getSession() {
    try {
        const { session, user: authUser } = await neonAuth();
        if (!session || !authUser) {
            return null;
        }

        // Ensure user exists in the application database
        // This prevents foreign key constraint violations when creating sprints, etc.
        await ensureUserExists(authUser);

        // Return session object with user included for compatibility with existing code
        return {
            ...session,
            user: authUser
        };
    } catch (error) {
        console.error("Failed to fetch session:", error instanceof Error ? error.message : "Unknown error");
        return null;
    }
}

/**
 * Verifies the user's session and returns session data.
 * 
 * Following Next.js authentication patterns:
 * https://nextjs.org/docs/app/guides/authentication
 * 
 * This function should be used in Server Components to verify authentication.
 * If no session exists, it redirects to the sign-in page.
 * 
 * @returns Session data if authenticated
 * @throws Redirects to /auth/sign-in if not authenticated
 */
export async function verifySession() {
    const session = await getSession();

    if (!session) {
        redirect('/auth/sign-in');
    }

    return session;
}

/**
 * Gets the current session or throws an error if not authenticated.
 * 
 * This function should be used in Server Actions where you want to return
 * an error response instead of redirecting.
 * 
 * Following Next.js authentication patterns:
 * https://nextjs.org/docs/app/guides/authentication
 * 
 * @throws {Error} "Unauthorized" if no session is found
 */
export async function getRequiredSession() {
    const session = await getSession();
    if (!session) {
        // Throw a clear error that can be caught by error boundaries
        const error = new Error("Unauthorized: Please sign in to access this page");
        error.name = "UnauthorizedError";
        throw error;
    }
    return session;
}

/**
 * Gets the authenticated user's ID.
 * 
 * @returns The user ID from the session
 * @throws {Error} "Unauthorized" if no session is found
 */
export async function getUserId() {
    const session = await getRequiredSession();
    return session.user.id;
}
