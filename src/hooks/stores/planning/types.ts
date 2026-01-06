
import type {
    PlanningFormData,
    SimplifiedGoal,
    AnnualGoal,
    AntiGoal,
    WheelOfLifeCategory,
    PlanningStatus,
} from "@/lib/validators/planning";
import type { PlanningWithTypedFields } from "@/lib/types";

// --- Navigation Slice ---
export interface PlanningNavigationState {
    currentStep: number;
}
export interface PlanningNavigationActions {
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    canGoNext: () => boolean;
    canGoBack: () => boolean;
}
export type PlanningNavigationSlice = PlanningNavigationState & PlanningNavigationActions;

// --- Sync Slice ---
export interface PlanningSyncState {
    planningId: string | null;
    year: number;
    status: PlanningStatus;
    isDirty: boolean;
    isSaving: boolean;
}
export interface PlanningSyncActions {
    loadFromServer: (data: PlanningWithTypedFields) => void;
    reset: () => void;
    getFormData: () => Partial<PlanningFormData>;
    markSaving: (saving: boolean) => void;
    markAsSaved: () => void;
}
export type PlanningSyncSlice = PlanningSyncState & PlanningSyncActions;

// --- Form Slice (Steps 1, 2, 3 + Review Data) ---
export interface PlanningFormState {
    // Step 1
    brainDump: string;
    futureIdentity: string;
    // Step 2
    targetWheelOfLife: Record<string, number>;
    wheelVisionStatements: Record<string, string>;
    // Step 3
    futureYouLetter: string;
    // From Review
    previousIdentity: string;
    wheelOfLife: Record<string, number>;
}
export interface PlanningFormActions {
    // Step 1
    setBrainDump: (text: string) => void;
    setFutureIdentity: (text: string) => void;
    // Step 2
    setTargetWheelOfLife: (targets: Record<string, number>) => void;
    updateTargetDimension: (dimension: string, score: number) => void;
    setWheelVisionStatement: (dimension: string, statement: string) => void;
    // Step 3
    setFutureYouLetter: (text: string) => void;
}
export type PlanningFormSlice = PlanningFormState & PlanningFormActions;

// --- Goals Slice (Steps 4, 5, 6) ---
export interface PlanningGoalsState {
    goals: SimplifiedGoal[];
    annualGoalIds: string[];
    annualGoals: AnnualGoal[];
}
export interface PlanningGoalsActions {
    // Step 4
    addGoal: (text: string) => void;
    removeGoal: (id: string) => void;
    updateGoal: (id: string, updates: Partial<SimplifiedGoal>) => void;
    updateGoalCategory: (id: string, category: WheelOfLifeCategory | undefined) => void;
    // Step 5
    setAnnualGoalIds: (ids: string[]) => void;
    toggleAnnualGoal: (id: string) => void;
    // Step 6
    updateAnnualGoalDetails: (id: string, updates: Partial<AnnualGoal>) => void;
    // Helpers
    getAnnualGoals: () => AnnualGoal[];
    getBacklogGoals: () => SimplifiedGoal[];
}
export type PlanningGoalsSlice = PlanningGoalsState & PlanningGoalsActions;

// --- Anti Slice (Step 7) ---
export interface PlanningAntiState {
    antiVision: string;
    antiGoals: AntiGoal[];
}
export interface PlanningAntiActions {
    setAntiVision: (text: string) => void;
    addAntiGoal: (text: string) => void;
    removeAntiGoal: (id: string) => void;
    updateAntiGoal: (id: string, text: string) => void;
}
export type PlanningAntiSlice = PlanningAntiState & PlanningAntiActions;

// --- Commitment Slice (Steps 8, 9) ---
// futureYouLetter belongs to FormSlice (Step 8)

export interface PlanningCommitmentState {
    commitmentStatement: string;
    signatureImage: string;
    signedAt: Date | null;
}
export interface PlanningCommitmentActions {
    setCommitmentStatement: (text: string) => void;
    setSignatureImage: (base64: string) => void;
    setSignedAt: (date: Date) => void;
}
export type PlanningCommitmentSlice = PlanningCommitmentState & PlanningCommitmentActions;

// --- Unified Store Type ---
export type PlanningStore = PlanningNavigationSlice &
    PlanningSyncSlice &
    PlanningFormSlice &
    PlanningGoalsSlice &
    PlanningAntiSlice &
    PlanningCommitmentSlice;
