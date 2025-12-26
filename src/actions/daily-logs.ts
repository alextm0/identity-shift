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
import { upsertDailyLog, getDailyLogById, deleteDailyLog, getTodayLogBySprintId } from "@/data-access/daily-logs";
import { getActiveSprint } from "@/data-access/sprints";
import { DailyLogFormSchema } from "@/lib/validators";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { NotFoundError, BusinessRuleError } from "@/lib/errors";
import { ActionResult, success } from "@/lib/actions/result";
import { withAuth, withValidation, withErrorHandling } from "@/lib/actions/middleware";
import { normalizeDate } from "@/lib/data-access/base";
import { randomUUID } from "crypto";

export async function saveDailyLogAction(formData: unknown): Promise<ActionResult<{ id: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            DailyLogFormSchema,
            withAuth(
                async (userId, validated) => {
                    const activeSprint = await getActiveSprint(userId);
                    if (!activeSprint) {
                        throw new BusinessRuleError("No active sprint found. Start a sprint first.");
                    }

                    // Check if log exists for today to update instead of create
                    const today = normalizeDate(new Date(validated.date));
                    const existingLog = await getTodayLogBySprintId(activeSprint.id, today);

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
                    
                    return success(
                        { id: logId },
                        { 
                            message: "Daily log committed successfully",
                            redirect: "dashboard"
                        }
                    );
                },
                {
                    rateLimit: { key: 'daily-log', limit: 20, windowMs: 60000 }
                }
            )
        ),
        "Failed to commit daily log. Please try again."
    );
    
    return await wrappedAction(formData);
}

export async function deleteDailyLogAction(logId: string): Promise<ActionResult<{ deleted: boolean }>> {
    const wrappedAction = withErrorHandling(
        withAuth(
            async (userId) => {
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
                rateLimit: { key: 'delete-log', limit: 10, windowMs: 60000 }
            }
        ),
        "Failed to delete daily log. Please try again."
    );
    
    return await wrappedAction();
}

export async function updateDailyLogByIdAction(logId: string, formData: unknown): Promise<ActionResult<{ id: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            DailyLogFormSchema,
            withAuth(
                async (userId, validated) => {
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
                    rateLimit: { key: 'update-log', limit: 20, windowMs: 60000 }
                }
            )
        ),
        "Failed to update daily log. Please try again."
    );
    
    return await wrappedAction(formData);
}

