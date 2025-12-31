
import { getDailyData } from "@/queries/daily";
import { DailyLogForm } from "@/components/daily/daily-log-form";
import { getDashboardData } from "@/queries/dashboard";

export default async function DailyPage() {
  const [{ todayLog }, { activeSprint }] = await Promise.all([
    getDailyData(),
    getDashboardData(),
  ]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-6">
      <DailyLogForm activeSprint={activeSprint ?? undefined} initialData={todayLog} />
    </div>
  );
}

