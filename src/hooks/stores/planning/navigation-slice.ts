
import type { StateCreator } from "zustand";
import type { PlanningStore, PlanningNavigationSlice } from "./types";
import { canGoNextStep, canGoBackStep } from "@/lib/validators/planning-steps";

export const createPlanningNavigationSlice: StateCreator<
    PlanningStore,
    [],
    [],
    PlanningNavigationSlice
> = (set, get) => ({
    currentStep: 1,

    setStep: (step) => set({ currentStep: step, isDirty: true }),

    nextStep: () => {
        const currentStep = get().currentStep;
        if (currentStep < 9) { // Hardcoded 9, should ideally be dynamic but following original pattern
            set({ currentStep: currentStep + 1, isDirty: true });
        }
    },

    prevStep: () => {
        const currentStep = get().currentStep;
        if (currentStep > 1) {
            set({ currentStep: currentStep - 1, isDirty: true });
        }
    },

    canGoNext: () => {
        const state = get();
        return canGoNextStep({
            currentStep: state.currentStep,
            goals: state.goals,
            annualGoalIds: state.annualGoalIds,
            annualGoals: state.annualGoals,
            antiGoals: state.antiGoals,
            signatureImage: state.signatureImage,
        });
    },

    canGoBack: () => {
        return canGoBackStep(get().currentStep);
    },
});
