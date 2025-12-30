import { saveYearlyReviewProgressAction, completeYearlyReviewAction } from "@/actions/yearly-reviews";
import type { YearlyReviewFormData } from "@/lib/validators/yearly-review";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";

interface HandleReviewCompletionOptions {
  reviewId: string;
  formData: Partial<YearlyReviewFormData>;
  year: number;
  currentStep: number;
  isEditMode: boolean;
  onSuccess: (redirectPath: string) => void;
  onError: (error: string) => void;
  onSavingChange: (saving: boolean) => void;
}

/**
 * Handles review completion logic for both edit and normal modes
 * 
 * In edit mode: saves progress, re-completes review, redirects to view page
 * In normal mode: completes review, redirects to planning or specified redirect
 */
export async function handleReviewCompletion({
  reviewId,
  formData,
  year,
  currentStep,
  isEditMode,
  onSuccess,
  onError,
  onSavingChange,
}: HandleReviewCompletionOptions): Promise<void> {
  if (!reviewId) {
    onError("Review ID is required");
    return;
  }

  onSavingChange(true);


  const wheelRatings = formData.wheelRatings || {};
  const wins = formData.wins || [];

  try {
    if (isEditMode) {
      // In edit mode, save and re-complete, then redirect to view
      const saveResult = await saveYearlyReviewProgressAction(reviewId, {
        ...formData,
        year,
        currentStep,
      });

      if (!saveResult.success) {
        onError(saveResult.error || "Failed to save review");
        onSavingChange(false);
        return;
      }

      // Re-complete the review
      const completeResult = await completeYearlyReviewAction(reviewId, {
        ...formData,
        year,
        wheelRatings,
        wins,
        otherDetails: formData.otherDetails ?? undefined,
      } as any);

      if (completeResult.success) {
        onSavingChange(false);
        onSuccess(`/review/${year}`);
      } else {
        onError(completeResult.error || "Failed to complete review");
        onSavingChange(false);
      }
    } else {
      // Normal completion flow
      const result = await completeYearlyReviewAction(reviewId, {
        ...formData,
        year,
        wheelRatings,
        wins,
        otherDetails: formData.otherDetails ?? undefined,
      } as any);

      if (result.success) {
        onSavingChange(false);
        const redirectPath = result.redirect || "/dashboard";
        onSuccess(redirectPath);
      } else {
        onError(result.error || "Failed to complete review");
        onSavingChange(false);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to complete review";
    onError(errorMessage);
    onSavingChange(false);
  }
}

