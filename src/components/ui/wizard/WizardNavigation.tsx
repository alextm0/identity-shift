"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
  onSkip?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isSaving?: boolean;
  className?: string;
  nextLabel?: string;
  completeLabel?: string;
  exitTitle?: string;
  exitDescription?: string;
}

export function WizardNavigation({
  isLastStep,
  onBack,
  onNext,
  onExit,
  onSkip,
  canGoBack,
  canGoNext,
  isSaving,
  className,
  nextLabel = "Continue",
  completeLabel = "Complete",
  exitTitle = "Exit?",
  exitDescription = "Your progress will be saved. You can continue later.",
}: WizardNavigationProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);

  return (
    <>
      <div className={cn("flex items-center justify-between pt-8 border-t border-white/5", className)}>
        {/* Exit button */}
        <button
          onClick={() => setShowExitDialog(true)}
          className="flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white/60 uppercase tracking-widest transition-colors"
        >
          <X className="h-4 w-4" />
          Exit
        </button>

        {/* Navigation buttons */}
        <div className="flex items-center gap-4">
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs font-mono text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors mr-2"
            >
              Skip for now
            </button>
          )}

          {canGoBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSaving}
              className="font-mono text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          <Button
            onClick={onNext}
            disabled={!canGoNext || isSaving}
            className="font-mono text-xs uppercase tracking-widest"
          >
            {isLastStep ? (
              completeLabel
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        title={exitTitle}
        description={exitDescription}
        confirmText="Exit"
        cancelText="Continue"
        onConfirm={onExit}
        variant="destructive"
      />
    </>
  );
}

