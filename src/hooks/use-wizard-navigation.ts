"use client";

import { useRouter } from "next/navigation";
import { useReviewStore } from "@/hooks/stores/use-review-store";
import { handleReviewCompletion } from "@/lib/review/completion-handler";
import { REVIEW_WIZARD_STEPS } from "@/lib/constants/review";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { toast } from "sonner";
import { useCallback } from "react";
import type { YearlyReviewWithTypedFields } from "@/lib/types";

interface UseWizardNavigationProps {
  initialReview: YearlyReviewWithTypedFields;
  year: number;
  isEditMode: boolean;
  autoSave: () => Promise<void>;
}

export function useWizardNavigation({
  initialReview,
  year,
  isEditMode,
  autoSave
}: UseWizardNavigationProps) {
  const router = useRouter();
  const {
    currentStep,
    setStep,
    markSaving,
    getFormData,
    reviewId,
    isDirty
  } = useReviewStore();

  const handleNextNavigation = useCallback(() => {
    if (currentStep < REVIEW_WIZARD_STEPS) {
      setStep(currentStep + 1);
    }
  }, [currentStep, setStep]);

  const handleBackNavigation = useCallback(() => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  }, [currentStep, setStep]);

  const canGoNextNavigation = useCallback(() => {
    return currentStep < REVIEW_WIZARD_STEPS;
  }, [currentStep]);

  const canGoBackNavigation = useCallback(() => {
    return currentStep > 1;
  }, [currentStep]);

  const handleNext = useCallback(async () => {
    // Use getState to ensure we have the absolute latest state if needed
    const effectiveReviewId = reviewId || initialReview.id;

    // If not on last step, move to next step
    if (currentStep < REVIEW_WIZARD_STEPS) {
      // Save before moving to next step
      if (isDirty && effectiveReviewId) {
        try {
          markSaving(true);
          await autoSave();
          markSaving(false);
        } catch (error) {
          markSaving(false);
          console.error("Auto-save failed during navigation:", error);
          toast.error("Auto-save failed. Please try again.");
          return; // Abort navigation
        }
      }
      handleNextNavigation();
    } else {
      // Complete review
      if (!effectiveReviewId) {
        toast.error("Cannot complete review: reviewId is missing.");
        return;
      }

      const formData = getFormData();
      await handleReviewCompletion({
        reviewId: effectiveReviewId,
        formData,
        year,
        currentStep,
        isEditMode,
        onSuccess: (redirectPath) => {
          router.push(redirectPath);
        },
        onError: (error) => {
          console.error("Failed to complete review:", error);
          toast.error("Failed to complete review. Please try again.");
        },
        onSavingChange: markSaving,
      });
    }
  }, [
    currentStep,
    reviewId,
    initialReview.id,
    isDirty,
    autoSave,
    handleNextNavigation,
    getFormData,
    year,
    isEditMode,
    router,
    markSaving
  ]);

  const handleBack = useCallback(async () => {
    const effectiveReviewId = reviewId || initialReview.id;

    // Auto-save before moving back
    if (isDirty && effectiveReviewId) {
      await autoSave();
    }
    handleBackNavigation();
  }, [handleBackNavigation, isDirty, reviewId, initialReview.id, autoSave]);

  const handleExit = useCallback(async () => {
    const effectiveReviewId = reviewId || initialReview.id;

    // Auto-save before exiting
    if (isDirty && effectiveReviewId) {
      await autoSave();
    }
    router.push("/dashboard");
  }, [reviewId, initialReview.id, isDirty, autoSave, router]);

  const canGoNext = useCallback((): boolean => {
    // For step 3 (Year Snapshot), always allow completion
    if (currentStep === REVIEW_WIZARD_STEPS) {
      return true;
    }

    // For step 2 (Wins), always allow proceeding (0 wins allowed - hard years happen)
    if (currentStep === 2) {
      return true;
    }

    // For step 1 (Wheel of Life), check if all dimensions are rated
    if (currentStep === 1) {
      const ratings = getFormData().wheelRatings;
      return !!(ratings && Object.keys(ratings).length === LIFE_DIMENSIONS.length);
    }

    return canGoNextNavigation();
  }, [currentStep, canGoNextNavigation, getFormData]);

  const canGoBack = useCallback(() => {
    return canGoBackNavigation();
  }, [canGoBackNavigation]);

  return {
    handleNext,
    handleBack,
    handleExit,
    canGoNext,
    canGoBack
  };
}
