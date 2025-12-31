import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint } from "@/data-access/sprints";
import { getDailyLogs } from "@/data-access/daily-logs";
import { getMonthlyReviews } from "@/data-access/reviews";
import { getPromiseLogsForDateRange } from "@/data-access/promises";
import { startOfMonth, endOfMonth, format, parse } from "date-fns";
import { toMonthlyReviewWithTypedFields } from "@/lib/type-helpers";

export async function getMonthlyData(selectedMonth?: string) {
    const session = await getRequiredSession();
    const userId = session.user.id;

    // Use selected month or default to current month
    const targetDate = selectedMonth
        ? parse(selectedMonth, "yyyy-MM", new Date())
        : new Date();

    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const monthStr = format(targetDate, "yyyy-MM");

    const results = await Promise.allSettled([
        getActiveSprint(userId),
        getDailyLogs(userId, 365), // Get more days to support viewing past months
        getMonthlyReviews(userId),
        getPromiseLogsForDateRange(userId, monthStart, monthEnd)
    ]);

    // Extract results with graceful fallbacks
    const activeSprint = results[0].status === 'fulfilled' ? results[0].value : null;
    const allLogs = results[1].status === 'fulfilled' ? results[1].value : [];
    const allReviews = results[2].status === 'fulfilled' ? results[2].value : [];
    const promiseLogs = results[3].status === 'fulfilled' ? results[3].value : [];

    const monthlyLogs = allLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
    });

    // Find the review for the selected month
    const selectedReview = allReviews.find(r => r.month === monthStr);
    const latestReview = selectedReview ? toMonthlyReviewWithTypedFields(selectedReview) : null;

    return {
        activeSprint,
        monthlyLogs,
        promiseLogs,
        latestReview,
        allReviews,
        userId,
        monthStr
    };
}

