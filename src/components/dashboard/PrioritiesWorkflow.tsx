"use client";

import { GlassPanel } from '@/components/dashboard/glass-panel';
import {
  CheckCircle2,
  Target,
  Zap,
  Sparkles,
  Activity,
  ChevronDown,
  Calendar,
  Flag,
  Info,
  Clock,
  Layout
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriorityWithProgress {
  key: string;
  label: string;
  goalText: string;
  type: string;
  unitsThisWeek: number;
  weeklyTarget: number;
  progress: number;
  isComplete: boolean;
  sprintName?: string;
}

interface PrioritiesWorkflowProps {
  priorities: PriorityWithProgress[];
}

function CommitmentItem({ priority, index }: { priority: PriorityWithProgress, index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassPanel
        className={cn(
          "group flex flex-col border-white/5 shadow-none transition-all duration-500 overflow-hidden cursor-pointer relative",
          priority.isComplete
            ? "hover:bg-action-emerald/[0.04] hover:border-action-emerald/30 bg-action-emerald/[0.01]"
            : "hover:bg-white/[0.04] hover:border-white/10",
          isExpanded ? "bg-white/[0.05] border-white/20 ring-1 ring-white/10" : "bg-white/[0.02]"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Progress Background Layer (Subtle) */}
        {!priority.isComplete && (
          <div
            className="absolute inset-0 bg-white/[0.02] origin-left pointer-events-none transition-all duration-1000 ease-out"
            style={{ width: `${priority.progress}%` }}
          />
        )}

        <div className="px-5 py-4 flex items-center justify-between gap-4 relative z-10">
          {/* Left section: Icon + Label */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={cn(
              "flex-shrink-0 p-2.5 rounded-xl border transition-all duration-500",
              priority.isComplete
                ? "bg-action-emerald/10 border-action-emerald/30 text-action-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-white/5 border-white/10 text-white/30 group-hover:text-white/60 group-hover:border-white/20 group-hover:bg-white/10",
              isExpanded ? "scale-105 rotate-2" : ""
            )}>
              {priority.isComplete ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Target className="h-4 w-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className={cn(
                  "text-sm md:text-base font-bold tracking-tight transition-all duration-300",
                  priority.isComplete ? "text-white/40" : "text-white/80"
                )}>
                  {priority.label}
                </h4>
                <AnimatePresence>
                  {priority.isComplete && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-1.5 py-0.5 rounded-full bg-action-emerald/20 border border-action-emerald/30 flex items-center gap-1"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-action-emerald" />
                      <span className="text-[9px] uppercase font-bold text-action-emerald tracking-wider">Met</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 mt-1 overflow-hidden">
                <span className={cn(
                  "text-[9px] font-mono uppercase tracking-widest px-1 py-0.5 rounded bg-white/5",
                  priority.isComplete ? "text-action-emerald/60" : "text-white/30"
                )}>
                  {priority.type}
                </span>
                <span className="text-white/10">•</span>
                <p className="text-[10px] text-white/40 truncate transition-colors group-hover:text-white/60">
                  {priority.goalText}
                </p>
              </div>
            </div>
          </div>

          {/* Right section: Progress + Chevron */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-mono font-bold tabular-nums transition-colors",
                  priority.isComplete ? "text-action-emerald" : "text-white/40"
                )}>
                  {priority.unitsThisWeek} <span className="opacity-40">/</span> {priority.weeklyTarget}
                </span>
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${priority.progress}%` }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      priority.isComplete
                        ? "bg-action-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-focus-violet/60"
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className={cn(
                  "p-1 rounded-full transition-colors",
                  isExpanded ? "bg-white/10 text-white" : "text-white/20 group-hover:text-white/40"
                )}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="px-6 pb-8 pt-4 border-t border-white/5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Goal Context */}
                  <div className="md:col-span-12 lg:col-span-7 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Layout className="h-3.5 w-3.5 text-focus-violet" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Strategic Context</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-sm md:text-base text-white/80 leading-relaxed font-medium">
                          {priority.goalText}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white/[0.01] border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="h-3 w-3 text-focus-violet/60" />
                          <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">Sprint</span>
                        </div>
                        <p className="text-xs font-medium text-white/60">{priority.sprintName || "Main Project"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.01] border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-3 w-3 text-focus-violet/60" />
                          <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">Commitment</span>
                        </div>
                        <p className="text-xs font-medium text-white/60 capitalize">{priority.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Detail */}
                  <div className="md:col-span-12 lg:col-span-5 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-3.5 w-3.5 text-focus-violet" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Progress Analysis</span>
                      </div>
                      <div className="space-y-5">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                              {Math.round(priority.progress)}%
                            </p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Total Completion</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-mono font-semibold text-white/60 tracking-tight">
                              {priority.unitsThisWeek} <span className="text-white/20">/</span> {priority.weeklyTarget}
                            </p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Units this week</p>
                          </div>
                        </div>

                        <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${priority.progress}%` }}
                            className={cn(
                              "h-full rounded-full",
                              priority.isComplete ? "bg-action-emerald shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-gradient-to-r from-focus-violet/60 to-focus-violet"
                            )}
                          />
                        </div>

                        <p className="text-xs text-white/40 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                          {priority.isComplete
                            ? `Incredible! You've met your ${priority.type} commitment of ${priority.weeklyTarget} units. Keep the momentum!`
                            : `You need ${priority.weeklyTarget - priority.unitsThisWeek} more completions to reach your weekly target. ${priority.type === 'daily' ? 'Stay consistent every day.' : 'You can do it!'}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.div>
  );
}

export function PrioritiesWorkflow({ priorities }: PrioritiesWorkflowProps) {
  const completedCount = priorities.filter(p => p.isComplete).length;
  const totalCount = priorities.length;

  return (
    <div className="space-y-8">
      {/* Enhanced header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-focus-violet/10 border border-focus-violet/20">
            <Activity className="h-4 w-4 text-focus-violet" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xl font-black text-white tracking-tighter lowercase">Commitments</h4>
            <p className="text-[12px] text-white/50 lowercase">promises to your future self</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm font-mono font-bold text-white">{completedCount}</span>
            <span className="text-xs font-mono text-white/20">/</span>
            <span className="text-xs font-mono text-white/40">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Priority cards */}
      <div className="grid grid-cols-1 gap-4">
        {priorities.map((priority, index) => (
          <CommitmentItem
            key={priority.key || index}
            priority={priority}
            index={index}
          />
        ))}

        {priorities.length === 0 && (
          <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
            <Sparkles className="h-8 w-8 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-medium">No commitments for this sprint yet.</p>
            <p className="text-[10px] uppercase tracking-widest text-white/10 mt-2">Go to planning to add goals</p>
          </div>
        )}
      </div>
    </div>
  );
}
