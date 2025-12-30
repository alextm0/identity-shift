"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import { saveYearlyReviewProgressAction } from "@/actions/yearly-reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useReviewStore } from "@/hooks/stores/use-review-store";
import { StepWins } from "./step-wins"; // The component for editing wins

interface EditableWinsSectionProps {
    reviewId: string;
    initialWins: string[];
}

export function EditableWinsSection({ reviewId, initialWins }: EditableWinsSectionProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { setWins, resetWins } = useReviewStore(); // Access wins from the store

    // Initialize store wins with initialWins when entering edit mode or on mount
    useEffect(() => {
        if (isEditing) {
            setWins(initialWins);
        } else {
            // When exiting edit mode or initially rendering in view mode, ensure store matches initial
            resetWins(initialWins);
        }
    }, [initialWins, isEditing, setWins, resetWins]);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            // The store's `wins` array is already being updated by StepWins
            // We need to pass the store's current wins to the action
            const currentWinsInStore = useReviewStore.getState().wins;

            // Filter out empty strings before saving
            const nonEmptyWins = currentWinsInStore.filter(w => w && w.trim());

            const result = await saveYearlyReviewProgressAction(reviewId, { wins: nonEmptyWins });
            if (result.success) {
                toast.success("Wins updated successfully");
                setIsEditing(false);
                router.refresh(); // Revalidate data
            } else {
                toast.error(result.error || "Failed to update wins");
            }
        } catch (error) {
            toast.error("Failed to update wins");
            console.error("Error updating wins:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = useCallback(() => {
        // Reset the store's wins to the initial state
        resetWins(initialWins);
        setIsEditing(false);
    }, [initialWins, resetWins]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    What Went Well
                </h2>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                size="sm"
                                className="font-mono text-xs uppercase tracking-widest"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                variant="violet"
                                size="sm"
                                className="font-mono text-xs uppercase tracking-widest"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save Wins"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            size="sm"
                            className="font-mono text-xs uppercase tracking-widest"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className={cn(isEditing ? "glass-pane p-6" : "space-y-6")}>
                {isEditing ? (
                    <StepWins />
                ) : (
                    <>
                        {initialWins && initialWins.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {initialWins.map((win, i) => (
                                    <div key={i} className="glass-pane p-6 relative group border-white/[0.05] hover:border-white/10 transition-all">
                                        <div className="absolute top-4 right-4 flex-shrink-0 w-6 h-6 rounded-full bg-action-emerald/10 border border-action-emerald/20 flex items-center justify-center">
                                            <span className="text-action-emerald text-[10px] font-mono">{i + 1}</span>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed pr-6">{win}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-pane p-8 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
                                No wins recorded yet. Click Edit to add some!
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
