"use client";

import { useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { savePlanningProgressAction } from "@/actions/planning";
import { usePlanningCompletion } from "@/hooks/use-planning-completion";
import { WizardProgress } from "./wizard-progress";
import { WizardNavigation } from "./wizard-navigation";
import type { PlanningWithTypedFields } from "@/lib/types";
import { PLANNING_STEPS } from "@/lib/constants/planning";
import { Loader2 } from "lucide-react";

interface PlanningWizardContainerProps {
    initialPlanning?: PlanningWithTypedFields;
    isEditMode?: boolean;
}

// Lazy load all step components for better performance
const BrainDumpStep = lazy(() => import('./steps/brain-dump').then(module => ({ default: module.BrainDumpStep })));
const FutureIdentityStep = lazy(() => import('./steps/future-identity').then(module => ({ default: module.FutureIdentityStep })));
const WheelVisionStep = lazy(() => import('./steps/wheel-vision').then(module => ({ default: module.WheelVisionStep })));
const FutureLetterStep = lazy(() => import('./steps/future-you-letter').then(module => ({ default: module.FutureLetterStep })));
const GoalBacklogStep = lazy(() => import('./steps/goal-backlog').then(module => ({ default: module.GoalBacklogStep })));
const AnnualGoalsStep = lazy(() => import('./steps/annual-goals').then(module => ({ default: module.AnnualGoalsStep })));
const GoalDetailsStep = lazy(() => import('./steps/goal-details').then(module => ({ default: module.GoalDetailsStep })));
const AntiVisionStep = lazy(() => import('./steps/anti-vision').then(module => ({ default: module.AntiVisionStep })));
const CommitmentStep = lazy(() => import('./steps/commitment').then(module => ({ default: module.CommitmentStep })));

// Step registry - maps step number to component
interface StepComponentProps {
    onNext: () => void;
    onBack: () => void;
    onComplete?: () => void;
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
    const store = usePlanningStore();
    const {
        planningId,
        currentStep,
        isDirty,
        isSaving,
        canGoNext,
        canGoBack,
    } = usePlanningStore(state => ({
        planningId: state.planningId,
        currentStep: state.currentStep,
        isDirty: state.isDirty,
        isSaving: state.isSaving,
        canGoNext: state.canGoNext,
        canGoBack: state.canGoBack,
    }));

    const { complete, error } = usePlanningCompletion({
        planningId,
        initialPlanningId: initialPlanning?.id,
        isEditMode,
    });

    // Load initial data from server into the store, runs only once
    useEffect(() => {
        if (initialPlanning && !store.planningId) {
            store.loadFromServer(initialPlanning);
        }
    }, [initialPlanning, store]);


    // Auto-save on step change (debounced)
    const autoSave = useCallback(async () => {
        const activeId = store.planningId;
        if (!activeId || !store.isDirty) return;

        store.markSaving(true);
        try {
            const formData = store.getFormData();
            await savePlanningProgressAction(activeId, formData);
            store.markAsSaved();
        } catch (error) {
            console.error("Failed to auto-save:", error);
            store.markSaving(false);
        }
    }, [store]);

    // Auto-save when step changes (not during typing)
    useEffect(() => {
        if (currentStep > 1 && isDirty) {
            const timeoutId = setTimeout(() => {
                autoSave();
            }, 2000); // Debounce 2 seconds to avoid interrupting typing

            return () => clearTimeout(timeoutId);
        }
        return undefined;
    }, [currentStep, autoSave, isDirty]);

    const handleNext = useCallback(async () => {
        if (currentStep === PLANNING_STEPS.length) {
            await complete();
        } else {
            store.nextStep();
            if (isDirty && planningId) {
                await autoSave();
            }
        }
    }, [currentStep, complete, store, isDirty, planningId, autoSave]);

    const handleBack = useCallback(() => {
        store.prevStep();
    }, [store]);

    const handleExit = async () => {
        if (isDirty && planningId) {
            try {
                await autoSave();
            } catch (error) {
                console.error("Failed to save on exit:", error);
            }
        }
        router.push("/dashboard");
    };

    const isLastStep = currentStep === PLANNING_STEPS.length;

    // Render step using registry pattern with lazy loading
    const renderStep = useMemo(() => {
        const StepComponent = STEP_COMPONENTS[currentStep];
        if (!StepComponent) return null;

        return <StepComponent
            onNext={handleNext}
            onBack={handleBack}
            onComplete={isLastStep ? complete : undefined}
        />;
    }, [currentStep, complete, isLastStep, handleNext, handleBack]);

    return (
        <div className="min-h-screen flex flex-col p-6 md:p-12">
            <div className="mb-8">
                <WizardProgress
                    currentStep={currentStep}
                    totalSteps={PLANNING_STEPS.length}
                    currentStepName={PLANNING_STEPS[currentStep - 1]?.name}
                    currentStepTime={PLANNING_STEPS[currentStep - 1]?.time}
                    isSaving={isSaving}
                />
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                    <div className="glass-pane p-8 md:p-12">
                        <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-white/40" /></div>}>
                            {renderStep}
                        </Suspense>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-bullshit-crimson/10 border border-bullshit-crimson/30 rounded-xl">
                            <p className="text-bullshit-crimson text-sm font-mono uppercase tracking-widest">
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <WizardNavigation
                    isLastStep={isLastStep}
                    onBack={handleBack}
                    onNext={handleNext}
                    onExit={handleExit}
                    onSkip={currentStep === 2 ? store.nextStep : undefined}
                    canGoBack={canGoBack()}
                    canGoNext={canGoNext()}
                    isSaving={isSaving}
                />
            </div>
        </div>
    );
}
