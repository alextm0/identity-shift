
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
});
