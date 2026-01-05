import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDashboardData } from '@/queries/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SprintStatus } from '@/components/dashboard/SprintStatus';
import { ConsistencyGrid } from '@/components/dashboard/ConsistencyGrid';
import { PrioritiesWorkflow } from '@/components/dashboard/PrioritiesWorkflow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TimeMetrics } from '@/components/dashboard/TimeMetrics';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2, Flame, TrendingUp, Layout, Calendar, BarChart3, Zap, Sparkles } from 'lucide-react';
import { GlassPanel } from '@/components/dashboard/glass-panel';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Track your daily progress, sprint status, and priorities',
  robots: {
    index: false,
    follow: false,
  },
};

async function DashboardContent() {
  const {
    activeSprint,
    activeSprintsWithMetrics,
    todayStatus,
    completedYearlyReview,
    planning,
    consistencyData,
    prioritiesWithProgress,
    timeMetrics,
    datesWithLogs,
  } = await getDashboardData();

  const hasCompletedPlanning = planning?.status === 'completed';

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10 space-y-10">
      <DashboardHeader sprintName={
        activeSprintsWithMetrics.length > 1
          ? `${activeSprintsWithMetrics.length} Active Sprints`
          : activeSprint?.name ?? "No Active Sprint"
      } />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Metrics & Systems (Left) */}
        <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
          <ConsistencyGrid consistencyData={consistencyData} />
          <QuickActions
            completedYearlyReview={completedYearlyReview}
            hasCompletedPlanning={hasCompletedPlanning}
          />
        </div>

        {/* Column 2: Active Protocol & Flow (Center) */}
        <div className="lg:col-span-6 space-y-8 order-1 lg:order-2">
          {/* Main Call to Action - Compact Hero */}
          <Link href="/dashboard/daily" className="block group/log">
            <GlassPanel
              className={cn(
                "p-5 flex flex-row items-center justify-between gap-6 border-white/5 transition-all duration-500 relative overflow-hidden group/panel",
                todayStatus === 'completed'
                  ? "bg-white/[0.01] opacity-60 hover:opacity-100"
                  : "bg-gradient-to-br from-action-emerald/[0.02] to-transparent hover:border-action-emerald/20 shadow-[0_0_40px_rgba(16,185,129,0.02)]"
              )}
            >
              <div className="flex items-center gap-5 relative z-10">
                {/* Compact Iconic Element */}
                <div className="relative shrink-0">
                  <div className={cn(
                    "relative flex items-center justify-center h-12 w-12 rounded-xl transition-all duration-500",
                    todayStatus === 'completed'
                      ? "bg-white/5 text-white/20"
                      : "bg-action-emerald/10 text-action-emerald border border-action-emerald/20 group-hover/panel:bg-action-emerald/20"
                  )}>
                    {todayStatus === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Zap className="h-6 w-6 fill-action-emerald/20 transition-transform group-hover/panel:scale-110" />
                    )}
                  </div>

                  {/* Status Indicator Dot */}
                  <div className={cn(
                    "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background z-20 flex items-center justify-center",
                    todayStatus === 'completed' ? "bg-white/20" : "bg-action-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  )}>
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h2 className={cn(
                    "text-xl font-black lowercase tracking-tighter transition-colors duration-500 leading-tight",
                    todayStatus === 'completed' ? "text-white/20" : "text-white"
                  )}>
                    {todayStatus === 'completed' ? "Log Secured" : "Log the Day"}
                  </h2>
                  <p className="text-[12px] text-white/50 font-normal leading-none transition-colors group-hover/panel:text-white/70">
                    {todayStatus === 'completed'
                      ? "Neural trajectories stabilized."
                      : "Document the process. Shift the identity."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <div className={cn(
                  "hidden sm:flex flex-col items-end gap-1.5",
                  todayStatus === 'completed' ? "opacity-10" : "opacity-100"
                )}>
                  <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em] text-action-emerald/60">
                    {todayStatus === 'completed' ? "SYNCED" : "READY"}
                  </span>
                  <div className="w-20 h-[2px] bg-white/5 overflow-hidden rounded-full">
                    <div className={cn(
                      "h-full transition-all duration-[1s] ease-in-out",
                      todayStatus === 'completed' ? "bg-white/20 w-full" : "bg-action-emerald w-[15%] group-hover/panel:w-full"
                    )} />
                  </div>
                </div>

                <div className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-lg border transition-all duration-500 relative group/btn shrink-0",
                  todayStatus === 'completed'
                    ? "bg-white/5 border-white/5 text-white/10"
                    : "bg-action-emerald/10 border-action-emerald/20 text-action-emerald hover:bg-white hover:text-background hover:border-white shadow-lg"
                )}>
                  <TrendingUp className="h-5 w-5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </div>
              </div>
            </GlassPanel>
          </Link>

          <PrioritiesWorkflow priorities={prioritiesWithProgress} />
        </div>

        {/* Column 3: Context & Blueprint (Right) */}
        <div className="lg:col-span-3 space-y-8 order-3">
          <div className="space-y-4">

            <MiniCalendar
              highlightedDates={datesWithLogs}
              sprintStart={activeSprint?.startDate ? new Date(activeSprint.startDate) : undefined}
              sprintEnd={activeSprint?.endDate ? new Date(activeSprint.endDate) : undefined}
            />
          </div>

          <div className="group">
            <GlassPanel className="p-6 border-white/5 bg-white/[0.01] hover:border-focus-violet/20 transition-all duration-700 relative overflow-hidden">
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-focus-violet/10 border border-focus-violet/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-focus-violet" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[11px] font-black text-white/90 tracking-tighter lowercase">Identity Protocol</h4>
                      <span className="text-[8px] font-mono font-black text-focus-violet/40 uppercase tracking-[0.2em] mt-0.5">Core Principle</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-focus-violet/40 animate-pulse" />
                </div>

                <p className="text-[17px] font-bold text-white/60 tracking-tight leading-snug">
                  A tiny experiment is a small action repeated for a set number of trials, designed to learn about yourself.
                </p>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div >
    </div >
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-pulse">
      <div className="h-16 w-96 bg-white/5 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 outline-none">
        <div className="lg:col-span-3 space-y-8">
          <div className="h-40 bg-white/5 rounded-2xl" />
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
        <div className="lg:col-span-6 space-y-8">
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
        <div className="lg:col-span-3 space-y-8">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
