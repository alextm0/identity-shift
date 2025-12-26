/**
 * Constants
 * 
 * Provides constant values used throughout the application.
 * For type-safe enums, see enums.ts
 */

import { OneChangeOption, SprintPriorityType, DesiredIdentityStatus } from "./enums";

/**
 * Areas of Life
 * Used in planning for wheel of life and goal setting
 */
export const AREAS_OF_LIFE = [
    "Health & Energy",
    "Physical Environment",
    "Mental & Emotional",
    "Career & Mission",
    "Wealth & Finance",
    "Relationships",
    "Spirituality",
    "Leisure & Play"
] as const;

/**
 * One Change Options
 * Options for weekly review "one change" selection
 * @see OneChangeOption enum for type-safe values
 */

export const ONE_CHANGE_OPTIONS = [
    { value: OneChangeOption.CUT_SCOPE, label: 'Cut Scope (Less is More)' },
    { value: OneChangeOption.ADD_RECOVERY, label: 'Add Recovery (Avoiding Burnout)' },
    { value: OneChangeOption.FIX_MORNING, label: 'Fix Morning (Environmental Gap)' },
    { value: OneChangeOption.REMOVE_DISTRACTION, label: 'Remove Distraction (Deep Work)' },
    { value: OneChangeOption.KEEP_SAME, label: 'Maintain Stability (Trust the Process)' }
] as const;

/**
 * Sprint Priority Type Labels
 * Human-readable labels for sprint priority types
 */
export const SPRINT_PRIORITY_TYPE_LABELS = {
    [SprintPriorityType.HABIT]: 'Habit',
    [SprintPriorityType.WORK]: 'Work',
} as const;

/**
 * Desired Identity Status Labels
 * Human-readable labels for desired identity status
 */
export const DESIRED_IDENTITY_STATUS_LABELS = {
    [DesiredIdentityStatus.YES]: 'Yes',
    [DesiredIdentityStatus.PARTIALLY]: 'Partially',
    [DesiredIdentityStatus.NO]: 'No',
} as const;

/**
 * Energy Level Range
 * Valid energy levels for daily logs (1-5)
 */
export const ENERGY_LEVEL_MIN = 1;
export const ENERGY_LEVEL_MAX = 5;

/**
 * Progress Ratio Range
 * Valid progress ratio values (0-1)
 */
export const PROGRESS_RATIO_MIN = 0;
export const PROGRESS_RATIO_MAX = 1;

/**
 * Evidence Ratio Range
 * Valid evidence ratio values (0-100)
 */
export const EVIDENCE_RATIO_MIN = 0;
export const EVIDENCE_RATIO_MAX = 100;

/**
 * Anti-Bullshit Score Range
 * Valid anti-bullshit score values (0-100)
 */
export const ANTI_BULLSHIT_SCORE_MIN = 0;
export const ANTI_BULLSHIT_SCORE_MAX = 100;

/**
 * Perceived Progress Range
 * Valid perceived progress values (1-10)
 */
export const PERCEIVED_PROGRESS_MIN = 1;
export const PERCEIVED_PROGRESS_MAX = 10;
