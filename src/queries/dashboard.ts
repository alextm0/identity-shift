import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint, getSprints } from "@/data-access/sprints";
import { getDailyLogByDate, getDailyLogs, getTodayLogBySprintId } from "@/data-access/daily-logs";
import { getPlanningByUserId } from "@/data-access/planning";
import { getWeeklyReviews, getMonthlyReviews } from "@/data-access/reviews";
import { getCompletedYearlyReview } from "@/data-access/yearly-reviews";
import { differenceInDays } from "date-fns";

/**
 * Get comprehensive dashboard data for the authenticated user.
 * 
 * This function ensures:
 * - User is authenticated (via getRequiredSession)
 * - All data queries include userId filter (enforced in data access layer)
 * - Users can only access their own data
 * 
 * Returns:
 * - Planning data (identity, goals, wheel of life)
 * - Active sprint and recent sprints
 * - Today's daily log
 * - Recent daily logs (last 7 days)
 * - Latest weekly review
 * - Latest monthly review
 */
export async function getDashboardData() {
    // This will throw if user is not authenticated
    const session = await getRequiredSession();
    const userId = session.user.id;

    // Create a single promise for active sprint to avoid duplicate DB calls
    const activeSprintPromise = getActiveSprint(userId);

    // Review year: Review the previous year (e.g., in Jan 2026, review 2025)
    // For now, default to 2025 as specified in the requirements
    const currentDate = new Date();
    const CURRENT_YEAR = currentDate.getMonth() === 0 && currentDate.getDate() <= 5
        ? currentDate.getFullYear() - 1
        : 2025;

    // Fetch all dashboard data in parallel for better performance
    const [
        planning,
        activeSprint,
        recentSprints,
        todayLog,
        recentLogs,
        weeklyReviews,
        monthlyReviews,
        completedYearlyReview,
    ] = await Promise.all([
        getPlanningByUserId(userId),
        activeSprintPromise,
        getSprints(userId).then(sprints => sprints.slice(0, 3)), // Last 3 sprints
        activeSprintPromise.then(async (sprint) => {
            if (!sprint) return undefined;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return await getTodayLogBySprintId(sprint.id, today);
        }),
        getDailyLogs(userId, 7), // Last 7 days
        getWeeklyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest weekly review
        getMonthlyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest monthly review
        getCompletedYearlyReview(userId, CURRENT_YEAR).catch(() => undefined), // Check for completed review (don't fail if table doesn't exist yet)
    ]);

    // Calculate days left for active sprint
    let daysLeft: number | null = null;
    if (activeSprint) {
        const endDate = new Date(activeSprint.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        daysLeft = Math.max(0, differenceInDays(endDate, today));
    }

    // Determine today status
    const todayStatus: 'pending' | 'completed' = todayLog ? 'completed' : 'pending';

    return {
        planning,
        activeSprint,
        recentSprints,
        todayLog,
        recentLogs,
        latestWeeklyReview: weeklyReviews[0] || null,
        latestMonthlyReview: monthlyReviews[0] || null,
        completedYearlyReview,
        daysLeft,
        todayStatus,
        userId,
        user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        }
    };
}
