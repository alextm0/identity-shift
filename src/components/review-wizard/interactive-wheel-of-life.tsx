"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import { WEAK_DIMENSION_THRESHOLD, STRONG_DIMENSION_THRESHOLD, WHEEL_MIN_VALUE, WHEEL_MAX_VALUE } from "@/lib/constants/thresholds";

interface InteractiveWheelOfLifeProps {
  values: Record<string, number>;
  onChange: (dimension: string, value: number) => void;
  showWeakStrong?: boolean;
}

export function InteractiveWheelOfLife({
  values,
  onChange,
  showWeakStrong = false
}: InteractiveWheelOfLifeProps) {
  const dimensions = Object.keys(values);
  const size = 400;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / dimensions.length;
  const viewBoxPadding = 50;

  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Get status for coloring
  const getStatus = useCallback((value: number): 'weak' | 'strong' | 'normal' => {
    if (!showWeakStrong) return 'normal';
    if (value < WEAK_DIMENSION_THRESHOLD) return 'weak';
    if (value >= STRONG_DIMENSION_THRESHOLD) return 'strong';
    return 'normal';
  }, [showWeakStrong]);

  // Calculate value from mouse position projected onto spoke
  const getValueFromMouse = useCallback((dimensionIndex: number, clientX: number, clientY: number): number => {
    if (!svgRef.current) return (WHEEL_MIN_VALUE + WHEEL_MAX_VALUE) / 2; // Default to middle value

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

    // Convert projection distance to value (0 to radius -> WHEEL_MIN_VALUE to WHEEL_MAX_VALUE)
    const clampedProjection = Math.max(0, Math.min(radius, projection));
    const value = Math.round((clampedProjection / radius) * (WHEEL_MAX_VALUE - WHEEL_MIN_VALUE) + WHEEL_MIN_VALUE);

    return Math.max(WHEEL_MIN_VALUE, Math.min(WHEEL_MAX_VALUE, value));
  }, [angleStep, radius, size, center, viewBoxPadding]);

  // Pointer handlers
  const handlePointerDown = useCallback((dimension: string, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveDimension(dimension);
    setIsDragging(true);

    const dimIndex = dimensions.indexOf(dimension);
    const value = getValueFromMouse(dimIndex, e.clientX, e.clientY);
    onChange(dimension, value);
  }, [dimensions, getValueFromMouse, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !activeDimension) return;

    const dimIndex = dimensions.indexOf(activeDimension);
    const value = getValueFromMouse(dimIndex, e.clientX, e.clientY);
    onChange(activeDimension, value);
  }, [isDragging, activeDimension, dimensions, getValueFromMouse, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setActiveDimension(null);
  }, []);

  // Computed data for rendering
  const spokeData = useMemo(() => {
    const adjustedCenter = center + viewBoxPadding;

    return dimensions.map((dimension, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = values[dimension] || (WHEEL_MIN_VALUE + WHEEL_MAX_VALUE) / 2;
      const r = (value / WHEEL_MAX_VALUE) * radius;
      const status = getStatus(value);

      return {
        dimension,
        value,
        angle,
        status,
        // Point at current value
        x: adjustedCenter + r * Math.cos(angle),
        y: adjustedCenter + r * Math.sin(angle),
        // End of spoke (at radius)
        endX: adjustedCenter + radius * Math.cos(angle),
        endY: adjustedCenter + radius * Math.sin(angle),
        // Label position (outside wheel)
        labelX: adjustedCenter + (radius + 50) * Math.cos(angle),
        labelY: adjustedCenter + (radius + 50) * Math.sin(angle),
        // Center
        centerX: adjustedCenter,
        centerY: adjustedCenter,
      };
    });
  }, [dimensions, values, radius, center, angleStep, viewBoxPadding, getStatus]);

  const polygonPoints = spokeData.map(d => `${d.x},${d.y}`).join(" ");
  const adjustedCenter = center + viewBoxPadding;

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto overflow-visible">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size + viewBoxPadding * 2} ${size + viewBoxPadding * 2}`}
        className="w-full h-full drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        style={{ overflow: 'visible', touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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

        {/* Axis Lines (Spokes) */}
        {spokeData.map((spoke, i) => {
          const isActive = activeDimension === spoke.dimension;

          return (
            <g key={`spoke-${i}`}>
              {/* Invisible hit area */}
              <line
                x1={spoke.centerX}
                y1={spoke.centerY}
                x2={spoke.endX}
                y2={spoke.endY}
                stroke="transparent"
                strokeWidth={40}
                className="cursor-pointer"
                onPointerDown={(e) => handlePointerDown(spoke.dimension, e)}
                onPointerEnter={() => !isDragging && setActiveDimension(spoke.dimension)}
                onPointerLeave={() => !isDragging && setActiveDimension(null)}
              />

              {/* Visible spoke line */}
              <line
                x1={spoke.centerX}
                y1={spoke.centerY}
                x2={spoke.endX}
                y2={spoke.endY}
                className={cn(
                  "stroke-1 transition-all duration-300 pointer-events-none",
                  isActive
                    ? "stroke-focus-violet"
                    : spoke.status === 'weak'
                      ? "stroke-bullshit-crimson/30"
                      : spoke.status === 'strong'
                        ? "stroke-action-emerald/30"
                        : "stroke-white/10"
                )}
              />
            </g>
          );
        })}

        {/* Current Status Polygon */}
        <polygon
          points={polygonPoints}
          className="fill-white/10 stroke-white/20 stroke-1 pointer-events-none"
        />

        {/* Data Points */}
        {spokeData.map((spoke, i) => {
          const isActive = activeDimension === spoke.dimension;

          return (
            <g key={`point-${i}`}>
              {/* Hit area for the point */}
              <circle
                cx={spoke.x}
                cy={spoke.y}
                r={20}
                fill="transparent"
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown(spoke.dimension, e)}
                onPointerEnter={() => !isDragging && setActiveDimension(spoke.dimension)}
                onPointerLeave={() => !isDragging && setActiveDimension(null)}
              />

              {/* Visible data point */}
              <circle
                cx={spoke.x}
                cy={spoke.y}
                r={isActive ? 6 : 4}
                className={cn(
                  "transition-all duration-200 pointer-events-none",
                  isActive
                    ? "fill-focus-violet"
                    : spoke.status === 'weak'
                      ? "fill-bullshit-crimson/60"
                      : spoke.status === 'strong'
                        ? "fill-action-emerald/60"
                        : "fill-white/40"
                )}
                style={{
                  filter: isActive
                    ? "drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))"
                    : undefined,
                }}
              />

              {/* Value label when active */}
              {isActive && (
                <text
                  x={spoke.x}
                  y={spoke.y - 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-focus-violet font-mono text-sm font-bold pointer-events-none"
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))",
                  }}
                >
                  {spoke.value}
                </text>
              )}
            </g>
          );
        })}

        {/* Labels */}
        {spokeData.map((spoke, i) => {
          const textAnchor = Math.cos(spoke.angle) > 0.1
            ? "start"
            : Math.cos(spoke.angle) < -0.1
              ? "end"
              : "middle";
          const isActive = activeDimension === spoke.dimension;

          return (
            <text
              key={`label-${i}`}
              x={spoke.labelX}
              y={spoke.labelY}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest transition-all duration-300 pointer-events-none",
                isActive
                  ? "fill-focus-violet font-semibold"
                  : spoke.status === 'weak'
                    ? "fill-bullshit-crimson/80 font-semibold"
                    : spoke.status === 'strong'
                      ? "fill-action-emerald/80 font-semibold"
                      : "fill-white/40"
              )}
            >
              {DIMENSION_LABELS[spoke.dimension as keyof typeof DIMENSION_LABELS] || spoke.dimension}
            </text>
          );
        })}
      </svg>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
          Click or drag on any spoke to adjust values
        </p>
      </div>
    </div>
  );
}
