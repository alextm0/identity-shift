import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint } from "@/data-access/sprints";
import { getLast7DaysLogs } from "@/data-access/daily-logs";
import { getWeeklyReviews } from "@/data-access/reviews";

export async function getWeeklyData() {
    const session = await getRequiredSession();
    const userId = session.user.id;

    const [activeSprint, allReviews] = await Promise.all([
        getActiveSprint(userId),
        getWeeklyReviews(userId)
    ]);

    // Get logs for the active sprint's last 7 days
    const weeklyLogs = activeSprint ? await getLast7DaysLogs(activeSprint.id) : [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return {
        activeSprint,
        weeklyLogs,
        latestReview: allReviews[0] || null,
        allReviews,
        userId,
        weekEnd: today
    };
}

