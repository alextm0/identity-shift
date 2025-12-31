"use client";

import { ReactNode } from "react";
import { WizardProgressBar } from "./WizardProgressBar";
import { WizardNavigation } from "./WizardNavigation";

export interface WizardStepConfig {
  id: number;
  name: string;
  time?: string;
  component: ReactNode;
}

interface WizardProps {
  steps: WizardStepConfig[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
  onSkip?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isSaving?: boolean;
  nextLabel?: string;
  completeLabel?: string;
  exitTitle?: string;
  exitDescription?: string;
}

export function Wizard({
  steps,
  currentStep,
  onStepChange: _onStepChange,
  onNext,
  onBack,
  onExit,
  onSkip,
  canGoBack,
  canGoNext,
  isSaving,
  nextLabel,
  completeLabel,
  exitTitle,
  exitDescription,
}: WizardProps) {
  const currentStepConfig = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-12">
      {/* Progress bar */}
      <div className="mb-8">
        <WizardProgressBar
          currentStep={currentStep}
          totalSteps={steps.length}
          currentStepName={currentStepConfig?.name}
          currentStepTime={currentStepConfig?.time}
          isSaving={isSaving}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="glass-pane p-8 md:p-12">
            {currentStepConfig?.component}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isLastStep={isLastStep}
          onBack={onBack}
          onNext={onNext}
          onExit={onExit}
          onSkip={onSkip}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          isSaving={isSaving}
          nextLabel={nextLabel}
          completeLabel={completeLabel}
          exitTitle={exitTitle}
          exitDescription={exitDescription}
        />
      </div>
    </div>
  );
}

