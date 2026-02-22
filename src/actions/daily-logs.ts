'use server';

/**
 * Server Actions for Daily Logs
 * 
 * Following Next.js authentication patterns:
 * https://nextjs.org/docs/app/guides/authentication
 * 
 * Security:
 * - Verifies user session before proceeding
 * - Ensures user can only save logs to their own active sprint
 * - All data is filtered by authenticated userId
 */

import { revalidateTag } from "next/cache";
import { revalidateDashboard } from "@/lib/revalidate";
import { getDailyLogById, deleteDailyLog, saveDailyAudit } from "@/data-access/daily-logs";
import { logPromiseCompletion } from "@/data-access/promises";
import { getActiveSprint } from "@/data-access/sprints";
import { DailyAuditSchema, QuickPromiseLogSchema, UpdateDailyLogSchema } from "@/lib/validators";
import { NotFoundError, BusinessRuleError } from "@/lib/errors";
import { success } from "@/lib/actions/result";
import { createAction, createActionWithoutValidation } from "@/lib/actions/middleware";
import { db } from "@/lib/db";
import { dailyLog } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";


export const deleteDailyLogAction = createActionWithoutValidation(
    async (userId, logId: string) => {
        // Verify ownership
        const log = await getDailyLogById(logId, userId);
        if (!log) {
            throw new NotFoundError("Daily log not found");
        }

        await deleteDailyLog(logId, userId);

        revalidateTag("daily-logs", "max");
        revalidateTag("dashboard", "max");

        return success(
            { deleted: true },
            { message: "Daily log deleted successfully" }
        );
    },
    {
        rateLimit: { key: 'delete-log', limit: 10, windowMs: 60000 },
        errorMessage: "Failed to delete daily log. Please try again."
    }
);


export const saveDailyAuditAction = createAction(
    DailyAuditSchema,
    async (userId, validated) => {
        const activeSprint = await getActiveSprint(userId);

        let sprintId: string | null = null;

        if (activeSprint) {
            sprintId = activeSprint.id;

            // If a mainGoalId is provided, validate it belongs to the active sprint
            if (validated.mainGoalId) {
                const goalExists = activeSprint.goals.some(goal => goal.id === validated.mainGoalId);
                if (!goalExists) {
                    throw new BusinessRuleError("Selected goal does not belong to the active sprint.");
                }
            }
        }

        const logId = await saveDailyAudit(
            userId,
            sprintId,
            {
                date: validated.date,
                mainGoalId: validated.mainGoalId,
                energy: validated.energy,
                sleepHours: validated.sleepHours,
                exerciseMinutes: validated.exerciseMinutes,
                blockerTag: validated.blockerTag ?? undefined,
                win: validated.win,
                drain: validated.drain,
                note: validated.note,
                promiseCompletions: validated.promiseCompletions,
            }
        );

        revalidateDashboard();
        revalidateTag("daily-logs", "max");
        revalidateTag("active-sprint", "max");

        return success(
            { id: logId },
            {
                message: "Daily log saved successfully",
                redirect: "dashboard"
            }
        );
    },
    {
        rateLimit: { key: 'save-daily-audit', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to save daily log"
    }
);

export const logPromiseCompletionAction = createAction(
    QuickPromiseLogSchema,
    async (userId, validated) => {
        // Find if there is an active sprint - not strictly required for logging if we just use promiseId,
        // but promise belongs to a sprint.
        // logPromiseCompletion handles logic.

        await logPromiseCompletion(
            validated.promiseId,
            validated.date,
            validated.completed,
            userId,
            undefined // dailyLogId - simplified log doesn't attach to full audit initially
        );

        // Revalidate to show updated counters
        revalidateDashboard();

        return success(
            { logged: true },
            { message: validated.completed ? "Promise completed" : "Promise unchecked" }
        );
    },
    {
        rateLimit: { key: 'log-promise', limit: 60, windowMs: 60000 },
        errorMessage: "Failed to log promise"
    }
);

export const updateDailyLogByIdAction = createAction(
    UpdateDailyLogSchema,
    async (userId, validated) => {
        // Verify ownership
        const log = await getDailyLogById(validated.logId, userId);
        if (!log) {
            throw new NotFoundError("Daily log not found");
        }

        // Update the daily log with validated fields
        await db.update(dailyLog)
            .set({
                energy: validated.energy,
                sleepHours: validated.sleepHours,
                exerciseMinutes: validated.exerciseMinutes,
                win: validated.win,
                drain: validated.drain,
                note: validated.note,
                updatedAt: new Date(),
            })
            .where(and(
                eq(dailyLog.id, validated.logId),
                eq(dailyLog.userId, userId)
            ));

        revalidateTag("daily-logs", "max");
        revalidateTag("dashboard", "max");

        return success(
            { updated: true },
            { message: "Daily log updated successfully" }
        );
    },
    {
        rateLimit: { key: 'update-log', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to update daily log. Please try again."
    }
);

