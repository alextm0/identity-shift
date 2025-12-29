/**
 * Migration utility for transforming old review data to new format
 * 
 * Transforms:
 * - bigThreeWins array → wins array (filter empty strings)
 * - damnGoodDecision → otherDetails (if no otherDetails exists)
 */

import type { YearlyReview } from "@/lib/types";

export interface MigratedReviewData {
    wins: string[];
    otherDetails: string;
}

/**
 * Migrate old review data to new format
 */
export function migrateReviewData(review: YearlyReview): MigratedReviewData {
    let wins: string[] = [];
    let otherDetails = "";

    // Migrate wins from bigThreeWins if new wins don't exist
    if (review.wins && Array.isArray(review.wins) && review.wins.length > 0) {
        // New format already exists
        wins = review.wins.filter(w => w && w.trim());
    } else if (review.bigThreeWins && Array.isArray(review.bigThreeWins)) {
        // Migrate from old bigThreeWins
        wins = review.bigThreeWins.filter(w => w && w.trim());
    }

    // Migrate otherDetails from damnGoodDecision if needed
    if (review.otherDetails) {
        // New format already exists
        otherDetails = review.otherDetails;
    } else if (review.damnGoodDecision) {
        // Migrate from old damnGoodDecision
        otherDetails = review.damnGoodDecision;
    }

    return { wins, otherDetails };
}

/**
 * Apply migration to review data (mutates the review object)
 */
export function applyMigrationToReview(review: YearlyReview): YearlyReview {
    const migrated = migrateReviewData(review);
    
    return {
        ...review,
        wins: migrated.wins.length > 0 ? migrated.wins : null,
        otherDetails: migrated.otherDetails || null,
    };
}


