/**
 * Weekly Review Mutation Hook
 * 
 * Provides a hook for managing weekly review mutations with loading states,
 * error handling, and optimistic updates.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
    createWeeklyReviewAction, 
    updateWeeklyReviewAction 
} from "@/actions/reviews";
import { WeeklyReviewFormData } from "@/lib/validators";
import { getErrorMessage } from "@/lib/errors";

export function useWeeklyReview() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const createWeeklyReview = async (formData: WeeklyReviewFormData) => {
        setError(null);

        startTransition(async () => {
            try {
                const result = await createWeeklyReviewAction(formData);
                if (result.success) {
                    toast.success(result.message || "Weekly review saved successfully");
                    router.refresh();
                } else {
                    setError(result.error || "Failed to save weekly review");
                    toast.error(result.error || "Failed to save weekly review");
                }
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setError(errorMessage);
                toast.error(errorMessage);
            }
        });
    };

    const updateWeeklyReview = async (reviewId: string, formData: Partial<WeeklyReviewFormData>) => {
        setError(null);

        startTransition(async () => {
            try {
                const result = await updateWeeklyReviewAction(reviewId, formData);
                if (result.success) {
                    toast.success(result.message || "Weekly review updated successfully");
                    router.refresh();
                } else {
                    const errorMessage = result.error || "Failed to update weekly review";
                    setError(errorMessage);
                    toast.error(errorMessage);
                }
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                setError(errorMessage);
                toast.error(errorMessage);
            }
        });
    };

    return {
        createWeeklyReview,
        updateWeeklyReview,
        isPending,
        error,
    };
}

