
import type { StateCreator } from "zustand";
import type { PlanningStore, PlanningAntiSlice } from "./types";
import type { AntiGoal } from "@/lib/validators/planning";

export const createPlanningAntiSlice: StateCreator<
    PlanningStore,
    [],
    [],
    PlanningAntiSlice
> = (set) => ({
    antiVision: "",
    antiGoals: [],

    setAntiVision: (text) => set({ antiVision: text, isDirty: true }),
    addAntiGoal: (text) => {
        const antiGoal: AntiGoal = {
            id: crypto.randomUUID(),
            text,
            createdAt: new Date(),
        };
        set((state) => ({
            antiGoals: [...state.antiGoals, antiGoal],
            isDirty: true,
        }));
    },
    removeAntiGoal: (id) => {
        set((state) => ({
            antiGoals: state.antiGoals.filter(ag => ag.id !== id),
            isDirty: true,
        }));
    },
    updateAntiGoal: (id, text) => {
        set((state) => ({
            antiGoals: state.antiGoals.map(ag =>
                ag.id === id ? { ...ag, text } : ag
            ),
            isDirty: true,
        }));
    },
});
