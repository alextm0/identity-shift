"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteYearlyReviewAction } from "@/actions/yearly-reviews";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { YearlyReviewWithTypedFields } from "@/lib/types";
import { format } from "date-fns";
import { analyzeDimensions } from "@/lib/utils/dimension-analysis";
import { EditableWheelSection } from "./editable-wheel-section";
import { EditableWinsSection } from "./editable-wins-section";
import { EditableDetailsSection } from "./editable-details-section";
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
        } catch {
            toast.error("Failed to delete review");
            setIsDeleting(false);
        }
    };

    // Analyze dimensions using utility function
    const { weakDimensions, strongDimensions } = analyzeDimensions(review.wheelRatings);

    return (
        <div className="min-h-screen bg-[#14141F] text-white">
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
                    <EditableWheelSection
                        reviewId={review.id}
                        initialRatings={review.wheelRatings}
                        showWeakStrong={true}
                        highlightedArea={weakDimensions[0]?.key || null}
                        weakDimensions={weakDimensions}
                        strongDimensions={strongDimensions}
                    />
                </div>

                {/* Wins */}
                <EditableWinsSection
                    reviewId={review.id}
                    initialWins={review.wins || []}
                />

                {/* Other Details */}
                <EditableDetailsSection
                    reviewId={review.id}
                    initialDetails={review.otherDetails ?? null}
                />
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

