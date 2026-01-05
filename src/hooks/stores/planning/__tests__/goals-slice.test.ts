
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
});
