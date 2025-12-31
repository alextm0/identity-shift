import Link from "next/link";
import { Button } from '@/components/ui/button';
import { CheckCircle2, Flame, Layout, TrendingUp, Calendar, FileText, Target } from 'lucide-react';
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  todayStatus: 'pending' | 'completed';
  completedYearlyReview: { year: number } | null;
  hasCompletedPlanning: boolean;
}

export function QuickActions({ todayStatus, completedYearlyReview, hasCompletedPlanning }: QuickActionsProps) {
  const reviewYear = new Date().getFullYear();
  const planningYear = new Date().getFullYear() + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Layout className="h-4 w-4 text-white/40" />
        <h3 className="body-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>
      </div>

      <div className="space-y-4">
        {/* 1. Main Action: Log Today */}
        <Link href="/dashboard/daily" className="block group">
          <Button
            className={cn(
              "w-full h-20 rounded-2xl button-text uppercase transition-all duration-300 relative overflow-hidden",
              todayStatus === 'completed'
                ? "bg-[var(--color-surface)] text-white/40 border border-[var(--color-border)] hover:bg-white/10"
                : "bg-white/[0.02] border border-action-emerald/20 text-action-emerald hover:bg-action-emerald/10 hover:border-action-emerald/40"
            )}
          >
            <span className="flex items-center justify-center gap-3 relative z-10 label-sm">
              {todayStatus === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
              <span className="pt-px">{todayStatus === 'completed' ? 'Log Updated' : 'Execute Daily'}</span>
            </span>
            {todayStatus !== 'completed' && (
              <span className="absolute inset-0 bg-action-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Button>
        </Link>

        {/* 2. Secondary Actions Row */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/weekly" className="block">
            <Button
              variant="outline"
              className="h-24 w-full rounded-2xl flex flex-col items-center justify-center gap-3 group"
            >
              <div className="p-2 rounded-full bg-focus-violet/10 text-focus-violet group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="label-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Weekly</span>
            </Button>
          </Link>

          <Link href="/dashboard/monthly" className="block">
            <Button
              variant="outline"
              className="h-24 w-full rounded-2xl flex flex-col items-center justify-center gap-3 group"
            >
              <div className="p-2 rounded-full bg-focus-violet/10 text-focus-violet group-hover:scale-110 transition-transform">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="label-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Monthly</span>
            </Button>
          </Link>
        </div>

        {/* 3. Review Action */}
        {!completedYearlyReview ? (
          <Link href="/review" className="block">
            <Button
              variant="violet"
              className="w-full h-14 rounded-2xl"
            >
              <span className="flex items-center justify-center gap-2 label-sm">
                <FileText className="h-4 w-4" />
                <span className="pt-px">Start {reviewYear} Review</span>
              </span>
            </Button>
          </Link>
        ) : (
          <Link href={`/review/${completedYearlyReview.year}`} className="block">
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl"
            >
              <span className="flex items-center justify-center gap-2 label-sm text-zinc-500">
                <FileText className="h-4 w-4" />
                <span className="pt-px">View {completedYearlyReview.year} Review</span>
              </span>
            </Button>
          </Link>
        )}

        {/* 4. Planning Action - Always visible */}
        <Link href={hasCompletedPlanning ? "/dashboard/planning/view" : "/dashboard/planning"} className="block">
          <Button
            variant={hasCompletedPlanning ? "outline" : "violet"}
            className="w-full h-14 rounded-2xl"
          >
            <span className={cn(
              "flex items-center justify-center gap-2 label-sm",
              hasCompletedPlanning ? "text-zinc-500" : ""
            )}>
              <Target className="h-4 w-4" />
              <span className="pt-px">{hasCompletedPlanning ? "View Planning" : `Plan ${planningYear}`}</span>
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
