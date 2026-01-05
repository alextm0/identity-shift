
import { useState } from "react";
import { Maximize2, ListTodo, ChevronDown, ScrollText, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { WheelOfLife } from "@/components/planning/wheel-of-life";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import type { SimplifiedGoal } from "@/lib/validators";

interface PlanningSidebarProps {
    currentWheel: Record<string, number>;
    targetWheel: Record<string, number>;
    backlogGoals: SimplifiedGoal[];
    commitmentStatement?: string;
    signatureImage?: string;
    signedAt?: Date | null;
}

export function PlanningSidebar({
    currentWheel,
    targetWheel,
    backlogGoals,
    commitmentStatement,
    signatureImage,
    signedAt
}: PlanningSidebarProps) {
    const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
    const [isBacklogExpanded, setIsBacklogExpanded] = useState(false);

    return (
        <div className="space-y-12">
            {/* Strategic Blueprint - Wheel of Life */}
            <div className="space-y-6">
                <GlassPanel className="p-6 border-white/5 overflow-hidden group relative rounded-2xl">
                    <button
                        onClick={() => setIsWheelModalOpen(true)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/5 border border-[var(--color-border)] hover:bg-white/10 hover:border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        aria-label="View wheel of life in fullscreen"
                    >
                        <Maximize2 className="h-4 w-4 text-white/60 hover:text-white/90 transition-colors" />
                    </button>
                    <div className="flex justify-center">
                        <div className="w-full">
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
                        onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
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
                                <ChevronDown className={cn("h-3.5 w-3.5 text-white/20 transition-transform duration-200", isBacklogExpanded ? "rotate-180" : "")} />
                            </div>
                        </div>
                    </button>

                    {isBacklogExpanded && (
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
                            {signatureImage && (
                                <img
                                    src={signatureImage}
                                    alt="Signature"
                                    className="h-20 w-auto opacity-90 mb-4"
                                />
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

            {/* Wheel of Life Modal */}
            <Dialog open={isWheelModalOpen} onOpenChange={setIsWheelModalOpen}>
                <DialogOverlay className="bg-[var(--color-background)]/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-500 data-[state=closed]:duration-300" />
                <DialogContent className="max-w-4xl w-full !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] !mx-0 !my-0 p-0 border border-white/20 bg-[var(--color-background)]/80 backdrop-blur-2xl shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-90 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4 data-[state=open]:duration-500 data-[state=closed]:duration-300 rounded-3xl overflow-visible [&>button]:hidden">
                    <DialogTitle className="sr-only">Strategic Blueprint - Wheel of Life</DialogTitle>
                    <div className="relative w-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/20 bg-white/[0.03] shrink-0">
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
                        <div className="flex items-center justify-center bg-white/[0.02] p-8 w-full min-h-[600px]">
                            <div className="w-full max-w-[580px] mx-auto">
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
