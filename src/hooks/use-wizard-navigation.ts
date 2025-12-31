import { useState, useCallback } from "react";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";

interface UseWizardNavigationOptions {
  totalSteps: number;
  currentStep: number;
  onStepChange: (step: number) => void;
  multiStepIndices?: readonly number[];
  itemsPerMultiStep?: number;
}

interface WizardNavigationReturn {
  currentStep: number;
  subStepIndex: number;
  handleNext: () => void;
  handleBack: () => void;
  canGoNext: () => boolean;
  canGoBack: () => boolean;
  isLastSubStep: boolean;
  isFirstSubStep: boolean;
}

/**
 * Custom hook for wizard navigation with support for multi-step items
 * 
 * Handles navigation between steps and sub-steps (e.g., dimensions within a step).
 * Automatically manages sub-step index resets when changing steps.
 */
export function useWizardNavigation({
  totalSteps,
  currentStep,
  onStepChange,
  multiStepIndices = [],
  itemsPerMultiStep = LIFE_DIMENSIONS.length,
}: UseWizardNavigationOptions): WizardNavigationReturn {
  const [prevStep, setPrevStep] = useState(currentStep);
  const [subStepIndex, setSubStepIndex] = useState(0);

  if (currentStep !== prevStep) {
    setPrevStep(currentStep);
    setSubStepIndex(0);
  }

  const isMultiStep = useCallback(
    (step: number) => (multiStepIndices as number[]).includes(step),
    [multiStepIndices]
  );

  const isLastSubStep = isMultiStep(currentStep) && subStepIndex >= itemsPerMultiStep - 1;
  const isFirstSubStep = subStepIndex === 0;

  const handleNext = useCallback(() => {
    if (isMultiStep(currentStep)) {
      if (subStepIndex < itemsPerMultiStep - 1) {
        // Move to next sub-step within current step
        setSubStepIndex(subStepIndex + 1);
        return;
      } else {
        // Finished all sub-steps, move to next step
        setSubStepIndex(0);
      }
    }

    if (currentStep < totalSteps) {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, subStepIndex, totalSteps, itemsPerMultiStep, isMultiStep, onStepChange]);

  const handleBack = useCallback(() => {
    if (isMultiStep(currentStep)) {
      if (subStepIndex > 0) {
        // Move to previous sub-step within current step
        setSubStepIndex(subStepIndex - 1);
        return;
      } else {
        // Go back to previous step
        setSubStepIndex(0);
      }
    }

    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, subStepIndex, isMultiStep, onStepChange]);

  const canGoNext = useCallback(() => {
    // For multi-step, can always navigate between sub-steps
    if (isMultiStep(currentStep)) {
      return true;
    }
    // For regular steps, check if not on last step
    return currentStep < totalSteps;
  }, [currentStep, totalSteps, isMultiStep]);

  const canGoBack = useCallback(() => {
    // For multi-step, can go back if not on first sub-step or not on first step
    if (isMultiStep(currentStep)) {
      return subStepIndex > 0 || currentStep > 1;
    }
    return currentStep > 1;
  }, [currentStep, subStepIndex, isMultiStep]);

  return {
    currentStep,
    subStepIndex,
    handleNext,
    handleBack,
    canGoNext,
    canGoBack,
    isLastSubStep,
    isFirstSubStep,
  };
}

