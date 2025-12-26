"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

interface MetricGaugeProps {
  value: number;
  label: string;
  subLabel?: string;
  className?: string;
}

export function MetricGauge({ value, label, subLabel, className }: MetricGaugeProps) {
  // Data for the gauge
  const data = [
    { value: value },
    { value: 100 - value },
  ];

  // Dynamic color based on value (Bullshit Crimson -> Action Emerald)
  const getColor = (val: number) => {
    if (val < 30) return "var(--color-bullshit-crimson)";
    if (val < 70) return "var(--color-motion-amber)";
    return "var(--color-action-emerald)";
  };

  const activeColor = getColor(value);

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <div className="relative w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell key="cell-0" fill={activeColor} />
              <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-2xl font-bold font-mono tracking-tighter" style={{ color: activeColor }}>
            {value}%
          </span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/60">{label}</p>
        {subLabel && <p className="text-[10px] text-white/40 mt-1">{subLabel}</p>}
      </div>
    </div>
  );
}

