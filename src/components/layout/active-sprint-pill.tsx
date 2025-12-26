"use client";

import Link from "next/link";
import { Sprint } from "@/lib/types";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

interface ActiveSprintPillProps {
  sprint: Sprint | null;
}

export function ActiveSprintPill({ sprint }: ActiveSprintPillProps) {
  if (!sprint) {
    return (
      <Link href="/dashboard/sprint">
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/20" />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              No Active Sprint
            </span>
          </div>
        </div>
      </Link>
    );
  }

  const endDate = new Date(sprint.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(0, differenceInDays(endDate, today));

  return (
    <Link href="/dashboard/sprint">
      <div className="px-4 py-2 rounded-full bg-action-emerald/10 border border-action-emerald/20 hover:bg-action-emerald/20 transition-all cursor-pointer group">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-action-emerald animate-pulse" />
          <span className="text-[10px] font-mono text-action-emerald uppercase tracking-widest">
            {sprint.name}
          </span>
          <span className="text-[8px] font-mono text-action-emerald/60">
            {daysLeft}d left
          </span>
          <span className="px-1.5 py-0.5 rounded bg-action-emerald/20 text-[8px] font-mono text-action-emerald uppercase">
            ACTIVE
          </span>
        </div>
      </div>
    </Link>
  );
}

