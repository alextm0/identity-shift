"use client";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Calendar } from "lucide-react";
import { CalendarDayData } from "@/use-cases/monthly-summary";
import { cn } from "@/lib/utils";
import { format, getDay } from "date-fns";

interface MonthlyCalendarHeatmapProps {
  calendarData: CalendarDayData[];
  monthStr: string;
}

export function MonthlyCalendarHeatmap({ calendarData, monthStr }: MonthlyCalendarHeatmapProps) {
  // Group days into weeks (Mon-Sun)
  const weeks: CalendarDayData[][] = [];
  let currentWeek: CalendarDayData[] = [];

  calendarData.forEach((day, index) => {
    const dayOfWeek = getDay(day.date);
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6

    // If starting a new week (Monday) and current week has data, push it
    if (adjustedDay === 0 && currentWeek.length > 0) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }

    // Add padding for first week if needed
    if (index === 0 && adjustedDay > 0) {
      for (let i = 0; i < adjustedDay; i++) {
        currentWeek.push({} as CalendarDayData); // Empty placeholder
      }
    }

    currentWeek.push(day);

    // If last day, push the week
    if (index === calendarData.length - 1) {
      weeks.push(currentWeek);
    }
  });

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <GlassPanel className="p-6 lg:p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-white/40" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">{format(calendarData[0]?.date || new Date(), 'MMMM yyyy')}</h3>
        </div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Completion Heatmap</p>
      </div>

      <div className="space-y-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2">
          {dayLabels.map((label, i) => (
            <div key={i} className="text-center text-[9px] lg:text-[10px] font-mono text-white/30 uppercase">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1 lg:space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 lg:gap-2">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = week[dayIndex];

                if (!day || !day.date) {
                  return <div key={dayIndex} className="aspect-square" />;
                }

                const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isFuture = day.date > new Date();

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "aspect-square rounded-md border transition-all relative group cursor-default flex items-center justify-center",
                      !day.hasLog && !isFuture && "bg-white/5 border-white/10",
                      !day.hasLog && isFuture && "bg-transparent border-white/5 opacity-30",
                      day.hasLog && day.ratio >= 0.7 && "bg-action-emerald/30 border-action-emerald/40",
                      day.hasLog && day.ratio < 0.7 && day.ratio >= 0.5 && "bg-motion-amber/30 border-motion-amber/40",
                      day.hasLog && day.ratio < 0.5 && "bg-bullshit-crimson/30 border-bullshit-crimson/40",
                      isToday && "ring-2 ring-focus-violet/60"
                    )}
                  >
                    {/* Day number */}
                    <span className={cn(
                      "text-[9px] lg:text-[10px] font-mono",
                      !day.hasLog && "text-white/30",
                      day.hasLog && "text-white/80 font-bold"
                    )}>
                      {format(day.date, 'd')}
                    </span>

                    {/* Tooltip */}
                    {day.hasLog && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {format(day.date, 'MMM d')}
                        <div className="text-[9px] text-white/60">{day.kept}/{day.committed}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-white/10 bg-white/5" />
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider">Not Logged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-bullshit-crimson/30 border-bullshit-crimson/40" />
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider">&lt;50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-motion-amber/30 border-motion-amber/40" />
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider">50-69%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-action-emerald/30 border-action-emerald/40" />
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider">≥70%</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
