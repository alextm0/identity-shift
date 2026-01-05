
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
// Note: Step 8 is 'Future You Letter' which is in FormSlice (Step 3 in code comments, but Step 8 in UI usually? 
// Original Store comment: "Step 3: Letter from Future You (Optional)" AND "Step 8: Future You Letter".
// Checking original code: 
//   Line 46: Step 3: Letter from Future You (Optional) -> property futureYouLetter
//   Line 12: Step 8: Future You Letter
//   Line 139: // Step 3 futureYouLetter: ""
//   Line 376: futureYouLetter: data.futureYouLetter || ""
//   Line 195: setFutureYouLetter
//   In canGoNext: Step 8: Future You Letter -> return true. 
// It seems `futureYouLetter` is used for Step 3? Or Step 8?
// The CONSTANTS say:
//   3: Wheel Vision
//   8: Future Letter
// Let's check `PLANNING_STEPS` in `src/lib/constants/planning`.
// But for now, I'll stick to grouping `futureYouLetter` in FormSlice or CommitmentSlice.
// The Plan says "Step 8: Future You Letter", so I'll put it in FormSlice as it is text content.
// WAIT, the store has `futureYouLetter` under "Step 3".
// Let's look at the original store file comments again.
// Line 7: "Step 3: Letter from Future You (Optional)"
// Line 12: "Step 8: Future You Letter"
// It seems there is a confusion in the original file comments.
// In `canGoNext`: case 8 calls it "Future You Letter". case 3 calls it "Wheel Vision".
// So Step 3 is Wheel Vision?
// Let's check `PLANNING_STEPS` later if needed, but for refactoring, I just move the state.
// `futureYouLetter` is a text field, fits in `FormSlice`.

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
