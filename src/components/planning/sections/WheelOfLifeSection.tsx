"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { WheelOfLifeWatcher } from "@/components/planning/WheelOfLifeWatcher";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, Target } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { PlanningFormData } from "@/lib/validators";
import { cn } from "@/lib/utils";

interface WheelOfLifeSectionProps {
  form: UseFormReturn<PlanningFormData>;
}

export function WheelOfLifeSection({ form }: WheelOfLifeSectionProps) {
  const [activeTab, setActiveTab] = useState("assessment");
  const [hoveredGoalArea] = useState<string | null>(null);

  // Get default values for initial render
  const wheelOfLifeValues = form.getValues("wheelOfLife") || {};
  const wheelOfLifeTargetValues = form.getValues("wheelOfLifeTarget") || wheelOfLifeValues;

  return (
    <GlassPanel className="p-8 space-y-6 backdrop-blur-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase mb-2">Wheel of Life</h2>
        <p className="text-sm text-white/40 leading-relaxed">
          Assess your current satisfaction and set targets for next year. The chart shows both overlayed.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="target" className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5" />
            Target
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Sliders */}
            <div className="lg:col-span-1 space-y-4">
              {Object.keys(wheelOfLifeValues).map((key) => {
                const value = form.watch(`wheelOfLife.${key}`) as number;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                      <span className={cn(
                        "text-white/60 transition-colors",
                        hoveredGoalArea === key && "text-focus-violet"
                      )}>{key}</span>
                      <span className="text-white/40">{value}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      {...form.register(`wheelOfLife.${key}`, { valueAsNumber: true })}
                      className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white/40 transition-all duration-300"
                    />
                  </div>
                );
              })}
            </div>

            {/* Chart */}
            <div className="lg:col-span-2 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
              <WheelOfLifeWatcher
                control={form.control}
                targetValues={wheelOfLifeTargetValues}
                highlightedArea={hoveredGoalArea}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="target" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Sliders */}
            <div className="lg:col-span-1 space-y-4">
              {Object.keys(wheelOfLifeTargetValues).map((key) => {
                const value = form.watch(`wheelOfLifeTarget.${key}`) as number;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                      <span className={cn(
                        "text-white/60 transition-colors",
                        hoveredGoalArea === key && "text-focus-violet"
                      )}>{key}</span>
                      <span className="text-focus-violet">{value}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      {...form.register(`wheelOfLifeTarget.${key}`, { valueAsNumber: true })}
                      className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-focus-violet transition-all duration-300"
                    />
                  </div>
                );
              })}
            </div>

            {/* Chart */}
            <div className="lg:col-span-2 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
              <WheelOfLifeWatcher
                control={form.control}
                targetValues={wheelOfLifeTargetValues}
                highlightedArea={hoveredGoalArea}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </GlassPanel>
  );
}

