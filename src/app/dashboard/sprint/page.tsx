import type { Metadata } from 'next';
import { getSprintsData } from "@/queries/sprints";
import { getPlanningData } from "@/queries/planning";
import { SprintForm } from "@/components/sprints/sprint-form";
import { CloseSprintButton } from "@/components/sprints/close-sprint-button";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { parseAnnualGoals } from "@/lib/type-helpers";
import { SprintPromise } from "@/lib/types";

import { DeleteSprintButton } from "@/components/sprints/delete-sprint-button";
import { SprintHistory } from "./sprint-history";

export const metadata: Metadata = {
  title: 'Sprint Management',
  description: 'Start, manage, and close your sprints',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SprintControlPage() {
  const { activeSprints, allSprints } = await getSprintsData();
  const { planning } = await getPlanningData();
  // Combine all goal sources to ensure legacy data is available
  let annualGoals = parseAnnualGoals(planning);

  // Fallback to activeGoals/goals if annualGoals is empty (migration path)
  if (annualGoals.length === 0) {
    const legacyGoals = [
      ...(planning.activeGoals || []),
      ...(planning.goals || [])
    ];

    if (legacyGoals.length > 0) {
      annualGoals = legacyGoals.map(g => ({
        id: g.id,
        text: g.text,
        category: g.category,
        definitionOfDone: "Migrated goal",
        createdAt: g.createdAt || new Date(),
        updatedAt: g.updatedAt
      }));
    }
  }


  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white uppercase">
            Sprint <span className="text-white/20 font-light">{" // "}</span> <span className="text-action-emerald">Control</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mt-4">
            Time-boxed focus units. Max 3 priorities. No distractions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/sprint/metrics">
            <Button variant="outline" className="text-white/40 hover:text-white border-white/10">
              <BarChart3 className="h-4 w-4 mr-2 text-action-emerald" />
              View Metrics
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="ghost" className="text-white/40 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Identity Shift
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-8">
        <SprintForm annualGoals={annualGoals} />
      </div>

      {activeSprints && activeSprints.length > 0 ? (
        <div className="space-y-8">
          {activeSprints.map((sprint) => (
            <GlassPanel key={sprint.id} className="p-6 border-white/5">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${new Date(sprint.startDate) > new Date() ? "bg-focus-violet animate-pulse" : "bg-action-emerald animate-pulse"}`} />
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                        {sprint.name}
                      </h2>
                      <p className="font-mono text-[10px] text-telemetry-slate uppercase tracking-widest mt-1">
                        {format(new Date(sprint.startDate), "MMM d")} — {format(new Date(sprint.endDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                      <p className={`text-[8px] font-mono font-bold uppercase tracking-tighter ${new Date(sprint.startDate) > new Date() ? "text-focus-violet" : "text-white/60"}`}>
                        {new Date(sprint.startDate) > new Date() ? "UPCOMING" : "ACTIVE"}
                      </p>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <SprintForm activeSprint={sprint} sprintToEdit={sprint} annualGoals={annualGoals} />
                    <CloseSprintButton sprintId={sprint.id} />
                    <DeleteSprintButton sprintId={sprint.id} sprintName={sprint.name} />
                  </div>
                </div>

                {/* ... goals section ... */}
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">
                    Commitment Goals & Promises
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sprint.goals?.map((goal) => (
                      <div key={goal.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-start gap-2 mb-4">
                          <div className="h-2 w-2 rounded-full bg-focus-violet mt-1.5 shrink-0" />
                          <p className="text-sm font-bold text-white uppercase tracking-tight leading-tight">{goal.goalText}</p>
                        </div>

                        <div className="space-y-3">
                          {goal.promises?.map((promise: SprintPromise) => (
                            <div key={promise.id} className="pl-4 border-l border-white/10">
                              <p className="text-xs text-telemetry-slate leading-relaxed">
                                {promise.text}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] font-mono uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/[0.03] text-white/40">
                                  {promise.type}
                                </span>
                                {promise.type === 'weekly' && promise.weeklyTarget && (
                                  <span className="text-[8px] font-mono text-action-emerald uppercase tracking-tighter">
                                    Target: {promise.weeklyTarget}x
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <GlassPanel className="p-12 border-dashed border-white/10 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <Target className="h-16 w-16 text-white/20 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
                No Active Sprint
              </h2>
              <p className="text-sm text-telemetry-slate mb-8">
                Initialize a sprint to begin tracking your progress. You need an active sprint to log daily progress.
              </p>
              <SprintForm annualGoals={annualGoals} />
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Sprint History / Archive */}
      <div className="pt-12 border-t border-white/5">
        <SprintHistory sprints={allSprints} />
      </div>
    </div>
  );
}


