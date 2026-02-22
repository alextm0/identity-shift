"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDailyLogByIdAction } from "@/actions/daily-logs";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, Zap, Moon, Activity, Trophy, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyLog } from "@/lib/types";
import { useRouter } from "next/navigation";

// Minimalist schema for editing daily logs
const DailyLogEditSchema = z.object({
  energy: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24).optional(),
  exerciseMinutes: z.number().min(0).max(480).optional(),
  win: z.string().max(300).optional(),
  drain: z.string().max(300).optional(),
  note: z.string().max(500).optional(),
});

type DailyLogEditData = z.infer<typeof DailyLogEditSchema>;

interface DailyLogEditModalProps {
  log: DailyLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyLogEditModal({ log, open, onOpenChange }: DailyLogEditModalProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<DailyLogEditData>({
    resolver: zodResolver(DailyLogEditSchema),
    defaultValues: {
      energy: log.energy || 3,
      sleepHours: log.sleepHours || undefined,
      exerciseMinutes: (log as any).exerciseMinutes || undefined,
      win: log.win || "",
      drain: log.drain || "",
      note: log.note || "",
    },
  });

  async function onSubmit(data: DailyLogEditData) {
    setIsPending(true);
    try {
      await updateDailyLogByIdAction({ ...data, logId: log.id });
      toast.success("Daily log updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update log");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0c0c0e] border-white/10 p-0 overflow-hidden rounded-3xl">
        <div className="p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <span className="h-8 w-1 bg-action-emerald rounded-full" />
              Edit Entry <span className="text-white/20 font-light">//</span> <span className="text-white/40 text-sm font-mono">{new Date(log.date).toLocaleDateString()}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Energy */}
              <GlassPanel className="p-4 space-y-3 bg-white/[0.02] border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-white/30" />
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Energy</Label>
                </div>
                <div className="flex justify-between gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => form.setValue("energy", i)}
                      className={cn(
                        "h-8 w-8 rounded-lg border transition-all duration-200 flex items-center justify-center text-xs font-mono",
                        form.watch("energy") === i
                          ? "bg-white border-white text-black shadow-lg scale-105"
                          : "border-white/10 bg-white/5 text-white/40 hover:border-white/20"
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </GlassPanel>

              {/* Sleep */}
              <GlassPanel className="p-4 space-y-3 bg-white/[0.02] border-white/5">
                <div className="flex items-center gap-2">
                  <Moon className="h-3 w-3 text-white/30" />
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Sleep</Label>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    {...form.register("sleepHours", { valueAsNumber: true })}
                    className="h-9 bg-white/5 border-white/10 text-sm text-white focus:bg-white/10 pr-8"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/20">h</span>
                </div>
              </GlassPanel>

              {/* Exercise */}
              <GlassPanel className="p-4 space-y-3 bg-white/[0.02] border-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-white/30" />
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Exercise</Label>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    {...form.register("exerciseMinutes", { valueAsNumber: true })}
                    className="h-9 bg-white/5 border-white/10 text-sm text-white focus:bg-white/10 pr-10"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/20">min</span>
                </div>
              </GlassPanel>
            </div>

            {/* Wins & Drain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassPanel className="p-4 space-y-3 bg-white/[0.02] border-white/5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3 text-action-emerald/50" />
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Small Win</Label>
                </div>
                <Textarea
                  {...form.register("win")}
                  className="bg-white/5 border-white/10 text-sm text-white min-h-[80px] resize-none focus:bg-white/10 rounded-xl"
                  placeholder="Today's win..."
                />
              </GlassPanel>

              <GlassPanel className="p-4 space-y-3 bg-white/[0.02] border-white/5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-bullshit-crimson/50" />
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Drain</Label>
                </div>
                <Textarea
                  {...form.register("drain")}
                  className="bg-white/5 border-white/10 text-sm text-white min-h-[80px] resize-none focus:bg-white/10 rounded-xl"
                  placeholder="Today's drain..."
                />
              </GlassPanel>
            </div>

            {/* Field Notes */}
            <GlassPanel className="p-4 space-y-3 bg-white/[0.02] border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-white/30" />
                <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Field Notes</Label>
              </div>
              <Textarea
                {...form.register("note")}
                className="bg-white/5 border-white/10 text-sm text-white min-h-[100px] resize-none focus:bg-white/10 rounded-xl"
                placeholder="Additional insights..."
              />
            </GlassPanel>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 px-6 text-white/40 hover:text-white hover:bg-white/5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 px-8 bg-action-emerald hover:bg-action-emerald/90 text-[#09090b] font-bold rounded-xl shadow-lg shadow-action-emerald/10"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
