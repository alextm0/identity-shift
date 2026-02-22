"use client";

import { useMemo } from "react";
import { format, startOfWeek, endOfWeek, getWeek } from "date-fns";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { WeeklyEntriesTable } from "./weekly-entries-table";
import { PromisesByGoalTable } from "./promises-by-goal-table";
import { WeeklyProgressChart } from "./weekly-progress-chart";
import { calculateWeeklySummary } from "@/use-cases/weekly-summary";
import { Calendar, Zap as ZapIcon, Target } from "lucide-react";
import { DailyLog, SprintWithDetails, WeeklyReview, PromiseLog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WeeklyReviewPanelProps {
  activeSprint?: SprintWithDetails;
  weeklyLogs: DailyLog[];
  promiseLogs: PromiseLog[];
  latestReview?: WeeklyReview | null;
  allReviews?: WeeklyReview[];
}

export function WeeklyReviewPanel({ activeSprint, weeklyLogs, promiseLogs }: WeeklyReviewPanelProps) {
  const summary = useMemo(() => activeSprint ? calculateWeeklySummary(weeklyLogs, activeSprint, promiseLogs) : {
    prioritySummary: {},
    goalSummaries: [],
    avgEnergy: weeklyLogs.length > 0 ? weeklyLogs.reduce((sum, log) => sum + log.energy, 0) / weeklyLogs.length : 0,
    motionUnits: 0,
    actionUnits: 0,
    logsCount: weeklyLogs.length,
    totalPromisesKept: 0,
    totalPromisesTarget: 0,
    promisesAtRisk: 0,
  }, [weeklyLogs, activeSprint, promiseLogs]);

  // Calculate week date range with Monday as start
  const today = new Date();
  const weekStartDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEndDate = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
  const weekNumber = getWeek(today, { weekStartsOn: 1 });
  const weekRange = `Week ${weekNumber}: ${format(weekStartDate, "MMM d")} - ${format(weekEndDate, "MMM d, yyyy")}`;

  return (
    <div className="space-y-10 md:space-y-12 lg:space-y-16">
      {/* Week Date Range */}
      <div className="flex items-center gap-3 text-white/40">
        <Calendar className="h-4 w-4" />
        <p className="font-mono text-xs uppercase tracking-widest">{weekRange}</p>
      </div>

      {/* Week Summary - Top Priority */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        <GlassPanel className="p-6 lg:p-7 hover:border-action-emerald/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Promises Kept</p>
            <Target className="h-4 w-4 text-action-emerald/40 flex-shrink-0" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold leading-tight">
            <span className={cn(
              summary.totalPromisesTarget > 0 && summary.totalPromisesKept / summary.totalPromisesTarget >= 0.7
                ? "text-action-emerald"
                : "text-white"
            )}>
              {summary.totalPromisesKept}
            </span>
            <span className="text-lg lg:text-xl text-white/40"> / {summary.totalPromisesTarget}</span>
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 lg:p-7 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Days Logged</p>
            <Calendar className="h-4 w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            {weeklyLogs.length}<span className="text-lg lg:text-xl text-white/40"> / 7</span>
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 lg:p-7 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Avg Energy</p>
            <ZapIcon className="h-4 w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            {summary.avgEnergy.toFixed(1)}<span className="text-lg lg:text-xl text-white/40">/5</span>
          </p>
        </GlassPanel>
      </div>

      {/* Weekly Progress Chart - Full Width */}
      <WeeklyProgressChart
        weeklyLogs={weeklyLogs}
        promiseLogs={promiseLogs}
        totalTarget={activeSprint ? summary.totalPromisesTarget / 7 : 0}
      />

      {/* Main Content: Promises Table */}
      {activeSprint && summary.goalSummaries.length > 0 && (
        <PromisesByGoalTable goalSummaries={summary.goalSummaries} />
      )}

      {/* Daily Entries Table - Full Width */}
      <div className="space-y-5 pt-4 lg:pt-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/20" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Daily Entries</h3>
        </div>
        <WeeklyEntriesTable weeklyLogs={weeklyLogs} promiseLogs={promiseLogs} />
      </div>
    </div>
  );
}

