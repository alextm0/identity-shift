"use client";

import { cn } from "@/lib/utils";
import { DesiredIdentityStatus } from "@/lib/enums";
import { User, CheckCircle2, HelpCircle, XCircle } from "lucide-react";

interface IdentityCheckProps {
  value: DesiredIdentityStatus;
  onChange: (val: DesiredIdentityStatus) => void;
}

const OPTIONS = [
  { id: DesiredIdentityStatus.YES, label: 'Aligned', icon: CheckCircle2, color: 'text-action-emerald' },
  { id: DesiredIdentityStatus.PARTIALLY, label: 'Partially', icon: HelpCircle, color: 'text-motion-amber' },
  { id: DesiredIdentityStatus.NO, label: 'Misaligned', icon: XCircle, color: 'text-bullshit-crimson' },
];

export function IdentityCheck({ value, onChange }: IdentityCheckProps) {
  return (
    <div className="flex gap-4">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 group",
            value === opt.id
              ? "bg-white/10 border-white/20"
              : "bg-white/5 border-white/5 text-white/20 hover:bg-white/10 hover:text-white/40"
          )}
        >
          <opt.icon className={cn("h-5 w-5", value === opt.id ? opt.color : "opacity-20")} />
          <span className="text-xs font-mono uppercase tracking-widest font-bold">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

