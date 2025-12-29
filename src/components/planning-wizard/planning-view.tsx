"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Target, Sparkles, ChevronDown, ChevronUp, ScrollText, ShieldAlert, ListTodo, Clock, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import type { PlanningWithTypedFields } from "@/lib/types";
import { format } from "date-fns";
import { DIMENSION_LABELS } from "@/lib/validators/yearly-review";
import type { LifeDimension } from "@/lib/validators/yearly-review";
import type { SimplifiedGoal, AnnualGoal } from "@/lib/validators";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { WheelOfLife } from "@/components/planning/wheel-of-life";
import { LIFE_DIMENSIONS } from "@/lib/validators/yearly-review";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface PlanningViewProps {
    planning: PlanningWithTypedFields;
}

export function PlanningView({ planning }: PlanningViewProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        strategic_blueprint: false,
        backlog: false,
        future_letter: false,
        commitment: false,
        survival_guards: false,
        raw_context: false,
    });

    const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleGoal = (id: string) => {
        setExpandedGoals(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Extract data
    const goals = planning.goals || planning.activeGoals || [];
    const annualGoalIds = planning.annualGoalIds || [];
    const richAnnualGoals = planning.annualGoals || [];

    const annualGoals = useMemo(() => {
        // If we have rich annual goals data, use it (it contains definitionOfDone, etc.)
        if (richAnnualGoals.length > 0) {
            return richAnnualGoals;
        }

        // Fallback: Filter from backlog (simplified data only)
        return goals.filter((g: SimplifiedGoal) =>
            annualGoalIds.includes(g.id) || (g as SimplifiedGoal & { isAnnualGoal?: boolean }).isAnnualGoal
        );
    }, [goals, annualGoalIds, richAnnualGoals]);

    const backlogGoals = useMemo(() => goals.filter((g: SimplifiedGoal) =>
        !annualGoalIds.includes(g.id) && !(g as SimplifiedGoal & { isAnnualGoal?: boolean }).isAnnualGoal
    ), [goals, annualGoalIds]);

    const targetWheelOfLife = planning.targetWheelOfLife || {};
    const antiVision = planning.antiVision;
    const antiGoals = planning.antiGoals || [];
    const futureIdentity = planning.futureIdentity;
    const commitmentStatement = planning.commitmentStatement;
    const signatureName = planning.signatureName;
    const signatureImage = planning.signatureImage;
    const signedAt = planning.signedAt;
    const futureYouLetter = planning.futureYouLetter;
    const brainDump = planning.brainDump;
    const themeWord = planning.themeWord;
    const driftResponse = planning.driftResponse;

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
        <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30">
            {/* Background Blooms */}
            <div className="bg-blooms pointer-events-none fixed inset-0 z-[-1]">
                <div className="bloom-violet opacity-5" />
                <div className="bloom-emerald opacity-[0.03]" />
            </div>

            <div className="max-w-[1200px] mx-auto p-6 md:p-8 lg:p-12 space-y-12 pb-32">

                {/* --- HEADER TIER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white/30">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">{planning.year} STRATEGIC PATH</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold font-sans text-white uppercase tracking-tighter leading-none">
                                Identity <span className="text-white/20 font-light">&</span> Vision
                            </h1>
                            <div className="flex flex-wrap items-center gap-4">
                                {themeWord && (
                                    <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">
                                            Theme: {themeWord}
                                        </p>
                                    </div>
                                )}
                                {futureIdentity && (
                                    <div className="flex items-center gap-4 py-2 px-4 rounded-xl bg-white/[0.03] border border-white/5 w-fit group hover:border-emerald-500/20 transition-all duration-500">
                                        <Sparkles className="h-4 w-4 text-emerald-500/40 group-hover:text-emerald-500/60 transition-colors" />
                                        <p className="text-lg md:text-xl font-medium text-white/90 leading-tight">
                                            {futureIdentity}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/planning?edit=true">
                            <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5">
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Edit Plan
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="h-9 px-4 text-[10px] uppercase tracking-widest border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                                <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                                Exit to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
                    {/* --- MAIN COLUMN: Action & Roadmap (8/12) --- */}
                    <div className="lg:col-span-8 space-y-12">





                        {/* Annual Goals - Concise List Row View */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                        <Target className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Annual Roadmap</h3>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-xs font-mono text-emerald-500 font-bold">{annualGoals.length}</span>
                                    <span className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">Targets</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {annualGoals.map((goal: AnnualGoal, index: number) => {
                                    const isExpanded = expandedGoals[goal.id];
                                    return (
                                        <div
                                            key={`annual-${goal.id}-${index}`}
                                            className={cn(
                                                "group relative border border-white/5 bg-white/[0.02] rounded-xl transition-all duration-300 overflow-hidden",
                                                isExpanded ? "bg-white/[0.04] border-white/10" : "hover:bg-white/[0.04] hover:border-white/10"
                                            )}
                                        >
                                            <button
                                                onClick={() => toggleGoal(goal.id)}
                                                className="w-full text-left p-6 flex items-start sm:items-center justify-between gap-6"
                                            >
                                                <div className="flex items-start sm:items-center gap-6 flex-1 min-w-0">
                                                    <span className="text-xs font-mono text-white/20 shrink-0 pt-1 sm:pt-0">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <div className="flex flex-col gap-1 min-w-0">
                                                        <h4 className="text-lg font-medium text-white/90 leading-tight group-hover:text-white transition-colors">
                                                            {goal.text || goal.originalText}
                                                        </h4>
                                                        {goal.category && !isExpanded && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1 w-1 rounded-full bg-emerald-500/40" />
                                                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                                                                    {DIMENSION_LABELS[goal.category as LifeDimension]}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0 pt-1 sm:pt-0">
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-white/40" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                                                    )}
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="px-6 pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-white/5 mt-2">
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest flex items-center gap-2">
                                                            <span className="h-px w-4 bg-emerald-500/20" />
                                                            Success Criteria
                                                        </p>
                                                        <p className="text-sm text-white/70 font-light leading-relaxed">
                                                            {goal.definitionOfDone || "No definition provided."}
                                                        </p>
                                                    </div>

                                                    {goal.whyMatters && (
                                                        <div className="p-4 rounded-lg bg-white/[0.02] border border-emerald-500/10 flex items-start gap-4">
                                                            <div className="h-full w-0.5 bg-emerald-500/30 rounded-full shrink-0" />
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Why This Matters</p>
                                                                <p className="text-sm text-white/60 italic font-light leading-relaxed">
                                                                    &quot;{goal.whyMatters}&quot;
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- SURVIVAL GUARDS (Collapsible) --- */}
                        <div className="pt-8 border-t border-white/5">
                            <button
                                onClick={() => toggleSection('survival_guards')}
                                className="w-full group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                            <ShieldAlert className="h-4 w-4 text-white/50" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Survival Guards</h3>
                                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Design Constraints & Anti-Vision</p>
                                        </div>
                                    </div>
                                    <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300", expandedSections.survival_guards ? "rotate-180" : "")} />
                                </div>
                            </button>

                            {expandedSections.survival_guards && (
                                <div className="mt-6 p-6 rounded-2xl bg-white/[0.04] border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-8">
                                    {antiVision && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">The Failure Mode</p>
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                <p className="text-sm text-white/70 leading-relaxed font-sans">
                                                    {antiVision}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {driftResponse && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">Recovery Protocol</p>
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                <p className="text-sm text-white/70 leading-relaxed font-sans">
                                                    {driftResponse}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {antiGoals.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">Constraints (Anti-Goals)</p>
                                            <div className="flex flex-col gap-2">
                                                {antiGoals.map((antiGoal, index: number) => (
                                                    <div key={index} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 items-center group hover:bg-white/[0.04] transition-colors">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors shrink-0" />
                                                        <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{antiGoal.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Vision Wheel Reference - Always Visible */}
                        <div className="space-y-6 p-1 bg-white/[0.01] border border-white/5 rounded-[2.5rem]">
                            <div className="p-8 pb-0 space-y-2">
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard className="h-4 w-4 text-emerald-500/50" />
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Strategic Blueprint</h3>
                                </div>
                                <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Radar of Current vs Target Archetype</p>
                            </div>

                            <div className="p-8 pt-2 space-y-8">
                                <div className="flex justify-center">
                                    <div className="w-full max-w-[280px]">
                                        <WheelOfLife
                                            values={currentWheel}
                                            targetValues={targetWheel}
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    {/* --- SIDEBAR COLUMN: Guards & Context (4/12) --- */}
                    <div className="lg:col-span-4 space-y-12">



                        {/* Goal Backlog */}
                        {backlogGoals.length > 0 && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => toggleSection('backlog')}
                                    className="w-full"
                                >
                                    <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-white/5">
                                                <ListTodo className="h-3.5 w-3.5 text-white/40" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-white/40">Goal Backlog</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-white/20">{backlogGoals.length}</span>
                                            <ChevronDown className={cn("h-3.5 w-3.5 text-white/20 transition-transform duration-200", expandedSections.backlog ? "rotate-180" : "")} />
                                        </div>
                                    </div>
                                </button>

                                {expandedSections.backlog && (
                                    <div className="pt-2 space-y-1 animate-in fade-in slide-in-from-top-1">
                                        {backlogGoals.map((goal: SimplifiedGoal) => (
                                            <div key={goal.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                                <div className="mt-1.5 h-1 w-1 rounded-full bg-white/10 group-hover:bg-white/30 shrink-0 transition-colors" />
                                                <p className="text-xs text-white/40 group-hover:text-white/70 transition-colors leading-relaxed">
                                                    {goal.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Commitment Seal */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <ScrollText className="h-4 w-4 text-white/40" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Final Commitment</h3>
                            </div>

                            <GlassPanel className="p-8 border-white/5 overflow-hidden group relative rounded-[2rem]">
                                <div className="absolute -top-10 -right-10 opacity-[0.02]">
                                    <ScrollText className="h-48 w-48" />
                                </div>

                                <div className="relative z-10 space-y-8">
                                    <div className="space-y-2">
                                        {commitmentStatement ? (
                                            <p className="text-xs text-white/50 italic leading-relaxed text-center">
                                                &quot;{commitmentStatement}&quot;
                                            </p>
                                        ) : (
                                            <p className="text-xs text-white/30 italic text-center">No formal statement, sealed by signature.</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center pt-8 border-t border-white/5">
                                        {signatureImage ? (
                                            <img
                                                src={signatureImage}
                                                alt="Signature"
                                                className="h-20 w-auto opacity-100 invert brightness-200 mb-4"
                                            />
                                        ) : (
                                            <p className="text-white font-serif italic text-3xl mb-4 opacity-80">
                                                {signatureName}
                                            </p>
                                        )}
                                        <div className="text-center space-y-1">
                                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">AUTHENTICATED</p>
                                            <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest font-bold">
                                                {signedAt ? format(new Date(signedAt), "MMMM d, yyyy") : "SEALED"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </GlassPanel>
                        </div>
                    </div>
                </div>

                {/* Final Reflection: Future Letter */}
                {futureYouLetter && (
                    <div className="pt-24 border-t border-white/5">
                        <div className="space-y-12 max-w-4xl mx-auto">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="p-4 rounded-full bg-violet-500/5 border border-violet-500/10">
                                    <Sparkles className="h-8 w-8 text-violet-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.5em] text-white/40">Letter from the Future</h3>
                                    <button
                                        onClick={() => toggleSection('future_letter')}
                                        className="text-[10px] font-mono text-violet-500/60 uppercase tracking-widest hover:text-violet-400 transition-colors"
                                    >
                                        {expandedSections.future_letter ? "Conceal Revelation" : "Expose High-Level Vision"}
                                    </button>
                                </div>
                            </div>

                            {expandedSections.future_letter && (
                                <GlassPanel className="p-16 md:p-24 border-white/5 bg-white/[0.01] animate-in fade-in slide-in-from-bottom-10 duration-1000 rounded-[3rem]">
                                    <div className="max-w-3xl mx-auto space-y-12">
                                        <div className="flex justify-center opacity-10">
                                            <ScrollText className="h-16 w-16" />
                                        </div>
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed whitespace-pre-wrap text-center selection:bg-emerald-500/20">
                                                {futureYouLetter}
                                            </p>
                                        </div>
                                        <div className="flex justify-center pt-12">
                                            <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        </div>
                                    </div>
                                </GlassPanel>
                            )}
                        </div>
                    </div>
                )}

                {/* Raw Context / Brain Dump */}
                {brainDump && (
                    <div className="pt-12 border-t border-white/5 pb-12">
                        <div className="space-y-4">
                            <button
                                onClick={() => toggleSection('raw_context')}
                                className="w-full flex items-center justify-between group opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-white/10" />
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Raw Planning Context</p>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>
                            </button>

                            {expandedSections.raw_context && (
                                <div className="max-w-2xl mx-auto pt-8 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest text-center">Initial Brain Dump</p>
                                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <p className="text-xs text-white/40 font-mono leading-relaxed whitespace-pre-wrap">
                                                {brainDump}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!futureIdentity && annualGoals.length === 0 && (
                    <GlassPanel className="p-20 text-center border-white/5 bg-white/[0.02]">
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                            <ShieldAlert className="relative h-16 w-16 text-white/10 mx-auto" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-[0.2em]">Blueprint Empty</h2>
                        <p className="text-white/40 text-sm mb-10 max-w-md mx-auto leading-relaxed">
                            Your annual strategic path is currently unwritten. The dashboard remains in shadow until the manifest is signed.
                        </p>
                        <Link href="/dashboard/planning">
                            <Button variant="violet" className="font-mono text-[10px] uppercase tracking-widest px-10 h-12">
                                Initiate Planning →
                            </Button>
                        </Link>
                    </GlassPanel>
                )}
            </div>


        </div>
    );
}

