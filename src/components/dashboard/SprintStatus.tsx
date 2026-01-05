import { GlassPanel } from '@/components/dashboard/glass-panel';
import { Clock } from 'lucide-react';

interface SprintStatusProps {
  sprintProgress: number;
  currentDay: number;
  sprintDuration: number;
  title?: string;
}

export function SprintStatus({ sprintProgress, currentDay, sprintDuration, title = "Sprint Velocity" }: SprintStatusProps) {
  return (
    <GlassPanel className="p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] border-white/5 shadow-none hover:bg-white/[0.02] transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
        <Clock className="h-24 w-24" />
      </div>
      <div>
        <h3 className="metric-label mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="metric-value">{Math.round(sprintProgress)}%</span>
          <span className="label text-white/40">Complete</span>
        </div>
      </div>
      <div className="space-y-2 mt-4 relative z-10">
        <div className="flex justify-between label-sm">
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
  );
}
