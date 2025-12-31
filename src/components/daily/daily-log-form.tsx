"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DailyAuditSchema, type DailyAuditData, BlockerTag } from "@/lib/validators";
import { saveDailyAuditAction } from "@/actions/daily-logs";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DailyLog, SprintWithDetails, SprintGoal, SprintPromise } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isPromiseScheduledForDay } from "@/lib/scoring";
import { useMemo, useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { CheckCircle2, Trophy, AlertTriangle, Loader2 } from "lucide-react";

interface DailyLogFormProps {
  activeSprint?: SprintWithDetails;
  initialData?: DailyLog;
}

export function DailyLogForm({ activeSprint, initialData }: DailyLogFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const router = useRouter();

  const today = useMemo(() => initialData?.date ? new Date(initialData.date) : new Date(), [initialData?.date]);

  // Filter scheduled promises for today
  const goals = useMemo(() => activeSprint?.goals || [], [activeSprint?.goals]);

  const scheduledPromises = useMemo(() => goals.flatMap((goal) =>
    goal.promises?.filter((p: SprintPromise) => p.type === 'weekly' || isPromiseScheduledForDay(p.scheduleDays, today)).map((p: SprintPromise) => ({ ...p, goalText: goal.goalText })) || []
  ), [goals, today]);

  const form = useForm<DailyAuditData>({
    resolver: zodResolver(DailyAuditSchema),
    defaultValues: {
      date: today,
      mainGoalId: initialData?.mainGoalId || (goals.length > 0 ? goals[0].id : undefined),
      energy: initialData?.energy ?? 3,
      blockerTag: (initialData?.blockerTag as BlockerTag) || null,
      note: initialData?.note || "",
      promiseCompletions: scheduledPromises.reduce((acc, p) => ({ ...acc, [p.id]: false }), {}) as Record<string, boolean>,
    },
  });


  const saveLockRef = useRef<boolean>(false);
  const previousDataRef = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef<boolean>(true);

  // Auto-save logic hooks
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const watchedData = form.watch();

  useEffect(() => {
    // Don't auto-save if manual submission is pending or already saving or if no active data
    if (!activeSprint || goals.length === 0 || isPending || isSaving) return;

    // Only auto-save if we have the minimum required data
    if (!watchedData.mainGoalId) return;

    // Compare stringified data to detect actual changes
    const currentDataString = JSON.stringify(watchedData);
    if (currentDataString === previousDataRef.current) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      // Atomic check-and-set lock to prevent race condition
      if (saveLockRef.current || isPending || isSaving) return;
      saveLockRef.current = true;

      // Check if component is still mounted before setting state
      if (!isMountedRef.current) {
        saveLockRef.current = false;
        return;
      }

      setIsSaving(true);
      try {
        await saveDailyAuditAction(watchedData as DailyAuditData);

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setLastSaved(new Date());
          previousDataRef.current = currentDataString;
        }
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsSaving(false);
        }
        saveLockRef.current = false;
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [watchedData, isPending, isSaving, activeSprint, goals.length]);

  // Handle early returns AFTER hooks
  if (!activeSprint) {
    return (
      <GlassPanel className="p-8 text-center border-dashed border-white/10">
        <p className="text-white/40">No active sprint found. Start a sprint to track progress.</p>
      </GlassPanel>
    );
  }

  if (goals.length === 0) {
    return (
      <GlassPanel className="p-8 text-center border-dashed border-white/10">
        <p className="text-white/40">No goals found in active sprint. Please add goals to your sprint before creating a daily audit.</p>
      </GlassPanel>
    );
  }

  async function onSubmit(data: DailyAuditData) {
    // Acquire lock to prevent concurrent auto-save
    if (saveLockRef.current) return;
    saveLockRef.current = true;

    setIsPending(true);
    try {
      await saveDailyAuditAction(data);
      toast.success("Daily audit saved successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save audit");
      console.error(error);
    } finally {
      setIsPending(false);
      saveLockRef.current = false;
    }
  }

  const completions = form.watch("promiseCompletions") || {};
  const keptCount = Object.values(completions).filter(Boolean).length;
  const totalCount = scheduledPromises.length;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="heading-2 uppercase">
            Daily <span className="text-white/20 font-light">{" // "}</span> <span className="text-action-emerald">Audit</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-500",
              lastSaved ? "bg-action-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" : "bg-white/10"
            )} />
            <p className="label-sm text-white/30">
              {isSaving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Draft"}
            </p>
            <span className="text-white/20">•</span>
            <p className="label-sm text-white/40">
              {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Top Row: Main Focus + Promises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Main Focus Goal */}
        <GlassPanel className="p-6 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="metric-label">Main Focus</Label>
              <Trophy className="h-4 w-4 text-action-emerald/40 group-hover:text-action-emerald/60 transition-colors" />
            </div>
            <Controller
              control={form.control}
              name="mainGoalId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-white/5 border-white/5 h-12 text-sm text-white focus:ring-0 focus:ring-offset-0 hover:bg-white/[0.07] transition-colors">
                    <SelectValue placeholder="Select today's focus..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c0c0e] border-white/10">
                    {goals.map((g: SprintGoal) => (
                      <SelectItem key={g.id} value={g.id} className="text-sm focus:bg-white/5 hover:bg-white/5">
                        {g.goalText}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </GlassPanel>

        {/* 2. Promises Kept */}
        <GlassPanel className="p-6 space-y-5 border-white/10 ring-1 ring-white/5 hover:border-white/[0.15] transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Promises <span className="text-action-emerald font-mono text-xs">({keptCount}/{totalCount})</span>
            </h3>
          </div>

          <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {scheduledPromises.length > 0 ? scheduledPromises.map((promise: SprintPromise) => (
              <Controller
                key={promise.id}
                control={form.control}
                name={`promiseCompletions.${promise.id}`}
                render={({ field }) => (
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all duration-200 active:scale-[0.98]",
                      field.value
                        ? "bg-action-emerald/[0.08] border-action-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                        : "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]"
                    )}
                  >
                    <div className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200",
                      field.value ? "bg-action-emerald border-action-emerald text-[#09090b] scale-110" : "border-white/20 bg-white/5"
                    )}>
                      {field.value && <CheckCircle2 className="h-3 w-3 fill-current" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-medium truncate transition-colors", field.value ? "text-white" : "text-zinc-500")}>{promise.text}</p>
                    </div>
                  </div>
                )}
              />
            )) : (
              <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-xs text-white/20 italic">No protocols scheduled</p>
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* 3. Energy & Blocker Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Energy */}
        <GlassPanel className="p-6 space-y-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
          <Label className="metric-label text-white/30 group-hover:text-white/40 transition-colors block">
            Energy Level <span className="text-white/20">· Optional</span>
          </Label>
          <Controller
            control={form.control}
            name="energy"
            render={({ field }) => (
              <div className="flex gap-3 justify-between">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => field.onChange(i)}
                    className={cn(
                      "h-9 w-9 rounded-full border transition-all duration-200 flex items-center justify-center font-mono text-xs hover:scale-110",
                      field.value === i
                        ? "bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110"
                        : "border-white/10 bg-white/5 text-white/30 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            )}
          />
        </GlassPanel>

        {/* Blocker */}
        <GlassPanel className="p-6 space-y-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <Label className="metric-label text-white/30 group-hover:text-white/40 transition-colors">
              Primary Blocker <span className="text-white/20">· Optional</span>
            </Label>
            <AlertTriangle className="h-4 w-4 text-bullshit-crimson/30 group-hover:text-bullshit-crimson/40 transition-colors" />
          </div>
          <Controller
            control={form.control}
            name="blockerTag"
            render={({ field }) => (
              <Select
                onValueChange={(val) => field.onChange(val !== "NONE" ? val as BlockerTag : undefined)}
                value={field.value || "NONE"}
              >
                <SelectTrigger className="w-full bg-white/5 border-white/5 h-12 text-sm text-white hover:bg-white/[0.07] transition-colors">
                  <SelectValue placeholder="No Blocker" />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c0e] border-white/10">
                  <SelectItem value="NONE" className="text-sm">No Blocker</SelectItem>
                  <SelectItem value={BlockerTag.ENERGY} className="text-sm">Energy</SelectItem>
                  <SelectItem value={BlockerTag.TIME} className="text-sm">Time</SelectItem>
                  <SelectItem value={BlockerTag.MOTIVATION} className="text-sm">Motivation</SelectItem>
                  <SelectItem value={BlockerTag.EXTERNAL} className="text-sm">External</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </GlassPanel>
      </div>

      {/* 4. Field Notes */}
      <GlassPanel className="p-6 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
        <div className="flex justify-between items-center mb-4">
          <Label className="metric-label text-white/30 group-hover:text-white/40 transition-colors">
            Field Notes <span className="text-white/20">· Optional</span>
          </Label>
          <span className="label-sm text-white/20 italic">Progression Log</span>
        </div>
        <Textarea
          {...form.register("note")}
          placeholder="Brief insights, observations, or notes about today's work..."
          maxLength={140}
          className="bg-white/5 border-white/5 min-h-[60px] focus:min-h-[120px] transition-all duration-300 text-sm text-white resize-none focus:ring-0 focus:border-white/10 focus:bg-white/[0.07] rounded-xl py-3 px-4"
        />
      </GlassPanel>

      {/* Submit Button - Sticky on mobile, aligned on desktop */}
      <div className="flex justify-end pt-8 md:relative fixed bottom-0 left-0 right-0 md:p-0 p-4 bg-transparent z-10">
        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            "h-14 px-12 button-text font-bold rounded-2xl transition-all duration-300 active:scale-95 w-full md:w-auto shadow-lg",
            "bg-action-emerald hover:bg-action-emerald/90 text-[#09090b]",
            "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
            "border border-action-emerald/20"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Log Entry
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
