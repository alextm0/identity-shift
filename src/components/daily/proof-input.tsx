"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link2, ShieldCheck } from "lucide-react";

interface ProofInputProps {
  value: string;
  url: string;
  onChange: (val: string) => void;
  onUrlChange: (val: string) => void;
  isActive: boolean;
}

export function ProofInput({ value, url, onChange, onUrlChange, isActive }: ProofInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [value, isActive]);

  return (
    <div className={cn(
      "transition-all duration-700 overflow-hidden",
      isActive ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0"
    )}>
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-action-emerald" />
          <Label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Proof_of_Work</Label>
        </div>

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder="Justify your progress score. What did you actually build or complete?"
          className="min-h-[40px] bg-white/[0.03] border-white/5 focus:border-action-emerald/30 text-sm text-white/80 resize-none overflow-hidden"
        />

        <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl group focus-within:border-white/20 transition-all">
          <Link2 className="h-4 w-4 text-white/20 group-focus-within:text-white/40" />
          <input
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUrlChange(e.target.value)}
            placeholder="Evidence URL (GitHub, Loom, Doc...)"
            className="flex-1 bg-transparent border-none text-xs text-white/60 focus:ring-0 px-3 placeholder:text-white/10"
          />
        </div>
      </div>
    </div>
  );
}

