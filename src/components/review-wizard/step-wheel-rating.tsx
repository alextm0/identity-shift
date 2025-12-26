"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { InteractiveWheelOfLife } from "./interactive-wheel-of-life";
import { DIMENSION_LABELS, LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { DEFAULT_RATING } from "@/lib/constants/review";

interface StepWheelRatingProps {
    currentDimensionIndex?: number;
}

export function StepWheelRating({ currentDimensionIndex = 0 }: StepWheelRatingProps) {
    const { wheelRatings, setWheelRating } = useReviewStore();

    // Convert wheelRatings to format expected by InteractiveWheelOfLife (using labels as keys)
    const wheelValues: Record<string, number> = {};
    LIFE_DIMENSIONS.forEach((dimension) => {
        const label = DIMENSION_LABELS[dimension];
        wheelValues[label] = wheelRatings[dimension] || DEFAULT_RATING;
    });

    const handleChange = (dimensionLabel: string, value: number) => {
        // Find the dimension key from the label
        const dimension = Object.entries(DIMENSION_LABELS).find(
            ([_, label]) => label === dimensionLabel
        )?.[0] as typeof LIFE_DIMENSIONS[number] | undefined;
        
        if (dimension) {
            setWheelRating(dimension, value);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    Rate Your Life Dimensions
                </h2>
                <p className="text-white/80">
                    Click or drag on any spoke to set your rating (1-10)
                </p>
            </div>
            
            <InteractiveWheelOfLife
                values={wheelValues}
                onChange={handleChange}
                showWeakStrong={true}
            />
        </div>
    );
}

