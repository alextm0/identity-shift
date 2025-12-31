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

import { revalidatePath } from "next/cache";
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

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/daily");
        revalidatePath("/dashboard/weekly");

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
        if (!activeSprint) {
            // Plan says "Without Active Sprint ... Allow logging energy, blocker, note only, no promise tracking"
            // But DailyAuditSchema requires mainGoalId, which comes from sprint.
            // If freestyling, mainGoalId might be optional or handled differently?
            // Plan says "Freestyle Day ... No promise tracking, no scoring".
            // The simplified schema has mainGoalId required.
            // Maybe for freestyle day we use a different action or handle mainGoalId as optional?
            // Or allow null mainGoalId? UUID schema forbids null.
            // If no sprint, we should probably throw basic error for now as v1 focuses on sprint.
            throw new BusinessRuleError("No active sprint found. Please start a sprint to log an audit.");
        }

        // Validate that mainGoalId belongs to the active sprint
        const goalExists = activeSprint.goals.some(goal => goal.id === validated.mainGoalId);
        if (!goalExists) {
            throw new BusinessRuleError("Selected goal does not belong to the active sprint.");
        }

        const logId = await saveDailyAudit(
            userId,
            activeSprint.id,
            {
                date: validated.date,
                mainGoalId: validated.mainGoalId,
                energy: validated.energy,
                blockerTag: validated.blockerTag ?? undefined,
                note: validated.note,
                promiseCompletions: validated.promiseCompletions
            }
        );

        revalidateDashboard();
        revalidatePath("/dashboard/daily");
        // Revalidate sprint paths as well since promise logs affect weekly counters
        revalidatePath("/dashboard/sprint");

        return success(
            { id: logId },
            {
                message: "Daily audit saved successfully",
                redirect: "dashboard"
            }
        );
    },
    {
        rateLimit: { key: 'save-daily-audit', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to save daily audit"
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
                mainFocusCompleted: validated.mainFocusCompleted,
                morningGapMin: validated.morningGapMin,
                distractionMin: validated.distractionMin,
                priorities: validated.priorities,
                proofOfWork: validated.proofOfWork,
                win: validated.win,
                drain: validated.drain,
                note: validated.note,
                updatedAt: new Date(),
            })
            .where(and(
                eq(dailyLog.id, validated.logId),
                eq(dailyLog.userId, userId)
            ));

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/daily");
        revalidatePath("/dashboard/weekly");

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

