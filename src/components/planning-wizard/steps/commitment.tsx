"use client";

import { useRef, useState } from "react";
import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SignatureCanvas from 'react-signature-canvas';
import { ShieldCheck } from "lucide-react";
import { StepHeader } from "../ui/step-header";
import { StepContainer } from "../ui/step-container";

interface CommitmentStepProps {
    onComplete?: () => void;
}

export function CommitmentStep({ onComplete }: CommitmentStepProps) {
    const {
        setSignatureImage,
        isSaving
    } = usePlanningStore();

    const sigCanvas = useRef<any>(null);
    const [isSigned, setIsSigned] = useState(false);

    const clearSignature = () => {
        sigCanvas.current?.clear();
        setIsSigned(false);
        setSignatureImage("");
    };

    const handleSignatureEnd = () => {
        if (!sigCanvas.current?.isEmpty()) {
            setIsSigned(true);
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            setSignatureImage(dataUrl);
        }
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
                <div className="relative aspect-[3/1] rounded-2xl border border-white/10 bg-black/40 overflow-hidden cursor-crosshair group hover:border-white/20 transition-colors">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="white"
                        canvasProps={{
                            className: "w-full h-full"
                        }}
                        onEnd={handleSignatureEnd}
                    />
                    <div className="absolute top-4 right-4 transition-opacity group-hover:opacity-100 opacity-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSignature}
                            className="h-8 px-3 rounded-lg bg-black/60 hover:bg-black text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white border border-white/5"
                        >
                            Clear
                        </Button>
                    </div>
                </div>

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


