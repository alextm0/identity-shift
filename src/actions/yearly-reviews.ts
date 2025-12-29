'use server';

/**
 * Server Actions for Yearly Reviews
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
import { getOrCreateYearlyReview, getYearlyReviewById, updateYearlyReview, completeYearlyReview, getCompletedYearlyReview, deleteYearlyReview } from "@/data-access/yearly-reviews";
import { sanitizeText } from "@/lib/sanitize";
import { YearlyReviewFormSchema, CompleteYearlyReviewSchema, WheelRatingsSchema } from "@/lib/validators/yearly-review";
import { NotFoundError } from "@/lib/errors";
import { ActionResult, success } from "@/lib/actions/result";
import { withAuth, withValidation, withErrorHandling } from "@/lib/actions/middleware";
import { migrateReviewData } from "@/lib/db/migrations/migrate-review-data";

/**
 * Get or create a yearly review for a specific year
 */
export async function getOrCreateYearlyReviewAction(year: number): Promise<ActionResult<{ reviewId: string; currentStep: number; status: string }>> {
    const wrappedAction = withErrorHandling(
        withAuth(
            async (userId) => {
                const review = await getOrCreateYearlyReview(userId, year);

                // Apply migration if needed
                const migrated = migrateReviewData(review);
                if (migrated.wins.length > 0 || migrated.otherDetails) {
                    // Update review with migrated data
                    await updateYearlyReview(review.id, userId, {
                        wins: migrated.wins.length > 0 ? migrated.wins : null,
                        otherDetails: migrated.otherDetails || null,
                    });
                }

                return success(
                    {
                        reviewId: review.id,
                        currentStep: review.currentStep,
                        status: review.status,
                    },
                    { message: "Review loaded successfully" }
                );
            },
            {
                rateLimit: { key: 'get-yearly-review', limit: 10, windowMs: 60000 }
            }
        ),
        "Failed to load yearly review. Please try again."
    );

    return await wrappedAction();
}

/**
 * Save yearly review progress (auto-save)
 */
export async function saveYearlyReviewProgressAction(reviewId: string, formData: unknown): Promise<ActionResult<{ reviewId: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            YearlyReviewFormSchema.partial(),
            withAuth(
                async (userId, validated) => {
                    // Verify ownership
                    const review = await getYearlyReviewById(reviewId, userId);
                    if (!review) {
                        throw new NotFoundError("Yearly review not found");
                    }

                    // Sanitize text inputs
                    const updateData: any = {
                        ...validated,
                        updatedAt: new Date(),
                    };

                    if (validated.damnGoodDecision) {
                        updateData.damnGoodDecision = sanitizeText(validated.damnGoodDecision, 3000);
                    }

                    if (validated.generatedNarrative) {
                        updateData.generatedNarrative = sanitizeText(validated.generatedNarrative, 5000);
                    }

                    if (validated.wheelWins) {
                        const sanitizedWins: Record<string, string> = {};
                        for (const [key, value] of Object.entries(validated.wheelWins)) {
                            if (value) {
                                sanitizedWins[key] = sanitizeText(value, 2000);
                            }
                        }
                        updateData.wheelWins = sanitizedWins;
                    }

                    if (validated.wheelGaps) {
                        const sanitizedGaps: Record<string, string> = {};
                        for (const [key, value] of Object.entries(validated.wheelGaps)) {
                            if (value) {
                                sanitizedGaps[key] = sanitizeText(value, 2000);
                            }
                        }
                        updateData.wheelGaps = sanitizedGaps;
                    }

                    // Handle new wins field
                    if (validated.wins !== undefined) {
                        updateData.wins = validated.wins.map(win =>
                            win && win.trim() ? sanitizeText(win, 1000) : ""
                        ).filter(w => w && w.trim());
                    }

                    if (validated.otherDetails) {
                        updateData.otherDetails = sanitizeText(validated.otherDetails, 5000);
                    }

                    // Deprecated fields (kept for migration compatibility)
                    if (validated.bigThreeWins) {
                        updateData.bigThreeWins = validated.bigThreeWins.map(win =>
                            win && win.trim() ? sanitizeText(win, 1000) : ""
                        ) as [string, string, string];
                    }

                    // Only include wheelRatings if provided and has values
                    if (validated.wheelRatings && Object.keys(validated.wheelRatings).length > 0) {
                        updateData.wheelRatings = validated.wheelRatings;
                    }

                    await updateYearlyReview(reviewId, userId, updateData);

                    revalidatePath("/review");

                    return success(
                        { reviewId },
                        { message: "Progress saved" }
                    );
                },
                {
                    rateLimit: { key: 'save-yearly-review', limit: 20, windowMs: 60000 }
                }
            )
        ),
        "Failed to save progress. Please try again."
    );

    return await wrappedAction(formData);
}

/**
 * Complete yearly review (mark as completed)
 */
