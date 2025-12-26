"use client";

import { cn } from "@/lib/utils";
import { 
  Scissors, 
  Battery, 
  Sunrise, 
  ZapOff, 
  RefreshCcw 
} from "lucide-react";

interface OneChangeSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const OPTIONS = [
  { id: 'CUT_SCOPE', label: 'Cut Scope', icon: Scissors, desc: 'Reduce the number of priorities or targets.' },
  { id: 'ADD_RECOVERY', label: 'Add Recovery', icon: Battery, desc: 'Prioritize sleep and rest to restore energy.' },
  { id: 'FIX_MORNING', label: 'Fix Morning', icon: Sunrise, desc: 'Eliminate distraction in the first 2 hours.' },
  { id: 'REMOVE_DISTRACTION', label: 'Purge Leaks', icon: ZapOff, desc: 'Identify and remove energy-draining apps/habits.' },
  { id: 'KEEP_SAME', label: 'Hold Line', icon: RefreshCcw, desc: 'Maintenance phase. No changes required.' },
];

export function OneChangeSelector({ value, onChange }: OneChangeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Required Selection</p>
        {!value && (
          <span className="text-[8px] font-mono text-bullshit-crimson uppercase">*</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group",
              value === opt.id 
                ? "bg-focus-violet/10 border-focus-violet/40 text-focus-violet shadow-[0_0_20px_rgba(139,92,246,0.15)]" 
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              value === opt.id ? "bg-focus-violet/20" : "bg-white/5"
            )}>
              <opt.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-tight">{opt.label}</p>
              <p className="text-[10px] opacity-60 font-mono tracking-tighter mt-0.5">{opt.desc}</p>
            </div>
            {value === opt.id && (
              <div className="h-2 w-2 rounded-full bg-focus-violet" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

