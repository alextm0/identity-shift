import { getDashboardData } from '@/queries/dashboard';
import { PlanningForm } from '@/components/planning/planning-form';

export default async function IdentityPage() {
  const dashboardData = await getDashboardData();

  return (
    <>
      {/* The shared Command Center header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-2 uppercase">
            Identity <span className="text-white/20 font-light">//</span> <span className="text-focus-violet">Planning</span>
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-telemetry-slate">
            Subject: <span className="text-white/80 tracking-widest">{dashboardData.user.name || dashboardData.user.email}</span>
          </p>
        </div>
      </div>

      {/* Planning Form */}
      <div className="transition-all duration-500 ease-in-out">
        <PlanningForm initialData={dashboardData.planning} />
      </div>
    </>
  );
}

