/**
 * Planning Store
 * 
 * Manages client-side state for the 9-step planning ceremony.
 * Step 1: Empty Your Head + Future Identity
 * Step 2: Wheel of Life Vision
 * Step 3: Letter from Future You (Optional)
 * Step 4: Goal Backlog
 * Step 5: Annual Goals
 * Step 6: Goal Details
 * Step 7: Anti-Vision + Anti-Goals
 * Step 8: Future You Letter
 * Step 9: Commitment
 */

import { create } from "zustand";
import type {
    PlanningFormData,
    SimplifiedGoal,
    AnnualGoal,
    AntiGoal,
} from "@/lib/validators/planning";
import { PlanningStatus } from "@/lib/validators/planning";
import type { PlanningWithTypedFields } from "@/lib/types";

interface PlanningStore {
    // Current wizard state
    planningId: string | null;
    currentStep: number; // Support up to 9 or more dynamically
    year: number;
    isDirty: boolean;
    isSaving: boolean;
    status: PlanningStatus;

    // Step 1: Empty Your Head + Future Identity
    brainDump: string;
    futureIdentity: string;

    // Step 2: Wheel of Life Vision
    targetWheelOfLife: Record<string, number>;
    focusAreas: string[];
    wheelVisionStatements: Record<string, string>; // Per-dimension "what would be true"


    // Step 3: Letter from Future You (Optional)
    futureYouLetter: string;

    // Step 4-6: Goals
    goals: SimplifiedGoal[]; // Full backlog
    annualGoalIds: string[]; // Selected annual goal IDs
    annualGoals: AnnualGoal[]; // Annual goals with details

    // Step 7: Anti-Vision + Anti-Goals
    antiVision: string; // Failure narrative
    antiGoals: AntiGoal[]; // Unlimited list
    driftResponse: string; // If/Then drift response

    // Step 8: Commitment
    commitmentStatement: string;
    signatureName: string;
    signatureImage: string;
    signedAt: Date | null;

    // From Review (for reference)
    previousIdentity: string;
    wheelOfLife: Record<string, number>;

    // Actions - Navigation
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Actions - Step 1: Empty Your Head + Future Identity
    setBrainDump: (text: string) => void;
    setFutureIdentity: (text: string) => void;

    // Actions - Step 2: Wheel Vision
    setTargetWheelOfLife: (targets: Record<string, number>) => void;
    updateTargetDimension: (dimension: string, score: number) => void;
    toggleFocusArea: (area: string) => void;
    setWheelVisionStatement: (dimension: string, statement: string) => void;

    // Actions - Step 3: Letter from Future You
    setFutureYouLetter: (text: string) => void;

    // Actions - Step 4: Goal Backlog
    addGoal: (text: string) => void;
    removeGoal: (id: string) => void;
    updateGoal: (id: string, updates: Partial<SimplifiedGoal>) => void;
    updateGoalCategory: (id: string, category: string) => void;

    // Actions - Step 5: Annual Goals
    setAnnualGoalIds: (ids: string[]) => void;
    toggleAnnualGoal: (id: string) => void;

    // Actions - Step 6: Goal Details
    updateAnnualGoalDetails: (id: string, updates: Partial<AnnualGoal>) => void;

    // Actions - Step 7: Anti-Vision + Anti-Goals
    setAntiVision: (text: string) => void;
    addAntiGoal: (text: string) => void;
    removeAntiGoal: (id: string) => void;
    updateAntiGoal: (id: string, text: string) => void;
    setDriftResponse: (text: string) => void;

    // Actions - Step 8: Commitment
    setCommitmentStatement: (text: string) => void;
    setSignatureName: (name: string) => void;
    setSignatureImage: (base64: string) => void;
    setSignedAt: (date: Date) => void;

    // Actions - Data Management
    loadFromServer: (data: PlanningWithTypedFields) => void;
    reset: () => void;
    getFormData: () => Partial<PlanningFormData>;
    markSaving: (saving: boolean) => void;
    markAsSaved: () => void;

    // Helpers
    getAnnualGoals: () => AnnualGoal[];
    getBacklogGoals: () => SimplifiedGoal[];
    canGoNext: () => boolean;
    canGoBack: () => boolean;
}

