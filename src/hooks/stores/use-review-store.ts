/**
 * Review Store
 * 
 * Manages client-side state for the yearly review wizard.
 * Used for form state management and optimistic updates.
 */

import { create } from "zustand";
import { YearlyReviewFormData, LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import type { YearlyReviewWithTypedFields } from "@/lib/types";

interface ReviewStore {
    // Current wizard state
    currentStep: number;
    reviewId: string | null;
    isDirty: boolean;
    isSaving: boolean;

    // Step data
    wheelRatings: Record<string, number>;
    wheelWins: Record<string, string>;
    wheelGaps: Record<string, string>;
    wins: string[];
    otherDetails: string;

    // Actions
    setStep: (step: number) => void;
    setWheelRating: (dimension: string, value: number) => void;
    setWheelWin: (dimension: string, text: string) => void;
    setWheelGap: (dimension: string, text: string) => void;
    addWin: () => void;
    removeWin: (index: number) => void;
    updateWin: (index: number, text: string) => void;
    setWins: (wins: string[]) => void;
    resetWins: (wins: string[]) => void;
    setOtherDetails: (text: string) => void;
    loadFromServer: (data: YearlyReviewWithTypedFields) => void;
    reset: () => void;
    getFormData: () => Partial<YearlyReviewFormData>;
    markSaving: (saving: boolean) => void;
}

const initialWheelRatings: Record<string, number> = {};
LIFE_DIMENSIONS.forEach(dim => {
    initialWheelRatings[dim] = 5; // Default to baseline
});

const initialWheelAudit: Record<string, string> = {};
LIFE_DIMENSIONS.forEach(dim => {
    initialWheelAudit[dim] = "";
});

export const useReviewStore = create<ReviewStore>((set, get) => ({
    currentStep: 1,
    reviewId: null,
    isDirty: false,
    isSaving: false,

    wheelRatings: { ...initialWheelRatings },
    wheelWins: { ...initialWheelAudit },
    wheelGaps: { ...initialWheelAudit },
    wins: [""], // Start with one empty win
    otherDetails: "",

    setStep: (step) => set({ currentStep: step, isDirty: true }),

    setWheelRating: (dimension, value) => {
        const currentState = get();
        // Only update if value actually changed to prevent unnecessary re-renders
        if (currentState.wheelRatings[dimension] !== value) {
            const ratings = { ...currentState.wheelRatings };
            ratings[dimension] = value;
            set({ wheelRatings: ratings, isDirty: true });
        }
    },

    setWheelWin: (dimension, text) => {
        const wins = { ...get().wheelWins };
        wins[dimension] = text;
        set({ wheelWins: wins, isDirty: true });
    },

    setWheelGap: (dimension, text) => {
        const gaps = { ...get().wheelGaps };
        gaps[dimension] = text;
        set({ wheelGaps: gaps, isDirty: true });
    },

    addWin: () => {
        const wins = [...get().wins];
        wins.push("");
        set({ wins, isDirty: true });
    },

    removeWin: (index) => {
        const wins = [...get().wins];
        wins.splice(index, 1);
        // Ensure at least one empty win remains if all were removed
        if (wins.length === 0) {
            wins.push("");
        }
        set({ wins, isDirty: true });
    },

    updateWin: (index, text) => {
        const wins = [...get().wins];
        wins[index] = text;
        set({ wins: wins, isDirty: true });
    },

    setWins: (wins) => set({ wins: [...wins], isDirty: true }),

    resetWins: (wins) => set({ wins: [...wins], isDirty: false }),

    setOtherDetails: (text) => set({ otherDetails: text, isDirty: true }),

    loadFromServer: (data) => {
        // Use new fields
        const wins = data.wins && Array.isArray(data.wins) && data.wins.length > 0
            ? data.wins.filter(w => w && w.trim())
            : [""];
        const otherDetails = data.otherDetails || "";

        set({
            reviewId: data.id,
            currentStep: data.currentStep,
            wheelRatings: data.wheelRatings || { ...initialWheelRatings },
            wheelWins: data.wheelWins || { ...initialWheelAudit },
            wheelGaps: data.wheelGaps || { ...initialWheelAudit },
            wins: wins.length > 0 ? wins : [""],
            otherDetails,
            isDirty: false,
        });
    },

    reset: () => {
        set({
            currentStep: 1,
            reviewId: null,
            isDirty: false,
            isSaving: false,
            wheelRatings: { ...initialWheelRatings },
            wheelWins: { ...initialWheelAudit },
            wheelGaps: { ...initialWheelAudit },
            wins: [""],
            otherDetails: "",
        });
    },

    getFormData: () => {
        const state = get();
        // Only include fields that have actual data (not just defaults)
        const formData: Partial<YearlyReviewFormData> = {
            currentStep: state.currentStep,
        };

        // Include wheelRatings if any are set (not just defaults)
        const hasCustomRatings = Object.entries(state.wheelRatings).some(([key, value]) =>
            value !== initialWheelRatings[key]
        );
        if (hasCustomRatings || Object.keys(state.wheelRatings).length > 0) {
            formData.wheelRatings = state.wheelRatings;
        }

        // Include wheelWins if any have content
        if (Object.values(state.wheelWins).some(v => v.trim())) {
            formData.wheelWins = state.wheelWins;
        }

        // Include wheelGaps if any have content
        if (Object.values(state.wheelGaps).some(v => v.trim())) {
            formData.wheelGaps = state.wheelGaps;
        }

        // Include wins if any have content (filter empty strings)
        const nonEmptyWins = state.wins.filter(w => w && w.trim());
        if (nonEmptyWins.length > 0) {
            formData.wins = nonEmptyWins;
        }

        if (state.otherDetails.trim()) {
            formData.otherDetails = state.otherDetails;
        }

        return formData;
    },

    markSaving: (saving) => set({ isSaving: saving }),
}));

