import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint, getSprints } from "@/data-access/sprints";
import { getDailyLogByDate, getDailyLogs, getTodayLogForUser } from "@/data-access/daily-logs";
import { getPlanningByUserId } from "@/data-access/planning";
import { getWeeklyReviews, getMonthlyReviews } from "@/data-access/reviews";
import { getCompletedYearlyReview } from "@/data-access/yearly-reviews";
import { differenceInDays, subDays, isSameDay } from "date-fns";
import { toDailyLogWithTypedFields } from "@/lib/type-helpers"; // Import toDailyLogWithTypedFields

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
        : currentDate.getFullYear();

    // Fetch all dashboard data in parallel for better performance
    const [
        planning,
        rawActiveSprint, // Renamed to rawActiveSprint to differentiate
        rawRecentSprints, // Renamed
        todayLog,
        recentLogs,
        weeklyReviews,
        monthlyReviews,
        completedYearlyReview,
    ] = await Promise.all([
        getPlanningByUserId(userId),
        activeSprintPromise,
        getSprints(userId).then(sprints => sprints.slice(0, 3)), // Last 3 sprints
        getTodayLogForUser(userId, new Date()),
        getDailyLogs(userId, 7), // Last 7 days
        getWeeklyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest weekly review
        getMonthlyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest monthly review
        getCompletedYearlyReview(userId, CURRENT_YEAR).catch(() => undefined), // Check for completed review (don't fail if table doesn't exist yet)
    ]);

    const activeSprint = rawActiveSprint || null;
    const recentSprints = rawRecentSprints;

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

    // Calculate sprint metrics
    let sprintDuration = 30; // Default fallback
    let currentDay = 0;
    let sprintProgress = 0;
    if (activeSprint?.startDate && activeSprint?.endDate) {
        const startDate = new Date(activeSprint.startDate);
        const endDate = new Date(activeSprint.endDate);
        const computedDuration = differenceInDays(endDate, startDate);
        sprintDuration = computedDuration > 0 ? computedDuration : 30;
        currentDay = sprintDuration - (daysLeft || 0);
        sprintProgress = sprintDuration > 0 ? Math.min(100, (currentDay / sprintDuration) * 100) : 0;
    }

    // Calculate consistency data (Last 14 days)
    const historyDays = 14;
    const consistencyData = Array.from({ length: historyDays }).map((_, i) => {
        const d = subDays(new Date(), (historyDays - 1) - i);
        return {
            date: d,
            isToday: isSameDay(d, new Date()),
            hasLog: recentLogs.some(log => isSameDay(new Date(log.date), d)),
        };
    });

    // Calculate priority progress for each priority
    const prioritiesWithProgress = activeSprint ? (() => {
        return activeSprint.priorities.map(priority => {
            const unitsThisWeek = recentLogs.reduce((acc, log) => {
                const typedLog = toDailyLogWithTypedFields(log);
                return acc + (typedLog.priorities[priority.key]?.units || 0);
            }, 0);
            const weeklyTarget = priority.weeklyTargetUnits || 5;
            const progress = Math.min(100, (unitsThisWeek / weeklyTarget) * 100);
            const isComplete = unitsThisWeek >= weeklyTarget;

            return {
                ...priority,
                unitsThisWeek,
                weeklyTarget,
                progress,
                isComplete,
            };
        });
    })() : [];

    return {
        planning,
        activeSprint,
        recentSprints,
        todayLog,
        recentLogs,
        latestWeeklyReview: weeklyReviews[0] || null,
        latestMonthlyReview: monthlyReviews[0] || null, // Ensure latestMonthlyReview is also returned here
        completedYearlyReview: completedYearlyReview ? { year: completedYearlyReview.year } : null,
        daysLeft,
        todayStatus,
        sprintDuration,
        currentDay,
        sprintProgress,
        consistencyData,
        prioritiesWithProgress,
        userId,
        user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        }
    };
}
