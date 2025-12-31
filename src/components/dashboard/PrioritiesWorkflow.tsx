import { GlassPanel } from '@/components/dashboard/glass-panel';
import { CheckCircle2, Target, Zap, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PriorityWithProgress {
  key: string;
  label: string;
  type: string;
  unitsThisWeek: number;
  weeklyTarget: number;
  progress: number;
  isComplete: boolean;
}

interface PrioritiesWorkflowProps {
  priorities: PriorityWithProgress[];
}

export function PrioritiesWorkflow({ priorities }: PrioritiesWorkflowProps) {
  const completedCount = priorities.filter(p => p.isComplete).length;
  const totalCount = priorities.length;

  return (
    <div className="space-y-6">
      {/* Enhanced header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-focus-violet/10 border border-focus-violet/20">
            <Zap className="h-4 w-4 text-focus-violet" />
          </div>
          <div>
            <h3 className="heading-5 uppercase text-white">Sprint Commitments</h3>
            <p className="label-sm text-white/30 mt-0.5">Active promises for this sprint</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
          <span className="label font-bold text-white">{completedCount}/{totalCount}</span>
          <span className="label-sm text-white/40">done</span>
        </div>
      </div>

      {/* Priority cards */}
      <div className="grid grid-cols-1 gap-3">
        {priorities.map((priority, index) => (
          <GlassPanel
            key={index}
            className={cn(
              "group px-6 py-5 flex items-center justify-between gap-6 border-white/5 shadow-none transition-all duration-300",
              priority.isComplete
                ? "hover:bg-action-emerald/[0.02] hover:border-action-emerald/20"
                : "hover:bg-white/[0.03] hover:border-white/10"
            )}
          >
            {/* Left section: Icon + Label */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn(
                "flex-shrink-0 p-2.5 rounded-xl border transition-all duration-300",
                priority.isComplete
                  ? "bg-action-emerald/10 border-action-emerald/30 text-action-emerald shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "bg-white/5 border-white/10 text-white/30 group-hover:text-white/50 group-hover:border-white/20 group-hover:bg-white/10"
              )}>
                {priority.isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="body-sm font-bold text-white uppercase tracking-wide">
                    {priority.label}
                  </h4>
                  {priority.isComplete && (
                    <Sparkles className="h-3 w-3 text-action-emerald/60 flex-shrink-0" />
                  )}
                </div>
                <p className="label-sm text-white/40 mt-1">{priority.type}</p>
              </div>
            </div>

            {/* Right section: Progress */}
            <div className="flex items-center gap-3 w-full max-w-[140px] md:max-w-[220px]">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden group-hover:h-2 transition-all duration-300">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    priority.isComplete
                      ? "bg-gradient-to-r from-action-emerald/80 to-action-emerald shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      : "bg-gradient-to-r from-white/20 to-white/30"
                  )}
                  style={{ width: `${priority.progress}%` }}
                />
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className={cn(
                  "label font-mono font-bold tabular-nums transition-colors",
                  priority.isComplete ? "text-action-emerald" : "text-white/60"
                )}>
                  {priority.unitsThisWeek}/{priority.weeklyTarget}
                </span>
                <span className="label-sm text-white/30">
                  {Math.round(priority.progress)}%
                </span>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
