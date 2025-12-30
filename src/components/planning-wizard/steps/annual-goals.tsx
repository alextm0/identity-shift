"use client";

import { usePlanningStore } from "@/hooks/stores/use-planning-store";
import { DIMENSION_LABELS, LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { WheelOfLife } from "@/components/ui/WheelOfLife";
import { StepHeader } from "../ui/step-header";
import { StepContainer } from "../ui/step-container";
import { SelectionCard } from "../ui/selection-card";

export function AnnualGoalsStep() {
    const goals = usePlanningStore((state) => state.goals);
    const annualGoalIds = usePlanningStore((state) => state.annualGoalIds);
    const targetWheelOfLife = usePlanningStore((state) => state.targetWheelOfLife);
    const wheelOfLife = usePlanningStore((state) => state.wheelOfLife);
    const toggleAnnualGoal = usePlanningStore((state) => state.toggleAnnualGoal);
    const year = usePlanningStore((state) => state.year);

    // Group goals by category
    const goalsByCategory = LIFE_DIMENSIONS.reduce((acc, dim) => {
        acc[dim] = goals.filter(g => g.category === dim);
        return acc;
    }, {} as Record<string, typeof goals>);
    const uncategorizedGoals = goals.filter(g => !g.category);

    // Prepare wheel data for visualization
    const currentWheel = LIFE_DIMENSIONS.reduce((acc, dim) => {
        acc[dim] = wheelOfLife[dim] || 5;
        return acc;
    }, {} as Record<string, number>);

    const targetWheel = LIFE_DIMENSIONS.reduce((acc, dim) => {
        acc[dim] = targetWheelOfLife[dim] || currentWheel[dim] || 5;
        return acc;
    }, {} as Record<string, number>);

    return (
        <StepContainer size="xl">
            <StepHeader
                title="Annual Goals"
                subtitle="Select which goals will represent the year."
                description="Choose as many as you feel are crucial. The rest will be saved as 'Backlog / Later'."
            >
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest mt-2">
                    {annualGoalIds.length} {annualGoalIds.length === 1 ? 'goal' : 'goals'} selected
                </p>
            </StepHeader>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 items-start">

                {/* Left Column: Goal Selection */}
                <div className="space-y-6">
                    <div className="space-y-6">
                        {LIFE_DIMENSIONS.map((dimension) => {
                            const categoryGoals = goalsByCategory[dimension];
                            if (categoryGoals.length === 0) return null;

                            return (
                                <div key={dimension} className="space-y-3">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                                        {DIMENSION_LABELS[dimension]}
                                    </h3>
                                    <div className="space-y-2">
                                        {categoryGoals.map((goal) => (
                                            <SelectionCard
                                                key={goal.id}
                                                isSelected={annualGoalIds.includes(goal.id)}
                                                onClick={() => toggleAnnualGoal(goal.id)}
                                            >
                                                {goal.text}
                                            </SelectionCard>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Uncategorized goals */}
                        {uncategorizedGoals.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                                    Uncategorized
                                </h3>
                                <div className="space-y-2">
                                    {uncategorizedGoals.map((goal) => (
                                        <SelectionCard
                                            key={goal.id}
                                            isSelected={annualGoalIds.includes(goal.id)}
                                            onClick={() => toggleAnnualGoal(goal.id)}
                                        >
                                            {goal.text}
                                        </SelectionCard>
                                    ))}
                                </div>
                            </div>
                        )}

                        {goals.length === 0 && (
                            <div className="p-12 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                                <p className="text-white/30 font-mono text-xs uppercase tracking-widest">
                                    No goals yet. Go back to add goals first.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Wheel Visualization - Sticky on desktop */}
                <div className="hidden lg:block sticky top-8">
                    {Object.keys(targetWheelOfLife).length > 0 && (
                        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                            <div className="space-y-8">
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white uppercase tracking-widest mb-1">
                                        Vision Reference
                                    </p>
                                    <p className="text-xs text-white/40">
                                        Align your goals with your gap areas
                                    </p>
                                </div>
                                <div className="flex justify-center">
                                    <div className="w-full max-w-[450px]">
                                        <WheelOfLife
                                            values={currentWheel}
                                            targetValues={targetWheel}
                                            useDimensionLabels={true}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-white/40" />
                                        <span>Current</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-focus-violet" />
                                        <span>Target</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Wheel (shown below goals on small screens) */}
            <div className="lg:hidden">
                {Object.keys(targetWheelOfLife).length > 0 && (
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-white uppercase tracking-widest text-center">
                                Vision Reference
                            </p>
                            <div className="flex justify-center">
                                <WheelOfLife
                                    values={currentWheel}
                                    targetValues={targetWheel}
                                    useDimensionLabels={true}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {annualGoalIds.length > 0 && (
                <p className="text-sm text-action-emerald text-center font-mono uppercase tracking-widest">
                    ✓ {annualGoalIds.length} {annualGoalIds.length === 1 ? 'goal' : 'goals'} selected for {year}.
                </p>
            )}
        </StepContainer>
    );
}



