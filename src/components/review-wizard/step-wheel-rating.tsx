"use client";

import { useReviewStore } from "@/hooks/stores/use-review-store";
import { WheelOfLife } from "@/components/ui/WheelOfLife";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { DEFAULT_RATING } from "@/lib/constants/review";
import { useMemo } from "react";

import { prepareWheelValues } from "@/lib/utils/dimension-analysis";

export function StepWheelRating() {
    const { wheelRatings, setWheelRating } = useReviewStore();

    // Convert wheelRatings to format expected by WheelOfLife
    const wheelValues = useMemo(() => {
        return prepareWheelValues(wheelRatings);
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

