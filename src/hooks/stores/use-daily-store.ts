/**
 * Daily Log Store
 * 
 * Manages client-side state for daily log form and temporary data.
 * Used for form state management, temporary storage, and optimistic updates.
 */

import { create } from "zustand";
import { DailyLogFormData } from "@/lib/validators";

interface DailyStore {
    // Form state
    formData: Partial<DailyLogFormData> | null;
    isDirty: boolean;
    isLoading: boolean;
    error: string | null;

    // Temporary data (e.g., unsaved changes)
    temporaryData: Partial<DailyLogFormData> | null;

    // Actions
    setFormData: (data: Partial<DailyLogFormData>) => void;
    setTemporaryData: (data: Partial<DailyLogFormData> | null) => void;
    resetForm: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    markDirty: (dirty: boolean) => void;
}

export const useDailyStore = create<DailyStore>((set) => ({
    formData: null,
    isDirty: false,
    isLoading: false,
    error: null,
    temporaryData: null,

    setFormData: (data) => set({ formData: data, isDirty: true }),
    setTemporaryData: (data) => set({ temporaryData: data }),
    resetForm: () => set({ formData: null, temporaryData: null, isDirty: false, error: null }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    markDirty: (dirty) => set({ isDirty: dirty }),
}));

