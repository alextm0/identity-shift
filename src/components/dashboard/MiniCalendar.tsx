"use client";

import { GlassPanel } from '@/components/dashboard/glass-panel';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addDays, subDays, isWithinInterval, differenceInDays } from 'date-fns';
import { CheckCircle2, TrendingUp, Zap, Flame, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

interface MiniCalendarProps {
  highlightedDates?: Date[];
  sprintStart?: Date;
  sprintEnd?: Date;
  className?: string;
}

export function MiniCalendar({ highlightedDates = [], sprintStart, sprintEnd, className }: MiniCalendarProps) {
  const router = useRouter();
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

  const handleDateClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    router.push(`/dashboard/daily?date=${dateString}`);
  };

  return (
    <GlassPanel className={cn("group/calendar p-6 border-white/5 hover:border-white/10 transition-all duration-700 relative overflow-hidden text-white", className)}>
      {/* Background illumination */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-focus-violet/5 rounded-full blur-3xl group-hover:bg-focus-violet/10 transition-colors duration-700" />
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-action-emerald/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header: Identity Shift Style */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>

              <h2 className="text-2xl font-black lowercase tracking-tighter text-white/90">
                {format(today, 'MMMM')} <span className="text-white/10 font-thin">{format(today, 'yyyy')}</span>
              </h2>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-action-emerald" />
                <span className="text-[12px] font-mono font-bold text-white/90">{daysWithLogs} <span className="text-white/20">/ {daysPassed}</span></span>
              </div>
            </div>
          </div>


        </div>

        <div className="space-y-4">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-[9px] font-black text-white/20 uppercase tracking-widest pb-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((date, i) => {
              const isToday = isSameDay(date, today);
              const isCurrentMonth = date >= monthStart && date <= monthEnd;
              const highlighted = isHighlighted(date);
              const isPast = date < today && !isToday;
              const isInSprint = sprintStart && sprintEnd && isWithinInterval(date, { start: sprintStart, end: sprintEnd });
              const isClickable = date <= today;

              return (
                <div
                  key={i}
                  onClick={() => isClickable && handleDateClick(date)}
                  className={cn(
                    "relative aspect-square flex items-center justify-center rounded-lg transition-all duration-500",
                    "text-[11px] font-mono font-medium",
                    isClickable ? "cursor-pointer" : "cursor-default opacity-20",
                    isCurrentMonth ? "text-white/60" : "text-white/10",

                    // Sprint Background
                    isInSprint && !isToday && "bg-focus-violet/[0.04]",

                    // Today Styling (Black on White for high visibility)
                    isToday && [
                      "bg-white text-black font-black z-20 scale-110",
                      "shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    ],

                    // Highlighted (Logged) Styling
                    highlighted && !isToday && [
                      "text-action-emerald overflow-hidden",
                      "hover:bg-action-emerald/10 hover:scale-105"
                    ],

                    // Hover for regular days
                    !isToday && !highlighted && isClickable && "hover:bg-white/5 hover:text-white"
                  )}
                >
                  {/* Sprint Indicators (Premium "North Star" Design) */}
                  {sprintStart && isSameDay(date, sprintStart) && (
                    <>
                      {/* Corner Bracket */}
                      <div className="absolute inset-0 border-l-[3px] border-t-[3px] border-focus-violet/60 rounded-tl-xl pointer-events-none z-10 shadow-[inset_2px_2px_10px_rgba(139,92,246,0.3)]" />
                      {/* Sub-label */}
                      <span className="absolute -top-4 left-0 text-[7px] font-black text-focus-violet uppercase tracking-widest opacity-0 group-hover/calendar:opacity-100 transition-opacity">Launch</span>
                    </>
                  )}
                  {sprintEnd && isSameDay(date, sprintEnd) && (
                    <>
                      {/* Corner Bracket */}
                      <div className="absolute inset-0 border-r-[3px] border-b-[3px] border-focus-violet/60 rounded-br-xl pointer-events-none z-10 shadow-[inset_-2px_-2px_10px_rgba(139,92,246,0.3)]" />
                      {/* Sub-label */}
                      <span className="absolute -bottom-4 right-0 text-[7px] font-black text-focus-violet uppercase tracking-widest opacity-0 group-hover/calendar:opacity-100 transition-opacity">Target</span>
                    </>
                  )}

                  {/* Verified Indicator */}
                  {highlighted && !isToday && (
                    <div className="absolute inset-0 border border-action-emerald/20 rounded-lg pointer-events-none" />
                  )}

                  {/* Today's pulsing ring if in sprint */}
                  {isToday && isInSprint && (
                    <div className="absolute -inset-1 border border-focus-violet/40 rounded-xl animate-pulse -z-10" />
                  )}

                  <span className="relative z-10">{format(date, 'd')}</span>
                </div>
              );
            })}
          </div>

          {/* Footer Metrics */}
          <div className="pt-6 mt-2 border-t border-white/5 space-y-5">
            {sprintStart && sprintEnd ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-focus-violet/10 border border-focus-violet/20 flex items-center justify-center">
                      <Flame className="h-3.5 w-3.5 text-focus-violet" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white/80 leading-none tabular-nums">
                        {Math.max(0, differenceInDays(sprintEnd, today) + 1)} Days
                      </span>
                      <span className="text-[8px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mt-1">
                        {differenceInDays(sprintEnd, today) + 1 <= 0 ? "Completed" : "Remaining"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      differenceInDays(sprintEnd, today) + 1 <= 0 ? "bg-white/20" : "bg-focus-violet animate-pulse"
                    )} />
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                      {differenceInDays(sprintEnd, today) + 1 <= 0 ? "Ended" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Timeline Display */}
                <div className="relative group/timeline px-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-0.5">Start</span>
                      <span className="text-[10px] font-mono font-bold text-white/60 lowercase">{format(sprintStart, 'dd MMM')}</span>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-0.5">End</span>
                      <span className="text-[10px] font-mono font-bold text-white/60 lowercase">{format(sprintEnd, 'dd MMM')}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-focus-violet/20 via-focus-violet/50 to-focus-violet/20 rounded-full transition-all duration-700 group-hover:via-focus-violet/80"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-white/20" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white/20 tracking-tighter lowercase">System Idle</span>
                    <span className="text-[8px] font-mono font-black text-white/10 uppercase tracking-[0.2em] mt-0.5">Status: Standby</span>
                  </div>
                </div>
                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden" />
              </div>
            )}


          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
