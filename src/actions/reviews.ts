'use server';

/**
 * Server Actions for Reviews
 * 
 * Following Next.js authentication patterns:
 * https://nextjs.org/docs/app/guides/authentication
 * 
 * Security:
 * - Verifies user session before proceeding
 * - Ensures user can only create/manage their own reviews
 * - All data is filtered by authenticated userId
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/server";
import { createWeeklyReview, createMonthlyReview, getWeeklyReviewById, getMonthlyReviewById, updateWeeklyReview, updateMonthlyReview } from "@/data-access/reviews";
import { getSprintById } from "@/data-access/sprints";
import { sanitizeText } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

// Weekly Review Form Schema
const WeeklyReviewFormSchema = z.object({
    sprintId: z.string().uuid(),
    weekEndDate: z.date(),
    progressRatios: z.record(z.string(), z.number().min(0).max(1)), // {priorityKey: ratio}
    evidenceRatio: z.number().min(0).max(100),
    antiBullshitScore: z.number().min(0).max(100),
    alerts: z.array(z.string()),
    oneChange: z.enum(['CUT_SCOPE', 'ADD_RECOVERY', 'FIX_MORNING', 'REMOVE_DISTRACTION', 'KEEP_SAME']),
    changeReason: z.string().optional(),
});

// Monthly Review Form Schema
const MonthlyReviewFormSchema = z.object({
    sprintId: z.string().uuid(),
    month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
    whoWereYou: z.string().optional(),
    desiredIdentity: z.enum(['yes', 'partially', 'no']).optional(),
    perceivedProgress: z.record(z.string(), z.number().min(1).max(10)), // {priorityKey: 1-10}
    actualProgress: z.object({
        progressRatio: z.number().min(0).max(1),
        evidenceRatio: z.number().min(0).max(100),
    }),
    oneChange: z.string().optional(),
});

export async function createWeeklyReviewAction(formData: unknown) {
    try {
        const session = await getRequiredSession();
        
        // Rate limit: 5 reviews per hour per user
        enforceRateLimit(`create-weekly-review:${session.user.id}`, 5, 3600000);
        
        const validated = WeeklyReviewFormSchema.parse(formData);

        // Ensure oneChange is provided
        if (!validated.oneChange) {
            throw new Error("One change selection is required");
        }

        // Verify sprint ownership - check if sprint belongs to user
        const sprint = await getSprintById(validated.sprintId, session.user.id);
        if (!sprint) {
            throw new Error("Sprint not found or you don't have access to it");
        }

        // Sanitize text inputs
        const sanitizedAlerts = validated.alerts.map(alert => sanitizeText(alert, 500));

        await createWeeklyReview({
            id: randomUUID(),
            userId: session.user.id,
            sprintId: validated.sprintId,
            weekEndDate: validated.weekEndDate,
            progressRatios: validated.progressRatios,
            evidenceRatio: validated.evidenceRatio,
            antiBullshitScore: validated.antiBullshitScore,
            alerts: sanitizedAlerts,
            oneChange: validated.oneChange,
            changeReason: validated.changeReason ? sanitizeText(validated.changeReason, 2000) : null,
            createdAt: new Date(),
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/weekly");
        
        return { success: true, message: "Weekly review saved successfully" };
    } catch (error) {
        console.error("Error in createWeeklyReviewAction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to save weekly review. Please try again.");
    }
}

export async function updateWeeklyReviewAction(reviewId: string, formData: unknown) {
    const session = await getRequiredSession();
    
    // Verify ownership
    const review = await getWeeklyReviewById(reviewId, session.user.id);
    if (!review) {
        throw new Error("Weekly review not found");
    }

    const validated = WeeklyReviewFormSchema.partial().parse(formData);

    await updateWeeklyReview(reviewId, session.user.id, validated);

    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath("/reviews/weekly");
}

export async function createMonthlyReviewAction(formData: unknown) {
    const session = await getRequiredSession();
    
    // Rate limit: 2 reviews per hour per user
    enforceRateLimit(`create-monthly-review:${session.user.id}`, 2, 3600000);
    
    const validated = MonthlyReviewFormSchema.parse(formData);

    // Verify sprint ownership - check if sprint belongs to user
    const sprint = await getSprintById(validated.sprintId, session.user.id);
    if (!sprint) {
        throw new Error("Sprint not found or you don't have access to it");
    }

    await createMonthlyReview({
        id: randomUUID(),
        userId: session.user.id,
        sprintId: validated.sprintId,
        month: validated.month,
        whoWereYou: validated.whoWereYou ? sanitizeText(validated.whoWereYou, 5000) : null,
        desiredIdentity: validated.desiredIdentity ?? null,
        perceivedProgress: validated.perceivedProgress,
        actualProgress: validated.actualProgress,
        oneChange: validated.oneChange ? sanitizeText(validated.oneChange, 2000) : null,
        createdAt: new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath("/reviews/monthly");
}

export async function updateMonthlyReviewAction(reviewId: string, formData: unknown) {
    const session = await getRequiredSession();
    
    // Verify ownership
    const review = await getMonthlyReviewById(reviewId, session.user.id);
    if (!review) {
        throw new Error("Monthly review not found");
    }

    const validated = MonthlyReviewFormSchema.partial().parse(formData);

    await updateMonthlyReview(reviewId, session.user.id, validated);

    revalidatePath("/dashboard");
    revalidatePath("/reviews");
    revalidatePath("/reviews/monthly");
}

