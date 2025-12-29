"use client";

import { useState } from "react";
import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { ShieldCheck } from "lucide-react";
import { StepHeader } from "../ui/step-header";
import { StepContainer } from "../ui/step-container";

interface CommitmentStepProps {
    onComplete?: () => void;
}

export function CommitmentStep({ onComplete }: CommitmentStepProps) {
    const {
        setSignatureImage,
    } = usePlanningStore();

    const [isSigned, setIsSigned] = useState(false);

    const handleSignatureChange = (dataUrl: string) => {
        setSignatureImage(dataUrl);
        setIsSigned(dataUrl.length > 0);
    };

    const handleClear = () => {
        setIsSigned(false);
    };

    return (
        <StepContainer size="sm">
            <StepHeader
                title="Commitment"
                subtitle="Seal this plan with your signature."
            >
                <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-2xl bg-action-emerald/10 border border-action-emerald/20">
                        <ShieldCheck className="h-8 w-8 text-action-emerald" />
                    </div>
                </div>
            </StepHeader>

            <div className="space-y-6">
                <SignaturePad
                    onSignatureChange={handleSignatureChange}
                    onClear={handleClear}
                    isSigned={isSigned}
                />

                <div className="text-center">
                    <Label className="text-xs font-mono text-white/40 uppercase tracking-widest">
                        {isSigned ? "Signature Captured" : "Sign above to seal your covenant"}
                    </Label>
                </div>

                {isSigned && (
                    <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in zoom-in duration-700">
                        <div className="px-8 py-3 rounded-full bg-action-emerald/10 border border-action-emerald/20 shadow-lg shadow-emerald-500/5 transition-all">
                            <p className="text-sm font-mono text-action-emerald uppercase tracking-[0.3em] font-bold">
                                ✓ Covenant Sealed
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </StepContainer>
    );
}



