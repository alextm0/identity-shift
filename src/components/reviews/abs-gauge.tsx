"use client";

import { cn } from "@/lib/utils";

interface ABSGaugeProps {
  value: number;
  label?: string;
  subLabel?: string;
}

export function ABSGauge({ value, label = "Anti-Bullshit Score", subLabel }: ABSGaugeProps) {
  // Use viewBox for responsive SVG scaling
  const viewBoxSize = 256;
  const center = viewBoxSize / 2;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return "text-action-emerald";
    if (value >= 50) return "text-motion-amber";
    return "text-bullshit-crimson";
  };

  const getStrokeColor = () => {
    if (value >= 80) return "#10b981"; // action-emerald
    if (value >= 50) return "#f59e0b"; // motion-amber
    return "#ef4444"; // bullshit-crimson
  };

  const getGlow = () => {
    if (value >= 80) return "drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]";
    if (value >= 50) return "drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]";
    return "drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]";
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-6 md:p-8 lg:p-10 text-center space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      <div className="relative w-full max-w-[220px] sm:max-w-[240px] md:max-w-[256px] aspect-square">
        <svg 
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", getGlow())}
            style={{ filter: value >= 80 ? 'drop-shadow(0 0 20px rgba(16,185,129,0.4))' : undefined }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-mono tracking-tighter text-white leading-none">
            {value}
          </span>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-mono text-white/30 uppercase tracking-[0.2em] mt-1 sm:mt-1.5 md:mt-2">Units</span>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-1.5 md:space-y-2 px-2">
        <h3 className="text-xs sm:text-sm md:text-base font-bold text-white uppercase tracking-tight leading-tight">{label}</h3>
        <p className={cn("text-[9px] sm:text-[10px] md:text-xs font-mono uppercase tracking-widest font-semibold leading-tight", getColor())}>
          {subLabel || (value >= 80 ? "High Integrity" : value >= 50 ? "Moderate Simulation" : "Bullshit Warning")}
        </p>
      </div>
    </div>
  );
}

