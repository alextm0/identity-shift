import { getRequiredSession } from "@/lib/auth/server";
import { getDailyLogByDate } from "@/data-access/daily-logs";

export async function getDailyData(date: Date = new Date()) {
    const session = await getRequiredSession();
    const userId = session.user.id;

    // Normalize date to midnight
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const todayLog = await getDailyLogByDate(userId, targetDate);

    return {
        todayLog,
        userId,
        date: targetDate
    };
}

