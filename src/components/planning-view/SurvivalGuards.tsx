"use client";

import { useState } from "react";
import { ShieldAlert, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurvivalGuardsProps {
  antiVision?: string | null;
  antiGoals: Array<{ text: string }>;
}

export function SurvivalGuards({ antiVision, antiGoals }: SurvivalGuardsProps) {
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
              <ShieldAlert className="h-4 w-4 text-white/50" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Survival Guards</h3>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Design Constraints & Anti-Vision</p>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 p-6 rounded-2xl bg-white/[0.04] border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-8">
          {antiVision && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">The Failure Mode</p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-sm text-white/70 leading-relaxed font-sans">
                  {antiVision}
                </p>
              </div>
            </div>
          )}

          {antiGoals.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">Constraints (Anti-Goals)</p>
              <div className="flex flex-col gap-2">
                {antiGoals.map((antiGoal, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 items-center group hover:bg-white/[0.04] transition-colors">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors shrink-0" />
                    <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{antiGoal.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

