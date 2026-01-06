"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Edit2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimplifiedGoal, AnnualGoal } from "@/lib/validators";
import { DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import type { LifeDimension } from "@/lib/validators/yearly-review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateGoalDetailsAction } from "@/actions/planning";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

interface PlanningGoalItemProps {
    goal: AnnualGoal | SimplifiedGoal;
    index: number;
    planningId: string;
}

export function PlanningGoalItem({ goal, index, planningId }: PlanningGoalItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // Form state
    const [editedText, setEditedText] = useState(goal.text);
    const [editedDoD, setEditedDoD] = useState((goal as AnnualGoal).definitionOfDone || "");
    const [editedWhy, setEditedWhy] = useState((goal as AnnualGoal).whyMatters || "");

    const toggleGoal = (e?: React.MouseEvent) => {
        // Prevent toggle when clicking interactions in the header
        if (e && (e.target as HTMLElement).closest('button.no-toggle')) {
            return;
        }
        setIsExpanded(!isExpanded);
    };

    const startEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(true);
        setIsEditing(true);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaving(true);
        try {
            const result = await updateGoalDetailsAction(planningId, {
                goalId: goal.id,
                updates: {
                    text: editedText,
                    definitionOfDone: editedDoD,
                    whyMatters: editedWhy
                }
            });

            if (result.success) {
                toast.success("Goal updated");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update goal");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditedText(goal.text);
        setEditedDoD((goal as AnnualGoal).definitionOfDone || "");
        setEditedWhy((goal as AnnualGoal).whyMatters || "");
        setIsEditing(false);
    };

    return (
        <div
            className={cn(
                "group relative border rounded-xl transition-all duration-300 overflow-hidden",
                "bg-gradient-to-br from-white/[0.02] to-white/[0.01]",
                "shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
                isExpanded || isEditing
                    ? "border-white/15 bg-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.1)]"
                    : "border-white/5 hover:border-white/12 hover:bg-white/[0.04] hover:shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            )}
        >
            <div
                onClick={toggleGoal}
                className="w-full text-left p-6 flex items-start sm:items-center justify-between gap-6 relative z-10 cursor-pointer"
            >
                <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-300 shrink-0",
                        isExpanded || isEditing
                            ? "bg-white/10 border-white/20"
                            : "bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/15"
                    )}>
                        <span className={cn(
                            "text-xs font-mono font-bold transition-colors duration-300",
                            isExpanded || isEditing ? "text-white/80" : "text-white/50 group-hover:text-white/70"
                        )}>
                            {String(index + 1).padStart(2, '0')}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                        {isEditing ? (
                            <div onClick={e => e.stopPropagation()} className="cursor-default">
                                <Label htmlFor={`goal-text-${goal.id}`} className="sr-only">Goal Title</Label>
                                <Input
                                    id={`goal-text-${goal.id}`}
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    className="bg-white/10 border-white/10 text-lg font-semibold h-auto py-2"
                                    placeholder="Goal title"
                                />
                            </div>
                        ) : (
                            <h4 className={cn(
                                "text-lg font-semibold leading-tight transition-colors duration-300",
                                isExpanded ? "text-white" : "text-white/95 group-hover:text-white"
                            )}>
                                {goal.text}
                            </h4>
                        )}

                        {goal.category && !isExpanded && !isEditing && (
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/30 group-hover:bg-white/40 transition-colors duration-300" />
                                <span className="text-[10px] font-mono text-white/50 group-hover:text-white/60 uppercase tracking-wider transition-colors duration-300">
                                    {DIMENSION_LABELS[goal.category as LifeDimension]}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    size="sm"
                                    className="no-toggle font-mono text-[10px] h-7 uppercase tracking-widest bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    variant="violet"
                                    size="sm"
                                    className="no-toggle font-mono text-[10px] h-7 uppercase tracking-widest"
                                >
                                    <Save className="h-3 w-3 mr-1" />
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={startEditing}
                                    variant="ghost"
                                    size="icon"
                                    className="no-toggle h-7 w-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <div className={cn(
                                    "p-1.5 rounded-lg transition-all duration-300",
                                    isExpanded
                                        ? "bg-white/10 rotate-180"
                                        : "bg-white/5 group-hover:bg-white/10"
                                )}>
                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-white/60" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-white/30 group-hover:text-white/50 transition-colors" />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {(isExpanded || isEditing) && (
                <div className="px-6 pb-8 pt-4 space-y-6 animate-in fade-in slide-in-from-top-3 duration-500 border-t border-white/10 mt-2 relative z-10 cursor-default" onClick={e => e.stopPropagation()}>
                    {/* Success Criteria Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-6 bg-gradient-to-r from-emerald-500/60 to-transparent" />
                            <p className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest font-semibold">
                                Success Criteria
                            </p>
                        </div>
                        <div className="pl-8">
                            {isEditing ? (
                                <Textarea
                                    value={editedDoD}
                                    onChange={(e) => setEditedDoD(e.target.value)}
                                    placeholder="What does done look like?"
                                    className="min-h-[100px] bg-white/5 border-white/10 text-white leading-relaxed p-4 focus:border-emerald-500/50"
                                />
                            ) : (
                                <p className="text-sm text-white/75 font-sans leading-relaxed">
                                    {(goal as AnnualGoal).definitionOfDone || "No definition provided."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Why Matters Section */}
                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-px w-6 bg-gradient-to-r from-violet-500/60 to-transparent" />
                                <p className="text-[10px] font-mono text-violet-500/70 uppercase tracking-widest font-semibold">
                                    Why This Matters
                                </p>
                            </div>
                            <div className="pl-8">
                                <Textarea
                                    value={editedWhy}
                                    onChange={(e) => setEditedWhy(e.target.value)}
                                    placeholder="Why is this important to you?"
                                    className="min-h-[100px] bg-white/5 border-white/10 text-white leading-relaxed p-4 focus:border-violet-500/50"
                                />
                            </div>
                        </div>
                    ) : (
                        ('whyMatters' in goal) && (goal as AnnualGoal).whyMatters ? (
                            <div className="relative p-5 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-emerald-500/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] flex items-start gap-4 group/why">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/40 via-emerald-500/30 to-emerald-500/40 rounded-l-xl" />
                                <div className="space-y-2 pl-3">
                                    <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest font-semibold">Why This Matters</p>
                                    <p className="text-sm text-white/70 font-sans leading-relaxed">
                                        &quot;{(goal as AnnualGoal).whyMatters}&quot;
                                    </p>
                                </div>
                            </div>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
}
