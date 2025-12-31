import { GlassPanel } from '@/components/dashboard/glass-panel';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface ConsistencyDay {
  date: Date;
  isToday: boolean;
  hasLog: boolean;
}

interface ConsistencyGridProps {
  consistencyData: ConsistencyDay[];
}

export function ConsistencyGrid({ consistencyData }: ConsistencyGridProps) {
  return (
    <GlassPanel className="p-6 flex flex-col justify-between min-h-[160px] border-white/5 shadow-none hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="metric-label">Consistency</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-action-emerald" />
            <span className="label-sm text-white/20">Hit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span className="label-sm text-white/20">Miss</span>
          </div>
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
              "label-sm text-center w-full",
              day.isToday ? "text-white" : "text-white/10"
            )}>
              {format(day.date, 'EEEEE')}
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
