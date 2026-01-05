"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import { updateOtherDetailsAction } from "@/actions/yearly-reviews";
import { Textarea } from "@/components/ui/textarea";
import { useEditableSection } from "@/hooks/use-editable-section";

interface EditableDetailsSectionProps {
    reviewId: string;
    initialDetails: string | null;
}

export function EditableDetailsSection({
    reviewId,
    initialDetails,
}: EditableDetailsSectionProps) {
    const {
        isEditing,
        setIsEditing,
        isSaving,
        value,
        setValue,
        handleSave,
        handleCancel
    } = useEditableSection({
        initialValue: initialDetails || "",
        onSave: async (val) => updateOtherDetailsAction(reviewId, val),
        successMessage: "Details updated",
        errorMessage: "Failed to update details"
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">
                    Other Details
                </h2>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                size="sm"
                                className="font-mono text-[10px] h-7 uppercase tracking-widest"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                variant="violet"
                                size="sm"
                                className="font-mono text-[10px] h-7 uppercase tracking-widest"
                            >
                                <Save className="h-3 w-3 mr-1" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="ghost"
                            size="sm"
                            className="font-mono text-[10px] h-7 uppercase tracking-widest text-white/40 hover:text-white"
                        >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit Details
                        </Button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <Textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Add more details about your year..."
                        className="min-h-[200px] bg-white/5 border-white/10 text-white leading-relaxed p-6 focus:border-violet-500/50"
                    />
                </div>
            ) : (
                <div className="glass-pane p-8 relative border-white/[0.05] bg-action-emerald/[0.01]">
                    <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-transparent via-action-emerald/20 to-transparent opacity-50" />
                    {value ? (
                        <p className="text-white/90 text-sm leading-relaxed pl-4 italic">
                            &quot;{value}&quot;
                        </p>
                    ) : (
                        <p className="text-white/20 text-sm italic pl-4">
                            No additional details recorded.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
