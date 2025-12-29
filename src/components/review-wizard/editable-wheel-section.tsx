"use client";

import { useState, useEffect } from "react";
import { InteractiveWheelOfLife } from "./interactive-wheel-of-life";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import { updateWheelRatingsAction } from "@/actions/yearly-reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LIFE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import { DEFAULT_RATING } from "@/lib/constants/review";
import type { WheelRatings } from "@/lib/validators/yearly-review";

interface EditableWheelSectionProps {
    reviewId: string;
    initialRatings: WheelRatings;
}

export function EditableWheelSection({ reviewId, initialRatings }: EditableWheelSectionProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [ratings, setRatings] = useState<WheelRatings>(initialRatings);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with prop changes
    useEffect(() => {
        setRatings(initialRatings);
    }, [initialRatings]);

    // Ensure all dimensions are present
    const wheelValues: Record<string, number> = {};
    LIFE_DIMENSIONS.forEach(dim => {
        wheelValues[dim] = ratings[dim] || DEFAULT_RATING;
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateWheelRatingsAction(reviewId, ratings);
            if (result.success) {
                toast.success("Wheel ratings updated");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update ratings");
            }
        } catch (error) {
            toast.error("Failed to update ratings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setRatings(initialRatings);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                        Wheel of Life
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
                    <InteractiveWheelOfLife
                        values={wheelValues}
                        onChange={(dimension, value) => {
                            setRatings(prev => ({ ...prev, [dimension]: value }));
                        }}
                        showWeakStrong={false}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    Wheel of Life
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

