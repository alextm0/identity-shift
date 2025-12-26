"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DailyLogFormSchema, type DailyLogFormData } from "@/lib/validators";
import { saveDailyLogAction } from "@/actions/daily-logs";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EnergySlider } from "./energy-slider";
import { ProgressBar } from "./progress-bar";
import { ProofInput } from "./proof-input";
import { toast } from "sonner";
import { Save, Loader2, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sprint } from "@/lib/types";
import { toSprintWithPriorities } from "@/lib/type-helpers";
import { useRouter } from "next/navigation";

interface DailyLogFormProps {
  activeSprint: Sprint;
  initialData?: any;
}

export function DailyLogForm({ activeSprint, initialData }: DailyLogFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const sprintWithPriorities = toSprintWithPriorities(activeSprint);
  const priorities = sprintWithPriorities.priorities;

  const form = useForm<DailyLogFormData>({
    resolver: zodResolver(DailyLogFormSchema),
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      energy: initialData?.energy || 3,
      sleepHours: initialData?.sleepHours || 7,
      mainFocusCompleted: initialData?.mainFocusCompleted || false,
      morningGapMin: initialData?.morningGapMin || 0,
      distractionMin: initialData?.distractionMin || 0,
      priorities: initialData?.priorities || priorities.reduce((acc, p) => ({
        ...acc,
        [p.key]: { done: false, units: 0 }
      }), {}),
      proofOfWork: initialData?.proofOfWork || [],
      win: initialData?.win || "",
      drain: initialData?.drain || "",
      note: initialData?.note || "",
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

      await saveDailyLogAction(submissionData);
      toast.success("Daily log committed successfully");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to commit log");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-12 pb-24 md:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-1 space-y-4 md:space-y-8">
          <GlassPanel className="p-4 md:p-8 space-y-6 md:space-y-8">
            <EnergySlider
              value={form.watch("energy")}
              onChange={(val) => form.setValue("energy", val)}
            />

            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="space-y-4">
                <Label className="text-xs font-mono uppercase tracking-widest text-white/60">Recovery_Stats</Label>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Sleep Hours</span>
                    <Input
                      type="number"
                      {...form.register("sleepHours", { valueAsNumber: true })}
                      className="h-12 bg-white/5 border-white/10 text-lg font-medium px-4 focus:bg-white/10 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Morning Gap</span>
                    <Input
                      type="number"
                      {...form.register("morningGapMin", { valueAsNumber: true })}
                      className="h-12 bg-white/5 border-white/10 text-lg font-medium px-4 focus:bg-white/10 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase tracking-widest text-white/60">Distraction_Leakage (min)</Label>
                <Input
                  type="number"
                  {...form.register("distractionMin", { valueAsNumber: true })}
                  className="h-12 bg-white/5 border-white/10 text-lg font-medium px-4 focus:bg-white/10 transition-colors"
                />
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-4 md:p-8 bg-focus-violet/5 border-focus-violet/20">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500",
                form.watch("mainFocusCompleted") ? "bg-action-emerald shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-white/10"
              )}>
                <Trophy className={cn("h-5 w-5", form.watch("mainFocusCompleted") ? "text-white" : "text-white/20")} />
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
                "w-full py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest border transition-all duration-300",
                form.watch("mainFocusCompleted")
                  ? "bg-action-emerald/20 border-action-emerald/40 text-action-emerald"
                  : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
              )}
            >
              {form.watch("mainFocusCompleted") ? "IDENTIFIED_AND_SHIPPED" : "COMPLETE_PRIMARY_NODE"}
            </button>
          </GlassPanel>
        </div>

        <div className="lg:col-span-2 space-y-4 md:space-y-8">
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {priorities.map((priority) => {
              const proof = form.watch("proofOfWork")?.find((p) => p.type === priority.key) || { type: priority.key, value: "", url: "" };

              const updateProof = (field: "value" | "url", content: string) => {
                const currentProofs = form.getValues("proofOfWork") || [];
                const index = currentProofs.findIndex((p) => p.type === priority.key);

                if (index === -1) {
                  // Create new entry
                  form.setValue("proofOfWork", [
                    ...currentProofs,
                    {
                      type: priority.key,
                      value: field === "value" ? content : "",
                      url: field === "url" ? content : ""
                    }
                  ]);
                } else {
                  // Update existing entry
                  const newProofs = [...currentProofs];
                  newProofs[index] = { ...newProofs[index], [field]: content };
                  form.setValue("proofOfWork", newProofs);
                }
              };

              return (
                <GlassPanel key={priority.key} className="p-4 md:p-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <GlassPanel className="p-4 md:p-6 space-y-3 border-action-emerald/10">
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-action-emerald" />
                <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">The_Win</Label>
              </div>
              <Input
                {...form.register("win")}
                placeholder="One win today..."
                className="bg-transparent border-none px-3 text-sm text-white focus:ring-0 placeholder:text-white/10"
              />
            </GlassPanel>

            <GlassPanel className="p-4 md:p-6 space-y-3 border-bullshit-crimson/10">
              <div className="flex items-center gap-2">
                <Flame className="h-3 w-3 text-bullshit-crimson" />
                <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">The_Drain</Label>
              </div>
              <Input
                {...form.register("drain")}
                placeholder="What leaked energy?"
                className="bg-transparent border-none px-3 text-sm text-white focus:ring-0 placeholder:text-white/10"
              />
            </GlassPanel>
          </div>

          <div className="flex justify-center md:justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="h-14 px-12 bg-action-emerald hover:bg-action-emerald/90 text-white font-mono uppercase tracking-[0.2em] rounded-2xl emerald-glow"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  EXECUTE_COMMIT
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

