"use client";

import { cn } from "@/lib/utils";

interface EnergySliderProps {
  value: number;
  onChange: (val: number) => void;
}

export function EnergySlider({ value, onChange }: EnergySliderProps) {
  const getGlowColor = (val: number) => {
    switch (val) {
      case 1: return "rgba(148, 163, 184, 0.2)"; // Grey
      case 2: return "rgba(16, 185, 129, 0.1)";  // Emerald (Low)
      case 3: return "rgba(16, 185, 129, 0.2)";  // Emerald (High)
      case 4: return "rgba(139, 92, 246, 0.2)";  // Violet (Low)
      case 5: return "rgba(139, 92, 246, 0.4)";  // Violet (High)
      default: return "transparent";
    }
  };

  const getLabel = (val: number) => {
    switch (val) {
      case 1: return "Depleted";
      case 2: return "Sluggish";
      case 3: return "Stable";
      case 4: return "Driven";
      case 5: return "Optimal";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Energy_Level</label>
        <span className={cn(
          "text-xs font-mono font-bold uppercase tracking-tighter px-3 py-1 rounded-full border transition-all duration-500",
          value <= 2 ? "bg-white/5 border-white/10 text-white/40" : 
          value === 3 ? "bg-action-emerald/10 border-action-emerald/20 text-action-emerald" :
          "bg-focus-violet/10 border-focus-violet/20 text-focus-violet"
        )}>
          {getLabel(value)}
        </span>
      </div>

      <div className="relative h-24 flex items-center justify-center group">
        {/* Dynamic Background Glow */}
        <div 
          className="absolute inset-0 blur-3xl transition-all duration-1000 opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${getGlowColor(value)} 0%, transparent 70%)` }}
        />

        <div className="relative w-full px-4">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-focus-violet relative z-10"
          />
          
          <div className="flex justify-between mt-6 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i)}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center font-mono text-[10px] transition-all duration-300",
                  value === i 
                    ? "bg-white text-black scale-125 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                    : "text-white/20 hover:text-white/40"
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

