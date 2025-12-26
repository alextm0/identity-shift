"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DailyLogFormSchema, type DailyLogFormData } from "@/lib/validators";
import { updateDailyLogByIdAction } from "@/actions/daily-logs";
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
import { EnergySlider } from "@/components/daily/energy-slider";
import { ProgressBar } from "@/components/daily/progress-bar";
import { ProofInput } from "@/components/daily/proof-input";
import { toast } from "sonner";
import { Save, Loader2, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyLog, Sprint } from "@/lib/types";
import { useRouter } from "next/navigation";

interface DailyLogEditModalProps {
  log: DailyLog;
  activeSprint: Sprint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyLogEditModal({ log, activeSprint, open, onOpenChange }: DailyLogEditModalProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const priorities = (activeSprint.priorities as any[]) || [];

  const form = useForm<DailyLogFormData>({
    resolver: zodResolver(DailyLogFormSchema),
    defaultValues: {
      date: new Date(log.date),
      energy: log.energy,
      sleepHours: log.sleepHours || 7,
      mainFocusCompleted: log.mainFocusCompleted,
      morningGapMin: log.morningGapMin || 0,
      distractionMin: log.distractionMin || 0,
      priorities: (log.priorities as any) || priorities.reduce((acc, p) => ({
        ...acc,
        [p.key]: { done: false, units: 0 }
      }), {}),
      proofOfWork: (log.proofOfWork as any) || [],
      win: log.win || "",
      drain: log.drain || "",
      note: log.note || "",
    },
  });

  async function onSubmit(data: DailyLogFormData) {
    setIsPending(true);
    try {
      const submissionData = {
        ...data,
        priorities: Object.keys(data.priorities).reduce((acc, key) => ({
          ...acc,
          [key]: {
            ...data.priorities[key],
            done: data.priorities[key].units > 0
          }
        }), {})
      };

      await updateDailyLogByIdAction(log.id, submissionData);
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white uppercase tracking-tight">
            Edit Daily Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <GlassPanel className="p-6 space-y-6">
                <EnergySlider
                  value={form.watch("energy")}
                  onChange={(val) => form.setValue("energy", val)}
                />

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-3">
                    <Label className="text-xs font-mono uppercase tracking-widest text-white/60">Recovery_Stats</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Sleep Hours</span>
                        <Input
                          type="number"
                          {...form.register("sleepHours", { valueAsNumber: true })}
                          className="h-10 bg-white/5 border-white/10 text-sm font-medium px-3 focus:bg-white/10 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Morning Gap</span>
                        <Input
                          type="number"
                          {...form.register("morningGapMin", { valueAsNumber: true })}
                          className="h-10 bg-white/5 border-white/10 text-sm font-medium px-3 focus:bg-white/10 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-mono uppercase tracking-widest text-white/60">Distraction_Leakage (min)</Label>
                    <Input
                      type="number"
                      {...form.register("distractionMin", { valueAsNumber: true })}
                      className="h-10 bg-white/5 border-white/10 text-sm font-medium px-3 focus:bg-white/10 transition-colors"
                    />
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 bg-focus-violet/5 border-focus-violet/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-500",
                    form.watch("mainFocusCompleted") ? "bg-action-emerald shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-white/10"
                  )}>
                    <Trophy className={cn("h-4 w-4", form.watch("mainFocusCompleted") ? "text-white" : "text-white/20")} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-tight">Main Focus</h4>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">The Non-Negotiable</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => form.setValue("mainFocusCompleted", !form.watch("mainFocusCompleted"))}
                  className={cn(
                    "w-full py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest border transition-all duration-300",
                    form.watch("mainFocusCompleted")
                      ? "bg-action-emerald/20 border-action-emerald/40 text-action-emerald"
                      : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
                  )}
                >
                  {form.watch("mainFocusCompleted") ? "IDENTIFIED_AND_SHIPPED" : "COMPLETE_PRIMARY_NODE"}
                </button>
              </GlassPanel>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {priorities.map((priority) => {
                  const proof = form.watch("proofOfWork")?.find((p) => p.type === priority.key) || { type: priority.key, value: "", url: "" };

                  const updateProof = (field: "value" | "url", content: string) => {
                    const currentProofs = form.getValues("proofOfWork") || [];
                    const index = currentProofs.findIndex((p) => p.type === priority.key);

                    if (index === -1) {
                      form.setValue("proofOfWork", [
                        ...currentProofs,
                        {
                          type: priority.key,
                          value: field === "value" ? content : "",
                          url: field === "url" ? content : ""
                        }
                      ]);
                    } else {
                      const newProofs = [...currentProofs];
                      newProofs[index] = { ...newProofs[index], [field]: content };
                      form.setValue("proofOfWork", newProofs);
                    }
                  };

                  return (
                    <GlassPanel key={priority.key} className="p-4">
                      <ProgressBar
                        label={priority.label}
                        value={form.watch(`priorities.${priority.key}.units`) || 0}
                        onChange={(val) => {
                          form.setValue(`priorities.${priority.key}.units`, val);
                          form.setValue(`priorities.${priority.key}.done`, val > 0);
                        }}
                      />

                      <ProofInput
                        isActive={(form.watch(`priorities.${priority.key}.units`) || 0) > 0}
                        value={proof.value}
                        url={proof.url || ""}
                        onChange={(val) => updateProof("value", val)}
                        onUrlChange={(val) => updateProof("url", val)}
                      />
                    </GlassPanel>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassPanel className="p-4 space-y-2 border-action-emerald/10">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-action-emerald" />
                    <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">The_Win</Label>
                  </div>
                  <Input
                    {...form.register("win")}
                    placeholder="One win today..."
                    className="bg-transparent border-none px-2 text-sm text-white focus:ring-0 placeholder:text-white/10"
                  />
                </GlassPanel>

                <GlassPanel className="p-4 space-y-2 border-bullshit-crimson/10">
                  <div className="flex items-center gap-2">
                    <Flame className="h-3 w-3 text-bullshit-crimson" />
                    <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">The_Drain</Label>
                  </div>
                  <Input
                    {...form.register("drain")}
                    placeholder="What leaked energy?"
                    className="bg-transparent border-none px-2 text-sm text-white focus:ring-0 placeholder:text-white/10"
                  />
                </GlassPanel>
              </div>

              <GlassPanel className="p-4 space-y-2">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Note</Label>
                <Textarea
                  {...form.register("note")}
                  placeholder="Additional notes..."
                  className="bg-white/5 border-white/10 text-sm text-white focus:ring-0 placeholder:text-white/10 resize-none min-h-[80px]"
                />
              </GlassPanel>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-10 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-6 bg-action-emerald hover:bg-action-emerald/90 text-white font-mono uppercase tracking-widest text-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

