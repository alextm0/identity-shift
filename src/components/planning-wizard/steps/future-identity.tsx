"use client";

import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { WizardTextarea } from "../wizard-textarea";
import { StepHeader } from "../ui/step-header";
import { StepContainer } from "../ui/step-container";

export function FutureIdentityStep() {
    const { futureIdentity, setFutureIdentity } = usePlanningStore();

    return (
        <StepContainer>
            <StepHeader
                title="Future identity."
                subtitle="In Dec 2026, I’m the kind of person who…"
            />

            <WizardTextarea
                id="futureIdentity"
                label="Identity Statement"
                helper="Focus on behavior, not achievements."
                value={futureIdentity}
                onChange={setFutureIdentity}
                placeholder="e.g., ‘…keeps small promises daily.’"
                maxLength={1000}
                minHeight="160px"
                textareaClassName="text-xl leading-relaxed"
            >
                {futureIdentity.trim().length > 3 && (
                    <div className="pt-8 flex justify-center">
                        <div className="px-6 py-3 rounded-full bg-action-emerald/5 border border-action-emerald/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <p className="text-[10px] font-mono text-action-emerald uppercase tracking-[0.2em]">
                                ✓ Identity locked for 2026
                            </p>
                        </div>
                    </div>
                )}

                {futureIdentity.trim().length === 0 && (
                    <p className="text-center text-[10px] font-mono text-white/10 uppercase tracking-widest mt-8">
                        Not sure yet? You can skip this for now and come back later.
                    </p>
                )}
            </WizardTextarea>
        </StepContainer>
    );
}
