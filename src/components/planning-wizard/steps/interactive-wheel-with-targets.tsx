"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DIMENSION_LABELS } from "@/lib/validators/yearly-review";

interface InteractiveWheelOfLifeWithTargetsProps {
  currentValues: Record<string, number>;
  targetValues: Record<string, number>;
  onChange: (dimension: string, value: number) => void;
}

export function InteractiveWheelOfLifeWithTargets({
  currentValues,
  targetValues,
  onChange
}: InteractiveWheelOfLifeWithTargetsProps) {
  const dimensions = Object.keys(currentValues);
  const size = 400;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / dimensions.length;
  const viewBoxPadding = 50;

  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localTargetValues, setLocalTargetValues] = useState<Record<string, number>>(targetValues);
  const svgRef = useRef<SVGSVGElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with props when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalTargetValues(targetValues);
    }
  }, [targetValues, isDragging]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Calculate value from mouse position projected onto spoke
  const getValueFromMouse = useCallback((dimensionIndex: number, clientX: number, clientY: number): number => {
    if (!svgRef.current) return 5;

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

    // Convert projection distance to value (0 to radius -> 1 to 10)
    const clampedProjection = Math.max(0, Math.min(radius, projection));
    const value = Math.round((clampedProjection / radius) * 9 + 1);

    return Math.max(1, Math.min(10, value));
  }, [angleStep, radius, size, center, viewBoxPadding]);

  // Debounced onChange to avoid too many rapid updates
  const debouncedOnChange = useCallback((dimension: string, value: number) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Update local state immediately for visual feedback
    setLocalTargetValues(prev => ({ ...prev, [dimension]: value }));

    // Debounce the actual store update
    debounceTimerRef.current = setTimeout(() => {
      onChange(dimension, value);
    }, 100); // 100ms debounce
  }, [onChange]);

  // Pointer handlers
  const handlePointerDown = useCallback((dimension: string, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setActiveDimension(dimension);
    setIsDragging(true);

    const dimIndex = dimensions.indexOf(dimension);
    const value = getValueFromMouse(dimIndex, e.clientX, e.clientY);
    debouncedOnChange(dimension, value);
  }, [dimensions, getValueFromMouse, debouncedOnChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !activeDimension) return;

    const dimIndex = dimensions.indexOf(activeDimension);
    const value = getValueFromMouse(dimIndex, e.clientX, e.clientY);
    debouncedOnChange(activeDimension, value);
  }, [isDragging, activeDimension, dimensions, getValueFromMouse, debouncedOnChange]);

  const handlePointerUp = useCallback(() => {
    // Clear any pending debounced calls and execute immediately
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Ensure final value is saved
    if (activeDimension && localTargetValues[activeDimension] !== undefined) {
      onChange(activeDimension, localTargetValues[activeDimension]);
    }

    setIsDragging(false);
    setActiveDimension(null);
  }, [activeDimension, localTargetValues, onChange]);

  // Computed data for rendering - use local state during dragging for smooth updates
  const spokeData = useMemo(() => {
    const adjustedCenter = center + viewBoxPadding;

    return dimensions.map((dimension, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const currentValue = currentValues[dimension] || 5;
      // Use local state if dragging this dimension, otherwise use props
      const targetValue = isDragging && activeDimension === dimension
        ? (localTargetValues[dimension] ?? targetValues[dimension] ?? currentValue)
        : (targetValues[dimension] ?? currentValue);
      const currentR = (currentValue / 10) * radius;
      const targetR = (targetValue / 10) * radius;

      // Determine status based on target vs current
      let status: 'improving' | 'maintaining' | 'declining' = 'maintaining';
      if (targetValue > currentValue) status = 'improving';
      else if (targetValue < currentValue) status = 'declining';

      return {
        dimension,
        currentValue,
        targetValue,
        angle,
        status,
        // Current point
        currentX: adjustedCenter + currentR * Math.cos(angle),
        currentY: adjustedCenter + currentR * Math.sin(angle),
        // Target point
        targetX: adjustedCenter + targetR * Math.cos(angle),
        targetY: adjustedCenter + targetR * Math.sin(angle),
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
  }, [dimensions, currentValues, targetValues, localTargetValues, isDragging, activeDimension, radius, center, angleStep, viewBoxPadding]);

  const currentPolygonPoints = spokeData.map(d => `${d.currentX},${d.currentY}`).join(" ");
  const targetPolygonPoints = spokeData.map(d => `${d.targetX},${d.targetY}`).join(" ");
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
        {[2, 4, 6, 8, 10].map((level) => (
          <circle
            key={level}
            cx={adjustedCenter}
            cy={adjustedCenter}
            r={(level / 10) * radius}
            className="fill-none stroke-white/5 stroke-1"
          />
        ))}

        {/* Axis Lines (Spokes) */}
        {spokeData.map((spoke, i) => {
          const isActive = activeDimension === spoke.dimension;

          return (
            <g key={`spoke-${i}`}>
              {/* Invisible hit area for dragging */}
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
                    ? "stroke-focus-violet/40"
                    : "stroke-white/10"
                )}
              />
            </g>
          );
        })}

        {/* Current Status Polygon (subtle) */}
        <polygon
          points={currentPolygonPoints}
          className="fill-white/10 stroke-white/20 stroke-1 pointer-events-none"
        />

        {/* Target Status Polygon (glowing purple) */}
        <polygon
          points={targetPolygonPoints}
          className="fill-none stroke-focus-violet stroke-2 pointer-events-none transition-all duration-500"
          style={{
            filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))",
          }}
        />

        {/* Current Data Points (small, subtle) */}
        {spokeData.map((spoke, i) => (
          <circle
            key={`current-${i}`}
            cx={spoke.currentX}
            cy={spoke.currentY}
            r={3}
            className="fill-white/40 pointer-events-none"
          />
        ))}

        {/* Target Data Points (larger, glowing purple) */}
        {spokeData.map((spoke, i) => {
          const isActive = activeDimension === spoke.dimension;

          return (
            <g key={`target-${i}`}>
              {/* Hit area for the target point */}
              <circle
                cx={spoke.targetX}
                cy={spoke.targetY}
                r={20}
                fill="transparent"
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown(spoke.dimension, e)}
                onPointerEnter={() => !isDragging && setActiveDimension(spoke.dimension)}
                onPointerLeave={() => !isDragging && setActiveDimension(null)}
              />

              {/* Visible target point with glow */}
              <circle
                cx={spoke.targetX}
                cy={spoke.targetY}
                r={isActive ? 7 : 5}
                className={cn(
                  "transition-all duration-200 pointer-events-none",
                  isActive
                    ? "fill-focus-violet"
                    : spoke.status === 'improving'
                      ? "fill-action-emerald"
                      : spoke.status === 'declining'
                        ? "fill-bullshit-crimson/60"
                        : "fill-focus-violet/80"
                )}
                style={{
                  filter: isActive
                    ? "drop-shadow(0 0 12px rgba(139, 92, 246, 1))"
                    : spoke.status === 'improving'
                      ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))"
                      : spoke.status === 'declining'
                        ? "drop-shadow(0 0 8px rgba(220, 38, 38, 0.4))"
                        : "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))",
                }}
              />

              {/* Value label when active */}
              {isActive && (
                <g className="pointer-events-none">
                  <rect
                    x={spoke.targetX - 35}
                    y={spoke.targetY - 45}
                    width={70}
                    height={24}
                    rx={12}
                    className="fill-black/80 stroke-focus-violet/30 stroke-1 backdrop-blur-md"
                  />
                  <text
                    x={spoke.targetX}
                    y={spoke.targetY - 33}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white font-mono text-[10px] uppercase tracking-widest font-bold"
                  >
                    Target: {spoke.targetValue}/10
                  </text>
                </g>
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

          const ratingText = spoke.targetValue !== spoke.currentValue
            ? `${spoke.currentValue} → ${spoke.targetValue}`
            : `${spoke.currentValue}`;

          // Calculate a centered label position further out to avoid wheel overlap
          const angle = spoke.angle;
          const labelRadius = radius + 75;
          const labelX = adjustedCenter + labelRadius * Math.cos(angle);
          const labelY = adjustedCenter + labelRadius * Math.sin(angle);

          return (
            <g key={`label-${i}`} className="pointer-events-none transition-all duration-300">
              <text
                x={labelX}
                y={labelY - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
                  isActive
                    ? "fill-focus-violet font-bold"
                    : "fill-white/60"
                )}
              >
                {DIMENSION_LABELS[spoke.dimension as keyof typeof DIMENSION_LABELS] || spoke.dimension}
              </text>
              <text
                x={labelX}
                y={labelY + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn(
                  "font-mono text-[9px] font-bold tracking-tighter transition-all duration-300",
                  isActive
                    ? "fill-white"
                    : "fill-white/30"
                )}
              >
                {ratingText}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
