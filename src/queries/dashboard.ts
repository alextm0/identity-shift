import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint, getSprints } from "@/data-access/sprints";
import { getDailyLogs, getTodayLogForUser } from "@/data-access/daily-logs";
import { getPlanningByUserId } from "@/data-access/planning";
import { getWeeklyReviews, getMonthlyReviews } from "@/data-access/reviews";
import { getCompletedYearlyReview } from "@/data-access/yearly-reviews";
import { differenceInDays, subDays, isSameDay, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from "date-fns";
import { db } from "@/lib/db";
import { promiseLog } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { SprintWithDetails } from "@/lib/types";
import { normalizeDate } from "@/lib/data-access/base";

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

    // Fetch all dashboard data in parallel for better performance with graceful degradation
    const sevenDaysAgo = normalizeDate(subDays(new Date(), 7));

    const results = await Promise.allSettled([
        getPlanningByUserId(userId),
        activeSprintPromise,
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
    const rawActiveSprint = results[1].status === 'fulfilled' ? results[1].value : null;
    const rawRecentSprints = results[2].status === 'fulfilled' ? results[2].value : [];
    const todayLog = results[3].status === 'fulfilled' ? results[3].value : undefined;
    const recentLogs = results[4].status === 'fulfilled' ? results[4].value : [];
    const weeklyReviews = results[5].status === 'fulfilled' ? results[5].value : [];
    const monthlyReviews = results[6].status === 'fulfilled' ? results[6].value : [];
    const completedYearlyReview = results[7].status === 'fulfilled' ? results[7].value : undefined;
    const recentPromiseLogs = results[8].status === 'fulfilled' ? results[8].value : [];

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

    // Calculate progress for each promise (the new Focus Priorities)
    const prioritiesWithProgress = activeSprint ? (activeSprint as SprintWithDetails).goals?.flatMap((goal) =>
        goal.promises?.map((p) => ({
            ...p,
            goalText: goal.goalText
        })) || []
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
            type: `${promise.goalText.substring(0, 20)}${promise.goalText.length > 20 ? '...' : ''} // ${promise.type}`,
            unitsThisWeek: completionsThisWeek,
            weeklyTarget,
            progress,
            isComplete,
        };
    }) || [] : [];

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

    // Add sprint metric if there's an active sprint
    if (activeSprint && daysLeft !== null) {
        timeMetrics.push({
            label: 'Sprint',
            percentage: 100 - sprintProgress,
            remaining: `${daysLeft}d left`,
        });
    }

    // Calculate dates with daily logs for calendar highlighting
    const datesWithLogs = recentLogs.map(log => new Date(log.date));

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
        timeMetrics,
        datesWithLogs,
        userId,
        user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        }
    };
}
