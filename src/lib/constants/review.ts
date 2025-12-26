/**
 * Review Phase Constants
 * 
 * Centralized configuration for the review wizard and related functionality.
 */

export const REVIEW_WIZARD_STEPS = 5;
export const DIMENSIONS_COUNT = 8;
export const AUTO_SAVE_DEBOUNCE_MS = 2000;
export const DEFAULT_RATING = 5;

/**
 * Word limits for different review fields
 */
export const WORD_LIMITS = {
  wheelAudit: 200,
  bigThreeWin: 100,
  damnGoodDecision: 300,
} as const;

/**
 * Steps that contain multiple sub-steps (dimensions)
 * Note: Steps 2 and 3 now show all dimensions at once, so they're not multi-steps anymore
 */
export const MULTI_STEP_INDICES = [] as const;

/**
 * Minimum score to be considered "strong" dimension
 */
export const STRONG_DIMENSION_THRESHOLD = 8;

/**
 * Maximum score to be considered "weak" dimension
 */
export const WEAK_DIMENSION_THRESHOLD = 5;

