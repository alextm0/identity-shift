import { getDailyData } from "@/queries/daily";
import { DailyLogForm } from "@/components/daily/daily-log-form";
import { getDashboardData } from "@/queries/dashboard";
import { getSprintContainingDateCached } from "@/data-access/sprints";
import { getRequiredSession } from "@/lib/auth/server";

export default async function DailyPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const dateParam = params?.date;

  const session = await getRequiredSession();

  let targetDate = new Date();
  if (dateParam) {
    const parsed = new Date(dateParam + 'T00:00:00');
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  const [{ todayLog }, sprintForDate] = await Promise.all([
    getDailyData(targetDate),
    getSprintContainingDateCached(session.user.id, targetDate),
  ]);

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-10 px-0 md:px-6">
      <DailyLogForm activeSprint={sprintForDate} initialData={todayLog} targetDate={targetDate} />
    </div>
  );
}

