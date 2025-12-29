"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import { WEAK_DIMENSION_THRESHOLD, STRONG_DIMENSION_THRESHOLD, WHEEL_MIN_VALUE, WHEEL_MAX_VALUE } from "@/lib/constants/thresholds";

interface WheelOfLifeProps {
  values: Record<string, number>;
  targetValues?: Record<string, number>;
  highlightedArea?: string | null;
  showWeakStrong?: boolean;
  interactive?: boolean;
  onChange?: (dimension: string, value: number) => void;
  useDimensionLabels?: boolean; // If true, uses DIMENSION_LABELS for labels
}

export function WheelOfLife({
  values,
  targetValues,
  highlightedArea,
  showWeakStrong = false,
  interactive = false,
  onChange,
  useDimensionLabels = false,
}: WheelOfLifeProps) {
  const dimensions = Object.keys(values);
  const size = 400;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / dimensions.length;
  const viewBoxPadding = interactive ? 50 : 0;
  
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Get status for coloring
  const getDimensionStatus = (dimension: string): 'weak' | 'strong' | 'normal' => {
    if (!showWeakStrong) return 'normal';
    const score = values[dimension] || 0;
    if (score < WEAK_DIMENSION_THRESHOLD) return 'weak';
    if (score >= STRONG_DIMENSION_THRESHOLD) return 'strong';
    return 'normal';
  };

  // Calculate value from mouse position projected onto spoke (for interactive mode)
  const getValueFromMouse = useCallback((dimensionIndex: number, clientX: number, clientY: number): number => {
    if (!svgRef.current || !interactive) return (WHEEL_MIN_VALUE + WHEEL_MAX_VALUE) / 2;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const viewBoxSize = size + viewBoxPadding * 2;
    
    // Convert to SVG coordinates
    const svgX = (clientX - rect.left) / rect.width * viewBoxSize;
    const svgY = (clientY - rect.top) / rect.height * viewBoxSize;
    
    // Adjusted center (accounting for viewBox padding)
    const adjustedCenter = center + viewBoxPadding;
    
    // Vector from center to mouse
    const dx = svgX - adjustedCenter;
    const dy = svgY - adjustedCenter;
    
    // The spoke's angle
    const spokeAngle = dimensionIndex * angleStep - Math.PI / 2;
    
    // Unit vector along the spoke
    const spokeX = Math.cos(spokeAngle);
    const spokeY = Math.sin(spokeAngle);
    
    // Project mouse vector onto spoke (dot product)
    const projection = dx * spokeX + dy * spokeY;
    
    // Convert projection distance to value
    const clampedProjection = Math.max(0, Math.min(radius, projection));
    const value = Math.round((clampedProjection / radius) * (WHEEL_MAX_VALUE - WHEEL_MIN_VALUE) + WHEEL_MIN_VALUE);
    
    return Math.max(WHEEL_MIN_VALUE, Math.min(WHEEL_MAX_VALUE, value));
  }, [interactive, angleStep, radius, size, center, viewBoxPadding]);

  // Pointer handlers (for interactive mode)
  const handlePointerDown = useCallback((dimension: string, e: React.PointerEvent) => {
    if (!interactive || !onChange) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveDimension(dimension);
    setIsDragging(true);
    
    const dimIndex = dimensions.indexOf(dimension);
    const value = getValueFromMouse(dimIndex, e.clientX, e.clientY);
    onChange(dimension, value);
  }, [interactive, onChange, dimensions, getValueFromMouse]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!interactive || !isDragging || !activeDimension || !onChange) return;
    
    const dimIndex = dimensions.indexOf(activeDimension);
    const value = getValueFromMouse(dimIndex, e.clientX, e.clientY);
    onChange(activeDimension, value);
  }, [interactive, isDragging, activeDimension, onChange, dimensions, getValueFromMouse]);

  const handlePointerUp = useCallback(() => {
    if (!interactive) return;
    setIsDragging(false);
    setActiveDimension(null);
  }, [interactive]);

  // Compute points for rendering
  const adjustedCenter = center + viewBoxPadding;
  
  const currentPoints = useMemo(() => {
    return dimensions.map((key, i) => {
      const val = values[key];
      const angle = i * angleStep - Math.PI / 2;
      const r = (val / WHEEL_MAX_VALUE) * radius;
      return {
        x: adjustedCenter + r * Math.cos(angle),
        y: adjustedCenter + r * Math.sin(angle),
        labelX: adjustedCenter + (radius + 50) * Math.cos(angle),
        labelY: adjustedCenter + (radius + 50) * Math.sin(angle),
        angle,
        dimension: key,
        value: val,
      };
    });
  }, [values, radius, adjustedCenter, angleStep, dimensions]);

  const targetPoints = useMemo(() => {
    if (!targetValues) return null;
    return dimensions.map((key, i) => {
      const val = targetValues[key] || values[key];
      const angle = i * angleStep - Math.PI / 2;
      const r = (val / WHEEL_MAX_VALUE) * radius;
      return {
        x: adjustedCenter + r * Math.cos(angle),
        y: adjustedCenter + r * Math.sin(angle),
        angle,
        dimension: key,
      };
    });
  }, [targetValues, values, radius, adjustedCenter, angleStep, dimensions]);

  const currentPolygonPoints = currentPoints.map(p => `${p.x},${p.y}`).join(" ");
  const targetPolygonPoints = targetPoints ? targetPoints.map(p => `${p.x},${p.y}`).join(" ") : null;

  const viewBox = interactive 
    ? `0 0 ${size + viewBoxPadding * 2} ${size + viewBoxPadding * 2}`
    : `-50 -50 ${size + 100} ${size + 100}`;

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto overflow-visible">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        style={{ overflow: 'visible', touchAction: interactive ? 'none' : 'auto' }}
        onPointerMove={interactive ? handlePointerMove : undefined}
        onPointerUp={interactive ? handlePointerUp : undefined}
        onPointerLeave={interactive ? handlePointerUp : undefined}
      >
        {/* Background Circles */}
        {[2, 4, 6, 8, WHEEL_MAX_VALUE].map((level) => (
          <circle
            key={level}
            cx={adjustedCenter}
            cy={adjustedCenter}
            r={(level / WHEEL_MAX_VALUE) * radius}
            className="fill-none stroke-white/5 stroke-1"
          />
        ))}

        {/* Axis Lines / Spokes */}
        {dimensions.map((dimension, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const isHighlighted = highlightedArea === dimension || (interactive && activeDimension === dimension);
          const status = getDimensionStatus(dimension);
          const endX = adjustedCenter + radius * Math.cos(angle);
          const endY = adjustedCenter + radius * Math.sin(angle);
          
          return (
            <g key={`spoke-${i}`}>
              {/* Invisible hit area for interactive mode */}
              {interactive && (
                <line
                  x1={adjustedCenter}
                  y1={adjustedCenter}
                  x2={endX}
                  y2={endY}
                  stroke="transparent"
                  strokeWidth={40}
                  className="cursor-pointer"
                  onPointerDown={(e) => handlePointerDown(dimension, e)}
                  onPointerEnter={() => !isDragging && setActiveDimension(dimension)}
                  onPointerLeave={() => !isDragging && setActiveDimension(null)}
                />
              )}
              
              {/* Visible spoke line */}
              <line
                x1={adjustedCenter}
                y1={adjustedCenter}
                x2={endX}
                y2={endY}
                className={cn(
                  "stroke-1 transition-all duration-300",
                  interactive && "pointer-events-none",
                  isHighlighted 
                    ? "stroke-focus-violet/40" 
                    : status === 'weak'
                    ? "stroke-bullshit-crimson/30"
                    : status === 'strong'
                    ? "stroke-action-emerald/30"
                    : "stroke-white/5"
                )}
              />
            </g>
          );
        })}

        {/* Current Status Polygon */}
        <polygon
          points={currentPolygonPoints}
          className={cn(
            "fill-white/10 stroke-white/20 stroke-1 transition-all duration-500 ease-in-out",
            interactive && "pointer-events-none"
          )}
        />

        {/* Target Status Polygon */}
        {targetPolygonPoints && (
          <polygon
            points={targetPolygonPoints}
            className="fill-none stroke-focus-violet stroke-2 transition-all duration-500 ease-in-out pointer-events-none"
            style={{
              filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))",
            }}
          />
        )}

        {/* Current Data Points */}
        {currentPoints.map((p, i) => {
          const isHighlighted = highlightedArea === p.dimension || (interactive && activeDimension === p.dimension);
          const status = getDimensionStatus(p.dimension);
          
          return (
            <g key={`current-${i}`}>
              {/* Hit area for interactive mode */}
              {interactive && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={20}
                  fill="transparent"
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => handlePointerDown(p.dimension, e)}
                  onPointerEnter={() => !isDragging && setActiveDimension(p.dimension)}
                  onPointerLeave={() => !isDragging && setActiveDimension(null)}
                />
              )}
              
              {/* Visible data point */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHighlighted && interactive ? 6 : 4}
                className={cn(
                  "shadow-lg transition-all duration-500 ease-in-out",
                  interactive && "pointer-events-none",
                  isHighlighted 
                    ? "fill-focus-violet"
                    : status === 'weak'
                    ? "fill-bullshit-crimson/60"
                    : status === 'strong'
                    ? "fill-action-emerald/60"
                    : "fill-white/40"
                )}
                style={isHighlighted && interactive ? {
                  filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))",
                } : undefined}
              />
              
              {/* Value label when active (interactive mode) */}
              {interactive && isHighlighted && (
                <text
                  x={p.x}
                  y={p.y - 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-focus-violet font-mono text-sm font-bold pointer-events-none"
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))",
                  }}
                >
                  {p.value}
                </text>
              )}
            </g>
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
                "fill-focus-violet shadow-lg transition-all duration-500 ease-in-out pointer-events-none",
                isHighlighted && "scale-125"
              )}
              style={{
                filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))",
              }}
            />
          );
        })}

        {/* Labels */}
        {currentPoints.map((p, i) => {
          const label = useDimensionLabels 
            ? (DIMENSION_LABELS[dimensions[i] as keyof typeof DIMENSION_LABELS] || dimensions[i])
            : dimensions[i];
          const textAnchor = Math.cos(p.angle) > 0.1 ? "start" : Math.cos(p.angle) < -0.1 ? "end" : "middle";
          const isHighlighted = highlightedArea === p.dimension || (interactive && activeDimension === p.dimension);
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
                interactive && "pointer-events-none",
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
      
      {/* Instructions for interactive mode */}
      {interactive && (
        <div className="mt-6 text-center">
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Click or drag on any spoke to adjust values
          </p>
        </div>
      )}
    </div>
  );
}

