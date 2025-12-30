"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Target, Sparkles, ChevronDown, ChevronUp, ScrollText, ShieldAlert, ListTodo, Clock, LayoutDashboard, Maximize2, X } from "lucide-react";
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
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";

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
    const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);

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

                            <div className="space-y-4">
                                {annualGoals.map((goal, index: number) => {
                                    const isExpanded = expandedGoals[goal.id];
                                    return (
                                        <div
                                            key={`annual-${goal.id}-${index}`}
                                            className={cn(
                                                "group relative border rounded-xl transition-all duration-300 overflow-hidden",
                                                "bg-gradient-to-br from-white/[0.02] to-white/[0.01]",
                                                "shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
                                                isExpanded 
                                                    ? "border-white/15 bg-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.1)]" 
                                                    : "border-white/5 hover:border-white/12 hover:bg-white/[0.04] hover:shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                                            )}
                                        >
                                            <button
                                                onClick={() => toggleGoal(goal.id)}
                                                className="w-full text-left p-6 flex items-start sm:items-center justify-between gap-6 relative z-10"
                                            >
                                                <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
                                                    <div className={cn(
                                                        "flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-300 shrink-0",
                                                        isExpanded
                                                            ? "bg-white/10 border-white/20"
                                                            : "bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/15"
                                                    )}>
                                                        <span className={cn(
                                                            "text-xs font-mono font-bold transition-colors duration-300",
                                                            isExpanded ? "text-white/80" : "text-white/50 group-hover:text-white/70"
                                                        )}>
                                                            {String(index + 1).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                                                        <h4 className={cn(
                                                            "text-lg font-semibold leading-tight transition-colors duration-300",
                                                            isExpanded ? "text-white" : "text-white/95 group-hover:text-white"
                                                        )}>
                                                            {goal.text}
                                                        </h4>
                                                        {goal.category && !isExpanded && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-white/30 group-hover:bg-white/40 transition-colors duration-300" />
                                                                <span className="text-[10px] font-mono text-white/50 group-hover:text-white/60 uppercase tracking-wider transition-colors duration-300">
                                                                    {DIMENSION_LABELS[goal.category as LifeDimension]}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0 pt-1 sm:pt-0">
                                                    <div className={cn(
                                                        "p-1.5 rounded-lg transition-all duration-300",
                                                        isExpanded 
                                                            ? "bg-white/10 rotate-180" 
                                                            : "bg-white/5 group-hover:bg-white/10"
                                                    )}>
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4 text-white/60" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-white/30 group-hover:text-white/50 transition-colors" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="px-6 pb-8 pt-4 space-y-6 animate-in fade-in slide-in-from-top-3 duration-500 border-t border-white/10 mt-2 relative z-10">
                                                    {('definitionOfDone' in goal) ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-px w-6 bg-gradient-to-r from-emerald-500/60 to-transparent" />
                                                                <p className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest font-semibold">
                                                                    Success Criteria
                                                                </p>
                                                            </div>
                                                            <div className="pl-2">
                                                                <p className="text-sm text-white/75 font-sans leading-relaxed">
                                                                    {(goal as AnnualGoal).definitionOfDone || "No definition provided."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {('whyMatters' in goal) && (goal as AnnualGoal).whyMatters ? (
                                                        <div className="relative p-5 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-emerald-500/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] flex items-start gap-4 group/why">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500/40 via-emerald-500/30 to-emerald-500/40 rounded-l-xl" />
                                                            <div className="space-y-2 pl-3">
                                                                <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest font-semibold">Why This Matters</p>
                                                                <p className="text-sm text-white/70 font-sans leading-relaxed">
                                                                    &quot;{(goal as AnnualGoal).whyMatters}&quot;
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : null}
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

                        {/* Letter from the Future */}
                        {futureYouLetter && (
                            <div className="pt-8 border-t border-white/5">
                                <button
                                    onClick={() => toggleSection('future_letter')}
                                    className="w-full group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <Sparkles className="h-4 w-4 text-violet-500/60 group-hover:text-violet-500/80 transition-colors" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Letter from the Future</h3>
                                                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Expose High-Level Vision</p>
                                            </div>
                                        </div>
                                        <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300", expandedSections.future_letter ? "rotate-180" : "")} />
                                    </div>
                                </button>

                                {expandedSections.future_letter && (
                                    <div className="mt-6 p-6 rounded-2xl bg-white/[0.04] border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-6">
                                            <div className="flex justify-center opacity-10">
                                                <ScrollText className="h-12 w-12" />
                                            </div>
                                            <div className="prose prose-invert max-w-none">
                                                <p className="text-base text-white/60 font-sans leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/20">
                                                    {futureYouLetter}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Raw Context / Brain Dump */}
                        {brainDump && (
                            <div className="pt-8 border-t border-white/5">
                                <button
                                    onClick={() => toggleSection('raw_context')}
                                    className="w-full group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <ScrollText className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">Raw Planning Context</h3>
                                                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">Initial Brain Dump</p>
                                            </div>
                                        </div>
                                        <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform duration-300", expandedSections.raw_context ? "rotate-180" : "")} />
                                    </div>
                                </button>

                                {expandedSections.raw_context && (
                                    <div className="mt-6 p-6 rounded-2xl bg-white/[0.04] border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-xs text-white/40 font-mono leading-relaxed whitespace-pre-wrap">
                                            {brainDump}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- SIDEBAR COLUMN: Guards & Context (4/12) --- */}
                    <div className="lg:col-span-4 space-y-12">

                        {/* Strategic Blueprint - Wheel of Life */}
                        <div className="space-y-6">
                            <GlassPanel className="p-8 border-white/5 overflow-hidden group relative rounded-[2rem]">
                                <button
                                    onClick={() => setIsWheelModalOpen(true)}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                    aria-label="View wheel of life in fullscreen"
                                >
                                    <Maximize2 className="h-4 w-4 text-white/60 hover:text-white/90 transition-colors" />
                                </button>
                                <div className="flex justify-center py-2">
                                    <div className="w-full max-w-[600px]">
                                        <WheelOfLife
                                            values={currentWheel}
                                            targetValues={targetWheel}
                                        />
                                    </div>
                                </div>
                            </GlassPanel>
                        </div>

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

                        {/* Commitment Seal - Just Signature */}
                        <div className="space-y-6">
                            <GlassPanel className="p-8 border-white/5 overflow-hidden group relative rounded-[2rem]">
                                <div className="absolute -top-10 -right-10 opacity-[0.02]">
                                    <ScrollText className="h-48 w-48" />
                                </div>

                                <div className="relative z-10">
                                    {commitmentStatement && (
                                        <div className="space-y-2 mb-8">
                                            <p className="text-xs text-white/50 leading-relaxed text-center">
                                                &quot;{commitmentStatement}&quot;
                                            </p>
                                        </div>
                                    )}

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

            {/* Wheel of Life Modal */}
            <Dialog open={isWheelModalOpen} onOpenChange={setIsWheelModalOpen}>
                <DialogOverlay className="bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-500 data-[state=closed]:duration-300" />
                <DialogContent className="max-w-4xl w-full !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] !mx-0 !my-0 p-0 border border-white/20 bg-[#050505]/60 backdrop-blur-2xl shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-90 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4 data-[state=open]:duration-500 data-[state=closed]:duration-300 rounded-3xl overflow-hidden [&>button]:hidden max-h-[85vh]">
                    <DialogTitle className="sr-only">Strategic Blueprint - Wheel of Life</DialogTitle>
                    <div className="relative w-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/[0.03] shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-1">
                                    Strategic Blueprint
                                </h2>
                                <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
                                    Wheel of Life
                                </p>
                            </div>
                            <button
                                onClick={() => setIsWheelModalOpen(false)}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                                aria-label="Close modal"
                            >
                                <X className="h-4 w-4 text-white/60 group-hover:text-white/90 transition-colors" />
                            </button>
                        </div>

                        {/* Wheel Container */}
                        <div className="flex-1 flex items-center justify-center bg-white/[0.02] px-8 py-8 w-full">
                            <div className="w-full max-w-[550px] aspect-square mx-auto">
                                <WheelOfLife
                                    values={currentWheel}
                                    targetValues={targetWheel}
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

