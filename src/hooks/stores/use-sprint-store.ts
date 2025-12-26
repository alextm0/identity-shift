/**
 * Sprint Store
 * 
 * Manages client-side state for sprint data and operations.
 * Used for active sprint tracking, list management, and optimistic updates.
 */

import { create } from "zustand";
import { SprintFormData } from "@/lib/validators";

interface SprintStore {
    // Active sprint
    activeSprint: any | null;
    isLoading: boolean;
    error: string | null;

    // Form state
    formData: Partial<SprintFormData> | null;
    isDirty: boolean;

    // Actions
    setActiveSprint: (sprint: any | null) => void;
    setFormData: (data: Partial<SprintFormData>) => void;
    resetForm: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    markDirty: (dirty: boolean) => void;
}

export const useSprintStore = create<SprintStore>((set) => ({
    activeSprint: null,
    isLoading: false,
    error: null,
    formData: null,
    isDirty: false,

    setActiveSprint: (sprint) => set({ activeSprint: sprint }),
    setFormData: (data) => set({ formData: data, isDirty: true }),
    resetForm: () => set({ formData: null, isDirty: false, error: null }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    markDirty: (dirty) => set({ isDirty: dirty }),
}));

