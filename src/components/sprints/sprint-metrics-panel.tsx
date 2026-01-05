"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { calculateSprintSummary } from "@/use-cases/sprint-summary";
import {
    Calendar,
    Zap as ZapIcon,
    Target,
    TrendingUp,
    Flag,
    Activity,
    Award
} from "lucide-react";
import { DailyLog, SprintWithDetails, PromiseLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SprintMetricsPanelProps {
    sprint: SprintWithDetails;
    dailyLogs: DailyLog[];
    promiseLogs: PromiseLog[];
}

export function SprintMetricsPanel({ sprint, dailyLogs, promiseLogs }: SprintMetricsPanelProps) {
    const summary = useMemo(() =>
        calculateSprintSummary(dailyLogs, sprint, promiseLogs),
        [dailyLogs, sprint, promiseLogs]
    );

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const sprintRange = `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;

    const completionRate = summary.totalPromisesTarget > 0
        ? (summary.totalPromisesKept / summary.totalPromisesTarget) * 100
        : 0;

    return (
        <div className="space-y-12">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-white/40">
                    <Calendar className="h-4 w-4" />
                    <p className="font-mono text-xs uppercase tracking-widest">{sprintRange}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-focus-violet" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                            Day {summary.elapsedDays} of {summary.sprintDurationDays}
                        </span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-action-emerald" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                            {summary.velocity.toFixed(1)} tasks/day
                        </span>
                    </div>
                </div>
            </div>

            {/* High Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassPanel className="p-8 group">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Total Success</p>
                        <Award className="h-5 w-5 text-action-emerald/40 group-hover:text-action-emerald transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold tracking-tight text-white">
                            {Math.round(completionRate)}%
                        </p>
                        <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Aggregate Score</p>
                    </div>
                </GlassPanel>

                <GlassPanel className="p-8 group">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Promises Kept</p>
                        <Target className="h-5 w-5 text-focus-violet/40 group-hover:text-focus-violet transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold tracking-tight text-white">
                            {summary.totalPromisesKept}
                            <span className="text-xl text-white/20 font-light"> / {summary.totalPromisesTarget}</span>
                        </p>
                        <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Total Completions</p>
                    </div>
                </GlassPanel>

                <GlassPanel className="p-8 group">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Consistency</p>
                        <Calendar className="h-5 w-5 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold tracking-tight text-white">
                            {summary.logsCount}
                            <span className="text-xl text-white/20 font-light"> / {summary.elapsedDays}</span>
                        </p>
                        <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Days Logged</p>
                    </div>
                </GlassPanel>

                <GlassPanel className="p-8 group">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Avg Energy</p>
                        <ZapIcon className="h-5 w-5 text-motion-amber/40 group-hover:text-motion-amber transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-bold tracking-tight text-white">
                            {summary.avgEnergy.toFixed(1)}
                            <span className="text-xl text-white/20 font-light"> / 5.0</span>
                        </p>
                        <p className="text-xs text-white/40 font-mono uppercase tracking-widest">State Management</p>
                    </div>
                </GlassPanel>
            </div>

            {/* Goal Breakdown */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Flag className="h-4 w-4 text-white/20" />
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Strategic Objective Breakdown</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {summary.goalSummaries.map((goal, idx) => (
                        <GlassPanel key={goal.goalId} className="p-8 space-y-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Target className="h-32 w-32" />
                            </div>

                            <div className="flex flex-col gap-2 relative z-10">
                                <p className="text-[10px] font-mono text-focus-violet uppercase tracking-widest">Goal {idx + 1}</p>
                                <h4 className="text-xl font-bold text-white tracking-tight leading-tight uppercase">
                                    {goal.goalText}
                                </h4>
                            </div>

                            <div className="grid grid-cols-3 gap-8 relative z-10">
                                <div>
                                    <p className="text-2xl font-bold text-white tracking-tighter">{Math.round(goal.ratio * 100)}%</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Success</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white tracking-tighter">{goal.totalKept}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Kept</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white tracking-tighter">{goal.totalTarget}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Target</p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {goal.promises.map(promise => (
                                    <div key={promise.promiseId} className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-medium">
                                            <span className="text-white/60 tracking-tight">{promise.label}</span>
                                            <span className="font-mono text-white/40">{promise.actual} / {promise.target}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${promise.ratio * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    promise.ratio >= 0.8 ? "bg-action-emerald" :
                                                        promise.ratio >= 0.5 ? "bg-motion-amber" : "bg-bullshit-crimson/60"
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {summary.goalSummaries.length === 0 && (
                <GlassPanel className="p-20 text-center border-dashed border-white/10">
                    <Activity className="h-12 w-12 text-white/10 mx-auto mb-6" />
                    <p className="text-white/40 font-medium">No sprint data found for analysis.</p>
                </GlassPanel>
            )}
        </div>
    );
}
