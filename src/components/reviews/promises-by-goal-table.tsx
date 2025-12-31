"use client";

import { GoalSummary } from "@/use-cases/weekly-summary";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Target, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromisesByGoalTableProps {
  goalSummaries: GoalSummary[];
}

export function PromisesByGoalTable({ goalSummaries }: PromisesByGoalTableProps) {
  if (goalSummaries.length === 0) {
    return (
      <GlassPanel className="p-8 md:p-10">
        <div className="text-center text-white/40 py-12">
          <Target className="h-16 w-16 mx-auto mb-6 opacity-20" />
          <p className="font-mono text-xs uppercase tracking-widest">No promises tracked this week</p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-4 w-4 text-white/20" />
        <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Promises_By_Goal</h3>
      </div>

      <div className="space-y-5">
        {goalSummaries.map((goal) => (
          <GlassPanel key={goal.goalId} className="p-6 md:p-7 lg:p-8">
            {/* Goal Header */}
            <div className="mb-6 pb-6 border-b border-white/5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-tight">
                  {goal.goalText}
                </h4>
                <div className="flex items-baseline gap-1.5 shrink-0">
                  <span className={cn(
                    "text-2xl md:text-3xl font-bold",
                    goal.ratio >= 0.8 ? "text-action-emerald" :
                    goal.ratio >= 0.5 ? "text-motion-amber" :
                    "text-white/40"
                  )}>
                    {goal.totalKept}
                  </span>
                  <span className="text-sm text-white/40">/ {goal.totalTarget}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all rounded-full",
                      goal.ratio >= 0.8 ? "bg-action-emerald" :
                      goal.ratio >= 0.5 ? "bg-motion-amber" :
                      "bg-white/20"
                    )}
                    style={{ width: `${Math.min(100, goal.ratio * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-white/40 shrink-0 min-w-[3rem] text-right">
                  {Math.round(goal.ratio * 100)}%
                </span>
              </div>
            </div>

            {/* Promises List */}
            <div className="space-y-2.5">
              {goal.promises.map((promise) => (
                <div
                  key={promise.promiseId}
                  className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {promise.status === 'on-track' && (
                      <CheckCircle2 className="h-4 w-4 text-action-emerald shrink-0" />
                    )}
                    {promise.status === 'at-risk' && (
                      <AlertCircle className="h-4 w-4 text-motion-amber shrink-0" />
                    )}
                    {promise.status === 'missed' && (
                      <XCircle className="h-4 w-4 text-white/20 shrink-0" />
                    )}
                    <span className="text-sm text-white/90 truncate">{promise.label}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn(
                      "text-sm font-mono font-semibold min-w-[3rem] text-right",
                      promise.status === 'on-track' ? "text-action-emerald" :
                      promise.status === 'at-risk' ? "text-motion-amber" :
                      "text-white/40"
                    )}>
                      {promise.actual}/{promise.target}
                    </span>
                    <span className={cn(
                      "text-[9px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-full min-w-[4.5rem] text-center",
                      promise.status === 'on-track' && "bg-action-emerald/10 text-action-emerald",
                      promise.status === 'at-risk' && "bg-motion-amber/10 text-motion-amber",
                      promise.status === 'missed' && "bg-white/5 text-white/40"
                    )}>
                      {promise.status === 'on-track' ? 'On Track' :
                       promise.status === 'at-risk' ? 'At Risk' :
                       'Missed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
