
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlanningStore } from '../../use-planning-store';

describe('Planning Navigation Slice', () => {
    beforeEach(() => {
        usePlanningStore.getState().reset();
    });

    it('should initialize with step 1', () => {
        expect(usePlanningStore.getState().currentStep).toBe(1);
    });

    it('should increment step on nextStep', () => {
        usePlanningStore.getState().nextStep();
        expect(usePlanningStore.getState().currentStep).toBe(2);
    });

    it('should decrement step on prevStep', () => {
        usePlanningStore.getState().setStep(3);
        usePlanningStore.getState().prevStep();
        expect(usePlanningStore.getState().currentStep).toBe(2);
    });

    it('should not go below step 1', () => {
        usePlanningStore.getState().prevStep();
        expect(usePlanningStore.getState().currentStep).toBe(1);
    });

    it('should not go above max steps (9)', () => {
        usePlanningStore.getState().setStep(9);
        usePlanningStore.getState().nextStep();
        expect(usePlanningStore.getState().currentStep).toBe(9);
    });

    it('should mark as dirty on step change', () => {
        expect(usePlanningStore.getState().isDirty).toBe(false);
        usePlanningStore.getState().nextStep();
        expect(usePlanningStore.getState().isDirty).toBe(true);
    });

    describe('Computed Properties', () => {
        it('should return true for canGoBack when step > 1', () => {
            usePlanningStore.getState().setStep(2);
            expect(usePlanningStore.getState().canGoBack()).toBe(true);
        });

        it('should return false for canGoBack at step 1', () => {
            usePlanningStore.getState().setStep(1);
            expect(usePlanningStore.getState().canGoBack()).toBe(false);
        });

        it('should return correct value for canGoNext based on validation logic', () => {
            // Step 4 requires goals
            usePlanningStore.getState().setStep(4);
            expect(usePlanningStore.getState().canGoNext()).toBe(false);

            usePlanningStore.getState().addGoal('Test Goal');
            expect(usePlanningStore.getState().canGoNext()).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid transitions correctly', () => {
            usePlanningStore.getState().nextStep(); // 2
            usePlanningStore.getState().nextStep(); // 3
            usePlanningStore.getState().nextStep(); // 4
            expect(usePlanningStore.getState().currentStep).toBe(4);

            usePlanningStore.getState().prevStep(); // 3
            usePlanningStore.getState().prevStep(); // 2
            expect(usePlanningStore.getState().currentStep).toBe(2);
        });

        it('should allow setStep to arbitrary values (current behavior documentation)', () => {
            // documenting current behavior where setStep has no internal validation
            usePlanningStore.getState().setStep(99);
            expect(usePlanningStore.getState().currentStep).toBe(99);

            usePlanningStore.getState().setStep(0);
            expect(usePlanningStore.getState().currentStep).toBe(0);

            usePlanningStore.getState().setStep(-1);
            expect(usePlanningStore.getState().currentStep).toBe(-1);
        });
    });
});
