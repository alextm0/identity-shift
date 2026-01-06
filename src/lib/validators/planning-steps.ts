
import type { SimplifiedGoal, AnnualGoal, AntiGoal } from "@/lib/validators/planning";

interface PlanningState {
    currentStep: number;
    goals: SimplifiedGoal[];
    annualGoalIds: string[];
    annualGoals: AnnualGoal[];
    antiGoals: AntiGoal[];
    signatureImage: string;
}

export const canGoNextStep = (state: PlanningState): boolean => {
    switch (state.currentStep) {
        case 1:
            // Step 1: Brain Dump - Optional, 5-10 lines encouraged but can continue
            return true;
        case 2:
            // Step 2: Future Identity - Required eventually, but "Skip for now" allowed
            return true;
        case 3:
            // Step 3: Wheel Vision - Targets can be default (maintenance) causing empty store state, so allow next.
            return true;
        case 4:
            // Step 4: Goal Backlog - Need at least one goal
            return state.goals.length > 0;
        case 5:
            // Step 5: Annual Goals - Need at least one annual goal selected
            return state.annualGoalIds.length > 0;
        case 6:
            // Step 6: Goal Details - All annual goals need definition of done and progress signal
            return state.annualGoals.every(ag =>
                ag.definitionOfDone.trim().length > 0
            );
        case 7:
            // Step 7: Anti-Vision - Need at least 3 anti-goals with content
            return state.antiGoals.filter(ag => ag.text.trim().length > 0).length >= 3;
        case 8:
            // Step 8: Future You Letter - Optional
            return true;
        case 9:
            // Step 9: Commitment - Need signature
            return state.signatureImage.trim().length > 0;
        default:
            return false;
    }
};

export const canGoBackStep = (currentStep: number): boolean => {
    return currentStep > 1;
};
