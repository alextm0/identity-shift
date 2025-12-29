"use client";

import { useState } from "react";
import { ScrollText, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CommitmentSealProps {
  commitmentStatement?: string | null;
  signatureName?: string | null;
  signatureImage?: string | null;
  signedAt?: Date | string | null;
}

export function CommitmentSeal({ commitmentStatement, signatureName, signatureImage, signedAt }: CommitmentSealProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="pt-8 border-t border-white/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
              <ScrollText className="h-4 w-4 text-white/50" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Commitment Seal</h3>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Covenant & Signature</p>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 p-6 rounded-2xl bg-white/[0.04] border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
          {commitmentStatement && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">Covenant Statement</p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  {commitmentStatement}
                </p>
              </div>
            </div>
          )}

          {signatureImage && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">Signature</p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <img
                  src={signatureImage}
                  alt="Signature"
                  className="max-w-full h-auto rounded-lg"
                />
                {signatureName && (
                  <p className="text-xs font-mono text-white/50 uppercase tracking-widest mt-3">
                    {signatureName}
                  </p>
                )}
                {signedAt && (
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">
                    Signed on {format(new Date(signedAt), "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

