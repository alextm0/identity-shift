"use client";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface IntegrityMirrorProps {
  selfRating: number; // 1-10
  realityRating: number; // 1-10 calculated from data
  onSelfRatingChange: (rating: number) => void;
}

export function IntegrityMirror({ selfRating, realityRating, onSelfRatingChange }: IntegrityMirrorProps) {
  const [showFormula, setShowFormula] = useState(false);
  const calibrationGap = selfRating - realityRating;
  const gapPercent = Math.abs(calibrationGap) * 10; // Convert to percentage

  const getGapStatus = () => {
    if (Math.abs(calibrationGap) <= 1) return { label: 'Calibrated', color: 'text-action-emerald', icon: Minus };
    if (calibrationGap > 1) return { label: 'Over-Estimating', color: 'text-motion-amber', icon: TrendingUp };
    return { label: 'Under-Estimating', color: 'text-focus-violet', icon: TrendingDown };
  };

  const status = getGapStatus();
  const StatusIcon = status.icon;

  return (
    <GlassPanel className="p-6 lg:p-8 border-focus-violet/10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-action-emerald" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/40">Integrity Mirror</h3>
        </div>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="text-[10px] font-mono text-white/30 uppercase tracking-wider hover:text-white/60 transition-colors"
        >
          {showFormula ? 'Hide' : 'Show'} Formula
        </button>
      </div>

      {/* Visual comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Self Rating */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-white/60">Self-Perception</p>
            <span className="text-2xl font-bold text-focus-violet">{selfRating}</span>
          </div>
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-focus-violet rounded-full transition-all duration-500"
              style={{ width: `${selfRating * 10}%` }}
            />
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={selfRating}
            onChange={(e) => onSelfRatingChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-focus-violet"
          />
        </div>

        {/* Reality Rating */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-white/60">Reality Score</p>
            <span className="text-2xl font-bold text-action-emerald">{realityRating.toFixed(1)}</span>
          </div>
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-action-emerald rounded-full transition-all duration-500"
              style={{ width: `${realityRating * 10}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            Derived from promises + logs + goals
          </p>
        </div>
      </div>

      {/* Calibration Gap */}
      <div className={cn(
        "p-5 rounded-xl border transition-all",
        Math.abs(calibrationGap) <= 1 && "bg-action-emerald/5 border-action-emerald/20",
        calibrationGap > 1 && "bg-motion-amber/5 border-motion-amber/20",
        calibrationGap < -1 && "bg-focus-violet/5 border-focus-violet/20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={cn("h-5 w-5", status.color)} />
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-white/60">Calibration Status</p>
              <p className={cn("text-sm font-bold uppercase tracking-tight mt-1", status.color)}>
                {status.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-white/40 uppercase tracking-wider">Gap</p>
            <p className={cn("text-2xl font-bold", status.color)}>
              {calibrationGap > 0 && '+'}
              {calibrationGap.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Formula explanation (progressive disclosure) */}
      {showFormula && (
        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-3">Reality Formula</p>
          <div className="space-y-2 text-xs text-white/60 font-mono">
            <div className="flex justify-between">
              <span>Promises Kept Rate</span>
              <span className="text-white/80">× 0.5</span>
            </div>
            <div className="flex justify-between">
              <span>Days Logged Consistency</span>
              <span className="text-white/80">× 0.3</span>
            </div>
            <div className="flex justify-between">
              <span>Goal Completion Average</span>
              <span className="text-white/80">× 0.2</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between font-bold">
              <span className="text-white">Reality Score</span>
              <span className="text-action-emerald">{realityRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
