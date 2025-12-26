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
import { createWeeklyReview, createMonthlyReview, getWeeklyReviewById, getMonthlyReviewById, updateWeeklyReview, updateMonthlyReview } from "@/data-access/reviews";
import { getSprintById } from "@/data-access/sprints";
import { sanitizeText } from "@/lib/sanitize";
import { randomUUID } from "crypto";
import { WeeklyReviewFormSchema, MonthlyReviewFormSchema } from "@/lib/validators";
import { NotFoundError } from "@/lib/errors";
import { ActionResult, success } from "@/lib/actions/result";
import { withAuth, withValidation, withErrorHandling } from "@/lib/actions/middleware";

export async function createWeeklyReviewAction(formData: unknown): Promise<ActionResult<{ id: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            WeeklyReviewFormSchema,
            withAuth(
                async (userId, validated) => {
                    // Verify sprint ownership - check if sprint belongs to user
                    const sprint = await getSprintById(validated.sprintId, userId);
                    if (!sprint) {
                        throw new NotFoundError("Sprint not found or you don't have access to it");
                    }

                    // Sanitize text inputs
                    const sanitizedAlerts = validated.alerts.map(alert => sanitizeText(alert, 500));

                    const reviewId = randomUUID();
                    await createWeeklyReview({
                        id: reviewId,
                        userId,
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
                    
                    return success(
                        { id: reviewId },
                        { 
                            message: "Weekly review saved successfully",
                            redirect: "weekly"
                        }
                    );
                },
                {
                    rateLimit: { key: 'create-weekly-review', limit: 5, windowMs: 3600000 }
                }
            )
        ),
        "Failed to save weekly review. Please try again."
    );
    
    return await wrappedAction(formData);
}

export async function updateWeeklyReviewAction(reviewId: string, formData: unknown): Promise<ActionResult<{ id: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            WeeklyReviewFormSchema.partial(),
            withAuth(
                async (userId, validated) => {
                    // Verify ownership
                    const review = await getWeeklyReviewById(reviewId, userId);
                    if (!review) {
                        throw new NotFoundError("Weekly review not found");
                    }

                    await updateWeeklyReview(reviewId, userId, validated);

                    revalidatePath("/dashboard");
                    revalidatePath("/reviews");
                    revalidatePath("/reviews/weekly");
                    
                    return success(
                        { id: reviewId },
                        { 
                            message: "Weekly review updated successfully",
                            redirect: "weekly"
                        }
                    );
                },
                {
                    rateLimit: { key: 'update-weekly-review', limit: 5, windowMs: 3600000 }
                }
            )
        ),
        "Failed to update weekly review. Please try again."
    );
    
    return await wrappedAction(formData);
}

export async function createMonthlyReviewAction(formData: unknown): Promise<ActionResult<{ id: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            MonthlyReviewFormSchema,
            withAuth(
                async (userId, validated) => {
                    // Verify sprint ownership - check if sprint belongs to user
                    const sprint = await getSprintById(validated.sprintId, userId);
                    if (!sprint) {
                        throw new NotFoundError("Sprint not found or you don't have access to it");
                    }

                    const reviewId = randomUUID();
                    await createMonthlyReview({
                        id: reviewId,
                        userId,
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
                    
                    return success(
                        { id: reviewId },
                        { 
                            message: "Monthly review saved successfully",
                            redirect: "monthly"
                        }
                    );
                },
                {
                    rateLimit: { key: 'create-monthly-review', limit: 2, windowMs: 3600000 }
                }
            )
        ),
        "Failed to save monthly review. Please try again."
    );
    
    return await wrappedAction(formData);
}

export async function updateMonthlyReviewAction(reviewId: string, formData: unknown): Promise<ActionResult<{ id: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            MonthlyReviewFormSchema.partial(),
            withAuth(
                async (userId, validated) => {
                    // Verify ownership
                    const review = await getMonthlyReviewById(reviewId, userId);
                    if (!review) {
                        throw new NotFoundError("Monthly review not found");
                    }

                    await updateMonthlyReview(reviewId, userId, validated);

                    revalidatePath("/dashboard");
                    revalidatePath("/reviews");
                    revalidatePath("/reviews/monthly");
                    
                    return success(
                        { id: reviewId },
                        { 
                            message: "Monthly review updated successfully",
                            redirect: "monthly"
                        }
                    );
                },
                {
                    rateLimit: { key: 'update-monthly-review', limit: 5, windowMs: 3600000 }
                }
            )
        ),
        "Failed to update monthly review. Please try again."
    );
    
    return await wrappedAction(formData);
}

