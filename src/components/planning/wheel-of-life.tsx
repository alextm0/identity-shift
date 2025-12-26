"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WheelOfLifeProps {
  values: Record<string, number>;
  targetValues?: Record<string, number>;
  highlightedArea?: string | null;
  showWeakStrong?: boolean; // If true, highlights weak (<5) and strong (>=8) spokes
}

export function WheelOfLife({ values, targetValues, highlightedArea, showWeakStrong = false }: WheelOfLifeProps) {
  const dimensions = Object.keys(values);
  const size = 400;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / dimensions.length;

  // Determine if a dimension is weak or strong
  const getDimensionStatus = (dimension: string): 'weak' | 'strong' | 'normal' => {
    if (!showWeakStrong) return 'normal';
    const score = values[dimension] || 0;
    if (score < 5) return 'weak';
    if (score >= 8) return 'strong';
    return 'normal';
  };

  const currentPoints = useMemo(() => {
    return dimensions.map((key, i) => {
      const val = values[key];
      const angle = i * angleStep - Math.PI / 2;
      const r = (val / 10) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 50) * Math.cos(angle),
        labelY: center + (radius + 50) * Math.sin(angle),
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
      const r = (val / 10) * radius;
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
    <div className="relative w-full max-w-[500px] aspect-square mx-auto overflow-visible">
      <svg
        viewBox={`-50 -50 ${size + 100} ${size + 100}`}
        className="w-full h-full drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        style={{ overflow: 'visible' }}
      >
        {/* Background Circles */}
        {[2, 4, 6, 8, 10].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * radius}
            className="fill-none stroke-white/5 stroke-1"
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
          className="fill-white/10 stroke-white/20 stroke-1 transition-all duration-500 ease-in-out"
        />

        {/* Target Status Polygon - Bright Stroke Overlay */}
        {targetPolygonPoints && (
          <polygon
            points={targetPolygonPoints}
            className="fill-none stroke-focus-violet stroke-2 transition-all duration-500 ease-in-out"
            style={{
              filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))",
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
              r="4"
              className={cn(
                "shadow-lg transition-all duration-500 ease-in-out",
                isHighlighted 
                  ? "fill-focus-violet"
                  : status === 'weak'
                  ? "fill-bullshit-crimson/60"
                  : status === 'strong'
                  ? "fill-action-emerald/60"
                  : "fill-white/40"
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
              r="5"
              className={cn(
                "fill-focus-violet shadow-lg transition-all duration-500 ease-in-out",
                isHighlighted && "fill-focus-violet scale-125"
              )}
              style={{
                filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))",
              }}
            />
          );
        })}

        {/* Labels */}
        {currentPoints.map((p, i) => {
          const label = dimensions[i];
          const textAnchor = Math.cos(p.angle) > 0.1 ? "start" : Math.cos(p.angle) < -0.1 ? "end" : "middle";
          const isHighlighted = highlightedArea === p.dimension;
          const status = getDimensionStatus(p.dimension);
          return (
            <text
              key={i}
              x={p.labelX}
              y={p.labelY}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
                isHighlighted 
                  ? "fill-focus-violet font-semibold"
                  : status === 'weak'
                  ? "fill-bullshit-crimson/80 font-semibold"
                  : status === 'strong'
                  ? "fill-action-emerald/80 font-semibold"
                  : "fill-white/40"
              )}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
