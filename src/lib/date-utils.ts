/**
 * Utility to determine which years should be used for Annual Review and Planning
 * based on the current date.
 * 
 * Rules:
 * - From January to November: 
 *   - Review the previous year
 *   - Plan the current year
 * - In December:
 *   - Review the current year
 *   - Plan the next year
 */
export function getCurrentReviewAndPlanningYears(date: Date = new Date()) {
    const currentYear = date.getFullYear();
    const isDecember = date.getMonth() === 11;

    return {
        reviewYear: isDecember ? currentYear : currentYear - 1,
        planningYear: isDecember ? currentYear + 1 : currentYear,
    };
}
