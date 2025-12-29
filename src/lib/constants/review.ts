/**
 * Review Phase Constants
 * 
 * Centralized configuration for the review wizard and related functionality.
 */

export const REVIEW_WIZARD_STEPS = 3;
export const DIMENSIONS_COUNT = 8;
export const AUTO_SAVE_DEBOUNCE_MS = 2000;
export const DEFAULT_RATING = 5;
export const DEFAULT_MAX_WINS = 10; // Soft default, not hard cap

/**
 * Word limits for different review fields
 */
export const WORD_LIMITS = {
  wheelAudit: 200,
  win: 100, // For individual wins
  otherDetails: 500,
  // Deprecated (kept for backward compatibility with old editable components)
  bigThreeWin: 100,
  damnGoodDecision: 300,
} as const;

/**
 * Minimum score to be considered "strong" dimension
 */
export const STRONG_DIMENSION_THRESHOLD = 8;

/**
 * Maximum score to be considered "weak" dimension
 */
export const WEAK_DIMENSION_THRESHOLD = 5;

