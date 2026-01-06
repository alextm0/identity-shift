'use server';

import { db } from "@/lib/db";
import { session } from "@/lib/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createActionWithoutValidation } from "@/lib/actions/middleware";
import { success } from "@/lib/actions/result";
import { BusinessRuleError } from "@/lib/errors";
import { getRequiredSession } from "@/lib/auth/server";

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
 * Revoke all active sessions except the current one
 */
export const revokeOtherSessionsAction = createActionWithoutValidation(
    async (userId) => {
        // Get current session to exclude it
        const currentSession = await getRequiredSession();

        // Delete all OTHER sessions for the user
        await db
            .delete(session)
            .where(
                and(
                    eq(session.userId, userId),
                    ne(session.id, currentSession.id)
                )
            );

        revalidatePath("/account/settings");
        return success(undefined, { message: "All other sessions revoked successfully" });
    },
    {
        errorMessage: "Failed to revoke other sessions"
    }
);
