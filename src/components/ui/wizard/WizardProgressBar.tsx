"use client";

import { cn } from "@/lib/utils";

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
  currentStepName?: string;
  currentStepTime?: string;
  isSaving?: boolean;
  className?: string;
}

export function WizardProgressBar({
  currentStep,
  totalSteps,
  currentStepName,
  currentStepTime,
  isSaving,
  className
}: WizardProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/60 uppercase tracking-widest truncate max-w-[120px] md:max-w-none">
            {currentStepName || `Step ${currentStep}`}
          </span>
          <span className="text-xs font-mono text-focus-violet uppercase tracking-widest whitespace-nowrap">
            Step {currentStep}/{totalSteps}
          </span>
          {currentStepTime && (
            <span className="text-xs font-mono text-white/20 uppercase tracking-widest whitespace-nowrap">
              ~{currentStepTime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-500",
              isSaving ? "bg-focus-violet animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "bg-action-emerald/40"
            )} />
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.15em] whitespace-nowrap">
              {isSaving ? "Saving..." : "Saved automatically"}
            </span>
          </div>
          <span className="hidden md:inline text-xs font-mono text-white/40 uppercase tracking-widest">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Segmented progress bar */}
      <div className="flex gap-1 h-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              step < currentStep
                ? "bg-action-emerald/40"
                : step === currentStep
                  ? "bg-action-emerald shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "bg-white/5"
            )}
          />
        ))}
      </div>
    </div>
  );
}

