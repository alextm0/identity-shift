
import type { StateCreator } from "zustand";
import type { PlanningStore, PlanningFormSlice } from "./types";

export const createPlanningFormSlice: StateCreator<
    PlanningStore,
    [],
    [],
    PlanningFormSlice
> = (set) => ({
    // Step 1
    brainDump: "",
    futureIdentity: "",
    // Step 2
    targetWheelOfLife: {},
    wheelVisionStatements: {},
    // Step 3
    futureYouLetter: "",
    // From Review
    previousIdentity: "",
    wheelOfLife: {},

    // Step 1 Actions
    setBrainDump: (text) => set({ brainDump: text, isDirty: true }),
    setFutureIdentity: (text) => set({ futureIdentity: text, isDirty: true }),

    // Step 2 Actions
    setTargetWheelOfLife: (targets) => set({ targetWheelOfLife: targets, isDirty: true }),
    updateTargetDimension: (dimension, score) => {
        set((state) => ({
            targetWheelOfLife: { ...state.targetWheelOfLife, [dimension]: score },
            isDirty: true,
        }));
    },
    setWheelVisionStatement: (dimension, statement) => {
        set((state) => ({
            wheelVisionStatements: { ...state.wheelVisionStatements, [dimension]: statement },
            isDirty: true,
        }));
    },

    // Step 3 Actions
    setFutureYouLetter: (text) => set({ futureYouLetter: text, isDirty: true }),
});
