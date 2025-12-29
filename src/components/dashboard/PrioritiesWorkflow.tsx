import { GlassPanel } from '@/components/dashboard/glass-panel';
import { CheckCircle2, Target, TrendingUp } from 'lucide-react';
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-focus-violet" />
          Operations
        </h3>
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Live Status</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {priorities.map((priority, index) => (
          <GlassPanel key={index} className="px-6 py-5 flex items-center justify-between gap-6 border-white/5 shadow-none hover:bg-white/[0.02] hover:border-white/10 transition-all group">
            <div className="flex items-center gap-5 flex-1">
              <div className={cn(
                "p-2.5 rounded-lg border transition-colors",
                priority.isComplete
                  ? "bg-action-emerald/10 border-action-emerald/20 text-action-emerald"
                  : "bg-transparent border-white/10 text-white/20 group-hover:text-white/40 group-hover:border-white/20"
              )}>
                {priority.isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
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
                    priority.isComplete ? "bg-action-emerald" : "bg-white/20"
                  )}
                  style={{ width: `${priority.progress}%` }}
                />
              </div>
              <span className={cn(
                "text-xs font-mono font-bold w-8 text-right",
                priority.isComplete ? "text-action-emerald" : "text-zinc-600"
              )}>
                {priority.unitsThisWeek}/{priority.weeklyTarget}
              </span>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
