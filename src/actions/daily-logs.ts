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
import { getRequiredSession } from "@/lib/auth/server";
import { upsertDailyLog, getDailyLogById, deleteDailyLog, getTodayLogBySprintId } from "@/data-access/daily-logs";
import { getActiveSprint } from "@/data-access/sprints";
import { DailyLogFormSchema } from "@/lib/validators";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

export async function saveDailyLogAction(formData: unknown) {
    try {
        // Verify session - throws if not authenticated
        const session = await getRequiredSession();
        
        // Rate limit: 20 requests per minute per user
        enforceRateLimit(`daily-log:${session.user.id}`, 20, 60000);
        
        const validated = DailyLogFormSchema.parse(formData);

        const activeSprint = await getActiveSprint(session.user.id);
        if (!activeSprint) {
            throw new Error("No active sprint found. Start a sprint first.");
        }

        // Check if log exists for today to update instead of create
        const today = new Date(validated.date);
        today.setHours(0, 0, 0, 0);
        const existingLog = await getTodayLogBySprintId(activeSprint.id, today);

        // Sanitize text inputs
        const sanitizedProofOfWork = validated.proofOfWork.map(pow => ({
            ...pow,
            value: sanitizeText(pow.value, 5000),
            url: pow.url ? sanitizeUrl(pow.url) : undefined,
        }));

        await upsertDailyLog({
            id: existingLog?.id || randomUUID(),
            userId: session.user.id,
            sprintId: activeSprint.id,
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
        
        return { success: true, message: "Daily log committed successfully" };
    } catch (error) {
        console.error("Error in saveDailyLogAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to commit daily log. Please try again.");
    }
}

export async function deleteDailyLogAction(logId: string) {
    const session = await getRequiredSession();
    
    // Rate limit: 10 deletions per minute per user
    enforceRateLimit(`delete-log:${session.user.id}`, 10, 60000);
    
    // Verify ownership
    const log = await getDailyLogById(logId, session.user.id);
    if (!log) {
        throw new Error("Daily log not found");
    }

    await deleteDailyLog(logId, session.user.id);

    revalidatePath("/dashboard");
    revalidatePath("/daily");
    revalidatePath("/dashboard/weekly");
}

export async function updateDailyLogByIdAction(logId: string, formData: unknown) {
    try {
        const session = await getRequiredSession();
        
        // Rate limit: 20 updates per minute per user
        enforceRateLimit(`update-log:${session.user.id}`, 20, 60000);
        
        const validated = DailyLogFormSchema.parse(formData);

        // Verify ownership
        const existingLog = await getDailyLogById(logId, session.user.id);
        if (!existingLog) {
            throw new Error("Daily log not found");
        }

        // Sanitize text inputs
        const sanitizedProofOfWork = validated.proofOfWork.map(pow => ({
            ...pow,
            value: sanitizeText(pow.value, 5000),
            url: pow.url ? sanitizeUrl(pow.url) : undefined,
        }));

        await upsertDailyLog({
            id: logId,
            userId: session.user.id,
            sprintId: existingLog.sprintId,
            date: new Date(validated.date),
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
        
        return { success: true, message: "Daily log updated successfully" };
    } catch (error) {
        console.error("Error in updateDailyLogByIdAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to update daily log. Please try again.");
    }
}

