"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { WheelOfLife } from "@/components/planning/wheel-of-life";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { analyzeDimensions, convertRatingsToWheelFormat } from "@/lib/utils/dimension-analysis";

interface StepSummaryProps {
    year: number;
}

export function StepSummary({ year }: StepSummaryProps) {
    const { wheelRatings, generatedNarrative, setNarrative, bigThreeWins, damnGoodDecision } = useReviewStore();

    // Analyze dimensions using utility function
    const { weakDimensions, strongDimensions } = analyzeDimensions(wheelRatings);

    // Convert wheelRatings to format expected by WheelOfLife component
    const wheelValues = convertRatingsToWheelFormat(wheelRatings);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    Your {year} Foundation
                </h2>
                <p className="text-white/80">
                    Review your wheel and the narrative summary.
                </p>
            </div>

            {/* Wheel Visualization */}
            <div className="flex justify-center">
                <WheelOfLife 
                    values={wheelValues}
                    highlightedArea={weakDimensions[0]?.key || null}
                    showWeakStrong={true}
                />
            </div>

            {/* Weak/Strong Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weakDimensions.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                            Weakest Areas
                        </h3>
                        <div className="space-y-1">
                            {weakDimensions.map((dim) => (
                                <div key={dim.key} className="text-sm text-white/80">
                                    <span className="font-semibold">{dim.label}</span>
                                    <span className="text-white/40 ml-2">({dim.score}/10)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {strongDimensions.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                            Strongest Areas
                        </h3>
                        <div className="space-y-1">
                            {strongDimensions.map((dim) => (
                                <div key={dim.key} className="text-sm text-white/80">
                                    <span className="font-semibold">{dim.label}</span>
                                    <span className="text-white/40 ml-2">({dim.score}/10)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Generated Narrative */}
            <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-white uppercase tracking-tight">
                        Your {year} Summary
                    </Label>
                    <p className="text-xs text-white/60">
                        Edit this narrative if you'd like to refine it.
                    </p>
                </div>
                <Textarea
                    value={generatedNarrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    className="min-h-[150px] text-base"
                    placeholder="Your narrative will be generated here..."
                />
            </div>

            {/* Quick Recap */}
            {(bigThreeWins.some(w => w) || damnGoodDecision) && (
                <div className="space-y-4 pt-6 border-t border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                        Quick Recap
                    </h3>
                    {bigThreeWins.some(w => w) && (
                        <div className="space-y-2">
                            <p className="text-xs font-mono text-white/60 uppercase tracking-widest">
                                Top Wins
                            </p>
                            <ul className="space-y-1 text-sm text-white/80">
                                {bigThreeWins.filter(w => w).map((win, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-action-emerald mt-1">•</span>
                                        <span>{win.substring(0, 100)}{win.length > 100 ? "..." : ""}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {damnGoodDecision && (
                        <div className="space-y-2">
                            <p className="text-xs font-mono text-white/60 uppercase tracking-widest">
                                Key Decision
                            </p>
                            <p className="text-sm text-white/80">
                                {damnGoodDecision.substring(0, 150)}{damnGoodDecision.length > 150 ? "..." : ""}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

