"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
}

export function ProgressBar({ value, onChange, label }: ProgressBarProps) {
  const getSegmentColor = (idx: number) => {
    if (value < idx) return "bg-white/5";
    
    if (value === 0) return "bg-bullshit-crimson/40 border border-bullshit-crimson/50";
    if (value === 1) return "bg-motion-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    return "bg-action-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  };

  const getStatusText = () => {
    if (value === 0) return "SIMULATION";
    if (value === 1) return "MOTION";
    if (value === 2) return "PROGRESS";
    return "SHIPPED";
  };

  return (
    <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-3xl group transition-all duration-300 hover:border-white/10">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-white/80 tracking-tight">{label}</h4>
        <span className={cn(
          "text-[8px] font-mono px-2 py-0.5 rounded border uppercase tracking-tighter",
          value === 0 ? "text-bullshit-crimson border-bullshit-crimson/20 bg-bullshit-crimson/5" :
          value === 1 ? "text-motion-amber border-motion-amber/20 bg-motion-amber/5" :
          "text-action-emerald border-action-emerald/20 bg-action-emerald/5"
        )}>
          {getStatusText()}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 h-3">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              "rounded-sm transition-all duration-500",
              getSegmentColor(i)
            )}
          />
        ))}
      </div>

      <div className="flex justify-between text-[8px] font-mono text-white/10 uppercase tracking-widest">
        <span>Static</span>
        <span>Impact</span>
      </div>
    </div>
  );
}

