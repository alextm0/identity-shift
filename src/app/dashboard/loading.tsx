import { BentoGrid, BentoItem } from '@/components/dashboard/bento-grid';
import { GlassPanel } from '@/components/dashboard/glass-panel';

/**
 * Loading state for dashboard page - matches Bento layout.
 */
export default function DashboardLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
            {/* Header Loading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="h-12 w-80 bg-white/5 rounded-lg mb-4" />
                    <div className="h-4 w-60 bg-white/5 rounded mt-2" />
                </div>
                <div className="h-12 w-48 bg-white/5 rounded-xl" />
            </div>

            {/* Bento Grid Loading */}
            <BentoGrid>
                <BentoItem span="xl">
                    <GlassPanel className="h-64 p-8">
                        <div className="h-10 w-40 bg-white/5 rounded-lg mb-8" />
                        <div className="h-12 w-full bg-white/5 rounded-xl mb-4" />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-16 bg-white/5 rounded-2xl" />
                            <div className="h-16 bg-white/5 rounded-2xl" />
                            <div className="h-16 bg-white/5 rounded-2xl" />
                        </div>
                    </GlassPanel>
                </BentoItem>
                <BentoItem span="md">
                    <GlassPanel className="h-64 flex flex-col items-center justify-center">
                        <div className="h-32 w-32 rounded-full border-8 border-white/5 mb-4" />
                        <div className="h-4 w-24 bg-white/5 rounded" />
                    </GlassPanel>
                </BentoItem>
                <BentoItem span="lg">
                    <GlassPanel className="h-80 p-8 flex flex-col items-center justify-center">
                        <div className="h-24 w-24 bg-white/5 rounded-lg mb-4" />
                        <div className="h-12 w-32 bg-white/5 rounded mb-2" />
                        <div className="h-4 w-40 bg-white/5 rounded" />
                    </GlassPanel>
                </BentoItem>
                <BentoItem span="md">
                    <GlassPanel className="h-64 flex flex-col items-center justify-center">
                        <div className="h-20 w-20 bg-white/5 rounded-xl mb-6 rotate-45" />
                        <div className="h-8 w-16 bg-white/5 rounded mb-2" />
                        <div className="h-4 w-24 bg-white/5 rounded" />
                    </GlassPanel>
                </BentoItem>
                <BentoItem span="md">
                    <GlassPanel className="h-64 p-8">
                        <div className="h-6 w-32 bg-white/5 rounded mb-8" />
                        <div className="space-y-4">
                            <div className="h-12 w-full bg-white/5 rounded-xl" />
                            <div className="h-12 w-full bg-white/5 rounded-xl" />
                        </div>
                    </GlassPanel>
                </BentoItem>
                <BentoItem span="lg">
                    <GlassPanel className="h-full p-8">
                        <div className="h-6 w-40 bg-white/5 rounded mb-8" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 w-full bg-white/5 rounded-xl" />
                            ))}
                        </div>
                    </GlassPanel>
                </BentoItem>
                <BentoItem span="md">
                    <GlassPanel className="h-full p-8">
                        <div className="h-6 w-32 bg-white/5 rounded mb-8" />
                        <div className="space-y-6">
                            <div className="h-4 w-24 bg-white/5 rounded" />
                            <div className="h-8 w-full bg-white/5 rounded" />
                            <div className="h-1.5 w-full bg-white/5 rounded-full" />
                            <div className="h-8 w-full bg-white/5 rounded-lg" />
                        </div>
                    </GlassPanel>
                </BentoItem>
            </BentoGrid>
        </div>
    );
}
