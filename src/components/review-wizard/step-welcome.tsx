"use client";

import { Clock } from "lucide-react";

interface StepWelcomeProps {
    year: number;
    isEditMode?: boolean;
}

export function StepWelcome({ year, isEditMode = false }: StepWelcomeProps) {
    return (
        <div className="space-y-8 text-center">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
                    {isEditMode ? `Editing ${year} Review` : `Before ${year + 1} Begins`}
                </h1>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                    {isEditMode 
                        ? "Update your review. Changes will be saved automatically."
                        : "Let's understand where you stand. Be honest, not impressive."}
                </p>
            </div>

            <div className="flex items-center justify-center gap-3 text-sm font-mono text-white/60 uppercase tracking-widest">
                <Clock className="h-4 w-4" />
                <span>About 20 minutes</span>
            </div>

            <div className="pt-8 space-y-4 text-left max-w-xl mx-auto">
                <p className="text-white/70">
                    This review will help you:
                </p>
                <ul className="space-y-2 text-white/60 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="text-action-emerald mt-1">•</span>
                        <span>Create an honest baseline of your life across 8 dimensions</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-action-emerald mt-1">•</span>
                        <span>Identify what's working and what needs attention</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-action-emerald mt-1">•</span>
                        <span>Capture your biggest wins and key decisions from {year}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-action-emerald mt-1">•</span>
                        <span>Generate insights to guide your {year + 1} planning</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

