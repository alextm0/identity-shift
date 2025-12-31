"use client";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { TrendingUp } from "lucide-react";
import { WeeklySummaryForMonth } from "@/use-cases/monthly-summary";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MonthlyWeeklyTrendProps {
  weeklySummaries: WeeklySummaryForMonth[];
}

export function MonthlyWeeklyTrend({ weeklySummaries }: MonthlyWeeklyTrendProps) {
  const maxHeight = 100;

  return (
    <GlassPanel className="p-6 lg:p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-white/40" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Monthly Momentum</h3>
        </div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Promises Kept / Week</p>
      </div>

      <div className="space-y-6">
        {/* Chart */}
        <div className="flex items-end justify-between gap-3 lg:gap-4 h-40 lg:h-48 px-1">
          {weeklySummaries.map((week, i) => {
            const heightPercent = Math.min(100, week.ratio * 100);
            const isLatest = i === weeklySummaries.length - 1;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                {/* Bar */}
                <div className="relative w-full flex flex-col justify-end" style={{ height: `${maxHeight}%` }}>
                  {/* Target line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

                  {/* Actual bar */}
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all relative group cursor-default",
                      week.ratio >= 0.7 && "bg-action-emerald",
                      week.ratio < 0.7 && week.ratio >= 0.5 && "bg-motion-amber",
                      week.ratio < 0.5 && "bg-bullshit-crimson/60",
                      isLatest && "ring-2 ring-focus-violet/40"
                    )}
                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {week.kept}/{week.committed}
                      <div className="text-[9px] text-white/60">{format(week.weekStart, 'MMM d')}</div>
                    </div>
                  </div>
                </div>

                {/* Week label */}
                <div className="text-center">
                  <p className={cn(
                    "text-[9px] lg:text-[10px] font-mono uppercase tracking-wider",
                    isLatest && "text-focus-violet font-bold",
                    !isLatest && "text-white/60"
                  )}>
                    W{week.weekNumber}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-action-emerald" />
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">≥70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-motion-amber" />
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">50-69%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-bullshit-crimson/60" />
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">&lt;50%</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
