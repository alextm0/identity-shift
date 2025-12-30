"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { savePlanningProgressAction, completePlanningAction } from "@/actions/planning";
import { PlanningStatus } from "@/lib/validators/planning";

interface UsePlanningCompletionOptions {
  planningId: string | null;
  initialPlanningId?: string;
  isEditMode?: boolean;
}

export function usePlanningCompletion({
  planningId,
  initialPlanningId,
  isEditMode = false,
}: UsePlanningCompletionOptions) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    futureIdentity,
    annualGoalIds,
    antiGoals,
    signatureImage,
    getFormData,
    markSaving,
    setSignedAt,
  } = usePlanningStore();

  const validateCompletion = useCallback((): string | null => {
    if (!futureIdentity || futureIdentity.trim().length === 0) {
      return "Please complete your future identity in Step 2.";
    }

    if (!annualGoalIds || annualGoalIds.length === 0) {
      return "Please select at least one annual goal in Step 5.";
    }

    if (!antiGoals || antiGoals.length < 3) {
      return "Please add at least 3 anti-goals in Step 7.";
    }

    if (!signatureImage || signatureImage.trim().length === 0) {
      return "Please sign your commitment in Step 9.";
    }

    return null;
  }, [futureIdentity, annualGoalIds, antiGoals, signatureImage]);

  const complete = useCallback(async (): Promise<boolean> => {
    const activeId = planningId || initialPlanningId;

    if (!activeId) {
      setError("No planning session found. Please refresh the page.");
      return false;
    }

    // Validate required fields
    const validationError = validateCompletion();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setError(null);
    markSaving(true);

    try {
      const formData = getFormData();
      setSignedAt(new Date());

      const completeData = {
        ...formData,
        signatureImage,
        signedAt: new Date(),
        status: PlanningStatus.COMPLETED,
      };

      let result;
      try {
        if (isEditMode) {
          await savePlanningProgressAction(activeId, formData);
          result = await completePlanningAction(activeId, completeData as any);
        } else {
          result = await completePlanningAction(activeId, completeData as any);
        }
      } catch (actionError: unknown) {
        console.error("Action error:", actionError);
        const errorMessage = actionError instanceof Error ? actionError.message : (typeof actionError === 'object' && actionError !== null && 'error' in actionError ? String(actionError.error) : "Validation failed. Please check all required fields.");
        setError(errorMessage);
        markSaving(false);
        return false;
      }

      // Handle result
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          router.push(result.redirect || "/dashboard/planning/view");
          return true;
        } else {
          const errorMessage = result.error || "Failed to complete planning. Please try again.";
          setError(errorMessage);
          markSaving(false);
          return false;
        }
      } else {
        router.push("/dashboard/planning/view");
        return true;
      }
    } catch (error: unknown) {
      console.error("Failed to complete planning:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'error' in error) {
        errorMessage = String(error.error);
      }

      setError(errorMessage);
      markSaving(false);
      return false;
    }
  }, [
    planningId,
    initialPlanningId,
    isEditMode,
    validateCompletion,
    getFormData,
    markSaving,
    setSignedAt,
    signatureImage,
    router,
  ]);

  return {
    complete,
    error,
    setError,
  };
}

