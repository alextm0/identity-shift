import { GlassPanel } from '@/components/dashboard/glass-panel';

/**
 * Loading state for dashboard page - matches current layout.
 */
export default function DashboardLoading() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 py-12 md:py-16 animate-pulse">
            {/* Header Loading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="h-16 w-96 bg-white/5 rounded-lg mb-4" />
                    <div className="h-4 w-80 bg-white/5 rounded" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column - Left 2/3 */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Sprint & Consistency Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassPanel className="p-6 min-h-[160px] border-white/5">
                            <div className="h-4 w-32 bg-white/5 rounded mb-4" />
                            <div className="h-10 w-24 bg-white/5 rounded mb-4" />
                            <div className="h-2 w-full bg-white/5 rounded-full" />
                        </GlassPanel>
                        <GlassPanel className="p-6 min-h-[160px] border-white/5">
                            <div className="h-4 w-24 bg-white/5 rounded mb-4" />
                            <div className="flex gap-1.5 h-full pt-4">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={i} className="flex-1 bg-white/5 rounded-sm" style={{ height: `${20 + (i * 13) % 61}%` }} />
                                ))}
                            </div>
                        </GlassPanel>
                    </div>

                    {/* Priorities Loading */}
                    <div className="space-y-6">
                        <div className="h-6 w-32 bg-white/5 rounded" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <GlassPanel key={i} className="px-6 py-5 border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className="h-10 w-10 bg-white/5 rounded-lg" />
                                            <div>
                                                <div className="h-4 w-32 bg-white/5 rounded mb-2" />
                                                <div className="h-3 w-16 bg-white/5 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-2 w-32 bg-white/5 rounded-full" />
                                    </div>
                                </GlassPanel>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column - Right 1/3 */}
                <div className="space-y-6">
                    <div className="h-5 w-20 bg-white/5 rounded mb-2" />
                    <div className="space-y-4">
                        <div className="h-20 w-full bg-white/5 rounded-2xl" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-white/5 rounded-2xl" />
                            <div className="h-24 bg-white/5 rounded-2xl" />
                        </div>
                        <div className="h-14 w-full bg-white/5 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
