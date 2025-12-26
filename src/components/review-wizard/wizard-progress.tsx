"use client";

import { cn } from "@/lib/utils";

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
}

export function WizardProgress({ currentStep, totalSteps, className }: WizardProgressProps) {
    const percentage = (currentStep / totalSteps) * 100;
    const segments = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
        <div className={cn("w-full space-y-3", className)}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/60 uppercase tracking-widest">
                    Step {currentStep} / {totalSteps}
                </span>
                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                    {Math.round(percentage)}%
                </span>
            </div>
            
            {/* Segmented progress bar */}
            <div className="flex gap-1 h-1">
                {segments.map((step) => (
                    <div
                        key={step}
                        className={cn(
                            "flex-1 rounded-full transition-all duration-300",
                            step <= currentStep
                                ? "bg-action-emerald"
                                : "bg-white/5"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

