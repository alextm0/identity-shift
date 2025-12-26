import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint, getSprints } from "@/data-access/sprints";
import { getDailyLogByDate, getDailyLogs, getTodayLogBySprintId } from "@/data-access/daily-logs";
import { getPlanningByUserId } from "@/data-access/planning";
import { getWeeklyReviews, getMonthlyReviews } from "@/data-access/reviews";
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

    // Fetch all dashboard data in parallel for better performance
    const [
        planning,
        activeSprint,
        recentSprints,
        todayLog,
        recentLogs,
        weeklyReviews,
        monthlyReviews,
    ] = await Promise.all([
        getPlanningByUserId(userId),
        getActiveSprint(userId),
        getSprints(userId).then(sprints => sprints.slice(0, 3)), // Last 3 sprints
        (async () => {
            const activeSprint = await getActiveSprint(userId);
            if (!activeSprint) return undefined;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return await getTodayLogBySprintId(activeSprint.id, today);
        })(),
        getDailyLogs(userId, 7), // Last 7 days
        getWeeklyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest weekly review
        getMonthlyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest monthly review
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
