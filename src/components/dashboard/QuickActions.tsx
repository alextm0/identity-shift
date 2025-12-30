import Link from "next/link";
import { Button } from '@/components/ui/button';
import { CheckCircle2, Flame, Layout, TrendingUp, History, FileText, Target } from 'lucide-react';
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
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>
      </div>

      <div className="space-y-4">
        {/* 1. Main Action: Log Today */}
        <Link href="/dashboard/daily" className="block group">
          <Button
            className={cn(
              "w-full h-20 rounded-2xl font-mono uppercase tracking-widest text-xs transition-all duration-300 relative overflow-hidden",
              todayStatus === 'completed'
                ? "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                : "bg-black/40 border border-action-emerald/20 text-action-emerald hover:bg-action-emerald/10 hover:border-action-emerald/40 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            )}
          >
            <span className="flex items-center gap-3 relative z-10">
              {todayStatus === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
              {todayStatus === 'completed' ? 'Log Updated' : 'Execute Daily'}
            </span>
            {todayStatus !== 'completed' && (
              <span className="absolute inset-0 bg-action-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Button>
        </Link>

        {/* 2. Secondary Actions Row */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/weekly">
            <div className="group h-24 rounded-2xl bg-black/40 border border-white/5 hover:border-focus-violet/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 hover:bg-white/[0.02]">
              <div className="p-2 rounded-full bg-focus-violet/10 text-focus-violet group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wider transition-colors">Weekly</span>
            </div>
          </Link>

          <Link href="/dashboard/monthly">
            <div className="group h-24 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 hover:bg-white/[0.02]">
              <div className="p-2 rounded-full bg-white/5 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                <History className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-wider transition-colors">Reports</span>
            </div>
          </Link>
        </div>

        {/* 3. Review Action */}
        {!completedYearlyReview ? (
          <Link href="/review" className="block">
            <Button
              variant="violet"
              className="w-full h-14 rounded-2xl font-mono text-[10px] uppercase tracking-widest"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Start {reviewYear} Review
              </span>
            </Button>
          </Link>
        ) : (
          <Link href={`/review/${completedYearlyReview.year}`} className="block">
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl border-white/5 bg-black/40 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] hover:border-white/10 font-mono text-[10px] uppercase tracking-widest"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View {completedYearlyReview.year} Review
              </span>
            </Button>
          </Link>
        )}

        {/* 4. Planning Action - Always visible */}
        <Link href={hasCompletedPlanning ? "/dashboard/planning/view" : "/dashboard/planning"} className="block">
          <Button
            variant={hasCompletedPlanning ? "outline" : "violet"}
            className={cn(
              "w-full h-14 rounded-2xl font-mono text-[10px] uppercase tracking-widest",
              hasCompletedPlanning
                ? "border-white/5 bg-black/40 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] hover:border-white/10"
                : ""
            )}
          >
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {hasCompletedPlanning ? "View Planning" : `Plan ${planningYear}`}
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
