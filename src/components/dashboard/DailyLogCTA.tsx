import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2, Zap, TrendingUp } from 'lucide-react';
import { GlassPanel } from '@/components/dashboard/glass-panel';

interface DailyLogCTAProps {
    todayStatus: string | null;
}

export function DailyLogCTA({ todayStatus }: DailyLogCTAProps) {
    return (
        <Link href="/dashboard/daily" className="block group/log">
            <GlassPanel
                className={cn(
                    "p-5 flex flex-row items-center justify-between gap-6 border-white/5 transition-all duration-500 relative overflow-hidden group/panel",
                    todayStatus === 'completed'
                        ? "bg-white/[0.01] opacity-60 hover:opacity-100"
                        : "bg-gradient-to-br from-action-emerald/[0.02] to-transparent hover:border-action-emerald/20 shadow-[0_0_40px_rgba(16,185,129,0.02)]"
                )}
            >
                <div className="flex items-center gap-5 relative z-10">
                    {/* Compact Iconic Element */}
                    <div className="relative shrink-0">
                        <div className={cn(
                            "relative flex items-center justify-center h-12 w-12 rounded-xl transition-all duration-500",
                            todayStatus === 'completed'
                                ? "bg-white/5 text-white/20"
                                : "bg-action-emerald/10 text-action-emerald border border-action-emerald/20 group-hover/panel:bg-action-emerald/20"
                        )}>
                            {todayStatus === 'completed' ? (
                                <CheckCircle2 className="h-6 w-6" />
                            ) : (
                                <Zap className="h-6 w-6 fill-action-emerald/20 transition-transform group-hover/panel:scale-110" />
                            )}
                        </div>

                        {/* Status Indicator Dot */}
                        <div className={cn(
                            "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background z-20 flex items-center justify-center",
                            todayStatus === 'completed' ? "bg-white/20" : "bg-action-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        )}>
                            <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                    </div>

                    <div className="space-y-0.5">
                        <h2 className={cn(
                            "text-xl font-black lowercase tracking-tighter transition-colors duration-500 leading-tight",
                            todayStatus === 'completed' ? "text-white/20" : "text-white"
                        )}>
                            {todayStatus === 'completed' ? "Log Secured" : "Log the Day"}
                        </h2>
                        <p className="text-[12px] text-white/50 font-normal leading-none transition-colors group-hover/panel:text-white/70">
                            {todayStatus === 'completed'
                                ? "Neural trajectories stabilized."
                                : "Document the process. Shift the identity."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className={cn(
                        "hidden sm:flex flex-col items-end gap-1.5",
                        todayStatus === 'completed' ? "opacity-10" : "opacity-100"
                    )}>
                        <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em] text-action-emerald/60">
                            {todayStatus === 'completed' ? "SYNCED" : "READY"}
                        </span>
                        <div className="w-20 h-[2px] bg-white/5 overflow-hidden rounded-full">
                            <div className={cn(
                                "h-full transition-all duration-[1s] ease-in-out",
                                todayStatus === 'completed' ? "bg-white/20 w-full" : "bg-action-emerald w-[15%] group-hover/panel:w-full"
                            )} />
                        </div>
                    </div>

                    <div className={cn(
                        "h-10 w-10 flex items-center justify-center rounded-lg border transition-all duration-500 relative group/btn shrink-0",
                        todayStatus === 'completed'
                            ? "bg-white/5 border-white/5 text-white/10"
                            : "bg-action-emerald/10 border-action-emerald/20 text-action-emerald hover:bg-white hover:text-background hover:border-white shadow-lg"
                    )}>
                        <TrendingUp className="h-5 w-5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </div>
                </div>
            </GlassPanel>
        </Link>
    );
}
