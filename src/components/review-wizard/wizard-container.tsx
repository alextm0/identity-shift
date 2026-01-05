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
import { useWizardNavigation } from "@/hooks/use-wizard-navigation";

interface ReviewWizardContainerProps {
    initialReview: YearlyReviewWithTypedFields;
    year: number;
    isEditMode?: boolean;
}

export function ReviewWizardContainer({ initialReview, year, isEditMode = false }: ReviewWizardContainerProps) {
    const router = useRouter(); // Kept if needed by other logic, though navigation hook handles it mostly
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
        markSaving,
        markClean,
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
        const effectiveReviewId = reviewId || initialReview.id;
        if (!effectiveReviewId || !isDirty) return;

        markSaving(true);
        try {
            const formData = getFormData();
            const result = await saveYearlyReviewProgressAction(effectiveReviewId, {
                ...formData,
                year,
                currentStep,
            });

            if (result.success) {
                // Mark as not dirty after successful save
                markClean();
            }
        } catch (error) {
            console.error("Failed to auto-save:", error);
        } finally {
            markSaving(false);
        }
    }, [reviewId, isDirty, year, currentStep, getFormData, markSaving, markClean, initialReview.id]);

    // Use auto-save hook
    useAutoSave({
        onSave: autoSave,
        isDirty,
        enabled: !!(reviewId || initialReview.id),
        dependencies: [
            wheelRatings,
            wheelWins,
            wheelGaps,
            wins,
            otherDetails,
        ],
    });

    // Use wizard navigation hook
    const {
        handleNext,
        handleBack,
        handleExit,
        canGoNext,
        canGoBack
    } = useWizardNavigation({
        initialReview,
        year,
        isEditMode,
        autoSave
    });

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
