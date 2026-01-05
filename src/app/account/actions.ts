'use server';

import { db } from "@/lib/db";
import { session } from "@/lib/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createActionWithoutValidation } from "@/lib/actions/middleware";
import { success } from "@/lib/actions/result";
import { BusinessRuleError } from "@/lib/errors";

/**
 * Get all active sessions for the current user
 */
export const getUserSessionsAction = createActionWithoutValidation(
    async (userId) => {
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

        return success({ sessions });
    },
    {
        errorMessage: "Failed to fetch user sessions"
    }
);

/**
 * Revoke a specific session
 */
export const revokeSessionAction = createActionWithoutValidation<void, [string]>(
    async (userId, sessionId) => {
        // Ensure user owns the session
        const existingSession = await db.query.session.findFirst({
            where: and(
                eq(session.id, sessionId),
                eq(session.userId, userId)
            )
        });

        if (!existingSession) {
            throw new BusinessRuleError("Session not found or not owned by user");
        }

        // Delete the session
        await db
            .delete(session)
            .where(eq(session.id, sessionId));

        revalidatePath("/account/settings");
        return success(undefined, { message: "Session revoked successfully" });
    },
    {
        errorMessage: "Failed to revoke session"
    }
);

/**
 * Revoke all active sessions (except the current one logic might need current session ID context, 
 * but `revokeAllOtherSessions` usually implies that. 
 * Better Auth usually handles current session via cookie. 
 * Here the original logic just deleted ALL sessions for userId, effectively logging them out everywhere including current device if the current session is DB backed? 
 * Actually better-auth probably uses the DB session, so deleting ALL logs them out completely. 
 * The naming `revokeAllOtherSessions` suggests keeping one, but the original implementation was `delete(session).where(eq(session.userId, userId))`.
 * I will stick to the original logic which wiped all sessions for the user.)
 * 
 * Wait, the original code in `revokeSession` claimed "except current one" in comment but code didn't check.
 * The original `revokeAllOtherSessions` name implies "Other", but implementation deleted ALL. 
 * 
 * I will implement strict "Revoke All" as per original code behavior, but call it `revokeAllSessionsAction`.
 */
export const revokeAllSessionsAction = createActionWithoutValidation(
    async (userId) => {
        // Delete all sessions for the user
        await db
            .delete(session)
            .where(eq(session.userId, userId));

        revalidatePath("/account/settings");
        return success(undefined, { message: "All sessions revoked successfully" });
    },
    {
        errorMessage: "Failed to revoke all sessions"
    }
);
