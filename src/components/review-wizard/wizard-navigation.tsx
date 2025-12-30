"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface WizardNavigationProps {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    onExit: () => void;
    canGoBack: boolean;
    canGoNext: boolean;
    isSaving?: boolean;
    isEditMode?: boolean;
    className?: string;
}

export function WizardNavigation({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    onExit,
    canGoBack,
    canGoNext,
    isSaving,
    isEditMode = false,
    className,
}: WizardNavigationProps) {
    const [showExitDialog, setShowExitDialog] = useState(false);
    const isLastStep = currentStep === totalSteps;

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
                            isEditMode ? "Save Changes" : "Complete Review"
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={showExitDialog}
                onOpenChange={setShowExitDialog}
                title="Exit Review?"
                description="Your progress will be saved as a draft. You can continue later from where you left off."
                confirmText="Exit"
                cancelText="Continue Review"
                onConfirm={onExit}
                variant="destructive"
            />
        </>
    );
}

