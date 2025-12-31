import { GlassPanel } from '@/components/dashboard/glass-panel';
import { MetricGauge } from '@/components/dashboard/metric-gauge';
import { getDashboardData } from '@/queries/dashboard';

export default async function AuditPage() {
  const dashboardData = await getDashboardData();

  return (
    <>
      {/* The shared Command Center header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white mb-2 uppercase">
            Command Center <span className="text-white/20 font-light">{"//"}</span> <span className="text-action-emerald">2026</span>
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-telemetry-slate">
            Subject: <span className="text-white/80 tracking-widest">{dashboardData.user.name || dashboardData.user.email}</span> {"//"} 24_HOUR_REALITY: ACTIVE
          </p>
        </div>
      </div>

      {/* Audit content */}
      <div className="animate-fade-blur transition-all duration-500 ease-in-out">
        <div className="unified-pane flex flex-col md:flex-row min-h-[600px] items-start">
          {/* Left Column (70% - Focus) */}
          <div className="flex-[7] flex flex-col p-8 gap-12 self-stretch">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-telemetry-slate">Integrity_Mirror // Audit_Ledger</h3>
                <div className="h-[1px] flex-1 mx-8 bg-white/5" />
                <div className="font-mono text-[10px] text-action-emerald tracking-widest uppercase">STABLE</div>
              </div>

              <div className="h-[300px] w-full bg-white/[0.01] rounded-3xl border border-dashed border-white/5 flex items-center justify-center group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-action-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="text-[10px] font-mono text-telemetry-slate uppercase tracking-[0.5em] z-10">Recharts // Linear_Evidence_Analysis</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <p className="text-[8px] font-mono text-telemetry-slate uppercase tracking-[0.3em] mb-4">Historical_Baseline</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-mono text-white">82</span>
                  <span className="text-xs font-mono text-white/20 mb-1">/100</span>
                </div>
                <p className="text-[10px] font-mono text-telemetry-slate uppercase tracking-widest">Global Integrity Score</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <p className="text-[8px] font-mono text-telemetry-slate uppercase tracking-[0.3em] mb-4">Deviation_Rate</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-mono text-bullshit-crimson">1.4</span>
                  <span className="text-xs font-mono text-white/20 mb-1">%</span>
                </div>
                <p className="text-[10px] font-mono text-telemetry-slate uppercase tracking-widest">Bullshit detection variance</p>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="vertical-separator" />

          {/* Right Column (30% - Context) */}
          <div className="flex-[3] p-8 flex flex-col gap-12 bg-white/[0.01] self-stretch">
            <div className="space-y-8">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-telemetry-slate text-center">Audit_Metrics</h3>

              <div className="flex flex-col items-center">
                <MetricGauge value={78} label="Current_ABS" className="scale-110" />
              </div>

              <div className="horizontal-separator" />

              <div className="p-8 rounded-3xl border border-bullshit-crimson/30 bg-bullshit-crimson/5">
                <h3 className="text-bullshit-crimson font-mono text-[10px] uppercase tracking-[0.3em] mb-4">Required_Adjustment</h3>
                <p className="text-[10px] font-mono text-white/60 leading-relaxed mb-6">
                  System detected energy leakage. Select adjustment to unlock logging.
                </p>
                <div className="space-y-3">
                  {['Scope_Redux', 'Recovery_Reset', 'Env_Reboot'].map((opt) => (
                    <button key={opt} className="w-full p-4 text-[10px] font-mono text-left uppercase tracking-widest bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

