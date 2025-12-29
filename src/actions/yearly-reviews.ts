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
import { getOrCreateYearlyReview, getYearlyReviewById, updateYearlyReview, getCompletedYearlyReview, deleteYearlyReview } from "@/data-access/yearly-reviews";
import { YearlyReviewFormSchema, CompleteYearlyReviewSchema, WheelRatingsSchema } from "@/lib/validators/yearly-review";
import { NotFoundError } from "@/lib/errors";
import { success } from "@/lib/actions/result";
import { createActionWithParam, createActionWithoutValidation } from "@/lib/actions/middleware";

/**
 * Get or create a yearly review for a specific year
 */
export const getOrCreateYearlyReviewAction = createActionWithoutValidation(
    async (userId, year: number) => {
        const review = await getOrCreateYearlyReview(userId, year);

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
        rateLimit: { key: 'get-yearly-review', limit: 10, windowMs: 60000 },
        errorMessage: "Failed to load yearly review. Please try again."
    }
);

/**
 * Save yearly review progress (auto-save)
 */
export const saveYearlyReviewProgressAction = createActionWithParam(
    YearlyReviewFormSchema.partial(),
    async (userId, reviewId: string, validated) => {
        // Verify ownership
        const review = await getYearlyReviewById(reviewId, userId);
        if (!review) {
            throw new NotFoundError("Yearly review not found");
        }

        // Data is already sanitized by Zod schema transforms
        const updateData = {
            ...validated,
            updatedAt: new Date(),
        };

        // Filter empty wins if present
        if (validated.wins !== undefined) {
            updateData.wins = validated.wins.filter(w => w && w.trim());
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
        rateLimit: { key: 'save-yearly-review', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to save progress. Please try again."
    }
);

/**
 * Complete yearly review (mark as completed)
 */
export const completeYearlyReviewAction = createActionWithParam(
    CompleteYearlyReviewSchema,
    async (userId, reviewId: string, validated) => {
        // Verify ownership
        const review = await getYearlyReviewById(reviewId, userId);
        if (!review) {
            throw new NotFoundError("Yearly review not found");
        }

        // Data is already sanitized by Zod schema transforms
        const updateData = {
            ...validated,
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date(),
        };

        // Filter empty wins
        updateData.wins = validated.wins.filter(w => w && w.trim());

        await updateYearlyReview(reviewId, userId, updateData);

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
        rateLimit: { key: 'complete-yearly-review', limit: 5, windowMs: 3600000 },
        errorMessage: "Failed to complete review. Please try again."
    }
);

/**
 * Check if user has completed review for a specific year
 */
export const hasCompletedYearlyReviewAction = createActionWithoutValidation(
    async (userId, year: number) => {
        const review = await getCompletedYearlyReview(userId, year);

        return success(
            { hasCompleted: !!review },
            { message: "Check completed" }
        );
    },
    {
        rateLimit: { key: 'check-yearly-review', limit: 10, windowMs: 60000 },
        errorMessage: "Failed to check review status. Please try again."
    }
);

/**
 * Enable editing for a completed review (marks as draft)
 */
export const editYearlyReviewAction = createActionWithoutValidation(
    async (userId, reviewId: string) => {
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
        rateLimit: { key: 'edit-yearly-review', limit: 5, windowMs: 60000 },
        errorMessage: "Failed to enable editing. Please try again."
    }
);

/**
 * Update wheel ratings for a review
 */
export const updateWheelRatingsAction = createActionWithParam(
    WheelRatingsSchema,
    async (userId, reviewId: string, validated) => {
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
        rateLimit: { key: 'update-wheel-ratings', limit: 20, windowMs: 60000 },
        errorMessage: "Failed to update wheel ratings. Please try again."
    }
);


/**
 * Delete/reset a yearly review
 */
export const deleteYearlyReviewAction = createActionWithoutValidation(
    async (userId, reviewId: string) => {
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
        rateLimit: { key: 'delete-yearly-review', limit: 5, windowMs: 60000 },
        errorMessage: "Failed to delete review. Please try again."
    }
);

