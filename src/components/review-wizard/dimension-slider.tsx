"use client";

import { cn } from "@/lib/utils";
import { DIMENSION_LABELS, type LifeDimension } from "@/lib/validators/yearly-review";

interface DimensionSliderProps {
    dimension: LifeDimension;
    value: number;
    onChange: (value: number) => void;
    className?: string;
}

export function DimensionSlider({ dimension, value, onChange, className }: DimensionSliderProps) {
    const label = DIMENSION_LABELS[dimension];
    
    const getLabel = (val: number): string => {
        if (val <= 3) return "Struggling";
        if (val <= 5) return "Baseline";
        if (val <= 7) return "Good";
        return "Thriving";
    };

    return (
        <div className={cn("space-y-8", className)}>
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                    {label}
                </h2>
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                    1=Struggling | 5=Baseline | 10=Thriving
                </p>
            </div>

            <div className="space-y-6">
                {/* Large value display */}
                <div className="text-center">
                    <div className="text-7xl md:text-8xl font-bold text-white mb-2">
                        {value}
                    </div>
                    <div className="text-sm font-mono text-white/60 uppercase tracking-widest">
                        {getLabel(value)}
                    </div>
                </div>

                {/* Slider */}
                <div className="px-4">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={value}
                        onChange={(e) => {
                            const newValue = Number(e.target.value);
                            // Immediately update to prevent lag
                            onChange(newValue);
                        }}
                        onInput={(e) => {
                            // Also handle onInput for better responsiveness
                            const newValue = Number((e.target as HTMLInputElement).value);
                            onChange(newValue);
                        }}
                        className="slider-violet w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) ${((value - 1) / 9) * 100}%, rgba(255, 255, 255, 0.05) ${((value - 1) / 9) * 100}%, rgba(255, 255, 255, 0.05) 100%)`,
                        }}
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

