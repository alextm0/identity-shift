"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { savePlanningProgressAction, completePlanningAction } from "@/actions/planning";
import { WizardProgress } from "./wizard-progress";
import { WizardNavigation } from "./wizard-navigation";
import type { PlanningWithTypedFields } from "@/lib/types";
import { PlanningStatus } from "@/lib/validators/planning";
// Planning ceremony steps
import { BrainDumpStep } from "./steps/brain-dump";
import { FutureIdentityStep } from "./steps/future-identity";
import { WheelVisionStep } from "./steps/wheel-vision";
import { FutureLetterStep } from "./steps/future-you-letter";
import { GoalBacklogStep } from "./steps/goal-backlog";
import { AnnualGoalsStep } from "./steps/annual-goals";
import { GoalDetailsStep } from "./steps/goal-details";
import { AntiVisionStep } from "./steps/anti-vision";
import { CommitmentStep } from "./steps/commitment";

const PLANNING_STEPS = [
    { id: 1, name: 'Empty Head', time: '5-10 min' },
    { id: 2, name: 'Future Identity', time: '2-3 min' },
    { id: 3, name: 'Wheel Vision', time: '5-10 min' },
    { id: 4, name: 'Goal Backlog', time: '5-10 min' },
    { id: 5, name: 'Annual Goals', time: '5 min' },
    { id: 6, name: 'Goal Details', time: '10-15 min' },
    { id: 7, name: 'Anti-Goals (Pre-mortem)', time: '5 min' },
    { id: 8, name: 'Future You Letter', time: '3-5 min' },
    { id: 9, name: 'Commitment', time: '3 min' },
] as const;

interface PlanningWizardContainerProps {
    initialPlanning?: PlanningWithTypedFields;
    isEditMode?: boolean;
}

