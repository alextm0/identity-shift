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
    <GlassPanel className="p-8 flex flex-col h-full border-white/5 shadow-none hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="label text-[10px] tracking-[0.2em] uppercase text-white/30">Consistency Score</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-action-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] uppercase font-bold tracking-tighter text-white/20">Log</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span className="text-[9px] uppercase font-bold tracking-tighter text-white/20">None</span>
          </div>
        </div>
      </div>

      <div className="flex items-stretch justify-between gap-1.5 mt-auto h-32 relative z-10">
        {consistencyData.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-3 group/day flex-1">
            <div className="relative w-full flex-1 flex items-end">
              <div
                className={cn(
                  "w-full rounded-md transition-all duration-500",
                  day.hasLog
                    ? "bg-action-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)] h-[80%] group-hover/day:h-[95%] group-hover/day:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    : day.isToday
                      ? "bg-white/20 h-[40%] animate-pulse"
                      : "bg-white/[0.05] h-[20%] group-hover/day:bg-white/[0.1] group-hover/day:h-[30%]"
                )}
              />
            </div>
            <span className={cn(
              "text-[9px] font-mono tracking-tighter transition-colors shrink-0 uppercase font-bold",
              day.isToday ? "text-white" : "text-white/20 group-hover/day:text-white/40"
            )}>
              {format(day.date, 'EEEEE')}
            </span>
          </div>
        ))}
      </div>

      {/* Subtle background accent */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-action-emerald/[0.02] blur-3xl rounded-full" />
    </GlassPanel>
  );
}
