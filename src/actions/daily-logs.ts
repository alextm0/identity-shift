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
import { upsertDailyLog, getDailyLogById, deleteDailyLog, getTodayLogForUser } from "@/data-access/daily-logs";
import { getActiveSprint } from "@/data-access/sprints";
import { DailyLogFormSchema } from "@/lib/validators";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { NotFoundError } from "@/lib/errors";
import { success } from "@/lib/actions/result";
import { createAction, createActionWithParam, createActionWithoutValidation } from "@/lib/actions/middleware";
import { normalizeDate } from "@/lib/data-access/base";
import { randomUUID } from "crypto";

export const saveDailyLogAction = createAction(
    DailyLogFormSchema,
    async (userId, validated) => {
        const activeSprint = await getActiveSprint(userId);

        // Check if log exists for today to update instead of create
        const today = normalizeDate(new Date(validated.date));
        const existingLog = await getTodayLogForUser(userId, today);

        // Sanitize text inputs
        const sanitizedProofOfWork = validated.proofOfWork.map(pow => ({
            ...pow,
            value: sanitizeText(pow.value, 5000),
            url: pow.url ? sanitizeUrl(pow.url) : undefined,
        }));

        const logId = existingLog?.id || randomUUID();
        await upsertDailyLog({
            id: logId,
            userId,
            sprintId: activeSprint?.id ?? null,
            date: today,
            energy: validated.energy,
            sleepHours: validated.sleepHours ?? null,
            mainFocusCompleted: validated.mainFocusCompleted,
            morningGapMin: validated.morningGapMin ?? null,
            distractionMin: validated.distractionMin ?? null,
            priorities: validated.priorities,
            proofOfWork: sanitizedProofOfWork,
            win: validated.win ? sanitizeText(validated.win, 500) : null,
            drain: validated.drain ? sanitizeText(validated.drain, 500) : null,
            note: validated.note ? sanitizeText(validated.note, 2000) : null,
            createdAt: existingLog?.createdAt || new Date(),
            updatedAt: new Date(),
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/daily");
        
        return success(
            { id: logId },
            { 
                message: "Daily log committed successfully",
                redirect: "dashboard"
            }
        );
    },
    {
        rateLimit: { key: 'daily-log', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to commit daily log. Please try again."
    }
);

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

export const updateDailyLogByIdAction = createActionWithParam(
    DailyLogFormSchema,
    async (userId, logId: string, validated) => {
        // Verify ownership
        const existingLog = await getDailyLogById(logId, userId);
        if (!existingLog) {
            throw new NotFoundError("Daily log not found");
        }

        // Sanitize text inputs
        const sanitizedProofOfWork = validated.proofOfWork.map(pow => ({
            ...pow,
            value: sanitizeText(pow.value, 5000),
            url: pow.url ? sanitizeUrl(pow.url) : undefined,
        }));

        await upsertDailyLog({
            id: logId,
            userId,
            sprintId: existingLog.sprintId,
            date: normalizeDate(new Date(validated.date)),
            energy: validated.energy,
            sleepHours: validated.sleepHours ?? null,
            mainFocusCompleted: validated.mainFocusCompleted,
            morningGapMin: validated.morningGapMin ?? null,
            distractionMin: validated.distractionMin ?? null,
            priorities: validated.priorities,
            proofOfWork: sanitizedProofOfWork,
            win: validated.win ? sanitizeText(validated.win, 500) : null,
            drain: validated.drain ? sanitizeText(validated.drain, 500) : null,
            note: validated.note ? sanitizeText(validated.note, 2000) : null,
            createdAt: existingLog.createdAt,
            updatedAt: new Date(),
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/daily");
        revalidatePath("/dashboard/weekly");
        
        return success(
            { id: logId },
            { 
                message: "Daily log updated successfully",
                redirect: "dashboard"
            }
        );
    },
    {
        rateLimit: { key: 'update-log', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to update daily log. Please try again."
    }
);

