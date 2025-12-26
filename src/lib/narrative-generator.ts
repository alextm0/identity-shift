/**
 * Narrative Generator
 * 
 * Auto-generates a summary narrative from yearly review data.
 * Creates an analytical, data-driven summary (not motivational fluff).
 */

import { WheelRatings, BigThreeWins, DIMENSION_LABELS } from "@/lib/validators/yearly-review";

export function generateNarrative(
    wheelRatings: WheelRatings,
    bigThreeWins: BigThreeWins,
    damnGoodDecision: string
): string {
    // Find strong and weak dimensions
    const dimensions = Object.entries(wheelRatings);
    const sortedDimensions = dimensions.sort((a, b) => a[1] - b[1]);
    
    const weakDimensions = sortedDimensions
        .filter(([_, score]) => score < 5)
        .slice(0, 3)
        .map(([dim]) => DIMENSION_LABELS[dim as keyof typeof DIMENSION_LABELS]);
    
    const strongDimensions = sortedDimensions
        .filter(([_, score]) => score >= 8)
        .slice(-3)
        .map(([dim]) => DIMENSION_LABELS[dim as keyof typeof DIMENSION_LABELS]);

    // Build narrative
    const parts: string[] = [];

    // Opening: Strong areas
    if (strongDimensions.length > 0) {
        parts.push(`In 2025, you built a foundation in ${strongDimensions.join(", ")}.`);
    } else {
        parts.push(`In 2025, you maintained stability across key areas.`);
    }

    // Biggest win
    if (bigThreeWins && bigThreeWins.length > 0 && bigThreeWins[0]) {
        const firstWin = bigThreeWins[0].substring(0, 100); // Truncate if too long
        parts.push(`Your biggest win was ${firstWin}.`);
    }

    // Key decision
    if (damnGoodDecision) {
        const decision = damnGoodDecision.substring(0, 150);
        parts.push(`A key decision was ${decision}.`);
    }

    // Weak areas and focus
    if (weakDimensions.length > 0) {
        parts.push(`Moving into 2026, you have momentum in ${strongDimensions.length > 0 ? strongDimensions.join(", ") : "several areas"}, but ${weakDimensions.join(" and ")} need attention.`);
        parts.push(`Your focus should be on ${weakDimensions.slice(0, 2).join(" and ")}.`);
    } else {
        parts.push(`Moving into 2026, you're positioned well across all dimensions.`);
    }

    return parts.join(" ");
}

