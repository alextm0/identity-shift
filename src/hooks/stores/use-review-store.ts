/**
 * Review Store
 * 
 * Manages client-side state for the yearly review wizard.
 * Used for form state management and optimistic updates.
 */

import { create } from "zustand";
import { YearlyReviewFormData, LIFE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/validators/yearly-review";
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
    // New fields
    wins: string[];
    otherDetails: string;
    // Deprecated fields (kept for migration)
    bigThreeWins: [string, string, string];
    damnGoodDecision: string;
    generatedNarrative: string;
    
    // Actions
    setStep: (step: number) => void;
    setWheelRating: (dimension: string, value: number) => void;
    setWheelWin: (dimension: string, text: string) => void;
    setWheelGap: (dimension: string, text: string) => void;
    // New actions
    addWin: () => void;
    removeWin: (index: number) => void;
    updateWin: (index: number, text: string) => void;
    setOtherDetails: (text: string) => void;
    // Deprecated actions (kept for migration)
    setBigThreeWin: (index: 0 | 1 | 2, text: string) => void;
    setDamnGoodDecision: (text: string) => void;
    setNarrative: (text: string) => void;
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
    // Deprecated fields (kept for migration)
    bigThreeWins: ["", "", ""],
    damnGoodDecision: "",
    generatedNarrative: "",
    
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
        set({ wins, isDirty: true });
    },
    
    setOtherDetails: (text) => set({ otherDetails: text, isDirty: true }),
    
    // Deprecated actions (kept for migration)
    setBigThreeWin: (index, text) => {
        const wins = [...get().bigThreeWins] as [string, string, string];
        wins[index] = text;
        set({ bigThreeWins: wins, isDirty: true });
    },
    
    setDamnGoodDecision: (text) => set({ damnGoodDecision: text, isDirty: true }),
    
    setNarrative: (text) => set({ generatedNarrative: text, isDirty: true }),
    
    loadFromServer: (data) => {
        // Migrate old data if needed
        let wins: string[] = [""];
        let otherDetails = "";
        
        // Check if new fields exist
        if (data.wins && Array.isArray(data.wins) && data.wins.length > 0) {
            wins = data.wins.filter(w => w && w.trim());
            if (wins.length === 0) wins = [""];
        } else if (data.bigThreeWins) {
            // Migrate from old bigThreeWins
            wins = (data.bigThreeWins as string[]).filter(w => w && w.trim());
            if (wins.length === 0) wins = [""];
        }
        
        if (data.otherDetails) {
            otherDetails = data.otherDetails;
        } else if (data.damnGoodDecision) {
            // Migrate from old damnGoodDecision
            otherDetails = data.damnGoodDecision;
        }
        
        set({
            reviewId: data.id,
            currentStep: data.currentStep,
            wheelRatings: data.wheelRatings || { ...initialWheelRatings },
            wheelWins: data.wheelWins || { ...initialWheelAudit },
            wheelGaps: data.wheelGaps || { ...initialWheelAudit },
            wins,
            otherDetails,
            // Keep deprecated fields for backward compatibility
            bigThreeWins: data.bigThreeWins || ["", "", ""],
            damnGoodDecision: data.damnGoodDecision || "",
            generatedNarrative: data.generatedNarrative || "",
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
            bigThreeWins: ["", "", ""],
            damnGoodDecision: "",
            generatedNarrative: "",
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
        
        // Deprecated fields (kept for migration compatibility)
        if (state.bigThreeWins.some(w => w && w.trim())) {
            formData.bigThreeWins = [
                state.bigThreeWins[0] || "",
                state.bigThreeWins[1] || "",
                state.bigThreeWins[2] || "",
            ] as [string, string, string];
        }
        
        if (state.damnGoodDecision.trim()) {
            formData.damnGoodDecision = state.damnGoodDecision;
        }
        
        if (state.generatedNarrative.trim()) {
            formData.generatedNarrative = state.generatedNarrative;
        }
        
        return formData;
    },
    
    markSaving: (saving) => set({ isSaving: saving }),
}));

