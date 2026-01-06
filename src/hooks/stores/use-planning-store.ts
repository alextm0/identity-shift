/**
 * Planning Store
 *
 * Manages client-side state for the 9-step planning ceremony.
 *
 * Step 1: Empty Head (Brain Dump)
 * Step 2: Future Identity
 * Step 3: Wheel of Life Vision
 * Step 4: Goal Backlog
 * Step 5: Annual Goals (Selection)
 * Step 6: Goal Details
 * Step 7: Anti-Vision + Anti-Goals
 * Step 8: Future You Letter (Optional)
 * Step 9: Commitment
 *
 * Refactored into domain-specific slices for better maintainability.
 */

import { create } from "zustand";
import type { PlanningStore } from "./planning/types";
import { createPlanningNavigationSlice } from "./planning/navigation-slice";
import { createPlanningSyncSlice } from "./planning/sync-slice";
import { createPlanningFormSlice } from "./planning/form-slice";
import { createPlanningGoalsSlice } from "./planning/goals-slice";
import { createPlanningAntiSlice } from "./planning/anti-slice";
import { createPlanningCommitmentSlice } from "./planning/commitment-slice";

export type { PlanningStore } from "./planning/types";

export const usePlanningStore = create<PlanningStore>()((...a) => ({
    ...createPlanningNavigationSlice(...a),
    ...createPlanningSyncSlice(...a),
    ...createPlanningFormSlice(...a),
    ...createPlanningGoalsSlice(...a),
    ...createPlanningAntiSlice(...a),
    ...createPlanningCommitmentSlice(...a),
}));

