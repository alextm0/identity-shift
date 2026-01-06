'use server';

/**
 * Server Actions for Data Export
 * 
 * Allows users to export all their data as JSON for backup or migration purposes.
 */

import { getRequiredSession } from "@/lib/auth/server";
import { getPlanningByUserIdAndYear } from "@/data-access/planning";
import { getSprints } from "@/data-access/sprints";
import { getDailyLogs } from "@/data-access/daily-logs";
import { getWeeklyReviews, getMonthlyReviews } from "@/data-access/reviews";
import { getCurrentReviewAndPlanningYears } from "@/lib/date-utils";

export async function exportUserDataAction() {
    const session = await getRequiredSession();
    const userId = session.user.id;
    const { planningYear } = getCurrentReviewAndPlanningYears();

    // Fetch all user data
    const [planning, sprints, dailyLogs, weeklyReviews, monthlyReviews] = await Promise.all([
        getPlanningByUserIdAndYear(userId, planningYear),
        getSprints(userId),
        getDailyLogs(userId, 10000), // Get all logs (large limit)
        getWeeklyReviews(userId),
        getMonthlyReviews(userId),
    ]);

    // Compile export data
    const exportData = {
        exportDate: new Date().toISOString(),
        userId: session.user.id,
        user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        },
        data: {
            planning: planning || null,
            sprints,
            dailyLogs,
            weeklyReviews,
            monthlyReviews,
        },
        metadata: {
            version: "1.0",
            totalRecords: {
                sprints: sprints.length,
                dailyLogs: dailyLogs.length,
                weeklyReviews: weeklyReviews.length,
                monthlyReviews: monthlyReviews.length,
            },
        },
    };

    return exportData;
}

