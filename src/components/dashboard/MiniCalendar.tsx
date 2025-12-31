import { GlassPanel } from '@/components/dashboard/glass-panel';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, subDays } from 'date-fns';
import { Calendar as CalendarIcon, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  highlightedDates?: Date[];
  className?: string;
}

export function MiniCalendar({ highlightedDates = [], className }: MiniCalendarProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = getDay(monthStart);

  // Add padding days from previous month
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) =>
    subDays(monthStart, firstDayOfWeek - i)
  );

  // Add padding days for next month to complete the grid
  const totalCells = paddingDays.length + daysInMonth.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDays = Array.from({ length: remainingCells }, (_, i) =>
    addDays(monthEnd, i + 1)
  );

  const allDays = [...paddingDays, ...daysInMonth, ...trailingDays];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isHighlighted = (date: Date) => {
    return highlightedDates.some(d => isSameDay(d, date));
  };

  // Calculate stats
  const daysWithLogs = daysInMonth.filter(day => isHighlighted(day)).length;
  const daysPassed = daysInMonth.filter(day => day <= today).length;
  const targetRate = daysPassed > 0 ? Math.round((daysWithLogs / daysPassed) * 100) : 0;

  return (
    <GlassPanel className={cn("group p-6 border-white/5 shadow-none hover:bg-white/[0.02] hover:border-white/10 transition-all duration-500", className)}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-action-emerald/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header with stats */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-action-emerald/10 transition-colors">
                <CalendarIcon className="h-3.5 w-3.5 text-white/40 group-hover:text-action-emerald/60 transition-colors" />
              </div>
              <h3 className="metric-label">{format(today, 'MMMM yyyy')}</h3>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
              <CheckCircle2 className="h-3 w-3 text-action-emerald/60" />
              <span className="label text-white/80 font-semibold">{daysWithLogs}</span>
              <span className="label-sm text-white/40">logged</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  targetRate >= 80 ? "bg-gradient-to-r from-action-emerald/60 to-action-emerald" :
                    targetRate >= 50 ? "bg-gradient-to-r from-motion-amber/60 to-motion-amber" :
                      "bg-gradient-to-r from-white/20 to-white/40"
                )}
                style={{ width: `${targetRate}%` }}
              />
            </div>
            <span className="label-sm text-white/40 w-10 text-right">{targetRate}%</span>
          </div>
          {targetRate >= 80 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendingUp className="h-3 w-3 text-action-emerald/60" />
              <span className="label-sm text-action-emerald/80">Strong consistency</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center label-sm text-white/30 font-bold">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {allDays.map((date, i) => {
              const isToday = isSameDay(date, today);
              const isCurrentMonth = date >= monthStart && date <= monthEnd;
              const highlighted = isHighlighted(date);
              const isPast = date < today && !isToday;

              return (
                <div
                  key={i}
                  className={cn(
                    "relative aspect-square flex items-center justify-center rounded-lg transition-all duration-300",
                    "label text-center font-medium",
                    // Base styling
                    isCurrentMonth ? "text-white/70" : "text-white/15",
                    // Today styling with animation
                    isToday && [
                      "bg-gradient-to-br from-focus-violet to-focus-violet/80",
                      "text-white font-bold",
                      "ring-2 ring-focus-violet/30 ring-offset-2 ring-offset-transparent",
                      "shadow-[0_0_12px_rgba(139,92,246,0.3)]",
                      "scale-105"
                    ],
                    // Highlighted (logged) days
                    highlighted && !isToday && [
                      "bg-action-emerald/15",
                      "text-action-emerald",
                      "font-semibold",
                      "hover:bg-action-emerald/25 hover:scale-105",
                      "shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                    ],
                    // Regular days
                    !isToday && !highlighted && isCurrentMonth && [
                      "hover:bg-white/10 hover:text-white hover:scale-105",
                      isPast && "text-white/40"
                    ]
                  )}
                >
                  {/* Dot indicator for logged days */}
                  {highlighted && !isToday && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-action-emerald animate-pulse" />
                  )}
                  {format(date, 'd')}
                </div>
              );
            })}
          </div>

          {/* Footer insight */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="label-sm text-white/40">This month</span>
              <span className="label text-white/60">
                {daysWithLogs}/{daysPassed} days
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
