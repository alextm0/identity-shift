
import { Button } from "@/components/ui/button";
import { Edit, ArrowLeft, Sparkles, Clock } from "lucide-react";
import Link from "next/link";

interface PlanningHeaderProps {
    year: number;
    futureIdentity?: string;
}

export function PlanningHeader({ year, futureIdentity }: PlanningHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/30">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">{year} STRATEGIC PATH</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white leading-none">
                        Identity <span className="text-white/20 font-light ml-1">{" // "}</span> <span className="text-action-emerald">Vision</span>
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
    );
}
