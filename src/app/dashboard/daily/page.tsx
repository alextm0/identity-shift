
import { getDailyData } from "@/queries/daily";
import { DailyLogForm } from "@/components/daily/daily-log-form";
import { getDashboardData } from "@/queries/dashboard";

export default async function DailyPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const dateParam = params?.date;

  let targetDate = new Date();
  if (dateParam) {
    const parsed = new Date(dateParam + 'T00:00:00');
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  const [{ todayLog }, { activeSprint }] = await Promise.all([
    getDailyData(targetDate),
    getDashboardData(),
  ]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-6">
      <DailyLogForm activeSprint={activeSprint ?? undefined} initialData={todayLog} targetDate={targetDate} />
    </div>
  );
}

