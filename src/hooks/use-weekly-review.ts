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
                await updateWeeklyReviewAction(reviewId, formData);
                toast.success("Weekly review updated successfully");
                router.refresh();
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

