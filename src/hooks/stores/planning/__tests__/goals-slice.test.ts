
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlanningStore } from '../../use-planning-store';

describe('Planning Goals Slice', () => {
    beforeEach(() => {
        usePlanningStore.getState().reset();
    });

    it('should add a goal', () => {
        usePlanningStore.getState().addGoal('Test Goal');
        const goals = usePlanningStore.getState().goals;
        expect(goals).toHaveLength(1);
        expect(goals[0].text).toBe('Test Goal');
        expect(usePlanningStore.getState().isDirty).toBe(true);
    });

    it('should remove a goal', () => {
        usePlanningStore.getState().addGoal('Goal 1');
        const id = usePlanningStore.getState().goals[0].id;
        usePlanningStore.getState().removeGoal(id);
        expect(usePlanningStore.getState().goals).toHaveLength(0);
    });

    it('should update a goal', () => {
        usePlanningStore.getState().addGoal('Goal 1');
        const id = usePlanningStore.getState().goals[0].id;
        usePlanningStore.getState().updateGoal(id, { text: 'Updated Goal' });
        expect(usePlanningStore.getState().goals[0].text).toBe('Updated Goal');
    });

    it('should toggle annual goal selection', () => {
        usePlanningStore.getState().addGoal('Backlog Goal');
        const id = usePlanningStore.getState().goals[0].id;

        // Toggle On
        usePlanningStore.getState().toggleAnnualGoal(id);
        expect(usePlanningStore.getState().annualGoalIds).toContain(id);
        expect(usePlanningStore.getState().annualGoals).toHaveLength(1);
        expect(usePlanningStore.getState().annualGoals[0].id).toBe(id);

        // Toggle Off
        usePlanningStore.getState().toggleAnnualGoal(id);
        expect(usePlanningStore.getState().annualGoalIds).not.toContain(id);
        expect(usePlanningStore.getState().annualGoals).toHaveLength(0);
    });

    it('should update annual goal details', () => {
        usePlanningStore.getState().addGoal('Goal 1');
        const id = usePlanningStore.getState().goals[0].id;
        usePlanningStore.getState().toggleAnnualGoal(id);

        usePlanningStore.getState().updateAnnualGoalDetails(id, { definitionOfDone: 'Done when...' });

        expect(usePlanningStore.getState().annualGoals[0].definitionOfDone).toBe('Done when...');
        // Backlog goal should remain unchanged
        expect(usePlanningStore.getState().goals[0]).not.toHaveProperty('definitionOfDone');
    });

    describe('Selectors', () => {
        it('should correctly separate annual goals and backlog goals', () => {
            usePlanningStore.getState().addGoal('Goal A');
            usePlanningStore.getState().addGoal('Goal B');
            const idA = usePlanningStore.getState().goals[0].id;
            const idB = usePlanningStore.getState().goals[1].id;

            usePlanningStore.getState().toggleAnnualGoal(idA);

            const annualGoals = usePlanningStore.getState().getAnnualGoals();
            const backlogGoals = usePlanningStore.getState().getBacklogGoals();

            expect(annualGoals).toHaveLength(1);
            expect(annualGoals[0].id).toBe(idA);
            expect(backlogGoals).toHaveLength(1);
            expect(backlogGoals[0].id).toBe(idB);
        });
    });

    describe('Edge Cases and Errors', () => {
        it('should not add goal with empty text', () => {
            usePlanningStore.getState().addGoal('');
            expect(usePlanningStore.getState().goals).toHaveLength(0);
        });

        it('should not crash when removing non-existent goal', () => {
            const initialLength = usePlanningStore.getState().goals.length;
            usePlanningStore.getState().removeGoal('non-existent-id');
            expect(usePlanningStore.getState().goals).toHaveLength(initialLength);
        });

        it('should not crash when updating non-existent goal', () => {
            usePlanningStore.getState().addGoal('Actual Goal');
            usePlanningStore.getState().updateGoal('non-existent-id', { text: 'N/A' });
            expect(usePlanningStore.getState().goals[0].text).toBe('Actual Goal');
        });

        it('should handle invalid IDs in setAnnualGoalIds', () => {
            usePlanningStore.getState().addGoal('Goal 1');
            const id1 = usePlanningStore.getState().goals[0].id;

            usePlanningStore.getState().setAnnualGoalIds([id1, 'invalid-id']);

            expect(usePlanningStore.getState().annualGoalIds).toEqual([id1, 'invalid-id']);
            // But annualGoals list should only contain the valid one
            expect(usePlanningStore.getState().annualGoals).toHaveLength(1);
            expect(usePlanningStore.getState().annualGoals[0].id).toBe(id1);
        });
    });
});
