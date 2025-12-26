"use client";

import { useState, useMemo } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { PerceivedVsActual } from "./perceived-vs-actual";
import { IdentityCheck } from "./identity-check";
import { createMonthlyReviewAction } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, Sparkles, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyLog, Sprint } from "@/lib/types";

interface MonthlyReviewPanelProps {
  activeSprint: Sprint;
  monthlyLogs: DailyLog[];
  monthStr: string;
  latestReview?: any;
}

export function MonthlyReviewPanel({ activeSprint, monthlyLogs, monthStr, latestReview }: MonthlyReviewPanelProps) {
  const [isPending, setIsPending] = useState(false);
  const [whoWereYou, setWhoWereYou] = useState("");
  const [desiredIdentity, setDesiredIdentity] = useState("partially");
  const [oneChange, setOneChange] = useState("");

  const priorities = (activeSprint.priorities as any[]) || [];
  const [perceivedProgress, setPerceivedProgress] = useState<Record<string, number>>(
    priorities.reduce((acc, p) => ({ ...acc, [p.key]: 5 }), {})
  );

  const actualData = useMemo(() => {
    return priorities.map(p => {
      const actualUnits = monthlyLogs.reduce((total, log) => {
        const logPriorities = log.priorities as any;
        return total + (logPriorities[p.key]?.units || 0);
      }, 0);

      const targetPerMonth = p.weeklyTargetUnits * 4;
      const normalizedActual = Math.min(10, (actualUnits / targetPerMonth) * 10);

      return {
        name: p.label,
        perceived: perceivedProgress[p.key] || 0,
        actual: Math.round(normalizedActual * 10) / 10
      };
    });
  }, [monthlyLogs, priorities, perceivedProgress]);

  async function handleSaveReview() {
    setIsPending(true);
    try {
      const avgActual = actualData.reduce((acc, d) => acc + d.actual, 0) / actualData.length;

      await createMonthlyReviewAction({
        sprintId: activeSprint.id,
        month: monthStr,
        whoWereYou,
        desiredIdentity: desiredIdentity as any,
        perceivedProgress,
        actualProgress: {
          progressRatio: avgActual / 10,
          evidenceRatio: 100
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

  return (
    <div className="space-y-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-focus-violet" />
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Identity Audit</h3>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-mono uppercase tracking-widest text-white/60">Reflection: Who were you this month?</Label>
              <Textarea
                value={whoWereYou}
                onChange={(e) => setWhoWereYou(e.target.value)}
                placeholder="Describe your actions, defaults, and identity in this time period..."
                className="min-h-[150px] bg-white/5 border-white/10 p-4 text-base text-zinc-200 focus:ring-0 placeholder:text-zinc-600 resize-none rounded-xl leading-relaxed font-sans"
              />
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <Label className="text-xs font-mono uppercase tracking-widest text-white/60">Alignment: Does this match your desired self?</Label>
              <IdentityCheck value={desiredIdentity} onChange={setDesiredIdentity} />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-action-emerald" />
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">The Evolution</h3>
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-mono uppercase tracking-widest text-white/60">One change for next month</Label>
              <Input
                value={oneChange}
                onChange={(e) => setOneChange(e.target.value)}
                placeholder="What single habit or constraint will you adjust?"
                className="bg-white/5 border-white/10 text-base h-14 rounded-xl px-4 text-zinc-200 placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <GlassPanel className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-action-emerald" />
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Integrity Mirror</h3>
              </div>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Self-Perception vs Reality (1-10)</p>
            </div>

            <PerceivedVsActual data={actualData} />

            <div className="mt-12 space-y-6">
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest border-b border-white/5 pb-4">Calibration Inputs</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {priorities.map((p) => (
                  <div key={p.key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[8px] font-mono uppercase tracking-widest text-white/40">{p.label}</Label>
                      <span className="text-[10px] font-mono font-bold text-focus-violet">{perceivedProgress[p.key] || 0}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={perceivedProgress[p.key] || 5}
                      onChange={(e) => setPerceivedProgress({ ...perceivedProgress, [p.key]: parseInt(e.target.value) })}
                      className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-focus-violet"
                    />
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveReview}
              disabled={isPending || monthlyLogs.length === 0}
              className="h-14 px-12 bg-focus-violet hover:bg-focus-violet/90 text-white font-mono uppercase tracking-[0.2em] rounded-2xl violet-glow transition-all duration-500"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : (
                <span className="flex items-center gap-3">
                  <Save className="h-5 w-5" />
                  LOG_REFLECTION
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

