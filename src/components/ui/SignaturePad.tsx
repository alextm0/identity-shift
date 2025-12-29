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
  penColor = "white",
  className,
}: SignaturePadProps) {
  const sigCanvas = useRef<{ clear: () => void; toDataURL: () => string } | null>(null);
  const [internalIsSigned, setInternalIsSigned] = useState(false);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setInternalIsSigned(false);
    onSignatureChange("");
    onClear?.();
  };

  const handleSignatureEnd = () => {
    if (!sigCanvas.current?.isEmpty()) {
      setInternalIsSigned(true);
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  return (
    <div className={className}>
      <div className="relative aspect-[3/1] rounded-2xl border border-white/10 bg-black/40 overflow-hidden cursor-crosshair group hover:border-white/20 transition-colors">
        <SignatureCanvas
          ref={sigCanvas}
          penColor={penColor}
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
    </div>
  );
}

