"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string) => void;
  onClear?: () => void;
  isSigned?: boolean;
  penColor?: string;
  className?: string;
}

export function SignaturePad({
  onSignatureChange,
  onClear,
  isSigned,
  penColor = "white",
  className,
}: SignaturePadProps) {
  const sigCanvas = useRef<any>(null);
  const [internalIsSigned, setInternalIsSigned] = useState(false);

  const finalIsSigned = isSigned !== undefined ? isSigned : internalIsSigned;

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setInternalIsSigned(false);
    onSignatureChange("");
    onClear?.();
  };

  const handleSignatureEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setInternalIsSigned(true);
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  return (
    <div className={className}>
      <div className="relative aspect-[3/1] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden cursor-crosshair group hover:border-white/20 transition-colors">
        <SignatureCanvas
          ref={sigCanvas}
          penColor={penColor}
          canvasProps={{
            className: "w-full h-full"
          }}
          onEnd={handleSignatureEnd}
        />
        {finalIsSigned && (
          <div className="absolute top-4 right-4 transition-opacity group-hover:opacity-100 opacity-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white border border-[var(--color-border)]"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

