"use client";

import { useState } from "react";
import { Target, ChevronDown, ChevronUp } from "lucide-react";
import { DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import type { LifeDimension } from "@/lib/validators/yearly-review";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  text?: string;
  originalText?: string;
  category?: string;
  definitionOfDone?: string;
  whyMatters?: string;
}

interface AnnualGoalsListProps {
  goals: Goal[];
}

export function AnnualGoalsList({ goals }: AnnualGoalsListProps) {
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const toggleGoal = (id: string) => {
    setExpandedGoals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
            <Target className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Annual Roadmap</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs font-mono text-emerald-500 font-bold">{goals.length}</span>
          <span className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">Targets</span>
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((goal, index) => {
          const isExpanded = expandedGoals[goal.id];
          return (
            <div
              key={`annual-${goal.id}-${index}`}
              className={cn(
                "group relative border border-white/5 bg-white/[0.02] rounded-xl transition-all duration-300 overflow-hidden",
                isExpanded ? "bg-white/[0.04] border-white/10" : "hover:bg-white/[0.04] hover:border-white/10"
              )}
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className="w-full text-left p-6 flex items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-start sm:items-center gap-6 flex-1 min-w-0">
                  <span className="text-xs font-mono text-white/20 shrink-0 pt-1 sm:pt-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-lg font-medium text-white/90 leading-tight group-hover:text-white transition-colors">
                      {goal.text || goal.originalText}
                    </h4>
                    {goal.category && !isExpanded && (
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-emerald-500/40" />
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                          {DIMENSION_LABELS[goal.category as LifeDimension]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 pt-1 sm:pt-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-white/40" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-white/5 mt-2">
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest flex items-center gap-2">
                      <span className="h-px w-4 bg-emerald-500/20" />
                      Success Criteria
                    </p>
                    <p className="text-sm text-white/70 font-light leading-relaxed">
                      {goal.definitionOfDone || "No definition provided."}
                    </p>
                  </div>

                  {goal.whyMatters && (
                    <div className="p-4 rounded-lg bg-white/[0.02] border border-emerald-500/10 flex items-start gap-4">
                      <div className="h-full w-0.5 bg-emerald-500/30 rounded-full shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Why This Matters</p>
                        <p className="text-sm text-white/60 italic font-light leading-relaxed">
                          &quot;{goal.whyMatters}&quot;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

