"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { ABSGauge } from "./abs-gauge";
import { ProgressChart } from "./progress-chart";
import { WeeklyTrendChart } from "./weekly-trend-chart";
import { AlertList } from "./alert-list";
import { WeeklyEntriesTable } from "./weekly-entries-table";
import { WeeklyHistory } from "./weekly-history";
import { calculateWeeklySummary } from "@/use-cases/weekly-summary";
import { generateAlerts } from "@/use-cases/alerts";
import { calculateABS } from "@/use-cases/anti-bullshit";
import { BarChart3, ShieldAlert, Calendar, Zap as ZapIcon, Target, ChevronDown } from "lucide-react";
import { DailyLog, SprintWithPriorities, WeeklyReview } from "@/lib/types";
import { toDailyLogWithTypedFields } from "@/lib/type-helpers";
import { cn } from "@/lib/utils";

interface WeeklyReviewPanelProps {
  activeSprint?: SprintWithPriorities;
  weeklyLogs: DailyLog[];
  latestReview?: WeeklyReview | null;
  allReviews?: WeeklyReview[];
}

type ChartType = "trend" | "progress";

export function WeeklyReviewPanel({ activeSprint, weeklyLogs, latestReview, allReviews = [] }: WeeklyReviewPanelProps) {
  // Default to "trend" chart when no sprint (since "progress" requires sprint priorities)
  const [selectedChart, setSelectedChart] = useState<ChartType>(activeSprint ? "trend" : "trend");
  
  const summary = useMemo(() => activeSprint ? calculateWeeklySummary(weeklyLogs, activeSprint) : {
    prioritySummary: {},
    avgEnergy: weeklyLogs.length > 0 ? weeklyLogs.reduce((sum, log) => sum + log.energy, 0) / weeklyLogs.length : 0,
    motionUnits: 0,
    actionUnits: 0,
  }, [weeklyLogs, activeSprint]);
  const absScore = useMemo(() => calculateABS(summary.motionUnits, summary.actionUnits), [summary]);
  const alerts = useMemo(() => generateAlerts(weeklyLogs, summary), [weeklyLogs, summary]);

  // Calculate week date range
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekRange = `${format(weekStart, "MMM d")} - ${format(today, "MMM d, yyyy")}`;

  // Calculate total units
  const totalUnits = weeklyLogs.reduce((sum, log) => {
    const typedLog = toDailyLogWithTypedFields(log);
    return sum + Object.values(typedLog.priorities).reduce((s, p) => s + (p.units || 0), 0);
  }, 0);

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-12">
      {/* Week Date Range */}
      <div className="flex items-center gap-2 text-white/40">
        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest">{weekRange}</p>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
        <GlassPanel className="p-5 sm:p-5 md:p-6 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-[8px] sm:text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Days_Logged</p>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">{weeklyLogs.length} / 7</p>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-5 md:p-6 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-[8px] sm:text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Avg_Energy</p>
            <ZapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">{summary.avgEnergy.toFixed(1)}<span className="text-base sm:text-lg text-white/40">/5</span></p>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-5 md:p-6 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-[8px] sm:text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Total_Units</p>
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-action-emerald leading-tight">{totalUnits}</p>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-5 md:p-6 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-[8px] sm:text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">ABS_Score</p>
            <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-focus-violet leading-tight">{absScore}</p>
        </GlassPanel>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          <GlassPanel className="p-0 overflow-hidden border-action-emerald/10">
            <ABSGauge value={absScore} />
          </GlassPanel>

          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/20" />
              <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-white/40">Diagnostic_Alerts</h3>
            </div>
            <AlertList alerts={alerts} />
          </div>

          <WeeklyHistory reviews={allReviews} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          {/* Chart Section with Dropdown */}
          <GlassPanel className="p-5 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-focus-violet flex-shrink-0" />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white uppercase tracking-tight">
                  {selectedChart === "trend" ? "Weekly_Trends" : "Integrity Mirror"}
                </h3>
              </div>
              {activeSprint && (
                <div className="relative inline-flex items-center w-full sm:w-auto">
                  <select
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value as ChartType)}
                    className={cn(
                      "appearance-none bg-white/5 border border-focus-violet/30 rounded-full px-3 sm:px-4 py-2 pr-9 sm:pr-10 w-full sm:w-auto",
                      "text-[10px] sm:text-xs font-mono text-white uppercase tracking-widest",
                      "hover:bg-white/10 hover:border-focus-violet/50",
                      "focus:outline-none focus:ring-2 focus:ring-focus-violet/50 focus:border-focus-violet/50",
                      "transition-all cursor-pointer min-w-[140px] sm:min-w-[160px]"
                    )}
                  >
                    <option value="trend" className="bg-[#050505] text-white">
                      Weekly Trends
                    </option>
                    <option value="progress" className="bg-[#050505] text-white">
                      Integrity Mirror
                    </option>
                  </select>
                  <ChevronDown className="absolute right-2.5 sm:right-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 pointer-events-none" />
                </div>
              )}
            </div>

            {selectedChart === "trend" ? (
              <>
                <p className="text-[9px] sm:text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4 sm:mb-6">
                  Energy & Units Over Time
                </p>
                <WeeklyTrendChart weeklyLogs={weeklyLogs} />
              </>
            ) : activeSprint ? (
              <>
                <p className="text-[9px] sm:text-[10px] font-mono text-white/20 uppercase tracking-widest mb-6 sm:mb-8">
                  Reality vs Targets
                </p>
                <ProgressChart data={Object.values(summary.prioritySummary)} />
                
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 md:mt-12 pt-8 sm:pt-10 md:pt-12 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[7px] sm:text-[8px] font-mono text-white/20 uppercase tracking-widest">Avg_Energy</p>
                    <p className="text-lg sm:text-xl font-bold text-white">{summary.avgEnergy.toFixed(1)}/5</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[7px] sm:text-[8px] font-mono text-white/20 uppercase tracking-widest">Motion_Units</p>
                    <p className="text-lg sm:text-xl font-bold text-motion-amber">{summary.motionUnits}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[7px] sm:text-[8px] font-mono text-white/20 uppercase tracking-widest">Action_Units</p>
                    <p className="text-lg sm:text-xl font-bold text-action-emerald">{summary.actionUnits}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-[9px] sm:text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4 sm:mb-6">
                  Energy & Units Over Time
                </p>
                <WeeklyTrendChart weeklyLogs={weeklyLogs} />
              </>
            )}
          </GlassPanel>

          {/* Daily Entries Table */}
          <WeeklyEntriesTable weeklyLogs={weeklyLogs} activeSprint={activeSprint} />
        </div>
      </div>
    </div>
  );
}

