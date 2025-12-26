import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint } from "@/data-access/sprints";
import { getDailyLogs } from "@/data-access/daily-logs";
import { getMonthlyReviews } from "@/data-access/reviews";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function getMonthlyData() {
    const session = await getRequiredSession();
    const userId = session.user.id;

    const [activeSprint, allLogs, existingReviews] = await Promise.all([
        getActiveSprint(userId),
        getDailyLogs(userId, 45),
        getMonthlyReviews(userId)
    ]);

    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthStr = format(today, "yyyy-MM");

    const monthlyLogs = allLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
    });

    return {
        activeSprint,
        monthlyLogs,
        latestReview: existingReviews[0] || null,
        userId,
        monthStr
    };
}

