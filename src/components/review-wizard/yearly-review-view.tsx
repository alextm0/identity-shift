"use client";

import { WheelOfLife } from "@/components/planning/wheel-of-life";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteYearlyReviewAction } from "@/actions/yearly-reviews";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { YearlyReviewWithTypedFields } from "@/lib/types";
import { format } from "date-fns";
import { analyzeDimensions, convertRatingsToWheelFormat } from "@/lib/utils/dimension-analysis";
import { EditableWheelSection } from "./editable-wheel-section";
import { EditableBigThreeSection } from "./editable-big-three-section";
import { EditableDecisionSection } from "./editable-decision-section";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface YearlyReviewViewProps {
    review: YearlyReviewWithTypedFields;
    year: number;
}

export function YearlyReviewView({ review, year }: YearlyReviewViewProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteYearlyReviewAction(review.id);
            if (result.success) {
                toast.success("Review deleted successfully");
                router.push("/dashboard");
            } else {
                toast.error(result.error || "Failed to delete review");
                setIsDeleting(false);
            }
        } catch (error) {
            toast.error("Failed to delete review");
            setIsDeleting(false);
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
                            onClick={() => setShowDeleteDialog(true)}
                            variant="outline"
                            className="font-mono text-xs uppercase tracking-widest text-bullshit-crimson hover:text-bullshit-crimson hover:bg-bullshit-crimson/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Reset Review
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
                <div className="space-y-4">
                    <EditableWheelSection reviewId={review.id} initialRatings={review.wheelRatings} />
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
                </div>

                {/* Wins - New format */}
                {review.wins && review.wins.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">
                                Wins
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {review.wins.map((win, i) => (
                                <div key={i} className="glass-pane p-6 relative group border-white/[0.05] hover:border-white/10 transition-all">
                                    <div className="absolute top-4 right-4 flex-shrink-0 w-6 h-6 rounded-full bg-action-emerald/10 border border-action-emerald/20 flex items-center justify-center">
                                        <span className="text-action-emerald text-[10px] font-mono">{i + 1}</span>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed pr-6">{win}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Big Three Wins - Legacy format (backward compatibility) */}
                {!review.wins && review.bigThreeWins && review.bigThreeWins.some(w => w) && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">
                                Top 3 Wins (Legacy)
                            </h2>
                            <EditableBigThreeSection reviewId={review.id} initialWins={review.bigThreeWins} />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {review.bigThreeWins.map((win, i) => (
                                win && (
                                    <div key={i} className="glass-pane p-6 relative border-white/[0.05]">
                                        <div className="absolute top-4 right-4 flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <span className="text-white/40 text-[10px] font-mono">{i + 1}</span>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed pr-6">{win}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Details - New format */}
                {review.otherDetails && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">
                                Other Details
                            </h2>
                        </div>
                        <div className="glass-pane p-8 relative border-white/[0.05] bg-action-emerald/[0.01]">
                            <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-transparent via-action-emerald/20 to-transparent opacity-50" />
                            <p className="text-white/90 text-sm leading-relaxed pl-4 italic">
                                "{review.otherDetails}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Damn Good Decision - Legacy format (backward compatibility) */}
                {!review.otherDetails && review.damnGoodDecision && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">
                                The Decision (Legacy)
                            </h2>
                            <EditableDecisionSection reviewId={review.id} initialDecision={review.damnGoodDecision} />
                        </div>
                        <div className="glass-pane p-8 border-white/[0.05]">
                            <p className="text-white/80 text-sm leading-relaxed italic">"{review.damnGoodDecision}"</p>
                        </div>
                    </div>
                )}

                {/* Generated Narrative - Legacy format (backward compatibility) */}
                {review.generatedNarrative && (
                    <div className="space-y-6">
                        <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest px-2">
                            Narrative Summary (Legacy)
                        </h2>
                        <div className="glass-pane p-8 border-white/[0.05]">
                            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{review.generatedNarrative}</p>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Reset Review?"
                description={`Are you sure you want to delete your ${year} review? This will permanently remove all your ratings, wins, and decisions. You'll be able to start fresh from the beginning.`}
                confirmText="Yes, Reset Review"
                cancelText="Cancel"
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={isDeleting}
            />
        </div>
    );
}

