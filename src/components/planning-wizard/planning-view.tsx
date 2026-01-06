"use client";

import type { PlanningWithTypedFields } from "@/lib/types";
import type { SimplifiedGoal } from "@/lib/validators";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { useMemo } from "react";
import { PlanningHeader } from "@/components/planning-view/planning-header";
import { PlanningAnnualGoals } from "@/components/planning-view/planning-annual-goals";
import { PlanningSummarySections } from "@/components/planning-view/planning-summary-sections";
import { PlanningSidebar } from "@/components/planning-view/planning-sidebar";
import { PlanningEmptyState } from "@/components/planning-view/planning-empty-state";

interface PlanningViewProps {
    planning: PlanningWithTypedFields;
}

export function PlanningView({ planning }: PlanningViewProps) {

    const annualGoals = useMemo(() => {
        const goals: SimplifiedGoal[] = (planning.goals as SimplifiedGoal[] | undefined) || planning.activeGoals || [];
        const annualGoalIds: string[] = (planning.annualGoalIds as string[] | undefined) || [];
        const richAnnualGoals = planning.annualGoals || [];

        // If we have rich annual goals data, use it (it contains definitionOfDone, etc.)
        if (richAnnualGoals.length > 0) {
            return richAnnualGoals;
        }

        // Fallback: Filter from backlog (simplified data only)
        return goals.filter((g: SimplifiedGoal) =>
            annualGoalIds.includes(g.id) || (g as SimplifiedGoal & { isAnnualGoal?: boolean }).isAnnualGoal
        );
    }, [planning.goals, planning.activeGoals, planning.annualGoalIds, planning.annualGoals]);

    const backlogGoals = useMemo(() => {
        const goals: SimplifiedGoal[] = (planning.goals as SimplifiedGoal[] | undefined) || planning.activeGoals || [];
        const annualGoalIds: string[] = (planning.annualGoalIds as string[] | undefined) || [];
        return goals.filter((g: SimplifiedGoal) =>
            !annualGoalIds.includes(g.id) && !(g as SimplifiedGoal & { isAnnualGoal?: boolean }).isAnnualGoal
        );
    }, [planning.goals, planning.activeGoals, planning.annualGoalIds]);

    const targetWheelOfLife = useMemo(() => planning.targetWheelOfLife || {}, [planning.targetWheelOfLife]);
    const antiVision = planning.antiVision || undefined;
    const antiGoals = planning.antiGoals || [];
    const futureIdentity = planning.futureIdentity || undefined;
    const commitmentStatement = planning.commitmentStatement || undefined;
    const signatureImage = planning.signatureImage || undefined;
    const signedAt = planning.signedAt ? new Date(planning.signedAt) : undefined;
    const futureYouLetter = planning.futureYouLetter || undefined;
    const brainDump = planning.brainDump || undefined;

    // Prepare wheel data
    const currentWheel = useMemo(() => LIFE_DIMENSIONS.reduce((acc, dim) => {
        acc[dim] = planning.wheelOfLife?.[dim] || 5;
        return acc;
    }, {} as Record<string, number>), [planning.wheelOfLife]);

    const targetWheel = useMemo(() => LIFE_DIMENSIONS.reduce((acc, dim) => {
        acc[dim] = targetWheelOfLife[dim] || currentWheel[dim] || 5;
        return acc;
    }, {} as Record<string, number>), [targetWheelOfLife, currentWheel]);

    return (
        <div className="min-h-screen bg-[#14141F] text-white selection:bg-violet-500/30">
            {/* Background Blooms */}
            <div className="bg-blooms pointer-events-none fixed inset-0 z-[-1]">
                <div className="bloom-violet opacity-5" />
                <div className="bloom-emerald opacity-[0.03]" />
            </div>

            <div className="max-w-[1200px] mx-auto p-6 md:p-8 lg:p-12 space-y-12 pb-32">

                {/* --- HEADER TIER --- */}
                <PlanningHeader year={planning.year} futureIdentity={futureIdentity} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
                    {/* --- MAIN COLUMN: Action & Roadmap (8/12) --- */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Annual Goals - Concise List Row View */}
                        <PlanningAnnualGoals goals={annualGoals} planningId={planning.id} />

                        {/* Summary Sections */}
                        <PlanningSummarySections
                            antiVision={antiVision}
                            antiGoals={antiGoals}
                            futureYouLetter={futureYouLetter}
                            brainDump={brainDump}
                        />
                    </div>

                    {/* --- SIDEBAR COLUMN: Guards & Context (4/12) --- */}
                    <div className="lg:col-span-4 space-y-12">
                        <PlanningSidebar
                            currentWheel={currentWheel}
                            targetWheel={targetWheel}
                            backlogGoals={backlogGoals}
                            commitmentStatement={commitmentStatement}
                            signatureImage={signatureImage}
                            signedAt={signedAt}
                        />
                    </div>
                </div>

                {/* Empty State */}
                {!futureIdentity && annualGoals.length === 0 && (
                    <PlanningEmptyState />
                )}
            </div>
        </div>
    );
}

