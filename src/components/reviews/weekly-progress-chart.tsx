"use client";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { BarChart3 } from "lucide-react";
import { DailyLog, PromiseLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

interface WeeklyProgressChartProps {
  weeklyLogs: DailyLog[];
  promiseLogs: PromiseLog[];
  totalTarget: number; // Total promises expected per day
}

interface DayData {
  day: string;
  date: Date;
  kept: number;
  committed: number;
  hasLog: boolean;
  ratio: number;
}

export function WeeklyProgressChart({ weeklyLogs, promiseLogs, totalTarget }: WeeklyProgressChartProps) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  // Build 7 days of data (Mon-Sun)
  const weekData: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayLogs = weeklyLogs.filter(log => isSameDay(new Date(log.date), date));
    const dayPromises = promiseLogs.filter(log => isSameDay(new Date(log.date), date));

    const kept = dayPromises.filter(p => p.completed).length;
    const committed = totalTarget; // Expected promises per day
    const hasLog = dayLogs.length > 0;
    const ratio = committed > 0 ? kept / committed : 0;

    return {
      day: format(date, 'EEE').toUpperCase(),
      date,
      kept,
      committed,
      hasLog,
      ratio
    };
  });

  const maxHeight = 100; // percentage for chart height

  return (
    <GlassPanel className="p-6 lg:p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-4 w-4 text-white/40" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Weekly Progress</h3>
        </div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Target: Log daily</p>
      </div>

      <div className="space-y-6">
        {/* Chart */}
        <div className="flex items-end justify-between gap-2 lg:gap-3 h-32 lg:h-40 px-1">
          {weekData.map((day, i) => {
            const heightPercent = Math.min(100, day.ratio * 100);
            const isToday = isSameDay(day.date, today);
            const isFuture = day.date > today;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                {/* Bar */}
                <div className="relative w-full flex flex-col justify-end" style={{ height: `${maxHeight}%` }}>
                  {/* Target line (faint, at 100%) */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

                  {/* Actual bar */}
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all relative group cursor-default",
                      !day.hasLog && !isFuture && "opacity-30",
                      isFuture && "opacity-20",
                      day.hasLog && day.ratio >= 0.7 && "bg-action-emerald",
                      day.hasLog && day.ratio < 0.7 && day.ratio >= 0.5 && "bg-motion-amber",
                      day.hasLog && day.ratio < 0.5 && "bg-bullshit-crimson/60",
                      !day.hasLog && !isFuture && "bg-white/10"
                    )}
                    style={{ height: `${day.hasLog ? heightPercent : 5}%` }}
                  >
                    {/* Tooltip on hover */}
                    {day.hasLog && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {day.kept}/{day.committed}
                      </div>
                    )}
                  </div>
                </div>

                {/* Day label */}
                <div className="text-center">
                  <p className={cn(
                    "text-[9px] lg:text-[10px] font-mono uppercase tracking-wider",
                    isToday && "text-focus-violet font-bold",
                    !isToday && day.hasLog && "text-white/60",
                    !day.hasLog && "text-white/20"
                  )}>
                    {day.day.slice(0, 3)}
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
