
import type { StateCreator } from "zustand";
import type { PlanningStore, PlanningSyncSlice } from "./types";
import { PlanningStatus } from "@/lib/validators/planning";
import { getCurrentReviewAndPlanningYears } from "@/lib/date-utils";
import type { SimplifiedGoal, AnnualGoal, AntiGoal } from "@/lib/validators/planning";

export const createPlanningSyncSlice: StateCreator<
    PlanningStore,
    [],
    [],
    PlanningSyncSlice
> = (set, get) => ({
    planningId: null,
    year: getCurrentReviewAndPlanningYears().planningYear,
    status: PlanningStatus.DRAFT,
    isDirty: false,
    isSaving: false,

    loadFromServer: (data) => {
        // Load all fields from server data
        const goals: SimplifiedGoal[] = (data.goals || []).map((g) => ({
            id: g.id,
            text: g.text || "",
            category: g.category,
            createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
            updatedAt: g.updatedAt ? new Date(g.updatedAt) : undefined,
        }));

        const annualGoalIds = data.annualGoalIds || [];

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
            createdAt: ag.createdAt ? new Date(ag.createdAt) : new Date(),
        }));

        set({
            planningId: data.id,
            year: data.year,
            currentStep: data.currentStep || 1,
            status: (data.status as PlanningStatus) || PlanningStatus.DRAFT,
            brainDump: data.brainDump || "",
            futureIdentity: data.futureIdentity || "",
            targetWheelOfLife: (data.targetWheelOfLife as Record<string, number>) || {},
            wheelVisionStatements: (data.wheelVisionStatements as Record<string, string>) || {},
            futureYouLetter: data.futureYouLetter || "",
            goals,
            annualGoalIds,
            annualGoals,
            antiVision: data.antiVision || "",
            antiGoals,
            commitmentStatement: data.commitmentStatement || "",
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
            year: getCurrentReviewAndPlanningYears().planningYear,
            isDirty: false,
            isSaving: false,
            status: PlanningStatus.DRAFT,
            brainDump: "",
            futureIdentity: "",
            targetWheelOfLife: {},
            wheelVisionStatements: {},
            futureYouLetter: "",
            goals: [],
            annualGoalIds: [],
            annualGoals: [],
            antiVision: "",
            antiGoals: [],
            commitmentStatement: "",
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
            wheelVisionStatements: Object.keys(state.wheelVisionStatements).length > 0 ? state.wheelVisionStatements : undefined,
            futureYouLetter: state.futureYouLetter || undefined,
            goals: state.goals.length > 0 ? state.goals : undefined,
            annualGoalIds: state.annualGoalIds.length > 0 ? state.annualGoalIds : undefined,
            annualGoals: state.annualGoals.length > 0 ? state.annualGoals : undefined,
            antiVision: state.antiVision || undefined,
            antiGoals: state.antiGoals.length > 0 ? state.antiGoals : undefined,
            commitmentStatement: state.commitmentStatement || undefined,
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
});
