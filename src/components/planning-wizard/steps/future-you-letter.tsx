"use client";

import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { WizardTextarea } from "../wizard-textarea";
import { Mail } from "lucide-react";
import { StepHeader } from "../ui/step-header";
import { StepContainer } from "../ui/step-container";

export function FutureLetterStep() {
    const { futureYouLetter, setFutureYouLetter } = usePlanningStore();

    return (
        <StepContainer size="lg" className="h-full flex flex-col">
            <StepHeader
                title="Future You Letter"
                subtitle="Write to your future self."
            />

            <WizardTextarea
                id="futureYouLetter"
                label="Letter from December 2026"
                value={futureYouLetter}
                onChange={setFutureYouLetter}
                placeholder="Dear Future Me..."
                maxLength={5000}
                minHeight="500px"
                className="flex-1"
                textareaClassName="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-base leading-relaxed h-full resize-none p-6"
            >
                {futureYouLetter.trim().length > 50 && (
                    <div className="pt-4 flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Mail className="h-4 w-4 text-focus-violet" />
                            <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
                                Will be delivered Dec 2026
                            </p>
                        </div>
                    </div>
                )}
            </WizardTextarea>
        </StepContainer>
    );
}
