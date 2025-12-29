"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReviewStore } from "@/hooks/stores/use-review-store";
import { saveYearlyReviewProgressAction } from "@/actions/yearly-reviews";
import { WizardProgress } from "./wizard-progress";
import { WizardNavigation } from "./wizard-navigation";
import { StepWheelRating } from "./step-wheel-rating";
import { StepWins } from "./step-wins";
import { StepYearSnapshot } from "./step-year-snapshot";
import type { YearlyReviewWithTypedFields } from "@/lib/types";
import { REVIEW_WIZARD_STEPS } from "@/lib/constants/review";
import { useAutoSave } from "@/hooks/use-auto-save";
import { handleReviewCompletion } from "@/lib/review/completion-handler";

interface ReviewWizardContainerProps {
    initialReview: YearlyReviewWithTypedFields;
    year: number;
    isEditMode?: boolean;
}

export function ReviewWizardContainer({ initialReview, year, isEditMode = false }: ReviewWizardContainerProps) {
    const router = useRouter();
    const {
        currentStep,
        reviewId,
        isDirty,
        isSaving,
        wheelRatings,
        wheelWins,
        wheelGaps,
        wins,
        otherDetails,
        loadFromServer,
        setStep,
        markSaving,
        getFormData,
    } = useReviewStore();

    // Load initial data - only once on mount
    const hasLoadedRef = useRef(false);
    useEffect(() => {
        if (initialReview && !hasLoadedRef.current) {
            loadFromServer(initialReview);
            hasLoadedRef.current = true;
        }
    }, [initialReview, loadFromServer]);

    // Auto-save function
    const autoSave = useCallback(async () => {
        if (!reviewId || !isDirty) return;

        markSaving(true);
        try {
            const formData = getFormData();
            const result = await saveYearlyReviewProgressAction(reviewId, {
                ...formData,
                year,
                currentStep,
            });

            if (result.success) {
                // Mark as not dirty after successful save
                useReviewStore.setState({ isDirty: false });
            }
        } catch (error) {
            console.error("Failed to auto-save:", error);
        } finally {
            markSaving(false);
        }
    }, [reviewId, isDirty, year, currentStep, getFormData, markSaving]);

    // Use auto-save hook
    useAutoSave({
        onSave: autoSave,
        isDirty,
        enabled: !!reviewId,
        dependencies: [
            wheelRatings,
            wheelWins,
            wheelGaps,
            wins,
            otherDetails,
        ],
    });

    // Simple navigation handlers (no sub-steps needed anymore)
    const handleNextNavigation = () => {
        if (currentStep < REVIEW_WIZARD_STEPS) {
            setStep(currentStep + 1);
        }
    };

    const handleBackNavigation = () => {
        if (currentStep > 1) {
            setStep(currentStep - 1);
        }
    };

    const canGoNextNavigation = () => {
        return currentStep < REVIEW_WIZARD_STEPS;
    };

    const canGoBackNavigation = () => {
        return currentStep > 1;
    };


    const handleNext = async () => {
        // If not on last step, move to next step
        if (currentStep < REVIEW_WIZARD_STEPS) {
            // Save before moving to next step
            if (isDirty && reviewId) {
                await autoSave();
            }
            handleNextNavigation();
        } else {
            // Complete review
            if (!reviewId) {
                console.error("Cannot complete review: reviewId is missing.");
                return;
            }
            const formData = getFormData();
            await handleReviewCompletion({
                reviewId: reviewId,
                formData,
                year,
                currentStep,
                isEditMode,
                onSuccess: (redirectPath) => {
                    router.push(redirectPath);
                },
                onError: (error) => {
                    console.error("Failed to complete review:", error);
                },
                onSavingChange: markSaving,
            });
        }
    };

    const handleBack = () => {
        handleBackNavigation();
    };

    const handleExit = async () => {
        // Auto-save before exiting
        if (isDirty && reviewId) {
            await autoSave();
        }
        router.push("/dashboard");
    };

    const canGoNext = (): boolean => {
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
            return !!(ratings && Object.keys(ratings).length === 8);
        }

        return canGoNextNavigation();
    };

    const canGoBack = () => {
        return canGoBackNavigation();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepWheelRating />;
            case 2:
                return <StepWins />;
            case 3:
                return <StepYearSnapshot year={year} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-6 md:p-12">
            {/* Progress bar */}
            <div className="mb-8">
                <WizardProgress currentStep={currentStep} totalSteps={REVIEW_WIZARD_STEPS} />
            </div>

            {/* Step content */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                    <div className="glass-pane p-8 md:p-12">
                        {renderStep()}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-8">
                <WizardNavigation
                    currentStep={currentStep}
                    totalSteps={REVIEW_WIZARD_STEPS}
                    onBack={handleBack}
                    onNext={handleNext}
                    onExit={handleExit}
                    canGoBack={canGoBack()}
                    canGoNext={canGoNext()}
                    isSaving={isSaving}
                    isEditMode={isEditMode}
                />
            </div>
        </div>
    );
}