export async function completeYearlyReviewAction(reviewId: string, formData: unknown): Promise<ActionResult<{ reviewId: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            CompleteYearlyReviewSchema,
            withAuth(
                async (userId, validated) => {
                    // Verify ownership
                    const review = await getYearlyReviewById(reviewId, userId);
                    if (!review) {
                        throw new NotFoundError("Yearly review not found");
                    }

                    // Sanitize text inputs
                    const updateData: any = {
                        ...validated,
                        status: 'completed',
                        completedAt: new Date(),
                        updatedAt: new Date(),
                    };

                    // Handle new fields
                    updateData.wins = validated.wins.map(win =>
                        win && win.trim() ? sanitizeText(win, 1000) : ""
                    ).filter(w => w && w.trim());

                    if (validated.otherDetails) {
                        updateData.otherDetails = sanitizeText(validated.otherDetails, 5000);
                    }

                    await updateYearlyReview(reviewId, userId, updateData);
                    await completeYearlyReview(reviewId, userId);

                    revalidatePath("/review");
                    revalidatePath("/dashboard");

                    return success(
                        { reviewId },
                        {
                            message: "Review completed successfully",
                            redirect: "/dashboard"
                        }
                    );
                },
                {
                    rateLimit: { key: 'complete-yearly-review', limit: 5, windowMs: 3600000 }
                }
            )
        ),
        "Failed to complete review. Please try again."
    );

    return await wrappedAction(formData);
}

/**
 * Check if user has completed review for a specific year
 */
export async function hasCompletedYearlyReviewAction(year: number): Promise<ActionResult<{ hasCompleted: boolean }>> {
    const wrappedAction = withErrorHandling(
        withAuth(
            async (userId) => {
                const review = await getCompletedYearlyReview(userId, year);

                return success(
                    { hasCompleted: !!review },
                    { message: "Check completed" }
                );
            },
            {
                rateLimit: { key: 'check-yearly-review', limit: 10, windowMs: 60000 }
            }
        ),
        "Failed to check review status. Please try again."
    );

    return await wrappedAction();
}

/**
 * Enable editing for a completed review (marks as draft)
 */
export async function editYearlyReviewAction(reviewId: string): Promise<ActionResult<{ reviewId: string }>> {
    const wrappedAction = withErrorHandling(
        withAuth(
            async (userId) => {
                // Verify ownership
                const review = await getYearlyReviewById(reviewId, userId);
                if (!review) {
                    throw new NotFoundError("Yearly review not found");
                }

                // Mark as draft to allow editing
                await updateYearlyReview(reviewId, userId, {
                    status: 'draft',
                    updatedAt: new Date(),
                });

                revalidatePath("/review");
                revalidatePath("/dashboard");

                return success(
                    { reviewId },
                    { message: "Review unlocked for editing" }
                );
            },
            {
                rateLimit: { key: 'edit-yearly-review', limit: 5, windowMs: 60000 }
            }
        ),
        "Failed to enable editing. Please try again."
    );

    return await wrappedAction();
}

/**
 * Update wheel ratings for a review
 */
export async function updateWheelRatingsAction(reviewId: string, wheelRatings: unknown): Promise<ActionResult<{ reviewId: string }>> {
    const wrappedAction = withErrorHandling(
        withValidation(
            WheelRatingsSchema,
            withAuth(
                async (userId, validated) => {
                    const review = await getYearlyReviewById(reviewId, userId);
                    if (!review) {
                        throw new NotFoundError("Yearly review not found");
                    }

                    await updateYearlyReview(reviewId, userId, {
                        wheelRatings: validated,
                        updatedAt: new Date(),
                    });

                    revalidatePath(`/review/${review.year}`);
                    revalidatePath("/dashboard");

                    return success(
                        { reviewId },
                        { message: "Wheel ratings updated" }
                    );
                },
                {
                    rateLimit: { key: 'update-wheel-ratings', limit: 20, windowMs: 60000 }
                }
            )
        ),
        "Failed to update wheel ratings. Please try again."
    );

    return await wrappedAction(wheelRatings);
}


/**
 * Delete/reset a yearly review
 */
export async function deleteYearlyReviewAction(reviewId: string): Promise<ActionResult<void>> {
    const wrappedAction = withErrorHandling(
        withAuth(
            async (userId) => {
                const review = await getYearlyReviewById(reviewId, userId);
                if (!review) {
                    throw new NotFoundError("Yearly review not found");
                }

                await deleteYearlyReview(reviewId, userId);

                revalidatePath("/review");
                revalidatePath("/dashboard");

                return success(
                    undefined,
                    { message: "Review deleted successfully" }
                );
            },
            {
                rateLimit: { key: 'delete-yearly-review', limit: 5, windowMs: 60000 }
            }
        ),
        "Failed to delete review. Please try again."
    );

    return await wrappedAction();
}

