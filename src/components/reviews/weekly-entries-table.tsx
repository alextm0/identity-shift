"use client";

import { useState } from "react";
import { format } from "date-fns";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { Edit2, Calendar, Zap, Trophy, Flame } from "lucide-react";
import { DailyLog, Sprint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DailyLogEditModal } from "./daily-log-edit-modal";

interface WeeklyEntriesTableProps {
  weeklyLogs: DailyLog[];
  activeSprint: Sprint;
}

export function WeeklyEntriesTable({ weeklyLogs, activeSprint }: WeeklyEntriesTableProps) {
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  // Create a map of logs by date for quick lookup
  const logsByDate = new Map<string, DailyLog>();
  weeklyLogs.forEach(log => {
    const dateKey = format(new Date(log.date), "yyyy-MM-dd");
    logsByDate.set(dateKey, log);
  });

  // Generate last 7 days
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  }).reverse();

  const getTotalUnits = (log: DailyLog) => {
    const priorities = log.priorities as any;
    return Object.values(priorities).reduce((sum: number, p: any) => sum + (p.units || 0), 0);
  };

  return (
    <>
      <GlassPanel className="p-5 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-focus-violet flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Daily_Entries</h3>
          </div>
          <p className="text-[9px] sm:text-[10px] font-mono text-white/20 uppercase tracking-widest">
            {weeklyLogs.length} / 7 Days Logged
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {days.map((date) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const log = logsByDate.get(dateKey);
            const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            const totalUnits = log ? getTotalUnits(log) : 0;

            return (
              <div
                key={dateKey}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all",
                  log
                    ? "bg-white/5 border-white/10 hover:border-white/20"
                    : "bg-white/[0.02] border-white/5 border-dashed"
                )}
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-widest">
                      {format(date, "EEE")}
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-white/60">
                      {format(date, "MMM d")}
                    </span>
                    {isToday && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded bg-action-emerald/10 border border-action-emerald/20 text-[7px] sm:text-[8px] font-mono text-action-emerald uppercase">
                        Today
                      </span>
                    )}
                  </div>

                  {log ? (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:gap-4 mt-1.5 sm:mt-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Zap className="h-3 w-3 text-white/40 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs font-mono text-white/60">
                          Energy: {log.energy}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Trophy className="h-3 w-3 text-action-emerald/60 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs font-mono text-action-emerald/80">
                          Units: {totalUnits}
                        </span>
                      </div>
                      {log.mainFocusCompleted && (
                        <span className="px-1.5 sm:px-2 py-0.5 rounded bg-action-emerald/10 border border-action-emerald/20 text-[7px] sm:text-[8px] font-mono text-action-emerald uppercase">
                          Focus ✓
                        </span>
                      )}
                      {log.win && (
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-white/50 truncate max-w-full sm:max-w-[200px]">
                          <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-action-emerald/60 flex-shrink-0" />
                          <span className="truncate">{log.win}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[9px] sm:text-[10px] font-mono text-white/20 uppercase tracking-widest mt-1.5 sm:mt-2">
                      No entry logged
                    </p>
                  )}
                </div>

                {log && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLog(log)}
                    className="h-9 sm:h-8 px-3 sm:px-3 text-white/60 hover:text-white hover:bg-white/10 w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Edit2 className="h-3.5 w-3.5 sm:h-3 sm:w-3 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {editingLog && (
        <DailyLogEditModal
          log={editingLog}
          activeSprint={activeSprint}
          open={!!editingLog}
          onOpenChange={(open) => !open && setEditingLog(null)}
        />
      )}
    </>
  );
}

