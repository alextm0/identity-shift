"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReviewStore } from "@/hooks/stores/use-review-store";
import { saveYearlyReviewProgressAction } from "@/actions/yearly-reviews";
import { WizardProgress } from "./wizard-progress";
import { WizardNavigation } from "./wizard-navigation";
import { StepWelcome } from "./step-welcome";
import { StepWheelRating } from "./step-wheel-rating";
import { StepAuditAll } from "./step-audit-all";
import { StepBigThree } from "./step-big-three";
import { StepSummary } from "./step-summary";
import type { YearlyReviewWithTypedFields } from "@/lib/types";
import { generateNarrative } from "@/lib/narrative-generator";
import { REVIEW_WIZARD_STEPS } from "@/lib/constants/review";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useWizardNavigation } from "@/hooks/use-wizard-navigation";
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
        bigThreeWins,
        damnGoodDecision,
        generatedNarrative,
        loadFromServer,
        setStep,
        markSaving,
        getFormData,
        setNarrative,
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
        enabled: currentStep > 1 && !!reviewId,
        dependencies: [
            wheelRatings,
            wheelWins,
            wheelGaps,
            bigThreeWins,
            damnGoodDecision,
            generatedNarrative,
        ],
    });

    // Wizard navigation hook
    const {
        subStepIndex,
        handleNext: handleNextNavigation,
        handleBack: handleBackNavigation,
        canGoNext: canGoNextNavigation,
        canGoBack: canGoBackNavigation,
    } = useWizardNavigation({
        totalSteps: REVIEW_WIZARD_STEPS,
        currentStep,
        onStepChange: setStep,
    });

    // Generate narrative when reaching step 6
    useEffect(() => {
        if (currentStep === REVIEW_WIZARD_STEPS) {
            const formData = getFormData();
            if (formData.wheelRatings && formData.bigThreeWins && formData.damnGoodDecision) {
                const narrative = generateNarrative(
                    formData.wheelRatings,
                    formData.bigThreeWins as [string, string, string],
                    formData.damnGoodDecision
                );
                setNarrative(narrative);
            }
        }
    }, [currentStep, getFormData, setNarrative]);

    const handleNext = async () => {
        // If not on last step, use navigation hook
        if (currentStep < REVIEW_WIZARD_STEPS) {
            // Save before moving to next step
            if (isDirty && reviewId) {
                await autoSave();
            }
            handleNextNavigation();
        } else {
            // Complete review - ensure all required fields are present
            const formData = getFormData();
            const completeFormData = {
                ...formData,
                year,
                wheelRatings: wheelRatings || {},
                wheelWins: wheelWins || {},
                wheelGaps: wheelGaps || {},
                bigThreeWins: bigThreeWins || ["", "", ""],
                damnGoodDecision: damnGoodDecision || "",
                generatedNarrative: generatedNarrative || "",
            };
            
            await handleReviewCompletion({
                reviewId: reviewId!,
                formData: completeFormData,
                year,
                currentStep,
                isEditMode,
                onSuccess: (redirectPath) => {
                    router.push(redirectPath);
                },
                onError: (error) => {
                    console.error("Failed to complete review:", error);
                    markSaving(false);
                },
                onSavingChange: markSaving,
            });
        }
    };

    const handleBack = () => {
        handleBackNavigation();
    };

    const handleExit = () => {
        // Discard all changes and reload from server
        if (initialReview) {
            loadFromServer(initialReview);
        } else {
            // If no initial review, just reset the store
            useReviewStore.getState().reset();
        }
        router.push("/dashboard");
    };

    const canGoNext = (): boolean => {
        // For step 6 (summary), always allow completion
        if (currentStep === REVIEW_WIZARD_STEPS) {
            return true;
        }
        
        // For step 2 (wheel rating), check if all dimensions are rated
        if (currentStep === 2) {
            // Check store directly - all dimensions must have valid values
            return LIFE_DIMENSIONS.every(dim => {
                const value = wheelRatings[dim];
                return value !== undefined && value >= 1 && value <= 10;
            });
        }
        
        // For step 3 (audit), allow proceeding (wins/gaps are optional)
        if (currentStep === 3) {
            return true;
        }
        
        // For step 4 (big three), check if big three and decision are filled
        if (currentStep === 4) {
            const bigThree = getFormData().bigThreeWins;
            const decision = getFormData().damnGoodDecision;
            return !!(bigThree && bigThree.every(w => w && w.trim().length > 0) && decision && decision.trim().length > 0);
        }
        
        // For multi-dimension steps, use navigation hook logic
        if (canGoNextNavigation()) {
            return true;
        }
        
        return false;
    };
    
    const canGoBack = () => {
        return canGoBackNavigation();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepWelcome year={year} isEditMode={isEditMode} />;
            case 2:
                return <StepWheelRating currentDimensionIndex={subStepIndex} />;
            case 3:
                return <StepAuditAll />;
            case 4:
                return <StepBigThree />;
            case 5:
                return <StepSummary year={year} />;
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

