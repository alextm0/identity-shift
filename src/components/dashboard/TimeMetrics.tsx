import { GlassPanel } from '@/components/dashboard/glass-panel';
import { Timer, Clock, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TimeMetric {
  label: string;
  percentage: number;
  remaining: string;
}

interface TimeMetricsProps {
  metrics: TimeMetric[];
}

const getHorizonCategory = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('year')) return 'year';
  if (l.includes('quarter')) return 'quarter';
  if (l.includes('sprint')) return 'sprint';
  return 'default';
};

export function TimeMetrics({ metrics }: TimeMetricsProps) {
  return (
    <GlassPanel className="group p-6 relative overflow-hidden border-white/5 shadow-none hover:bg-white/[0.02] hover:border-white/10 transition-all duration-500">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-focus-violet/5 rounded-full blur-3xl" />
      </div>

      {/* Background icon with better integration */}
      <div className="absolute top-2 right-2 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
        <Timer className="h-28 w-28 rotate-12" />
      </div>

      <div className="relative z-10">
        {/* Simple header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-focus-violet/10 transition-colors">
            <Clock className="h-3.5 w-3.5 text-white/40 group-hover:text-focus-violet/60 transition-colors" />
          </div>
          <h3 className="metric-label">Time Horizon</h3>
        </div>

        {/* Individual metrics */}
        <div className="space-y-5">
          {metrics.map((metric, index) => {
            const isLow = metric.percentage <= 25;
            const isMedium = metric.percentage > 25 && metric.percentage <= 50;
            const category = getHorizonCategory(metric.label);

            return (
              <div
                key={index}
                className="group/metric space-y-2 hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-lg transition-all duration-300"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className={cn(
                      "h-3 w-3 transition-all duration-300",
                      category === 'sprint' ? "text-focus-violet" :
                        category === 'quarter' ? "text-motion-amber" :
                          category === 'year' ? "text-action-emerald" :
                            isLow ? "text-bullshit-crimson/60 animate-pulse" :
                              isMedium ? "text-motion-amber/60" :
                                "text-action-emerald/60"
                    )} />
                    <span className="label text-white/60 group-hover/metric:text-white/80 transition-colors capitalize">
                      {metric.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "body-sm font-bold transition-all duration-300",
                      isLow ? "text-bullshit-crimson" :
                        isMedium ? "text-motion-amber" :
                          "text-white"
                    )}>
                      {Math.round(metric.percentage)}%
                    </span>
                    <span className="label-sm text-white/40">left</span>
                  </div>
                </div>

                {/* Enhanced progress bar with unique thickness and glow */}
                <div className={cn(
                  "relative w-full bg-white/5 rounded-full overflow-hidden transition-all duration-300",
                  category === 'year' ? "h-2 group-hover/metric:h-2.5" :
                    category === 'quarter' ? "h-1.5 group-hover/metric:h-2" :
                      "h-1 group-hover/metric:h-1.5"
                )}>
                  {/* Glow effect */}
                  <div
                    className={cn(
                      "absolute inset-0 blur-sm opacity-0 group-hover/metric:opacity-100 transition-opacity duration-300",
                      category === 'sprint' ? "bg-focus-violet/30" :
                        category === 'quarter' ? "bg-motion-amber/30" :
                          category === 'year' ? "bg-action-emerald/30" :
                            metric.percentage > 50 ? "bg-action-emerald/30" :
                              metric.percentage > 25 ? "bg-motion-amber/30" :
                                "bg-bullshit-crimson/30"
                    )}
                    style={{ width: `${metric.percentage}%` }}
                  />
                  {/* Main bar with gradient */}
                  <div
                    className={cn(
                      "relative h-full rounded-full transition-all duration-700 ease-out",
                      category === 'sprint' ? "bg-gradient-to-r from-focus-violet/60 via-focus-violet to-focus-violet shadow-[0_0_8px_rgba(139,92,246,0.5)]" :
                        category === 'quarter' ? "bg-gradient-to-r from-motion-amber/60 via-motion-amber to-motion-amber shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                          category === 'year' ? "bg-gradient-to-r from-action-emerald/60 via-action-emerald to-action-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                            metric.percentage > 50
                              ? "bg-gradient-to-r from-action-emerald/60 via-action-emerald to-action-emerald shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              : metric.percentage > 25
                                ? "bg-gradient-to-r from-motion-amber/60 via-motion-amber to-motion-amber shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                                : "bg-gradient-to-r from-bullshit-crimson/60 via-bullshit-crimson to-bullshit-crimson shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                    )}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>

                <div className="label-sm text-white/30 text-right group-hover/metric:text-white/40 transition-colors">
                  {metric.remaining}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
