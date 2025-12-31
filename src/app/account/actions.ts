"use server";

import { db } from "@/lib/db";
import { session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserId } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

/**
 * Get all active sessions for the current user
 */
export async function getUserSessions() {
    try {
        const userId = await getUserId();

        const sessions = await db
            .select({
                id: session.id,
                createdAt: session.createdAt,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                expiresAt: session.expiresAt,
            })
            .from(session)
            .where(eq(session.userId, userId))
            .orderBy(session.createdAt);

        return { sessions, error: null };
    } catch (error) {
        console.error("Failed to get user sessions:", error);
        return { sessions: null, error: "Failed to load sessions" };
    }
}

/**
 * Revoke a specific session (except current one)
 */
export async function revokeSession(sessionId: string) {
    try {
        // Verify user is authenticated
        await getUserId();

        // Delete the session
        await db
            .delete(session)
            .where(eq(session.id, sessionId));

        revalidatePath("/account/settings");
        return { success: true, error: null };
    } catch (error) {
        console.error("Failed to revoke session:", error);
        return { success: false, error: "Failed to revoke session" };
    }
}

/**
 * Revoke all sessions for the current user
 */
export async function revokeAllOtherSessions() {
    try {
        const userId = await getUserId();

        // Delete all sessions for the user
        await db
            .delete(session)
            .where(eq(session.userId, userId));

        revalidatePath("/account/settings");
        return { success: true, error: null };
    } catch (error) {
        console.error("Failed to revoke sessions:", error);
        return { success: false, error: "Failed to revoke sessions" };
    }
}
