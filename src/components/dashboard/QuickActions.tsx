import Link from "next/link";
import { Button } from '@/components/ui/button';
import { CheckCircle2, Flame, Layout, TrendingUp, Calendar, FileText, Target, BarChart3 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getCurrentReviewAndPlanningYears } from "@/lib/date-utils";

interface QuickActionsProps {
  todayStatus: 'pending' | 'completed';
  completedYearlyReview: { year: number } | null;
  hasCompletedPlanning: boolean;
}

export function QuickActions({ completedYearlyReview, hasCompletedPlanning }: Omit<QuickActionsProps, 'todayStatus'>) {
  const { reviewYear, planningYear } = getCurrentReviewAndPlanningYears();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Layout className="h-4 w-4 text-white/40" />
        <h3 className="body-sm font-bold text-white uppercase tracking-wider">System Controls</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Weekly Review Row */}
        <Link href="/dashboard/weekly" className="block col-span-1">
          <Button
            variant="outline"
            className="h-20 w-full rounded-2xl flex flex-col items-center justify-center gap-2 group px-3 hover:bg-white/[0.04] transition-all duration-300 border-white/5"
          >
            <div className="p-2.5 rounded-xl bg-focus-violet/10 text-focus-violet group-hover:scale-110 transition-all">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Weekly</span>
          </Button>
        </Link>

        {/* Sprint Dashboard */}
        <Link href="/dashboard/sprint" className="block col-span-1">
          <Button
            variant="outline"
            className="h-20 w-full rounded-2xl flex flex-col items-center justify-center gap-2 group px-3 hover:bg-white/[0.04] transition-all duration-300 border-white/5"
          >
            <div className="p-2.5 rounded-xl bg-action-emerald/10 text-action-emerald group-hover:scale-110 transition-all">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Sprints</span>
          </Button>
        </Link>

        {/* History */}
        <Link href="/dashboard/monthly" className="block col-span-1">
          <Button
            variant="outline"
            className="h-20 w-full rounded-2xl flex flex-col items-center justify-center gap-2 group px-3 hover:bg-white/[0.04] transition-all duration-300 border-white/5"
          >
            <div className="p-2.5 rounded-xl bg-motion-amber/10 text-motion-amber group-hover:scale-110 transition-all">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Monthly</span>
          </Button>
        </Link>

        {/* Ledger */}
        <Link href="/dashboard/audit" className="block col-span-1">
          <Button
            variant="outline"
            className="h-20 w-full rounded-2xl flex flex-col items-center justify-center gap-2 group px-3 hover:bg-white/[0.04] transition-all duration-300 border-white/5"
          >
            <div className="p-2.5 rounded-xl bg-white/5 text-white/40 group-hover:scale-110 transition-all">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Ledger</span>
          </Button>
        </Link>

        {/* Review & Planning Action */}
        <div className="col-span-2 space-y-3 pt-1">
          {!completedYearlyReview ? (
            <Link href="/review" className="block group">
              <Button
                variant="violet"
                className="w-full h-12 rounded-xl bg-focus-violet/80 hover:bg-focus-violet text-white border-none shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-500 overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-4 w-4" />
                  <span className="tracking-[0.2em] font-bold text-[10px] uppercase">Annual Review</span>
                </div>
              </Button>
            </Link>
          ) : (
            <Link href={`/review/${completedYearlyReview.year}`} className="block group">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all duration-500"
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="tracking-[0.2em] font-bold text-[10px] uppercase">{completedYearlyReview.year} Review</span>
                </div>
              </Button>
            </Link>
          )}

          <Link href={hasCompletedPlanning ? "/dashboard/planning/view" : "/dashboard/planning"} className="block group">
            <Button
              variant={hasCompletedPlanning ? "outline" : "violet"}
              className={cn(
                "w-full h-12 rounded-xl transition-all duration-500",
                hasCompletedPlanning
                  ? "border-focus-violet/20 text-focus-violet hover:bg-focus-violet/5 bg-focus-violet/[0.02]"
                  : "bg-focus-violet/80 hover:bg-focus-violet text-white border-none shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                <span className="tracking-[0.2em] font-bold text-[10px] uppercase">{hasCompletedPlanning ? `${planningYear} North Star` : "Planning"}</span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
