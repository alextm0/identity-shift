import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardData } from '@/queries/dashboard';
import { GlassPanel } from '@/components/dashboard/glass-panel';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Layout,
  Target,
  History,
  TrendingUp,
  Clock,
  Calendar
} from 'lucide-react';
import { format, subDays, isSameDay, getISOWeek, differenceInDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { toSprintWithPriorities, toDailyLogWithTypedFields } from "@/lib/type-helpers";

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  if (!dashboardData.activeSprint) {
    redirect("/dashboard/sprint");
  }

  const { activeSprint, todayLog, recentLogs, todayStatus, daysLeft } = dashboardData;
  const sprintWithPriorities = toSprintWithPriorities(activeSprint);
  const priorities = sprintWithPriorities.priorities;
  
  // Compute sprint duration from start and end dates
  let sprintDuration = 30; // Default fallback
  if (activeSprint?.startDate && activeSprint?.endDate) {
    const startDate = new Date(activeSprint.startDate);
    const endDate = new Date(activeSprint.endDate);
    const computedDuration = differenceInDays(endDate, startDate);
    sprintDuration = computedDuration > 0 ? computedDuration : 30; // Fallback to 30 if invalid
  }
  
  const currentDay = sprintDuration - (daysLeft || 0);
  const sprintProgress = sprintDuration > 0 ? Math.min(100, (currentDay / sprintDuration) * 100) : 0;
  const currentDate = new Date();
  const weekNumber = getISOWeek(currentDate);

  // Consistency Data (Last 14 days)
  const historyDays = 14;
  const consistencyData = Array.from({ length: historyDays }).map((_, i) => {
    const d = subDays(new Date(), (historyDays - 1) - i);
    return {
      date: d,
      isToday: isSameDay(d, new Date()),
      hasLog: recentLogs.some(log => isSameDay(new Date(log.date), d)),
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-12 md:py-16">

      {/* Restored & Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase mb-4">
            Command Center <span className="text-white/20 font-light">//</span> <span className="text-action-emerald">2026</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-widest text-white/40">
            <span className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {format(currentDate, "EEEE, MMMM d")}
            </span>
            <span className="h-3 w-[1px] bg-white/10" />
            <span>Week {weekNumber}</span>
            <span className="h-3 w-[1px] bg-white/10" />
            <span className="text-action-emerald">{activeSprint.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Column - Left 2/3 */}
        <div className="lg:col-span-2 space-y-8">

          {/* Sprint & Consistency Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimalist Sprint Status */}
            <GlassPanel className="p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] border-white/5 shadow-none hover:bg-white/[0.02] transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <Clock className="h-24 w-24" />
              </div>
              <div>
                <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Sprint Velocity</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{Math.round(sprintProgress)}%</span>
                  <span className="text-xs font-mono text-white/40 uppercase">Complete</span>
                </div>
              </div>
              <div className="space-y-2 mt-4 relative z-10">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-white/60">Day {currentDay}</span>
                  <span className="text-white/20">Target {sprintDuration}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full"
                    style={{ width: `${sprintProgress}%` }}
                  />
                </div>
              </div>
            </GlassPanel>

            {/* Consistency Grid */}
            <GlassPanel className="p-6 flex flex-col justify-between min-h-[160px] border-white/5 shadow-none hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Consistency</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-action-emerald" /><span className="text-[8px] font-mono uppercase text-white/20">Hit</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-white/10" /><span className="text-[8px] font-mono uppercase text-white/20">Miss</span></div>
                </div>
              </div>
              <div className="flex justify-between items-end gap-1.5 h-full pt-4">
                {consistencyData.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group flex-1 h-full justify-end">
                    <div
                      className={cn(
                        "w-full rounded-sm transition-all duration-300",
                        day.hasLog
                          ? "bg-action-emerald/80 h-[70%]"
                          : day.isToday
                            ? "bg-white/10 h-[30%] animate-pulse"
                            : "bg-white/5 h-[20%]"
                      )}
                    />
                    <span className={cn(
                      "text-[8px] font-mono uppercase text-center w-full",
                      day.isToday ? "text-white" : "text-white/10"
                    )}>
                      {format(day.date, 'EEEEE')}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* Priorities Workflow */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-focus-violet" />
                Operations
              </h3>
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Live Status</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {priorities.map((priority, index) => {
                const unitsThisWeek = recentLogs.reduce((acc, log) => {
                  const typedLog = toDailyLogWithTypedFields(log);
                  return acc + (typedLog.priorities[priority.key]?.units || 0);
                }, 0);
                const weeklyTarget = priority.weeklyTargetUnits || 5;
                const progress = Math.min(100, (unitsThisWeek / weeklyTarget) * 100);
                const isComplete = unitsThisWeek >= weeklyTarget;

                return (
                  <GlassPanel key={index} className="px-6 py-5 flex items-center justify-between gap-6 border-white/5 shadow-none hover:bg-white/[0.02] hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-5 flex-1">
                      <div className={cn(
                        "p-2.5 rounded-lg border transition-colors",
                        isComplete
                          ? "bg-action-emerald/10 border-action-emerald/20 text-action-emerald"
                          : "bg-transparent border-white/10 text-white/20 group-hover:text-white/40 group-hover:border-white/20"
                      )}>
                        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-200 text-sm uppercase tracking-tight mb-0.5">{priority.label}</h4>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{priority.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full max-w-[120px] md:max-w-[200px]">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isComplete ? "bg-action-emerald" : "bg-white/20"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-mono font-bold w-8 text-right",
                        isComplete ? "text-action-emerald" : "text-zinc-600"
                      )}>
                        {unitsThisWeek}/{weeklyTarget}
                      </span>
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Column - Right 1/3 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="h-4 w-4 text-white/40" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>
          </div>

          <div className="space-y-4">
            {/* 1. Main Action: Log Today */}
            <Link href="/dashboard/daily" className="block group">
              <Button
                className={cn(
                  "w-full h-20 rounded-2xl font-mono uppercase tracking-widest text-xs transition-all duration-300 relative overflow-hidden",
                  todayStatus === 'completed'
                    ? "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                    : "bg-black/40 border border-action-emerald/20 text-action-emerald hover:bg-action-emerald/10 hover:border-action-emerald/40 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                )}
              >
                <span className="flex items-center gap-3 relative z-10">
                  {todayStatus === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
                  {todayStatus === 'completed' ? 'Log Updated' : 'Execute Daily'}
                </span>
                {todayStatus !== 'completed' && (
                  <span className="absolute inset-0 bg-action-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Button>
            </Link>

            {/* 2. Secondary Actions Row */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/weekly">
                <div className="group h-24 rounded-2xl bg-black/40 border border-white/5 hover:border-focus-violet/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 hover:bg-white/[0.02]">
                  <div className="p-2 rounded-full bg-focus-violet/10 text-focus-violet group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wider transition-colors">Weekly</span>
                </div>
              </Link>

              <Link href="/dashboard/monthly">
                <div className="group h-24 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 hover:bg-white/[0.02]">
                  <div className="p-2 rounded-full bg-white/5 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    <History className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wider transition-colors">Reports</span>
                </div>
              </Link>
            </div>

            {/* 3. Bottom Action: Adjust Plan */}
            <Link href="/dashboard/identity" className="block">
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl border-white/5 bg-black/40 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] hover:border-white/10 font-mono text-[10px] uppercase tracking-widest"
              >
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Adjust Identity Plan
                </span>
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
