"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { WheelOfLife } from "@/components/ui/WheelOfLife";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { DEFAULT_RATING } from "@/lib/constants/review";
import { useMemo } from "react";

export function StepWheelRating() {
    const { wheelRatings, setWheelRating } = useReviewStore();
    
    // Convert wheelRatings to format expected by WheelOfLife
    // Use dimension keys as labels, but ensure all dimensions are present
    const wheelValues = useMemo(() => {
        const values: Record<string, number> = {};
        LIFE_DIMENSIONS.forEach(dim => {
            values[dim] = wheelRatings[dim] || DEFAULT_RATING;
        });
        return values;
    }, [wheelRatings]);

    const handleChange = (dimension: string, value: number) => {
        setWheelRating(dimension, value);
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    Wheel of Life
                </h2>
                <p className="text-white/80 max-w-2xl mx-auto">
                    Click or drag on any spoke to adjust your rating. Be honest—this creates your baseline.
                </p>
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                    1=Struggling | 5=Baseline | 10=Thriving
                </p>
            </div>

            <WheelOfLife
                values={wheelValues}
                onChange={handleChange}
                showWeakStrong={false}
                interactive={true}
                useDimensionLabels={true}
            />
        </div>
    );
}

