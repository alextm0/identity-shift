import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDashboardData } from '@/queries/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ConsistencyGrid } from '@/components/dashboard/ConsistencyGrid';
import { DailyLogCTA } from '@/components/dashboard/DailyLogCTA';
import { PrioritiesWorkflow } from '@/components/dashboard/PrioritiesWorkflow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { Sparkles } from 'lucide-react';
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
          <DailyLogCTA todayStatus={todayStatus} />

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
