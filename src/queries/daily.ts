import { getRequiredSession } from "@/lib/auth/server";
import { getActiveSprint } from "@/data-access/sprints";
import { getDailyLogByDate } from "@/data-access/daily-logs";

export async function getDailyData(date: Date = new Date()) {
    const session = await getRequiredSession();
    const userId = session.user.id;

    // Normalize date to midnight
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const [activeSprint, todayLog] = await Promise.all([
        getActiveSprint(userId),
        getDailyLogByDate(userId, targetDate)
    ]);

    return {
        activeSprint,
        todayLog,
        userId,
        date: targetDate
    };
}

