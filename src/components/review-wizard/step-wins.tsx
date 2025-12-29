"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useCallback } from "react";
import { DEFAULT_MAX_WINS } from "@/lib/constants/review";

export function StepWins() {
    const { wins, addWin, removeWin, updateWin } = useReviewStore();
    
    const handleWinChange = useCallback((index: number, value: string) => {
        updateWin(index, value);
    }, [updateWin]);
    
    const handleAddWin = useCallback(() => {
        addWin();
    }, [addWin]);
    
    const handleRemoveWin = useCallback((index: number) => {
        removeWin(index);
    }, [removeWin]);

    const canAddMore = wins.length < DEFAULT_MAX_WINS;

    return (
        <div className="space-y-10">
            <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    Wins
                </h2>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                    Short, concrete entries of what went well this year.
                </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
                {wins.map((win, index) => (
                    <div key={index} className="group relative flex items-start gap-4 p-1 rounded-lg transition-all">
                        <div className="mt-2.5 flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <span className="text-white/40 text-[10px] font-mono">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 relative">
                            <Textarea
                                value={win}
                                onChange={(e) => handleWinChange(index, e.target.value)}
                                placeholder="What did you achieve? (Keep it short)"
                                rows={2}
                                className="min-h-0 py-2 bg-transparent border-0 border-b border-white/5 rounded-none focus-visible:ring-0 focus-visible:border-action-emerald/50 text-white placeholder:text-white/20 resize-none transition-all"
                            />
                        </div>

                        {wins.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveWin(index)}
                                className="mt-2.5 flex-shrink-0 text-white/20 hover:text-bullshit-crimson opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove win"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
                
                {canAddMore && (
                    <div className="pt-4 flex justify-center">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddWin}
                            className="text-action-emerald hover:text-action-emerald hover:bg-action-emerald/10 font-mono text-[10px] uppercase tracking-widest py-1 h-auto"
                        >
                            <Plus className="h-3 w-3 mr-1.5" />
                            Add Win
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

