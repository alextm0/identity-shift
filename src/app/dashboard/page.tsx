import { getDashboardData } from '@/queries/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SprintStatus } from '@/components/dashboard/SprintStatus';
import { ConsistencyGrid } from '@/components/dashboard/ConsistencyGrid';
import { PrioritiesWorkflow } from '@/components/dashboard/PrioritiesWorkflow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TimeMetrics } from '@/components/dashboard/TimeMetrics';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';

export default async function DashboardPage() {
  const {
    activeSprint,
    todayStatus,
    completedYearlyReview,
    planning,
    sprintDuration,
    currentDay,
    sprintProgress,
    consistencyData,
    prioritiesWithProgress,
    timeMetrics,
    datesWithLogs,
  } = await getDashboardData();

  const hasCompletedPlanning = planning?.status === 'completed';

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-12 md:py-16">
      <DashboardHeader sprintName={activeSprint?.name ?? "No Active Sprint"} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column - Left 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sprint & Consistency Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSprint ? (
              <SprintStatus
                sprintProgress={sprintProgress}
                currentDay={currentDay}
                sprintDuration={sprintDuration}
              />
            ) : (
              <div className="p-8 bg-white/5 rounded-2xl text-center flex flex-col justify-center">
                <p className="text-white/40">No active sprint.</p>
                <a href="/dashboard/sprint" className="text-focus-violet hover:underline">Start a new sprint</a>
              </div>
            )}
            <ConsistencyGrid consistencyData={consistencyData} />
          </div>

          {/* Priorities Workflow */}
          {activeSprint && <PrioritiesWorkflow priorities={prioritiesWithProgress} />}

          {/* Time Metrics & Calendar Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimeMetrics metrics={timeMetrics} />
            <MiniCalendar highlightedDates={datesWithLogs} />
          </div>
        </div>

        {/* Sidebar Column - Right 1/3 */}
        <QuickActions
          todayStatus={todayStatus}
          completedYearlyReview={completedYearlyReview}
          hasCompletedPlanning={hasCompletedPlanning}
        />
      </div>
    </div>
  );
}
