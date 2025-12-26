"use client";

import { WheelOfLife } from "@/components/planning/wheel-of-life";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { editYearlyReviewAction } from "@/actions/yearly-reviews";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { YearlyReviewWithTypedFields } from "@/lib/types";
import { format } from "date-fns";
import { analyzeDimensions, convertRatingsToWheelFormat } from "@/lib/utils/dimension-analysis";
import { LIFE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/validators/yearly-review";

interface YearlyReviewViewProps {
    review: YearlyReviewWithTypedFields;
    year: number;
}

export function YearlyReviewView({ review, year }: YearlyReviewViewProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = async () => {
        setIsEditing(true);
        try {
            const result = await editYearlyReviewAction(review.id);
            if (result.success) {
                router.push(`/review?edit=true&year=${year}`);
            } else {
                console.error("Failed to enable editing:", result.error);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Failed to enable editing:", error);
            setIsEditing(false);
        }
    };
    // Convert wheelRatings to format expected by WheelOfLife component
    const wheelValues = convertRatingsToWheelFormat(review.wheelRatings);

    // Analyze dimensions using utility function
    const { weakDimensions, strongDimensions } = analyzeDimensions(review.wheelRatings);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Background Blooms */}
            <div className="bg-blooms pointer-events-none fixed inset-0 z-[-1]">
                <div className="bloom-violet" />
                <div className="bloom-emerald" />
            </div>

            <div className="max-w-4xl mx-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-2">
                            {year} Review
                        </h1>
                        {review.completedAt && (
                            <p className="text-sm font-mono text-white/60 uppercase tracking-widest">
                                Completed {format(new Date(review.completedAt), "MMMM d, yyyy")}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleEdit}
                            disabled={isEditing}
                            variant="violet"
                            className="font-mono text-xs uppercase tracking-widest"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {isEditing ? "Opening Editor..." : "Edit Review"}
                        </Button>
                        <Link href="/dashboard">
                            <Button variant="outline" className="font-mono text-xs uppercase tracking-widest">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Wheel Visualization */}
                <div className="glass-pane p-8">
                    <div className="flex justify-center mb-8">
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
                </div>

                {/* Dimension Audit (Wins & Gaps) */}
                {(Object.keys(review.wheelWins).length > 0 || Object.keys(review.wheelGaps).length > 0) && (
                    <div className="glass-pane p-8">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-6">
                            Dimension Deep Dive
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {LIFE_DIMENSIONS.map((dimension) => {
                                const label = DIMENSION_LABELS[dimension];
                                const rating = review.wheelRatings[dimension] || 0;
                                const win = review.wheelWins[dimension] || "";
                                const gap = review.wheelGaps[dimension] || "";
                                
                                if (!win && !gap) return null;

                                const getWinQuestion = (r: number): string => {
                                    const targetRating = Math.max(1, r - 1);
                                    return `Why didn't you write a ${targetRating}?`;
                                };

                                const getGapQuestion = (r: number): string => {
                                    const targetRating = Math.min(10, r + 1);
                                    return `Why isn't it a ${targetRating}?`;
                                };

                                return (
                                    <div key={dimension} className="space-y-4 border border-white/5 rounded-lg p-4">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-white uppercase tracking-tight">
                                                {label}
                                            </h3>
                                            <span className="text-xs font-mono text-white/60">
                                                Rated {rating}/10
                                            </span>
                                        </div>
                                        
                                        {win && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-mono text-white/60 uppercase tracking-widest">
                                                    {getWinQuestion(rating)}
                                                </p>
                                                <p className="text-sm text-white/80 whitespace-pre-wrap">{win}</p>
                                            </div>
                                        )}
                                        
                                        {gap && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-mono text-white/60 uppercase tracking-widest">
                                                    {getGapQuestion(rating)}
                                                </p>
                                                <p className="text-sm text-white/80 whitespace-pre-wrap">{gap}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Big Three Wins */}
                {review.bigThreeWins.some(w => w) && (
                    <div className="glass-pane p-8">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-4">
                            Top 3 Wins
                        </h2>
                        <div className="space-y-4">
                            {review.bigThreeWins.map((win, i) => (
                                win && (
                                    <div key={i} className="space-y-2">
                                        <h3 className="text-sm font-mono text-white/60 uppercase tracking-widest">
                                            Win {i + 1}
                                        </h3>
                                        <p className="text-white/80 whitespace-pre-wrap">{win}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Damn Good Decision */}
                {review.damnGoodDecision && (
                    <div className="glass-pane p-8">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-4">
                            The Damn Good Decision
                        </h2>
                        <p className="text-white/80 whitespace-pre-wrap">{review.damnGoodDecision}</p>
                    </div>
                )}

                {/* Generated Narrative */}
                {review.generatedNarrative && (
                    <div className="glass-pane p-8">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-4">
                            Summary
                        </h2>
                        <p className="text-white/80 whitespace-pre-wrap">{review.generatedNarrative}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

