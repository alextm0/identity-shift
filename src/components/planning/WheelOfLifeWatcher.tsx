"use client";

import { useWatch, Control } from "react-hook-form";
import { WheelOfLife } from "@/components/ui/WheelOfLife";
import { PlanningFormData } from "@/lib/validators";

interface WheelOfLifeWatcherProps {
  control: Control<PlanningFormData>;
  targetValues: Record<string, number>;
  highlightedArea: string | null;
}

export function WheelOfLifeWatcher({ control, targetValues, highlightedArea }: WheelOfLifeWatcherProps) {
  const values = useWatch({
    control,
    name: "wheelOfLife",
  }) as Record<string, number> | undefined;

  return (
    <WheelOfLife
      values={values || {}}
      targetValues={targetValues}
      highlightedArea={highlightedArea}
    />
  );
}
