
import { useState } from "react";
import { ShieldAlert, Sparkles, ScrollText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AntiGoal } from "@/lib/validators";

interface PlanningSummarySectionsProps {
    antiVision?: string;
    antiGoals: AntiGoal[];
    futureYouLetter?: string;
    brainDump?: string;
}

export function PlanningSummarySections({ antiVision, antiGoals, futureYouLetter, brainDump }: PlanningSummarySectionsProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        strategic_blueprint: false,
        backlog: false,
        future_letter: false,
        commitment: false,
        survival_guards: false,
        raw_context: false,
    });

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <>
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
                                    <Sparkles className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors" />
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
        </>
    );
}
