"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { savePlanningProgressAction } from "@/actions/planning";
import { usePlanningCompletion } from "@/hooks/use-planning-completion";
import { WizardProgress } from "./wizard-progress";
import { WizardNavigation } from "./wizard-navigation";
import type { PlanningWithTypedFields } from "@/lib/types";
import { PLANNING_STEPS } from "@/lib/constants/planning";
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

interface PlanningWizardContainerProps {
    initialPlanning?: PlanningWithTypedFields;
    isEditMode?: boolean;
}

// Step registry - maps step number to component
interface StepComponentProps {
    planning: PlanningWithTypedFields;
    onUpdate: (data: Partial<PlanningWithTypedFields>) => void;
    onNext: () => void;
    onBack: () => void;
}

const STEP_COMPONENTS: Record<number, React.ComponentType<StepComponentProps>> = {
    1: BrainDumpStep,
    2: FutureIdentityStep,
    3: WheelVisionStep,
    4: GoalBacklogStep,
    5: AnnualGoalsStep,
    6: GoalDetailsStep,
    7: AntiVisionStep,
    8: FutureLetterStep,
    9: CommitmentStep,
};

export function PlanningWizardContainer({ initialPlanning, isEditMode = false }: PlanningWizardContainerProps) {
    const router = useRouter();
    const {
        planningId,
        currentStep,
        isDirty,
        isSaving,
        loadFromServer,
        nextStep,
        prevStep,
        getFormData,
        markSaving,
        canGoNext,
        canGoBack,
        markAsSaved,
    } = usePlanningStore();

    const { complete, error, setError } = usePlanningCompletion({
        planningId,
        initialPlanningId: initialPlanning?.id,
        isEditMode,
    });

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
            await complete();
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

    const handleExit = async () => {
        // Auto-save before exiting
        if (isDirty && planningId) {
            try {
                await autoSave();
            } catch (error) {
                console.error("Failed to save on exit:", error);
                // The user will still be navigated away, but the error is logged.
            }
        }
        await router.push("/dashboard");
    };

    const isLastStep = currentStep === PLANNING_STEPS.length;

    // Render step using registry pattern
    const renderStep = useMemo(() => {
        const StepComponent = STEP_COMPONENTS[currentStep];
        if (!StepComponent) return null;
        
        // Special handling for CommitmentStep which needs onComplete
        if (currentStep === 9) {
            return <StepComponent onComplete={() => complete()} />;
        }
        
        return <StepComponent />;
    }, [currentStep, complete]);

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
