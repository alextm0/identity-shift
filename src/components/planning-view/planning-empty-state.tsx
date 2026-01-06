
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { GlassPanel } from "@/components/dashboard/glass-panel";

export function PlanningEmptyState() {
    return (
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
    );
}
