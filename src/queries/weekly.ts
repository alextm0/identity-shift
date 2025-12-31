import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint } from "@/data-access/sprints";
import { getCurrentWeekLogs } from "@/data-access/daily-logs";
import { getWeeklyReviews } from "@/data-access/reviews";
import { db } from "@/lib/db";
import { promiseLog } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { startOfWeek, endOfWeek } from "date-fns";
import { normalizeDate } from "@/lib/data-access/base";

export async function getWeeklyData() {
    const session = await getRequiredSession();
    const userId = session.user.id;

    // Calculate current week boundaries (Monday to Sunday)
    const today = new Date();
    const weekStartDate = startOfWeek(today, { weekStartsOn: 1 });
    const weekEndDate = endOfWeek(today, { weekStartsOn: 1 });
    const weekStart = normalizeDate(weekStartDate);
    const weekEnd = normalizeDate(weekEndDate);

    const results = await Promise.allSettled([
        getActiveSprint(userId),
        getWeeklyReviews(userId),
        getCurrentWeekLogs(userId),
        db.query.promiseLog.findMany({
            where: and(
                eq(promiseLog.userId, userId),
                gte(promiseLog.date, weekStart),
                lte(promiseLog.date, weekEnd)
            )
        })
    ]);

    // Extract results with graceful fallbacks
    const activeSprint = results[0].status === 'fulfilled' ? results[0].value : null;
    const allReviews = results[1].status === 'fulfilled' ? results[1].value : [];
    const weeklyLogs = results[2].status === 'fulfilled' ? results[2].value : [];
    const promiseLogs = results[3].status === 'fulfilled' ? results[3].value : [];

    return {
        activeSprint,
        weeklyLogs,
        latestReview: allReviews[0] || null,
        allReviews,
        promiseLogs,
        userId,
        weekEnd: weekEndDate
    };
}

