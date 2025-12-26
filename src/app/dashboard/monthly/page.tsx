import { getMonthlyData } from "@/queries/monthly";
import { MonthlyReviewPanel } from "@/components/reviews/monthly-review-panel";
import { GlassPanel } from "@/components/dashboard/glass-panel";

export default async function MonthlyReviewPage() {
  const { activeSprint, monthlyLogs, latestReview, monthStr } = await getMonthlyData();

  if (!activeSprint) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 md:px-0">
        <GlassPanel className="p-12 text-center space-y-6 border-dashed border-white/10">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Memory Bank Offline</h2>
          <p className="text-white/40 max-w-sm mx-auto">
            Monthly reflections require ongoing sprint data.
            Initialize a sprint to begin the identity evolution cycle.
          </p>
          <a href="/dashboard/sprint" className="inline-block px-8 py-3 bg-focus-violet/10 border border-focus-violet/20 text-focus-violet font-mono uppercase tracking-widest text-xs rounded-xl hover:bg-focus-violet/20 transition-all">
            Initialize Sprint
          </a>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-0 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white uppercase">
            Monthly <span className="text-white/20 font-light">//</span> <span className="text-focus-violet">Mirror</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mt-4">
            Identity reflection. Perceptual calibration. Future intent.
          </p>
        </div>
      </div>

      <MonthlyReviewPanel
        activeSprint={activeSprint}
        monthlyLogs={monthlyLogs}
        monthStr={monthStr}
        latestReview={latestReview}
      />
    </div>
  );
}

