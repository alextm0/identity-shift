"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LIFE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import type { LifeDimension } from "@/lib/validators/yearly-review";
import { savePlanningProgressAction } from "@/actions/planning";
import { Loader2 } from "lucide-react";
import { PlanningStatus, type PlanningGoal } from "@/lib/validators";
import type { PlanningWithTypedFields } from "@/lib/types";

interface GoalEditModalProps {
    goal: PlanningGoal;
    goalIndex: number;
    planning: PlanningWithTypedFields;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GoalEditModal({ goal, goalIndex, planning, open, onOpenChange }: GoalEditModalProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Local state to prevent text erasure
    const [specific, setSpecific] = useState(goal.specific || "");
    const [emotionalWhy, setEmotionalWhy] = useState(goal.emotionalWhy || "");
    const [antiGoal, setAntiGoal] = useState(goal.antiGoal || "");
    const [category, setCategory] = useState(goal.category);

    // Sync local state when goal changes
    useEffect(() => {
        if (goal) {
            setSpecific(goal.specific || "");
            setEmotionalWhy(goal.emotionalWhy || "");
            setAntiGoal(goal.antiGoal || "");
            setCategory(goal.category);
        }
    }, [goal]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update the goal in the planning data
            const updatedActiveGoals = [...(planning.activeGoals || [])];
            updatedActiveGoals[goalIndex] = {
                ...updatedActiveGoals[goalIndex],
                category: category,
                specific,
                emotionalWhy,
                antiGoal: antiGoal || undefined,
            };

            // Ensure planning.status is a valid PlanningStatus or undefined
            const statusToSave: PlanningStatus | undefined =
                Object.values(PlanningStatus).includes(planning.status as PlanningStatus)
                    ? (planning.status as PlanningStatus)
                    : undefined;

            // Save to server
            const result = await savePlanningProgressAction(planning.id, {
                activeGoals: updatedActiveGoals,
                currentModule: planning.currentModule ?? undefined,
                currentStep: planning.currentStep ?? undefined,
                currentGoalIndex: planning.currentGoalIndex ?? undefined,
                status: statusToSave, // Use the converted status
            });

            if (result.success) {
                onOpenChange(false);
                router.refresh();
            } else {
                console.error("Failed to save:", result.error);
            }
        } catch (error) {
            console.error("Failed to save goal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-2xl border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white uppercase tracking-tight">
                        Edit Goal
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label className="text-xs font-mono text-white/60 uppercase tracking-widest">
                            Wheel of Life Category
                        </Label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value === "" ? undefined : e.target.value as LifeDimension)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:bg-white/[0.07] hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-focus-violet/50 focus:border-focus-violet/50 pr-10"
                            >
                                {LIFE_DIMENSIONS.map((dim) => (
                                    <option key={dim} value={dim} className="bg-[#14141F]">
                                        {DIMENSION_LABELS[dim as LifeDimension]}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-white/60"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Specific Goal */}
                    <div className="space-y-2">
                        <Label className="text-xs font-mono text-white/60 uppercase tracking-widest">
                            Specific Goal *
                        </Label>
                        <Input
                            value={specific}
                            onChange={(e) => setSpecific(e.target.value)}
                            placeholder="e.g., 'Reduce visceral fat by 15%' (not 'Get fit')"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                            maxLength={500}
                        />
                        <p className="text-xs text-white/40">
                            Must be measurable or binary. Reject vague goals.
                        </p>
                    </div>

                    {/* Emotional Why */}
                    <div className="space-y-2">
                        <Label className="text-xs font-mono text-white/60 uppercase tracking-widest">
                            Why This Matters *
                        </Label>
                        <Textarea
                            value={emotionalWhy}
                            onChange={(e) => setEmotionalWhy(e.target.value)}
                            placeholder="What's the emotional drive behind this goal?"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                            rows={4}
                            maxLength={1000}
                        />
                    </div>

                    {/* Anti-Goal */}
                    <div className="space-y-2">
                        <Label className="text-xs font-mono text-white/60 uppercase tracking-widest">
                            Anti-Goal (Optional)
                        </Label>
                        <Input
                            value={antiGoal}
                            onChange={(e) => setAntiGoal(e.target.value)}
                            placeholder="e.g., 'I don't want to work weekends'"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                            maxLength={500}
                        />
                        <p className="text-xs text-white/40">
                            What are you NOT willing to sacrifice?
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                            className="font-mono text-xs uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !specific.trim() || !emotionalWhy.trim()}
                            className="font-mono text-xs uppercase tracking-widest"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}