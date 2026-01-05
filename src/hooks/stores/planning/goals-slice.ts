
import type { StateCreator } from "zustand";
import type { PlanningStore, PlanningGoalsSlice } from "./types";
import type { SimplifiedGoal, AnnualGoal } from "@/lib/validators/planning";

export const createPlanningGoalsSlice: StateCreator<
    PlanningStore,
    [],
    [],
    PlanningGoalsSlice
> = (set, get) => ({
    // State
    goals: [],
    annualGoalIds: [],
    annualGoals: [],

    // Step 4 Actions
    addGoal: (text) => {
        const goal: SimplifiedGoal = {
            id: crypto.randomUUID(),
            text,
            createdAt: new Date(),
        };
        set((state) => ({
            goals: [...state.goals, goal],
            isDirty: true,
        }));
    },
    removeGoal: (id) => {
        set((state) => ({
            goals: state.goals.filter(g => g.id !== id),
            annualGoalIds: state.annualGoalIds.filter(gid => gid !== id),
            annualGoals: state.annualGoals.filter(g => g.id !== id),
            isDirty: true,
        }));
    },
    updateGoal: (id, updates) => {
        set((state) => ({
            goals: state.goals.map(g =>
                g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
            ),
            isDirty: true,
        }));
    },
    updateGoalCategory: (id, category) => {
        // Reuse updateGoal
        get().updateGoal(id, { category });
    },

    // Step 5 Actions
    setAnnualGoalIds: (ids) => {
        set((state) => {
            // Convert selected goals to annual goals with empty details
            const newAnnualGoals: AnnualGoal[] = ids.map(goalId => {
                const existing = state.annualGoals.find(ag => ag.id === goalId);
                const goal = state.goals.find(g => g.id === goalId);
                if (existing) return existing;
                if (goal) {
                    return {
                        id: goal.id,
                        text: goal.text,
                        category: goal.category,
                        definitionOfDone: "",
                        progressSignal: "",
                        whyMatters: undefined,
                        createdAt: goal.createdAt,
                        updatedAt: new Date(),
                    };
                }
                return null;
            }).filter((g): g is AnnualGoal => g !== null);

            return {
                annualGoalIds: ids,
                annualGoals: newAnnualGoals,
                isDirty: true,
            };
        });
    },
    toggleAnnualGoal: (id) => {
        set((state) => {
            const isSelected = state.annualGoalIds.includes(id);
            const newIds = isSelected
                ? state.annualGoalIds.filter(gid => gid !== id)
                : [...state.annualGoalIds, id];

            // Update annual goals list
            const newAnnualGoals: AnnualGoal[] = newIds.map(goalId => {
                const existing = state.annualGoals.find(ag => ag.id === goalId);
                const goal = state.goals.find(g => g.id === goalId);
                if (existing) return existing;
                if (goal) {
                    return {
                        id: goal.id,
                        text: goal.text,
                        category: goal.category,
                        definitionOfDone: "",
                        progressSignal: "",
                        whyMatters: undefined,
                        createdAt: goal.createdAt,
                        updatedAt: new Date(),
                    };
                }
                return null;
            }).filter((g): g is AnnualGoal => g !== null);

            return {
                annualGoalIds: newIds,
                annualGoals: newAnnualGoals,
                isDirty: true,
            };
        });
    },

    // Step 6 Actions
    updateAnnualGoalDetails: (id, updates) => {
        set((state) => ({
            annualGoals: state.annualGoals.map(ag =>
                ag.id === id ? { ...ag, ...updates, updatedAt: new Date() } : ag
            ),
            isDirty: true,
        }));
    },

    // Helpers
    getAnnualGoals: () => {
        const state = get();
        return state.annualGoals.filter(ag => state.annualGoalIds.includes(ag.id));
    },

    getBacklogGoals: () => {
        const state = get();
        return state.goals.filter(g => !state.annualGoalIds.includes(g.id));
    },
});
