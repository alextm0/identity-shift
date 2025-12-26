"use client";

import { useState } from "react";
import { useReviewStore } from "@/hooks/stores/use-review-store";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LIFE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import { WORD_LIMITS, DEFAULT_RATING } from "@/lib/constants/review";
import { CheckCircle2, Circle } from "lucide-react";

export function StepAuditAll() {
    const { wheelWins, wheelGaps, wheelRatings, setWheelWin, setWheelGap } = useReviewStore();
    const [selectedDimension, setSelectedDimension] = useState<string>(LIFE_DIMENSIONS[0]);

    const getWinQuestion = (rating: number): string => {
        const targetRating = Math.max(1, rating - 1);
        return `Why didn't you write a ${targetRating}?`;
    };

    const getGapQuestion = (rating: number): string => {
        const targetRating = Math.min(10, rating + 1);
        return `Why isn't it a ${targetRating}?`;
    };

    const isDimensionComplete = (dimension: string): boolean => {
        const win = wheelWins[dimension] || "";
        const gap = wheelGaps[dimension] || "";
        return win.trim().length > 0 && gap.trim().length > 0;
    };

    const completedCount = LIFE_DIMENSIONS.filter(isDimensionComplete).length;

    const currentRating = wheelRatings[selectedDimension] || DEFAULT_RATING;
    const currentWin = wheelWins[selectedDimension] || "";
    const currentGap = wheelGaps[selectedDimension] || "";
    
    const winWordCount = currentWin.trim().split(/\s+/).filter(Boolean).length;
    const gapWordCount = currentGap.trim().split(/\s+/).filter(Boolean).length;
    const winOverLimit = winWordCount > WORD_LIMITS.wheelAudit;
    const gapOverLimit = gapWordCount > WORD_LIMITS.wheelAudit;

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    Deep Dive: What's Working & What's Missing
                </h2>
                <p className="text-white/80 max-w-2xl mx-auto">
                    Reflect on each dimension. You can complete them in any order and return later.
                </p>
                <p className="text-sm font-mono text-white/60 uppercase tracking-widest">
                    {completedCount} of {LIFE_DIMENSIONS.length} completed
                </p>
            </div>

            {/* Dimension Selector */}
            <div className="flex flex-wrap justify-center gap-3">
                {LIFE_DIMENSIONS.map((dimension) => {
                    const label = DIMENSION_LABELS[dimension];
                    const rating = wheelRatings[dimension] || DEFAULT_RATING;
                    const isSelected = selectedDimension === dimension;
                    const isComplete = isDimensionComplete(dimension);
                    
                    return (
                        <button
                            key={dimension}
                            onClick={() => setSelectedDimension(dimension)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                                "font-mono text-xs uppercase tracking-widest",
                                isSelected
                                    ? "bg-focus-violet/20 border-focus-violet text-white"
                                    : isComplete
                                    ? "bg-action-emerald/10 border-action-emerald/30 text-white/80 hover:bg-action-emerald/20"
                                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
                            )}
                        >
                            {isComplete ? (
                                <CheckCircle2 className="h-4 w-4 text-action-emerald" />
                            ) : (
                                <Circle className="h-4 w-4" />
                            )}
                            <span>{label}</span>
                            <span className="text-white/40">({rating}/10)</span>
                        </button>
                    );
                })}
            </div>

            {/* Selected Dimension Card */}
            <div className="max-w-3xl mx-auto">
                <div className="glass-pane p-8 space-y-6">
                    {/* Dimension Header */}
                    <div className="space-y-3 border-b border-white/5 pb-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                                {DIMENSION_LABELS[selectedDimension]}
                            </h3>
                            {isDimensionComplete(selectedDimension) && (
                                <span className="text-xs font-mono text-action-emerald uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Complete
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-mono text-white/60">
                                Rating: {currentRating}/10
                            </span>
                            <div className={cn(
                                "h-2 w-32 rounded-full",
                                currentRating < 5 ? "bg-bullshit-crimson/30" :
                                currentRating >= 8 ? "bg-action-emerald/30" :
                                "bg-white/10"
                            )}>
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all",
                                        currentRating < 5 ? "bg-bullshit-crimson" :
                                        currentRating >= 8 ? "bg-action-emerald" :
                                        "bg-white/40"
                                    )}
                                    style={{ width: `${(currentRating / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* What's Working */}
                    <div className="space-y-3">
                        <label className="text-sm font-mono text-white/80 uppercase tracking-widest block">
                            {getWinQuestion(currentRating)}
                        </label>
                        <Textarea
                            value={currentWin}
                            onChange={(e) => setWheelWin(selectedDimension, e.target.value)}
                            placeholder="What's working here? Even if it's small, list it."
                            className={cn(
                                "min-h-[150px] text-sm",
                                winOverLimit && "border-bullshit-crimson/50 focus:border-bullshit-crimson"
                            )}
                        />
                        <div className="flex justify-between items-center text-xs font-mono text-white/40">
                            <span className="uppercase tracking-widest">
                                {winWordCount} / {WORD_LIMITS.wheelAudit} words
                            </span>
                            {winOverLimit && (
                                <span className="text-bullshit-crimson uppercase tracking-widest">
                                    Over limit
                                </span>
                            )}
                        </div>
                    </div>

                    {/* What's Missing */}
                    <div className="space-y-3">
                        <label className="text-sm font-mono text-white/80 uppercase tracking-widest block">
                            {getGapQuestion(currentRating)}
                        </label>
                        <Textarea
                            value={currentGap}
                            onChange={(e) => setWheelGap(selectedDimension, e.target.value)}
                            placeholder="What's missing? What would move it to the next level?"
                            className={cn(
                                "min-h-[150px] text-sm",
                                gapOverLimit && "border-bullshit-crimson/50 focus:border-bullshit-crimson"
                            )}
                        />
                        <div className="flex justify-between items-center text-xs font-mono text-white/40">
                            <span className="uppercase tracking-widest">
                                {gapWordCount} / {WORD_LIMITS.wheelAudit} words
                            </span>
                            {gapOverLimit && (
                                <span className="text-bullshit-crimson uppercase tracking-widest">
                                    Over limit
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
