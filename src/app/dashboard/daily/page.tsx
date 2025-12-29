
import { getDailyData } from "@/queries/daily";
import { DailyLogForm } from "@/components/daily/daily-log-form";
import { getDashboardData } from "@/queries/dashboard";

export default async function DailyPage() {
  const [{ todayLog, date }, { activeSprint }] = await Promise.all([
    getDailyData(),
    getDashboardData(),
  ]);

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 md:px-0 space-y-6 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white uppercase">
            Daily <span className="text-white/20 font-light">{" // "}</span> <span className="text-focus-violet">Audit</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mt-4">
            {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <DailyLogForm activeSprint={activeSprint} initialData={todayLog} />
    </div>
  );
}

