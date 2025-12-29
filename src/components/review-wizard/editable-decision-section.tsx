"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import { saveYearlyReviewProgressAction } from "@/actions/yearly-reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WORD_LIMITS } from "@/lib/constants/review";

interface EditableDecisionSectionProps {
    reviewId: string;
    initialDecision: string;
}

export function EditableDecisionSection({ reviewId, initialDecision }: EditableDecisionSectionProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [decision, setDecision] = useState(initialDecision);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with prop changes
    useEffect(() => {
        setDecision(initialDecision);
    }, [initialDecision]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await saveYearlyReviewProgressAction(reviewId, {
                damnGoodDecision: decision,
            });
            if (result.success) {
                toast.success("Decision updated");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update decision");
            }
        } catch (error) {
            toast.error("Failed to update decision");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setDecision(initialDecision);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                        The Damn Good Decision
                    </h2>
                    <div className="flex items-center gap-2">
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
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
                <div className="glass-pane p-8">
                    <Textarea
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        placeholder="What decision changed things? Why did it matter?"
                        className="min-h-[150px]"
                    />
                    <div className="text-xs font-mono text-white/40 mt-2">
                        {(decision.trim().split(/\s+/).filter(Boolean).length)} / ~{WORD_LIMITS.damnGoodDecision} words
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    The Damn Good Decision
                </h2>
                <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs uppercase tracking-widest"
                >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </div>
        </div>
    );
}