export function PlanningWizardContainer({ initialPlanning, isEditMode = false }: PlanningWizardContainerProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const {
        planningId,
        currentStep,
        isDirty,
        isSaving,
        status,
        futureIdentity,
        annualGoalIds,
        antiVision,
        antiGoals,
        signatureImage,
        loadFromServer,
        setStep,
        nextStep,
        prevStep,
        getFormData,
        markSaving,
        canGoNext,
        canGoBack,
        setSignedAt,
        markAsSaved,
    } = usePlanningStore();

    // Load initial data - only once on mount
    // Load initial data - ensure sync with server
    useEffect(() => {
        if (initialPlanning) {
            // Only load if ID differs or we don't have an ID, to prevent unnecessary resets
            if (!planningId || planningId !== initialPlanning.id) {
                loadFromServer(initialPlanning);
            }
        }
    }, [initialPlanning, planningId, loadFromServer]);

    // Auto-save on step change (debounced)
    const autoSave = useCallback(async () => {
        const activeId = planningId || initialPlanning?.id;
        if (!activeId || !isDirty) return;

        markSaving(true);
        try {
            const formData = getFormData();
            await savePlanningProgressAction(activeId, formData);
            markAsSaved();
        } catch (error) {
            console.error("Failed to auto-save:", error);
            markSaving(false);
        }
    }, [planningId, initialPlanning?.id, isDirty, getFormData, markSaving, markAsSaved]);

    // Auto-save when step changes (not during typing)
    useEffect(() => {
        if (currentStep > 1 && isDirty) {
            const timeoutId = setTimeout(() => {
                autoSave();
            }, 2000); // Debounce 2 seconds to avoid interrupting typing

            return () => clearTimeout(timeoutId);
        }
    }, [currentStep, autoSave, isDirty]);

    const handleNext = async () => {
        if (currentStep === PLANNING_STEPS.length) {
            // Last step - complete planning
            await handleComplete();
        } else {
            // Move to next step
            nextStep();

            // Save before moving
            if (isDirty && planningId) {
                await autoSave();
            }
        }
    };

    const handleBack = () => {
        prevStep();
    };

    const handleExit = () => {
        // Auto-save before exiting
        if (isDirty && planningId) {
            autoSave();
        }
        router.push("/dashboard");
    };

    const handleComplete = async () => {
        // Use either the store ID or the initial prop ID
        const activeId = planningId || initialPlanning?.id;

        if (!activeId) {
            setError("No planning session found. Please refresh the page.");
            return;
        }

        // Clear any previous errors
        setError(null);

        // Validate that we have required data
        const formData = getFormData();

        // Check required fields
        if (!futureIdentity || futureIdentity.trim().length === 0) {
            setError("Please complete your future identity in Step 2.");
            return;
        }

        if (!annualGoalIds || annualGoalIds.length === 0) {
            setError("Please select at least one annual goal in Step 5.");
            return;
        }

        // antiVision is now optional, so no check here required unless specified.


        if (!antiGoals || antiGoals.length < 3) {
            setError("Please add at least 3 anti-goals in Step 7.");
            return;
        }

        if (!signatureImage || signatureImage.trim().length === 0) {
            setError("Please sign your commitment in Step 9.");
            return;
        }

        markSaving(true);
        try {
            // Set signed date
            setSignedAt(new Date());

            // Ensure all required fields are present and properly formatted
            const completeData = {
                ...formData,
                signatureImage,
                signedAt: new Date(),
                status: PlanningStatus.COMPLETED,
            };

            let result;
            try {
                if (isEditMode) {
                    // In edit mode, save progress and re-complete
                    await savePlanningProgressAction(activeId, formData);
                    result = await completePlanningAction(activeId, completeData);
                } else {
                    // Normal completion
                    result = await completePlanningAction(activeId, completeData);
                }
            } catch (actionError: any) {
                // Handle errors thrown by the action (validation errors, etc.)
                console.error("Action error:", actionError);
                const errorMessage = actionError?.message || actionError?.error || "Validation failed. Please check all required fields.";
                setError(errorMessage);
                markSaving(false);
                return;
            }

            // Handle result - check if it's an ActionResult
            if (result && typeof result === 'object' && 'success' in result) {
                if (result.success) {
                    router.push(result.redirect || "/dashboard/planning/view");
                } else {
                    const errorMessage = result.error || "Failed to complete planning. Please try again.";
                    setError(errorMessage);
                    markSaving(false);
                }
            } else {
                // If result doesn't have success property, assume it succeeded
                router.push("/dashboard/planning/view");
            }
        } catch (error: any) {
            console.error("Failed to complete planning:", error);
            // Extract error message from various error formats
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.error) {
                errorMessage = error.error;
            }
            setError(errorMessage);
            markSaving(false);
        }
    };

    const isLastStep = currentStep === PLANNING_STEPS.length;

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <BrainDumpStep />;
            case 2:
                return <FutureIdentityStep />;
            case 3:
                return <WheelVisionStep />;
            case 4:
                return <GoalBacklogStep />;
            case 5:
                return <AnnualGoalsStep />;
            case 6:
                return <GoalDetailsStep />;
            case 7:
                return <AntiVisionStep />;
            case 8:
                return <FutureLetterStep />;
            case 9:
                return <CommitmentStep onComplete={handleComplete} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-6 md:p-12">


            {/* Progress bar */}
            <div className="mb-8">
                <WizardProgress
                    currentStep={currentStep}
                    totalSteps={PLANNING_STEPS.length}
                    currentStepName={PLANNING_STEPS[currentStep - 1]?.name}
                    currentStepTime={PLANNING_STEPS[currentStep - 1]?.time}
                    isSaving={isSaving}
                />
            </div>

            {/* Step content */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                    <div className="glass-pane p-8 md:p-12">
                        {renderStep()}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 p-4 bg-bullshit-crimson/10 border border-bullshit-crimson/30 rounded-xl">
                            <p className="text-bullshit-crimson text-sm font-mono uppercase tracking-widest">
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-8">
                <WizardNavigation
                    currentStep={currentStep}
                    totalSteps={PLANNING_STEPS.length}
                    isLastStep={isLastStep}
                    onBack={handleBack}
                    onNext={handleNext}
                    onExit={handleExit}
                    onSkip={currentStep === 2 ? nextStep : undefined}
                    canGoBack={canGoBack()}
                    canGoNext={canGoNext()}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
