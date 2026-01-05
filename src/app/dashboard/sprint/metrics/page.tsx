import { getSprintMetricsData } from "@/queries/sprint-metrics";
import { SprintMetricsPanel } from "@/components/sprints/sprint-metrics-panel";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: 'Sprint Metrics',
    description: 'Track your sprint performance and commitment consistency',
};

export default async function SprintMetricsPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const params = await searchParams;
    const { sprint, dailyLogs, promiseLogs, allSprints } = await getSprintMetricsData(params.id);

    if (!sprint) {
        return (
            <div className="max-w-4xl mx-auto py-24 px-4 md:px-0">
                <GlassPanel className="p-16 text-center space-y-8 border-dashed border-white/10">
                    <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-10 w-10 text-white/20" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white uppercase tracking-tight">No Sprint Data Found</h2>
                        <p className="text-white/40 max-w-sm mx-auto">
                            Initialize a sprint to begin collecting performance metrics.
                        </p>
                    </div>
                    <Link href="/dashboard/sprint" className="inline-block px-10 py-4 bg-focus-violet border border-focus-violet/40 text-white font-mono uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-focus-violet/80 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                        Go to Sprint Control
                    </Link>
                </GlassPanel>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-0 space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="space-y-6">
                    <Link href="/dashboard/sprint">
                        <Button variant="ghost" className="text-white/40 hover:text-white -ml-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Sprint Control
                        </Button>
                    </Link>

                    <div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase leading-none">
                            Sprint <span className="text-white/10 font-light">{" // "}</span> <span className="text-focus-violet">Metrics</span>
                        </h1>
                        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/30 mt-6 flex items-center gap-3">
                            <span className="text-focus-violet">Performance Analysis</span>
                            <span className="h-px w-12 bg-white/10" />
                            <span>{sprint.name}</span>
                        </p>
                    </div>
                </div>

                {/* Sprint Selector (Simple dropdown or list) */}
                {allSprints.length > 1 && (
                    <div className="flex flex-col items-end gap-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">Switch Sprint Context</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                            {allSprints.slice(0, 3).map(s => (
                                <Link
                                    key={s.id}
                                    href={`/dashboard/sprint/metrics?id=${s.id}`}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all",
                                        s.id === sprint.id
                                            ? "bg-focus-violet/10 border-focus-violet/40 text-focus-violet"
                                            : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
                                    )}
                                >
                                    {s.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <SprintMetricsPanel
                sprint={sprint}
                dailyLogs={dailyLogs}
                promiseLogs={promiseLogs}
            />

            {/* Footer Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                <Link href="/dashboard/weekly" className="group">
                    <GlassPanel className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-focus-violet/10 text-focus-violet group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">Navigate to</p>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">Weekly Review</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </GlassPanel>
                </Link>

                <Link href="/dashboard/monthly" className="group">
                    <GlassPanel className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-focus-violet/10 text-focus-violet group-hover:scale-110 transition-transform">
                                <Activity className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">Navigate to</p>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">Monthly Mirror</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </GlassPanel>
                </Link>
            </div>
        </div>
    );
}
