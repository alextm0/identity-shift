"use client";

import { useState } from "react";
import { ListTodo, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  text?: string;
  originalText?: string;
  category?: string;
}

interface GoalBacklogSidebarProps {
  goals: Goal[];
}

export function GoalBacklogSidebar({ goals }: GoalBacklogSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (goals.length === 0) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full"
      >
        <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-white/5">
              <ListTodo className="h-3.5 w-3.5 text-white/40" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Goal Backlog</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-white/20" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/20" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {goals.map((goal, index) => (
            <div
              key={`backlog-${goal.id}-${index}`}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <p className="text-xs text-white/70 leading-relaxed">
                {goal.text || goal.originalText}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

