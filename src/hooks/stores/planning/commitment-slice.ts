
import type { StateCreator } from "zustand";
import type { PlanningStore, PlanningCommitmentSlice } from "./types";

export const createPlanningCommitmentSlice: StateCreator<
    PlanningStore,
    [],
    [],
    PlanningCommitmentSlice
> = (set) => ({
    commitmentStatement: "",
    signatureImage: "",
    signedAt: null,

    setCommitmentStatement: (text) => set({ commitmentStatement: text, isDirty: true }),
    setSignatureImage: (base64) => set({ signatureImage: base64, isDirty: true }),
    setSignedAt: (date) => set({ signedAt: date, isDirty: true }),
});
