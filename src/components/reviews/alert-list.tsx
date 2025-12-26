"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertListProps {
  alerts: string[];
}

export function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="p-8 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
        <Info className="h-5 w-5 text-white/10" />
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">No priority alerts detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, i) => {
        const isCritical = alert.includes("CRITICAL") || alert.includes("TRAP");
        return (
          <div 
            key={i} 
            className={cn(
              "flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300",
              isCritical 
                ? "bg-bullshit-crimson/5 border-bullshit-crimson/20 text-bullshit-crimson" 
                : "bg-motion-amber/5 border-motion-amber/20 text-motion-amber"
            )}
          >
            <div className="mt-0.5">
              {isCritical ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold uppercase tracking-tight leading-relaxed">
                {alert.split(":")[0]}
              </p>
              <p className="text-[10px] opacity-70 leading-relaxed">
                {alert.split(":")[1]?.trim() || alert}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

