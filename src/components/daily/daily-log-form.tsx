"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DailyAuditSchema, type DailyAuditData, BlockerTag } from "@/lib/validators";
import { saveDailyAuditAction, deleteDailyLogAction } from "@/actions/daily-logs";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SprintWithDetails, SprintGoal, SprintPromise, DailyLogWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isPromiseScheduledForDay } from "@/lib/scoring";
import { useMemo, useEffect, useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { CheckCircle2, Trophy, AlertTriangle, Loader2, Trash2, Zap, Moon, Activity, FileText } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DailyLogFormProps {
  activeSprint?: SprintWithDetails;
  initialData?: DailyLogWithRelations;
  targetDate?: Date;
}

export function DailyLogForm({ activeSprint, initialData, targetDate }: DailyLogFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(initialData?.updatedAt ? new Date(initialData.updatedAt) : null);
  const [savedLogId, setSavedLogId] = useState<string | undefined>(initialData?.id);

  const router = useRouter();

  const today = useMemo(() => {
    if (initialData?.date) return new Date(initialData.date);
    if (targetDate) return new Date(targetDate);
    return new Date();
  }, [initialData?.date, targetDate]);

  const hasActiveSprint = !!activeSprint;
  const goals = useMemo(() => activeSprint?.goals || [], [activeSprint?.goals]);

  const scheduledPromises = useMemo(() => goals.flatMap((goal) =>
    goal.promises?.filter((p: SprintPromise) => p.type === 'weekly' || isPromiseScheduledForDay(p.scheduleDays, today)).map((p: SprintPromise) => ({ ...p, goalText: goal.goalText })) || []
  ), [goals, today]);

  const form = useForm<DailyAuditData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(DailyAuditSchema) as any,
    defaultValues: {
      date: today,
      mainGoalId: initialData?.mainGoalId || (goals.length > 0 ? goals[0].id : undefined),
      energy: initialData?.energy ?? 3,
      sleepHours: initialData?.sleepHours ?? undefined,
      exerciseMinutes: (initialData as unknown as { exerciseMinutes?: number })?.exerciseMinutes ?? undefined,
      blockerTag: (initialData?.blockerTag as BlockerTag) || null,
      win: initialData?.win || "",
      drain: initialData?.drain || "",
      note: initialData?.note || "",
      promiseCompletions: initialData?.promiseLogs?.reduce((acc, log) => ({
        ...acc,
        [log.promiseId]: log.completed
      }), {}) || scheduledPromises.reduce((acc, p) => ({ ...acc, [p.id]: false }), {}) as Record<string, boolean>,
    },
  });

  const saveLockRef = useRef<boolean>(false);
  const previousDataRef = useRef<string>(JSON.stringify(form.getValues()));
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const watchedData = form.watch();
  const currentLogId = savedLogId || initialData?.id;
  const isNewEntry = !currentLogId;

  // Auto-save for existing entries
  useEffect(() => {
    if (isNewEntry) return;
    if (isPending || isSaving) return;

    const currentDataString = JSON.stringify(watchedData);
    if (currentDataString === previousDataRef.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (saveLockRef.current || isPending || isSaving) return;
      saveLockRef.current = true;
      if (!isMountedRef.current) { saveLockRef.current = false; return; }

      setIsSaving(true);
      try {
        await saveDailyAuditAction(watchedData as DailyAuditData);
        if (isMountedRef.current) {
          setLastSaved(new Date());
          previousDataRef.current = currentDataString;
        }
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        if (isMountedRef.current) setIsSaving(false);
        saveLockRef.current = false;
      }
    }, 2000);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [watchedData, isPending, isSaving, isNewEntry]);

  async function onSubmit(data: DailyAuditData) {
    if (saveLockRef.current) return;
    saveLockRef.current = true;
    setIsPending(true);
    try {
      const result = await saveDailyAuditAction(data);
      if (result.success) {
        if (result.data?.id) setSavedLogId(result.data.id);
        setLastSaved(new Date());
        previousDataRef.current = JSON.stringify(data);
        toast.success("Daily log saved!");
        router.refresh();
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to save log");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save log");
      console.error(error);
    } finally {
      setIsPending(false);
      saveLockRef.current = false;
    }
  }

  async function handleDelete() {
    if (!currentLogId) return;
    setIsDeleting(true);
    try {
      const result = await deleteDailyLogAction(currentLogId);
      if (result.success) {
        setSavedLogId(undefined);
        toast.success("Daily log deleted");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete log");
        setIsDeleting(false);
      }
    } catch (error) {
      toast.error("Failed to delete log");
      console.error(error);
      setIsDeleting(false);
    }
  }

  const completions = form.watch("promiseCompletions") || {};
  const keptCount = Object.values(completions).filter(Boolean).length;
  const totalCount = scheduledPromises.length;

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-28 md:pb-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <h1 className="heading-2 uppercase">
              Daily <span className="text-white/20 font-light">{" // "}</span> <span className="text-action-emerald">Log</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-500 shrink-0",
                lastSaved ? "bg-action-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" : "bg-white/10"
              )} />
              <p className="label-sm text-white/30 text-xs">
                {isSaving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Draft"}
              </p>
              <span className="text-white/20 text-xs">·</span>
              <p className="label-sm text-white/40 text-xs">
                {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {!hasActiveSprint && (
                <>
                  <span className="text-white/20 text-xs">·</span>
                  <p className="label-sm text-white/30 italic text-xs">Free day</p>
                </>
              )}
            </div>
          </div>

          {currentLogId && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white/20 hover:text-bullshit-crimson hover:bg-bullshit-crimson/10 transition-colors shrink-0"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending || isSaving || isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* ── Sprint section: Focus Goal ── */}
        {hasActiveSprint && (
          <GlassPanel className="p-5 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-action-emerald/50 group-hover:text-action-emerald/70 transition-colors" />
                <Label className="metric-label text-white/40 group-hover:text-white/50 transition-colors text-xs uppercase tracking-widest">
                  Today&apos;s Focus
                </Label>
              </div>
            </div>
            {goals.length > 0 ? (
              <Controller
                control={form.control}
                name="mainGoalId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full bg-white/5 border-white/8 h-11 text-sm text-white focus:ring-0 focus:ring-offset-0 hover:bg-white/[0.07] transition-colors rounded-xl">
                      <SelectValue placeholder="Select today's focus..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1e] border-white/15 shadow-xl">
                      {goals.map((g: SprintGoal) => (
                        <SelectItem
                          key={g.id}
                          value={g.id}
                          className="text-sm text-white focus:bg-white/10 focus:text-white hover:bg-white/10 cursor-pointer"
                        >
                          {g.goalText}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <p className="text-sm text-white/30 italic">No goals in this sprint yet.</p>
            )}
          </GlassPanel>
        )}

        {/* ── Protocols Checklist ── */}
        {hasActiveSprint && (
          <GlassPanel className="p-5 border-white/8 hover:border-white/[0.12] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-action-emerald/50" />
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Protocols</h3>
              </div>
              {totalCount > 0 && (
                <span className={cn(
                  "text-xs font-mono px-2.5 py-0.5 rounded-full border transition-all duration-300",
                  keptCount === totalCount && totalCount > 0
                    ? "bg-action-emerald/15 border-action-emerald/30 text-action-emerald"
                    : "bg-white/5 border-white/10 text-white/30"
                )}>
                  {keptCount}/{totalCount}
                </span>
              )}
            </div>

            {scheduledPromises.length > 0 ? (
              <div className="grid gap-2">
                {scheduledPromises.map((promise: SprintPromise) => (
                  <Controller
                    key={promise.id}
                    control={form.control}
                    name={`promiseCompletions.${promise.id}`}
                    render={({ field }) => (
                      <div
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 active:scale-[0.98]",
                          field.value
                            ? "bg-action-emerald/[0.07] border-action-emerald/25"
                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04]"
                        )}
                      >
                        {/* Custom checkbox */}
                        <div className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all duration-200",
                          field.value ? "bg-action-emerald border-action-emerald" : "border-white/20 bg-transparent"
                        )}>
                          {field.value && (
                            <svg className="h-2.5 w-2.5 text-black" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </div>
                        <p className={cn(
                          "text-xs font-medium transition-colors leading-snug",
                          field.value ? "text-white/80" : "text-white/35"
                        )}>{promise.text}</p>
                      </div>
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-white/[0.06] rounded-xl">
                <p className="text-xs text-white/20 italic">No protocols scheduled for today</p>
              </div>
            )}
          </GlassPanel>
        )}

        {/* ── Vitals Row: Energy / Sleep / Exercise ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Energy */}
          <GlassPanel className="p-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-3 w-3 text-white/30 group-hover:text-white/45 transition-colors shrink-0" />
              <Label className="text-xs uppercase tracking-widest text-white/30 group-hover:text-white/40 transition-colors">Energy</Label>
              <span className="ml-auto text-[10px] text-white/20">Required</span>
            </div>
            <Controller
              control={form.control}
              name="energy"
              render={({ field }) => (
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => field.onChange(i)}
                      className={cn(
                        "h-9 w-9 rounded-lg border transition-all duration-150 flex items-center justify-center font-mono text-xs hover:scale-105 active:scale-95",
                        field.value === i
                          ? "bg-white border-white text-black shadow-[0_0_16px_rgba(255,255,255,0.25)] scale-105"
                          : "border-white/8 bg-white/[0.03] text-white/25 hover:border-white/15 hover:bg-white/[0.06]"
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              )}
            />
          </GlassPanel>

          {/* Sleep */}
          <GlassPanel className="p-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-3 w-3 text-white/30 group-hover:text-white/45 transition-colors shrink-0" />
              <Label className="text-xs uppercase tracking-widest text-white/30 group-hover:text-white/40 transition-colors">Sleep</Label>
            </div>
            <div className="relative">
              <Input
                type="number"
                step="0.5"
                min={0}
                max={24}
                {...form.register("sleepHours", { valueAsNumber: true })}
                placeholder="7.5"
                className="bg-white/[0.04] border-white/8 h-10 text-sm text-white placeholder:text-white/15 focus:border-white/15 focus:bg-white/[0.06] pr-10 rounded-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 pointer-events-none">h</span>
            </div>
          </GlassPanel>

          {/* Exercise */}
          <GlassPanel className="p-4 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-3 w-3 text-white/30 group-hover:text-white/45 transition-colors shrink-0" />
              <Label className="text-xs uppercase tracking-widest text-white/30 group-hover:text-white/40 transition-colors">Exercise</Label>
            </div>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={480}
                {...form.register("exerciseMinutes", { valueAsNumber: true })}
                placeholder="30"
                className="bg-white/[0.04] border-white/8 h-10 text-sm text-white placeholder:text-white/15 focus:border-white/15 focus:bg-white/[0.06] pr-12 rounded-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 pointer-events-none">min</span>
            </div>
          </GlassPanel>
        </div>

        {/* ── Small Wins + Drain ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Small Wins */}
          <GlassPanel className="p-5 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-3.5 w-3.5 text-action-emerald/40 group-hover:text-action-emerald/60 transition-colors shrink-0" />
              <Label className="text-xs uppercase tracking-widest text-white/30 group-hover:text-white/40 transition-colors">Small Wins</Label>
            </div>
            <Textarea
              {...form.register("win")}
              placeholder="What went well today?"
              maxLength={300}
              className="bg-white/[0.03] border-white/[0.06] min-h-[64px] focus:min-h-[96px] transition-all duration-300 text-sm text-white resize-none focus:ring-0 focus:border-white/10 focus:bg-white/[0.06] rounded-xl py-3 px-4 placeholder:text-white/15"
            />
          </GlassPanel>

          {/* Drain */}
          <GlassPanel className="p-5 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-3.5 w-3.5 text-bullshit-crimson/40 group-hover:text-bullshit-crimson/60 transition-colors shrink-0" />
              <Label className="text-xs uppercase tracking-widest text-white/30 group-hover:text-white/40 transition-colors">Drain</Label>
            </div>
            <Textarea
              {...form.register("drain")}
              placeholder="What drained or blocked you?"
              maxLength={300}
              className="bg-white/[0.03] border-white/[0.06] min-h-[64px] focus:min-h-[96px] transition-all duration-300 text-sm text-white resize-none focus:ring-0 focus:border-white/10 focus:bg-white/[0.06] rounded-xl py-3 px-4 placeholder:text-white/15"
            />
          </GlassPanel>
        </div>

        {/* ── Field Notes ── */}
        <GlassPanel className="p-5 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-3.5 w-3.5 text-white/25 group-hover:text-white/40 transition-colors shrink-0" />
            <Label className="text-xs uppercase tracking-widest text-white/30 group-hover:text-white/40 transition-colors">Field Notes</Label>
            <span className="ml-auto text-[10px] text-white/15 italic">Optional</span>
          </div>
          <Textarea
            {...form.register("note")}
            placeholder="Insights, observations, anything that doesn't fit elsewhere..."
            maxLength={500}
            className="bg-white/[0.03] border-white/[0.06] min-h-[72px] focus:min-h-[120px] transition-all duration-300 text-sm text-white resize-none focus:ring-0 focus:border-white/10 focus:bg-white/[0.06] rounded-xl py-3 px-4 placeholder:text-white/15"
          />
        </GlassPanel>

        {/* ── Submit ── */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-10 md:relative md:p-0 md:flex md:justify-end md:pt-4">
          <div className="md:hidden absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none -z-[1]" />
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full md:w-auto h-13 px-10 button-text font-bold rounded-2xl transition-all duration-300 active:scale-95 shadow-lg",
              "bg-action-emerald hover:bg-action-emerald/90 text-[#09090b]",
              "hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]",
              "border border-action-emerald/20"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isNewEntry ? "Save Log" : "Update Log"}
              </>
            )}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Daily Log?"
        description="This action cannot be undone. This daily log will be permanently removed."
        confirmText="Delete Log"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
