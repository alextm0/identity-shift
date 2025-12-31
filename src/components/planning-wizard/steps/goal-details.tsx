"use client";

import { useState } from "react";
import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { cn } from "@/lib/utils";

export function GoalDetailsStep() {
    const { annualGoals = [], updateAnnualGoalDetails } = usePlanningStore();
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
    const goal = annualGoals[currentGoalIndex];

    if (annualGoals.length === 0) {
        return (
            <div className="p-12 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                <p className="text-white/30 font-mono text-xs uppercase tracking-widest">
                    No annual goals selected. Go back to select goals first.
                </p>
            </div>
        );
    }

    const isFirstGoal = currentGoalIndex === 0;
    const isLastGoal = currentGoalIndex === annualGoals.length - 1;

    const handleNext = () => {
        if (!isLastGoal) setCurrentGoalIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (!isFirstGoal) setCurrentGoalIndex(prev => prev - 1);
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
                    Goal Details
                </h1>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                    Define what success looks like.
                </p>
            </div>

            {/* Pagination / Goal Counter */}
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/40 border-b border-white/10 pb-4">
                <span>Goal {currentGoalIndex + 1} of {annualGoals.length}</span>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrev}
                        disabled={isFirstGoal}
                        className={cn("hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors", !isFirstGoal && "underline")}
                    >
                        Previous
                    </button>
                    <span className="text-white/10">|</span>
                    <button
                        onClick={handleNext}
                        disabled={isLastGoal}
                        className={cn("hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors", !isLastGoal && "underline")}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="relative group">
                <GlassPanel key={goal.id} className="relative p-8 space-y-8 border-[var(--color-border)] bg-[var(--color-surface)]">

                    {/* Goal Header */}
                    <div className="space-y-4 border-b border-white/5 pb-8">
                        {goal.category && (
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-action-emerald/20 border border-action-emerald/30 rounded-lg text-xs font-mono text-action-emerald uppercase tracking-widest">
                                    {DIMENSION_LABELS[goal.category as keyof typeof DIMENSION_LABELS]}
                                </span>
                            </div>
                        )}
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                            {goal.text}
                        </h3>
                    </div>

                    {/* Definition of Done */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-mono text-white/80 uppercase tracking-widest">
                                Definition of Done
                            </Label>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Required</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
                            What specific, binary outcome will verify this goal is achieved by Dec 31?
                        </p>
                        <Textarea
                            value={goal.definitionOfDone || ""}
                            onChange={(e) => updateAnnualGoalDetails(goal.id, { definitionOfDone: e.target.value })}
                            placeholder="I have..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[160px] text-base focus:border-white/20 focus:ring-white/10 transition-all resize-none rounded-xl p-4 leading-relaxed"
                            maxLength={1000}
                        />
                    </div>

                    {/* Why This Matters */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-mono text-white/80 uppercase tracking-widest">
                                The Why
                            </Label>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Optional</span>
                        </div>
                        <Textarea
                            value={goal.whyMatters || ""}
                            onChange={(e) => updateAnnualGoalDetails(goal.id, { whyMatters: e.target.value })}
                            placeholder="Why is this meaningful to your future self?"
                            className="bg-white/5 border-white/10 text-white/80 placeholder:text-white/30 min-h-[80px] text-sm focus:border-white/20 focus:ring-white/10 transition-all resize-none rounded-xl p-4"
                            maxLength={1000}
                        />
                    </div>
                </GlassPanel>
            </div>

            {annualGoals.every(ag => (ag.definitionOfDone || "").trim().length > 0) && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-sm text-action-emerald text-center font-mono uppercase tracking-widest">
                        ✓ All goals defined
                    </p>
                </div>
            )}
        </div>
    );
}




