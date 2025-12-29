"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WheelOfLife } from "@/components/ui/WheelOfLife";
import { convertRatingsToWheelFormat } from "@/lib/utils/dimension-analysis";
import { useCallback, useMemo } from "react";
import { WORD_LIMITS } from "@/lib/constants/review";

interface StepYearSnapshotProps {
    year: number;
}

export function StepYearSnapshot({ year }: StepYearSnapshotProps) {
    const { wheelRatings, wins, otherDetails, setOtherDetails } = useReviewStore();
    
    const handleOtherDetailsChange = useCallback((value: string) => {
        setOtherDetails(value);
    }, [setOtherDetails]);

    // Convert wheelRatings to format expected by WheelOfLife component
    const wheelValues = useMemo(() => {
        return convertRatingsToWheelFormat(wheelRatings);
    }, [wheelRatings]);

    // Filter out empty wins for display
    const nonEmptyWins = useMemo(() => {
        return wins.filter(w => w && w.trim());
    }, [wins]);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    Year Snapshot
                </h2>
                <p className="text-white/80">
                    Your {year} review snapshot. You can revisit this anytime.
                </p>
                <div className="pt-2">
                    <p className="text-sm text-action-emerald font-mono uppercase tracking-widest">
                        ✓ Review Complete
                    </p>
                </div>
            </div>

            {/* Wheel of Life Visualization */}
            <div className="flex justify-center">
                <WheelOfLife 
                    values={wheelValues}
                    showWeakStrong={false}
                />
            </div>

            {/* Wins List */}
            {nonEmptyWins.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-white/5">
                    <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest text-center">
                        Wins
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {nonEmptyWins.map((win, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-action-emerald/10 border border-action-emerald/20 flex items-center justify-center">
                                    <span className="text-action-emerald text-[10px] font-mono">{i + 1}</span>
                                </div>
                                <p className="text-sm text-white/80 leading-relaxed">{win}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other Details - Subsection */}
            <div className="space-y-6 pt-8 border-t border-white/5">
                <div className="text-center space-y-2">
                    <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest">
                        Other Details
                    </h3>
                    <p className="text-xs text-white/40 italic">
                        Anything else you want to remember from {year}?
                    </p>
                </div>
                
                <div className="relative">
                    <Textarea
                        value={otherDetails}
                        onChange={(e) => handleOtherDetailsChange(e.target.value)}
                        placeholder="Reflections, context, or notes for your future self..."
                        className="min-h-[120px] bg-white/[0.02] border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/20 resize-none focus-visible:ring-action-emerald/30 transition-all"
                    />
                </div>
            </div>
        </div>
    );
}

