"use client";

import { WheelOfLife } from "@/components/ui/WheelOfLife";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import { updateWheelRatingsAction } from "@/actions/yearly-reviews";
import { useEditableSection } from "@/hooks/use-editable-section";
import { prepareWheelValues } from "@/lib/utils/dimension-analysis";
import type { WheelRatings } from "@/lib/validators/yearly-review";

interface EditableWheelSectionProps {
    reviewId: string;
    initialRatings: WheelRatings;
    showWeakStrong?: boolean;
    highlightedArea?: string | null;
    weakDimensions?: { key: string; label: string; score: number }[];
    strongDimensions?: { key: string; label: string; score: number }[];
}

export function EditableWheelSection({
    reviewId,
    initialRatings,
    showWeakStrong = false,
    highlightedArea = null,
    weakDimensions = [],
    strongDimensions = []
}: EditableWheelSectionProps) {
    const {
        isEditing,
        setIsEditing,
        isSaving,
        value: ratings,
        setValue: setRatings,
        handleSave,
        handleCancel
    } = useEditableSection({
        initialValue: initialRatings,
        onSave: async (val) => updateWheelRatingsAction(reviewId, val),
        successMessage: "Wheel ratings updated",
        errorMessage: "Failed to update ratings"
    });

    const wheelValues = prepareWheelValues(ratings);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    Wheel of Life
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
                                {isSaving ? "Saving..." : "Save"}
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
            <div className="glass-pane p-8">
                <div className="flex justify-center mb-8">
                    <WheelOfLife
                        values={wheelValues}
                        onChange={(dimension, value) => {
                            if (isEditing) {
                                setRatings(prev => ({ ...prev, [dimension]: value }));
                            }
                        }}
                        highlightedArea={isEditing ? null : highlightedArea}
                        showWeakStrong={isEditing ? false : showWeakStrong}
                        interactive={isEditing}
                        useDimensionLabels={true}
                    />
                </div>

                {!isEditing && (weakDimensions.length > 0 || strongDimensions.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
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
                )}
            </div>
        </div>
    );
}

