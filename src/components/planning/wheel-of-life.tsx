"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { WEAK_DIMENSION_THRESHOLD, STRONG_DIMENSION_THRESHOLD, WHEEL_MAX_VALUE } from "@/lib/constants/thresholds";

interface WheelOfLifeProps {
  values: Record<string, number>;
  targetValues?: Record<string, number>;
  highlightedArea?: string | null;
  showWeakStrong?: boolean; // If true, highlights weak (<5) and strong (>=8) spokes
}

export function WheelOfLife({ values, targetValues, highlightedArea, showWeakStrong = false }: WheelOfLifeProps) {
  const dimensions = Object.keys(values);
  const size = 500; // Increased size for bigger wheel
  const center = size / 2;
  const radius = size * 0.42; // Larger radius for bigger wheel
  const angleStep = (Math.PI * 2) / dimensions.length;

  // Determine if a dimension is weak or strong
  const getDimensionStatus = (dimension: string): 'weak' | 'strong' | 'normal' => {
    if (!showWeakStrong) return 'normal';
    const score = values[dimension] || 0;
    if (score < WEAK_DIMENSION_THRESHOLD) return 'weak';
    if (score >= STRONG_DIMENSION_THRESHOLD) return 'strong';
    return 'normal';
  };

  const currentPoints = useMemo(() => {
    return dimensions.map((key, i) => {
      const val = values[key];
      const angle = i * angleStep - Math.PI / 2;
      const r = (val / WHEEL_MAX_VALUE) * radius;
      const labelDistance = radius + 35; // Closer to the wheel
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + labelDistance * Math.cos(angle),
        labelY: center + labelDistance * Math.sin(angle),
        angle,
        dimension: key,
      };
    });
  }, [values, radius, center, angleStep, dimensions]);

  const targetPoints = useMemo(() => {
    if (!targetValues) return null;
    return dimensions.map((key, i) => {
      const val = targetValues[key] || values[key];
      const angle = i * angleStep - Math.PI / 2;
      const r = (val / WHEEL_MAX_VALUE) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        angle,
        dimension: key,
      };
    });
  }, [targetValues, values, radius, center, angleStep, dimensions]);

  const currentPolygonPoints = currentPoints.map(p => `${p.x},${p.y}`).join(" ");
  const targetPolygonPoints = targetPoints ? targetPoints.map(p => `${p.x},${p.y}`).join(" ") : null;

  return (
    <div className="relative w-full h-full aspect-square overflow-visible">
      <svg
        viewBox={`-80 -80 ${size + 160} ${size + 160}`}
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Background Circles */}
        {[2, 4, 6, 8, WHEEL_MAX_VALUE].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / WHEEL_MAX_VALUE) * radius}
            className="fill-none stroke-white/8 stroke-[0.75]"
          />
        ))}

        {/* Axis Lines */}
        {dimensions.map((dimension, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const isHighlighted = highlightedArea === dimension;
          const status = getDimensionStatus(dimension);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              className={cn(
                "stroke-1 transition-all duration-300",
                isHighlighted 
                  ? "stroke-focus-violet/40" 
                  : status === 'weak'
                  ? "stroke-bullshit-crimson/30"
                  : status === 'strong'
                  ? "stroke-action-emerald/30"
                  : "stroke-white/5"
              )}
            />
          );
        })}

        {/* Current Status Polygon - Solid Fill */}
        <polygon
          points={currentPolygonPoints}
          className="fill-white/15 stroke-white/30 stroke-[2] transition-all duration-500 ease-in-out"
        />

        {/* Target Status Polygon - Bright Stroke Overlay */}
        {targetPolygonPoints && (
          <polygon
            points={targetPolygonPoints}
            className="fill-none stroke-focus-violet stroke-[2.5] transition-all duration-500 ease-in-out"
            style={{
              filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))",
            }}
          />
        )}

        {/* Current Data Points */}
        {currentPoints.map((p, i) => {
          const isHighlighted = highlightedArea === p.dimension;
          const status = getDimensionStatus(p.dimension);
          return (
            <circle
              key={`current-${i}`}
              cx={p.x}
              cy={p.y}
              r="6"
              className={cn(
                "transition-all duration-500 ease-in-out",
                isHighlighted
                  ? "fill-focus-violet"
                  : status === 'weak'
                  ? "fill-bullshit-crimson/70"
                  : status === 'strong'
                  ? "fill-action-emerald/70"
                  : "fill-white/60"
              )}
            />
          );
        })}

        {/* Target Data Points */}
        {targetPoints?.map((p, i) => {
          const isHighlighted = highlightedArea === p.dimension;
          return (
            <circle
              key={`target-${i}`}
              cx={p.x}
              cy={p.y}
              r="7"
              className={cn(
                "fill-focus-violet transition-all duration-500 ease-in-out",
                isHighlighted && "fill-focus-violet"
              )}
              style={{
                filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))",
              }}
            />
          );
        })}

        {/* Labels */}
        {currentPoints.map((p, i) => {
          const label = dimensions[i];
          const currentValue = values[p.dimension];
          const targetValue = targetValues?.[p.dimension];
          const textAnchor = Math.cos(p.angle) > 0.1 ? "start" : Math.cos(p.angle) < -0.1 ? "end" : "middle";
          const isHighlighted = highlightedArea === p.dimension;
          const status = getDimensionStatus(p.dimension);
          
          return (
            <g key={i}>
              <text
                x={p.labelX}
                y={p.labelY - 4}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className={cn(
                  "font-mono text-[13px] uppercase tracking-widest transition-all duration-300 font-bold",
                  isHighlighted
                    ? "fill-focus-violet"
                    : status === 'weak'
                    ? "fill-bullshit-crimson/95"
                    : status === 'strong'
                    ? "fill-action-emerald/95"
                    : "fill-white/90"
                )}
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)",
                }}
              >
                {label}
              </text>
              {/* Value Labels */}
              <text
                x={p.labelX}
                y={p.labelY + 12}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className={cn(
                  "font-mono text-[12px] font-bold transition-all duration-300",
                  isHighlighted
                    ? "fill-focus-violet/95"
                    : "fill-white/80"
                )}
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)",
                }}
              >
                {currentValue}
                {targetValue && (
                  <tspan className="fill-focus-violet/90"> / {targetValue}</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