export const usePlanningStore = create<PlanningStore>((set, get) => ({
    planningId: null,
    currentStep: 1,
    year: new Date().getFullYear() + 1,
    isDirty: false,
    isSaving: false,
    status: PlanningStatus.DRAFT,

    // Step 1
    brainDump: "",
    futureIdentity: "",

    // Step 2
    targetWheelOfLife: {},
    focusAreas: [],
    wheelVisionStatements: {},

    // Step 3
    futureYouLetter: "",

    // Step 4-6
    goals: [],
    annualGoalIds: [],
    annualGoals: [],

    // Step 7
    antiVision: "",
    antiGoals: [],
    driftResponse: "",

    // Step 8
    commitmentStatement: "",
    signatureName: "",
    signatureImage: "",
    signedAt: null,

    // From Review
    previousIdentity: "",
    wheelOfLife: {},

    setStep: (step) => set({ currentStep: step, isDirty: true }),

    nextStep: () => {
        const state = get();
        if (state.currentStep < 9) {
            set({ currentStep: state.currentStep + 1, isDirty: true });
        }
    },

    prevStep: () => {
        const state = get();
        if (state.currentStep > 1) {
            set({ currentStep: state.currentStep - 1, isDirty: true });
        }
    },

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
    toggleFocusArea: (area) => {
        set((state) => {
            const isSelected = state.focusAreas.includes(area);
            if (isSelected) {
                return { focusAreas: state.focusAreas.filter(a => a !== area), isDirty: true };
            }
            if (state.focusAreas.length >= 3) return state;
            return { focusAreas: [...state.focusAreas, area], isDirty: true };
        });
    },
    setWheelVisionStatement: (dimension, statement) => {
        set((state) => ({
            wheelVisionStatements: { ...state.wheelVisionStatements, [dimension]: statement },
            isDirty: true,
        }));
    },

    // Step 3 Actions
    setFutureYouLetter: (text) => set({ futureYouLetter: text, isDirty: true }),

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

    // Step 7 Actions
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
    setDriftResponse: (text) => set({ driftResponse: text, isDirty: true }),

    // Step 8 Actions
    setCommitmentStatement: (text) => set({ commitmentStatement: text, isDirty: true }),

    setSignatureName: (name) => set({ signatureName: name, isDirty: true }),
    setSignatureImage: (base64) => set({ signatureImage: base64, isDirty: true }),
    setSignedAt: (date) => set({ signedAt: date, isDirty: true }),

    loadFromServer: (data: PlanningWithTypedFields) => {
        // Load all fields from server data
        const goals: SimplifiedGoal[] = (data.goals || []).map((g) => ({
            id: g.id,
            text: g.text || "",
            category: g.category,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : undefined,
        }));

        const annualGoalIds = (data.annualGoalIds || []).map((id: string) => id);

        // Load annual goals with details
        const annualGoals: AnnualGoal[] = (data.annualGoals || []).map((ag) => ({
            id: ag.id,
            text: ag.text || "",
            category: ag.category,
            definitionOfDone: ag.definitionOfDone || "",
            progressSignal: ag.progressSignal || "",
            whyMatters: ag.whyMatters,
            createdAt: ag.createdAt ? new Date(ag.createdAt) : new Date(),
            updatedAt: ag.updatedAt ? new Date(ag.updatedAt) : undefined,
        }));

        const antiGoals: AntiGoal[] = (data.antiGoals || []).map((ag) => ({
            id: ag.id,
            text: ag.text || "",
            createdAt: ag.createdAt ? new Date(ag.createdAt) : undefined,
        }));

        set({
            planningId: data.id,
            year: data.year,
            currentStep: data.currentStep || 1,
            status: (data.status as PlanningStatus) || PlanningStatus.DRAFT,
            brainDump: data.brainDump || "",
            futureIdentity: data.futureIdentity || "",
            targetWheelOfLife: (data.targetWheelOfLife as Record<string, number>) || {},
            focusAreas: data.focusAreas || [],
            wheelVisionStatements: (data.wheelVisionStatements as Record<string, string>) || {},
            futureYouLetter: data.futureYouLetter || "",
            goals,
            annualGoalIds,
            annualGoals,
            antiVision: data.antiVision || "",
            antiGoals,
            driftResponse: data.driftResponse || "",
            commitmentStatement: data.commitmentStatement || "",
            signatureName: data.signatureName || "",
            signatureImage: data.signatureImage || "",
            signedAt: data.signedAt ? new Date(data.signedAt) : null,
            previousIdentity: data.previousIdentity || "",
            wheelOfLife: (data.wheelOfLife as Record<string, number>) || {},
            isDirty: false,
        });
    },

    reset: () => {
        set({
            planningId: null,
            currentStep: 1,
            year: new Date().getFullYear() + 1,
            isDirty: false,
            isSaving: false,
            status: PlanningStatus.DRAFT,
            brainDump: "",
            futureIdentity: "",
            targetWheelOfLife: {},
            focusAreas: [],
            wheelVisionStatements: {},
            futureYouLetter: "",
            goals: [],
            annualGoalIds: [],
            annualGoals: [],
            antiVision: "",
            antiGoals: [],
            driftResponse: "",
            commitmentStatement: "",
            signatureName: "",
            signatureImage: "",
            signedAt: null,
            previousIdentity: "",
            wheelOfLife: {},
        });
    },

    getFormData: () => {
        const state = get();

        return {
            brainDump: state.brainDump || undefined,
            futureIdentity: state.futureIdentity || undefined,
            targetWheelOfLife: Object.keys(state.targetWheelOfLife).length > 0 ? state.targetWheelOfLife : undefined,
            focusAreas: state.focusAreas.length > 0 ? state.focusAreas : undefined,
            wheelVisionStatements: Object.keys(state.wheelVisionStatements).length > 0 ? state.wheelVisionStatements : undefined,
            futureYouLetter: state.futureYouLetter || undefined,
            goals: state.goals.length > 0 ? state.goals : undefined,
            annualGoalIds: state.annualGoalIds.length > 0 ? state.annualGoalIds : undefined,
            annualGoals: state.annualGoals,
            antiVision: state.antiVision || undefined,
            antiGoals: state.antiGoals.length > 0 ? state.antiGoals : undefined,
            driftResponse: state.driftResponse || undefined,
            commitmentStatement: state.commitmentStatement || undefined,
            signatureName: state.signatureName || undefined,
            signatureImage: state.signatureImage || undefined,
            signedAt: state.signedAt || undefined,
            currentStep: state.currentStep,
            status: state.status,
            previousIdentity: state.previousIdentity || undefined,
            wheelOfLife: Object.keys(state.wheelOfLife).length > 0 ? state.wheelOfLife : undefined,
        };
    },

    markSaving: (saving) => set({ isSaving: saving }),
    markAsSaved: () => set({ isDirty: false, isSaving: false }),

    getAnnualGoals: () => {
        const state = get();
        return state.annualGoals.filter(ag => state.annualGoalIds.includes(ag.id));
    },

    getBacklogGoals: () => {
        const state = get();
        return state.goals.filter(g => !state.annualGoalIds.includes(g.id));
    },

    canGoNext: () => {
        const state = get();

        switch (state.currentStep) {
            case 1:
                // Step 1: Brain Dump - Optional, 5-10 lines encouraged but can continue
                return true;
            case 2:
                // Step 2: Future Identity - Required eventually, but "Skip for now" allowed
                return true;
            case 3:
                // Step 3: Wheel Vision - Targets can be default (maintenance) causing empty store state, so allow next.
                return true;
            case 4:
                // Step 4: Goal Backlog - Need at least one goal
                return state.goals.length > 0;
            case 5:
                // Step 5: Annual Goals - Need at least one annual goal selected
                return state.annualGoalIds.length > 0;
            case 6:
                // Step 6: Goal Details - All annual goals need definition of done and progress signal
                return state.annualGoals.every(ag =>
                    ag.definitionOfDone.trim().length > 0
                );
            case 7:
                // Step 7: Anti-Vision - Need at least 3 anti-goals with content
                return state.antiGoals.filter(ag => ag.text.trim().length > 0).length >= 3;
            case 8:
                // Step 8: Future You Letter - Optional
                return true;
            case 9:
                // Step 9: Commitment - Need signature
                return state.signatureImage.trim().length > 0;
            default:
                return false;
        }
    },

    canGoBack: () => {
        return get().currentStep > 1;
    },
}));
