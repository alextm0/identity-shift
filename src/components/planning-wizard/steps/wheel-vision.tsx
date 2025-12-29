"use client";

import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { InteractiveWheelOfLifeWithTargets } from "./interactive-wheel-with-targets";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";

export function WheelVisionStep() {
    const {
        wheelOfLife,
        targetWheelOfLife,
        updateTargetDimension,
    } = usePlanningStore();


    // Initialize target scores from current wheel or defaults
    const getTargetScore = (dimension: string): number => {
        return targetWheelOfLife[dimension] || wheelOfLife[dimension] || 5;
    };

    // Ensure all dimensions have values for display
    const currentWheel = LIFE_DIMENSIONS.reduce((acc, dim) => {
        acc[dim] = wheelOfLife[dim] || 5;
        return acc;
    }, {} as Record<string, number>);

    const targetWheel = LIFE_DIMENSIONS.reduce((acc, dim) => {
        acc[dim] = getTargetScore(dim);
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tight">
                    Wheel of Life Vision
                </h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    Set realistic targets for next year.
                </p>
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                    You can refine later. Start with what matters.
                </p>
            </div>

            {/* Interactive Wheel Visualization */}
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div className="relative group">
                    <InteractiveWheelOfLifeWithTargets
                        currentValues={currentWheel}
                        targetValues={targetWheel}
                        onChange={updateTargetDimension}
                    />

                    {/* Interaction Hint */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 border border-white/5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest whitespace-nowrap">
                            Drag points or click a spoke to set a target
                        </p>
                    </div>
                </div>



                {/* Legend */}
                <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <span>Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-focus-violet shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                        <span>Target Vision</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
