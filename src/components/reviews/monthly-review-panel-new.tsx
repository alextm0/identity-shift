"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { IntegrityMirror } from "./integrity-mirror";
import { IdentityCheck } from "./identity-check";
import { MonthlyWeeklyTrend } from "./monthly-weekly-trend";
import { MonthlyCalendarHeatmap } from "./monthly-calendar-heatmap";
import { createMonthlyReviewAction } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2, User, Sparkles, Calendar, Target, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyLog, SprintWithDetails, MonthlyReviewWithTypedFields, PromiseLog, MonthlyReview } from "@/lib/types";
import { DesiredIdentityStatus } from "@/lib/enums";
import { calculateMonthlySummary } from "@/use-cases/monthly-summary";
import { startOfMonth, endOfMonth, format, parse } from "date-fns";

interface MonthlyReviewPanelNewProps {
  activeSprint?: SprintWithDetails;
  monthlyLogs: DailyLog[];
  promiseLogs: PromiseLog[];
  monthStr: string;
  latestReview?: MonthlyReviewWithTypedFields;
  allReviews?: MonthlyReview[];
}

export function MonthlyReviewPanelNew({
  activeSprint,
  monthlyLogs,
  promiseLogs,
  monthStr,
  latestReview,
  allReviews = []
}: MonthlyReviewPanelNewProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [whoWereYou, setWhoWereYou] = useState("");
  const [desiredIdentity, setDesiredIdentity] = useState<DesiredIdentityStatus>(DesiredIdentityStatus.PARTIALLY);
  const [oneChange, setOneChange] = useState("");
  const [selfRating, setSelfRating] = useState(5);

  // Load existing review data when latestReview changes
  useEffect(() => {
    if (latestReview) {
      setWhoWereYou(latestReview.whoWereYou || "");
      setDesiredIdentity((latestReview.desiredIdentity as DesiredIdentityStatus) || DesiredIdentityStatus.PARTIALLY);
      setOneChange(latestReview.oneChange || "");
      // Note: selfRating could be loaded from perceivedProgress if needed
    } else {
      setWhoWereYou("");
      setDesiredIdentity(DesiredIdentityStatus.PARTIALLY);
      setOneChange("");
      setSelfRating(5);
    }
  }, [latestReview]);

  // Generate list of available months from reviews and current month
  const availableMonths = useMemo(() => {
    const months = new Set<string>();

    // Add current month
    const currentMonth = format(new Date(), "yyyy-MM");
    months.add(currentMonth);

    // Add all months from existing reviews
    allReviews.forEach(review => {
      if (review.month) {
        months.add(review.month);
      }
    });

    // Convert to sorted array (newest first)
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [allReviews]);

  const handleMonthChange = (newMonth: string) => {
    router.push(`/dashboard/monthly?month=${newMonth}`);
  };

  const getMonthLabel = (monthStr: string) => {
    try {
      const date = parse(monthStr, "yyyy-MM", new Date());
      return format(date, "MMMM yyyy");
    } catch {
      return monthStr;
    }
  };

  const summary = useMemo(() => {
    if (!activeSprint) return null;

    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    return calculateMonthlySummary(monthlyLogs, activeSprint, promiseLogs, monthStart, monthEnd);
  }, [monthlyLogs, activeSprint, promiseLogs]);

  // Calculate reality rating from data
  const realityRating = useMemo(() => {
    if (!summary) return 5;

    const promisesKeptWeight = summary.promisesKeptRatio * 10 * 0.5;
    const daysLoggedWeight = (summary.daysLogged / summary.totalDaysInMonth) * 10 * 0.3;
    const goalsWeight = summary.goalSummaries.length > 0
      ? (summary.goalSummaries.reduce((sum, g) => sum + g.ratio, 0) / summary.goalSummaries.length) * 10 * 0.2
      : 0;

    return Math.min(10, promisesKeptWeight + daysLoggedWeight + goalsWeight);
  }, [summary]);

  async function handleSaveReview() {
    if (!activeSprint) return;

    setIsPending(true);
    try {
      await createMonthlyReviewAction({
        sprintId: activeSprint.id,
        month: monthStr,
        whoWereYou,
        desiredIdentity,
        perceivedProgress: { overall: selfRating },
        actualProgress: {
          progressRatio: realityRating / 10,
          evidenceRatio: (summary?.daysLogged || 0) / (summary?.totalDaysInMonth || 1) * 100
        },
        oneChange
      });
      toast.success("Monthly Reflection Logged");
    } catch (error) {
      toast.error("Failed to save review");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  if (!activeSprint || !summary) {
    return (
      <div className="text-center text-white/40 py-12">
        No active sprint found. Start a sprint to see monthly insights.
      </div>
    );
  }

  return (
    <div className="space-y-10 lg:space-y-12">
      {/* Month Selector */}
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-focus-violet" />
            <Label className="text-xs font-mono uppercase tracking-widest text-white/60">Select Month</Label>
          </div>
          <Select value={monthStr} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white rounded-xl h-12">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900/95 border-white/10 backdrop-blur-xl">
              {availableMonths.map((month) => (
                <SelectItem
                  key={month}
                  value={month}
                  className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                >
                  {getMonthLabel(month)}
                  {allReviews.some(r => r.month === month) && (
                    <span className="ml-2 text-[10px] text-action-emerald">✓</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </GlassPanel>

      {/* Month Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <GlassPanel className="p-6 lg:p-7 hover:border-action-emerald/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Promises Kept</p>
            <Target className="h-4 w-4 text-action-emerald/40 flex-shrink-0" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold leading-tight">
            <span className={cn(
              summary.promisesKeptRatio >= 0.7 ? "text-action-emerald" : "text-white"
            )}>
              {summary.totalPromisesKept}
            </span>
            <span className="text-lg lg:text-xl text-white/40"> / {summary.totalPromisesTarget}</span>
          </p>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-2">
            {(summary.promisesKeptRatio * 100).toFixed(0)}% completion
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 lg:p-7 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Days Logged</p>
            <Calendar className="h-4 w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            {summary.daysLogged}<span className="text-lg lg:text-xl text-white/40"> / {summary.totalDaysInMonth}</span>
          </p>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-2">
            {((summary.daysLogged / summary.totalDaysInMonth) * 100).toFixed(0)}% consistency
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 lg:p-7 hover:border-motion-amber/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Longest Streak</p>
            <Flame className="h-4 w-4 text-motion-amber/40 flex-shrink-0" />
          </div>
          <p className={cn(
            "text-3xl lg:text-4xl font-bold leading-tight",
            summary.longestStreak >= 7 ? "text-motion-amber" : "text-white"
          )}>
            {summary.longestStreak}
            <span className="text-lg lg:text-xl text-white/40"> days</span>
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 lg:p-7 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-tight">Avg Energy</p>
            <TrendingUp className="h-4 w-4 text-white/20 flex-shrink-0" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            {summary.avgEnergy.toFixed(1)}<span className="text-lg lg:text-xl text-white/40">/5</span>
          </p>
        </GlassPanel>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <MonthlyWeeklyTrend weeklySummaries={summary.weeklySummaries} />
        <MonthlyCalendarHeatmap calendarData={summary.calendarData} monthStr={monthStr} />
      </div>

      {/* Main Content: Identity Audit + Integrity Mirror */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Identity Audit & Evolution */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-focus-violet" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Identity Audit</h3>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-white/60">Who were you this month?</Label>
              <Textarea
                value={whoWereYou}
                onChange={(e) => setWhoWereYou(e.target.value)}
                placeholder="Describe your actions, defaults, and identity..."
                className="min-h-[120px] bg-white/5 border-white/10 p-4 text-sm text-zinc-200 focus:ring-0 placeholder:text-zinc-600 resize-none rounded-xl leading-relaxed"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-white/60">Alignment</Label>
              <IdentityCheck value={desiredIdentity} onChange={setDesiredIdentity} />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-action-emerald" />
              <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Evolution</h3>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-white/60">One change for next month</Label>
              <Input
                value={oneChange}
                onChange={(e) => setOneChange(e.target.value)}
                placeholder="Single habit or constraint to adjust"
                className="bg-white/5 border-white/10 text-sm h-12 rounded-xl px-4 text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Integrity Mirror */}
        <div className="lg:col-span-2">
          <IntegrityMirror
            selfRating={selfRating}
            realityRating={realityRating}
            onSelfRatingChange={setSelfRating}
          />

          <div className="flex justify-end mt-8">
            <Button
              onClick={handleSaveReview}
              disabled={isPending || monthlyLogs.length === 0}
              className="h-12 px-10 bg-focus-violet hover:bg-focus-violet/90 text-white font-mono uppercase tracking-[0.2em] rounded-xl transition-all"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-3" />
              ) : (
                <span className="flex items-center gap-3">
                  <Save className="h-4 w-4" />
                  Log Reflection
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
