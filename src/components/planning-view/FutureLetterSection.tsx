"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FutureLetterSectionProps {
  futureYouLetter?: string | null;
}

export function FutureLetterSection({ futureYouLetter }: FutureLetterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!futureYouLetter) return null;

  return (
    <div className="pt-8 border-t border-white/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full group"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Future You Letter</h3>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Letter from Your Future Self</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 p-6 rounded-2xl bg-white/[0.04] border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm text-white/70 leading-relaxed font-sans whitespace-pre-wrap">
              {futureYouLetter}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

