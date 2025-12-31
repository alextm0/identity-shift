import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
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
    try {
        // Check if user already exists
        const existingUser = await db.select()
            .from(user)
            .where(eq(user.id, authUser.id))
            .limit(1);

        if (existingUser.length > 0) {
            // User exists, no action needed
            return;
        }

        // User doesn't exist, create them
        // Validate email before attempting creation
        if (!authUser.email || authUser.email.trim() === '') {
            throw new Error(`Cannot create user ${authUser.id}: email is required but was missing or empty`);
        }

        // Wrap in try-catch to handle race conditions where another request might create the user simultaneously
        try {
            await db.insert(user)
                .values({
                    id: authUser.id,
                    name: authUser.name || authUser.email || 'User',
                    email: authUser.email,
                    emailVerified: authUser.emailVerified ?? false,
                    image: authUser.image || null,
                });
        } catch (insertError: unknown) {
            const error = insertError as { code?: string };
            // Check if this is a legitimate race condition (user created by concurrent request)
            // vs. a constraint violation from invalid data (empty string, etc.)
            if (error.code === '23505') {
                // Unique constraint violation - could be race condition or invalid data
                // Verify the user actually exists now (legitimate race condition)
                const verifyUser = await db.select()
                    .from(user)
                    .where(eq(user.id, authUser.id))
                    .limit(1);

                if (verifyUser.length > 0) {
                    // User exists now - this was a legitimate race condition
                    return;
                }

                // User doesn't exist - this is likely an invalid data constraint violation
                // Log and propagate the error so it can be retried or handled appropriately
                console.error(`Failed to create user ${authUser.id} due to unique constraint violation:`, {
                    error: insertError,
                    email: authUser.email,
                    message: 'This may indicate duplicate email or empty string insertion attempt'
                });
                throw insertError;
            }

            if (error.code === '23503') {
                // Foreign key violation - user likely exists now (race condition)
                return;
            }

            // Re-throw other errors
            throw insertError;
        }
    } catch (error) {
        // Log error but don't throw - we don't want to break authentication flow
        // The foreign key constraint will catch this on the actual operation
        console.error("Failed to ensure user exists:", error);
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
        console.error("Failed to fetch session:", error);
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
