"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCallback } from "react";
import { WORD_LIMITS } from "@/lib/constants/review";

export function StepBigThree() {
    const { bigThreeWins, damnGoodDecision, setBigThreeWin, setDamnGoodDecision } = useReviewStore();
    
    // Use callbacks to ensure state updates properly
    const handleWinChange = useCallback((index: 0 | 1 | 2, value: string) => {
        setBigThreeWin(index, value);
    }, [setBigThreeWin]);
    
    const handleDecisionChange = useCallback((value: string) => {
        setDamnGoodDecision(value);
    }, [setDamnGoodDecision]);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    The Big Three
                </h2>
                <p className="text-white/80">
                    Capture your major wins and the decision that changed everything.
                </p>
            </div>

            {/* Three Wins */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                    Your Top 3 Wins
                </h3>
                <p className="text-sm text-white/60">
                    Not feelings, not "I worked hard"—concrete outcomes. Things you shipped, achieved, or completed.
                </p>
                
                {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-2">
                        <Label className="text-xs font-mono text-white/60 uppercase tracking-widest">
                            Win {index + 1}
                        </Label>
                        <Textarea
                            value={bigThreeWins[index] || ""}
                            onChange={(e) => handleWinChange(index as 0 | 1 | 2, e.target.value)}
                            placeholder={`What's one concrete outcome you're proud of?`}
                            className="min-h-[100px]"
                        />
                        <div className="text-xs font-mono text-white/40">
                            {((bigThreeWins[index] || "").trim().split(/\s+/).filter(Boolean).length)} / ~{WORD_LIMITS.bigThreeWin} words
                        </div>
                    </div>
                ))}
            </div>

            {/* Damn Good Decision */}
            <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                        The Damn Good Decision
                    </h3>
                    <p className="text-sm text-white/60">
                        What was ONE decision you made that paid off? A fork-in-the-road moment that changed your trajectory.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-xs font-mono text-white/60 uppercase tracking-widest">
                        Decision
                    </Label>
                    <Textarea
                        value={damnGoodDecision || ""}
                        onChange={(e) => handleDecisionChange(e.target.value)}
                        placeholder="What decision changed things? Why did it matter?"
                        className="min-h-[150px]"
                    />
                    <div className="text-xs font-mono text-white/40">
                        {(damnGoodDecision.trim().split(/\s+/).filter(Boolean).length)} / ~{WORD_LIMITS.damnGoodDecision} words
                    </div>
                </div>
            </div>
        </div>
    );
}

