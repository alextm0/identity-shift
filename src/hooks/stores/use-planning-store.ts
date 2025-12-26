/**
 * Planning Store
 * 
 * Manages client-side state for planning form and data.
 * Used for form state management and optimistic updates.
 */

import { create } from "zustand";
import { PlanningFormData } from "@/lib/validators";

interface PlanningStore {
    // Form state
    formData: Partial<PlanningFormData> | null;
    isDirty: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setFormData: (data: Partial<PlanningFormData>) => void;
    resetForm: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    markDirty: (dirty: boolean) => void;
}

export const usePlanningStore = create<PlanningStore>((set) => ({
    formData: null,
    isDirty: false,
    isLoading: false,
    error: null,

    setFormData: (data) => set({ formData: data, isDirty: true }),
    resetForm: () => set({ formData: null, isDirty: false, error: null }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    markDirty: (dirty) => set({ isDirty: dirty }),
}));

