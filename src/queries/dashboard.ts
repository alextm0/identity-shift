import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprintCached, getActiveSprintsCached, getSprints } from "@/data-access/sprints";
import { getDailyLogs, getTodayLogForUser } from "@/data-access/daily-logs";
import { getPlanningByUserIdAndYear } from "@/data-access/planning";
import { getWeeklyReviews, getMonthlyReviews } from "@/data-access/reviews";
import { getCompletedYearlyReview } from "@/data-access/yearly-reviews";
import { differenceInDays, subDays, isSameDay, startOfYear, endOfYear, startOfQuarter, endOfQuarter, isFuture, isPast, isToday, format } from "date-fns";
import { db } from "@/lib/db";
import { promiseLog } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { SprintWithDetails } from "@/lib/types";
import { normalizeDate } from "@/lib/data-access/base";
import { unstable_cache } from "next/cache";
import { getCurrentReviewAndPlanningYears } from "@/lib/date-utils";

function calculateSprintMetrics(sprint: SprintWithDetails) {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysLeft = Math.max(0, differenceInDays(endDate, today));
    const computedDuration = differenceInDays(endDate, startDate) + 1;
    const sprintDuration = computedDuration > 0 ? computedDuration : 1;
    const currentDay = sprintDuration - daysLeft;
    const sprintProgress = sprintDuration > 0 ? Math.min(100, (currentDay / sprintDuration) * 100) : 0;

    return { daysLeft, sprintDuration, currentDay, sprintProgress };
}


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
const fetchDashboardData = async (userId: string) => {
    // Create a single promise for active sprints (plural)
    // Using cached version which has 'active-sprint' tag
    const activeSprintsPromise = getActiveSprintsCached(userId);

    // Review year logic based on date utility
    const { reviewYear: CURRENT_YEAR, planningYear } = getCurrentReviewAndPlanningYears();

    // Fetch all dashboard data in parallel for better performance with graceful degradation
    const sevenDaysAgo = normalizeDate(subDays(new Date(), 7));

    const results = await Promise.allSettled([
        getPlanningByUserIdAndYear(userId, planningYear), // Now cached with 'planning' tag
        activeSprintsPromise,
        getSprints(userId).then(sprints => sprints.slice(0, 3)), // Last 3 sprints
        getTodayLogForUser(userId, new Date()),
        getDailyLogs(userId, 14), // Get more logs for consistency grid (14 days)
        getWeeklyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest weekly review
        getMonthlyReviews(userId).then(reviews => reviews.slice(0, 1)), // Latest monthly review
        getCompletedYearlyReview(userId, CURRENT_YEAR),
        db.query.promiseLog.findMany({
            where: and(
                eq(promiseLog.userId, userId),
                gte(promiseLog.date, sevenDaysAgo)
            )
        })
    ]);

    // Extract results with graceful fallbacks
    const planning = results[0].status === 'fulfilled' ? results[0].value : null;
    const rawActiveSprints = results[1].status === 'fulfilled' ? results[1].value : [];
    const rawRecentSprints = results[2].status === 'fulfilled' ? results[2].value : [];
    const todayLog = results[3].status === 'fulfilled' ? results[3].value : undefined;
    const recentLogs = results[4].status === 'fulfilled' ? results[4].value : [];
    const weeklyReviews = results[5].status === 'fulfilled' ? results[5].value : [];
    const monthlyReviews = results[6].status === 'fulfilled' ? results[6].value : [];
    const completedYearlyReview = results[7].status === 'fulfilled' ? results[7].value : undefined;
    const recentPromiseLogs = results[8].status === 'fulfilled' ? results[8].value : [];

    const activeSprints = rawActiveSprints;

    // Filter active sprints into running (started) vs upcoming

    const runningSprints = activeSprints.filter(s => {
        const start = new Date(s.startDate);
        return isPast(start) || isToday(start);
    });

    const upcomingSprints = activeSprints.filter(s => {
        const start = new Date(s.startDate);
        return isFuture(start) && !isToday(start);
    });

    const activeSprint = runningSprints.length > 0 ? runningSprints[0] : null; // Primary active sprint for backward compat
    const recentSprints = rawRecentSprints;

    // Calculate sprint metrics for all active sprints (running AND upcoming)
    const activeSprintsWithMetrics = activeSprints.map(sprint => {
        const metrics = calculateSprintMetrics(sprint as SprintWithDetails);
        return {
            ...sprint,
            ...metrics,
            isUpcoming: upcomingSprints.some(u => u.id === sprint.id)
        };
    });

    // Fallback variables for backward compatibility (using primary sprint)
    const primarySprintMetrics = activeSprintsWithMetrics.length > 0 ? activeSprintsWithMetrics[0] : null;
    const daysLeft = primarySprintMetrics?.daysLeft ?? null;
    const sprintDuration = primarySprintMetrics?.sprintDuration ?? 30;
    const currentDay = primarySprintMetrics?.currentDay ?? 0;
    const sprintProgress = primarySprintMetrics?.sprintProgress ?? 0;

    // Determine today status
    const todayStatus: 'pending' | 'completed' = todayLog ? 'completed' : 'pending';

    // Calculate consistency data (Last 14 days)
    const historyDays = 14;
    const dashboardNow = new Date();
    const consistencyData = Array.from({ length: historyDays }).map((_, i) => {
        const d = subDays(dashboardNow, (historyDays - 1) - i);
        const dStr = format(d, 'yyyy-MM-dd');
        return {
            date: d,
            isToday: isSameDay(d, dashboardNow),
            hasLog: recentLogs.some(log => format(new Date(log.date), 'yyyy-MM-dd') === dStr),
        };
    });

    // Calculate progress for each promise (the new Focus Priorities) - Aggregate from ONLY RUNNING sprints
    const prioritiesWithProgress = runningSprints.flatMap(sprint =>
        (sprint.goals || []).flatMap((goal) =>
            goal.promises?.map((p) => ({
                ...p,
                goalText: goal.goalText,
                sprintName: sprint.name // Add context
            })) || []
        )
    ).map((promise) => {
        const completionsThisWeek = recentPromiseLogs.filter(log =>
            log.promiseId === promise.id && log.completed
        ).length;

        const weeklyTarget = promise.type === 'weekly'
            ? (promise.weeklyTarget || 3)
            : (promise.scheduleDays?.length || 7);
        const progress = Math.min(100, (completionsThisWeek / weeklyTarget) * 100);
        const isComplete = completionsThisWeek >= weeklyTarget;

        return {
            key: promise.id,
            label: promise.text,
            goalText: promise.goalText,
            type: promise.type,
            unitsThisWeek: completionsThisWeek,
            weeklyTarget,
            progress,
            isComplete,
            sprintName: promise.sprintName,
        };
    });

    // Calculate time metrics (year, quarter, sprint)
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const yearTotal = differenceInDays(yearEnd, yearStart) + 1;
    const yearRemaining = differenceInDays(yearEnd, now);
    const yearProgress = 100 - ((yearRemaining / yearTotal) * 100);

    const quarterStart = startOfQuarter(now);
    const quarterEnd = endOfQuarter(now);
    const quarterTotal = differenceInDays(quarterEnd, quarterStart) + 1;
    const quarterRemaining = differenceInDays(quarterEnd, now);
    const quarterProgress = 100 - ((quarterRemaining / quarterTotal) * 100);

    const timeMetrics = [
        {
            label: 'Year',
            percentage: 100 - yearProgress,
            remaining: `${yearRemaining}d left`,
        },
        {
            label: 'Quarter',
            percentage: 100 - quarterProgress,
            remaining: `${quarterRemaining}d left`,
        },
    ];

    // Add sprint metrics for all active sprints
    activeSprintsWithMetrics.forEach(sprint => {
        timeMetrics.push({
            label: `Sprint: ${sprint.name}`,
            percentage: 100 - sprint.sprintProgress,
            remaining: `${sprint.daysLeft}d left`,
        });
    });

    // Calculate dates with daily logs for calendar highlighting
    const datesWithLogs = recentLogs.map(log => new Date(log.date));

    return {
        planning,
        activeSprintsWithMetrics,
        activeSprint, // Kept for backward compat
        activeSprints,
        runningSprints,
        upcomingSprints,
        recentSprints,
        todayLog,
        recentLogs,
        latestWeeklyReview: weeklyReviews[0] || null,
        latestMonthlyReview: monthlyReviews[0] || null,
        completedYearlyReview: completedYearlyReview ? { year: completedYearlyReview.year } : null,
        daysLeft,
        todayStatus,
        sprintDuration,
        currentDay,
        sprintProgress,
        consistencyData,
        prioritiesWithProgress,
        timeMetrics,
        datesWithLogs,
        userId,
    };
};

const getCachedDashboardData = unstable_cache(
    fetchDashboardData,
    ['dashboard-data'],
    { tags: ['dashboard'] }
);

export async function getDashboardData() {
    const session = await getRequiredSession();
    try {
        const data = await getCachedDashboardData(session.user.id);
        return {
            ...data,
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
            }
        };
    } catch (error) {
        console.error("Dashboard cache failed, falling back to direct fetch", error);
        // Fallback to direct fetch
        const data = await fetchDashboardData(session.user.id);
        return {
            ...data,
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
            }
        };
    }
}
