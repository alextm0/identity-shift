import { AuthForm } from '@/components/auth/auth-forms';
import { Fingerprint, Shield } from 'lucide-react';

export const dynamicParams = false;

export async function generateStaticParams() {
    return [
        { path: 'sign-in' },
        { path: 'sign-up' }
    ];
}

export default async function AuthPage({
    params
}: {
    params: Promise<{ path: string }>
}) {
    const { path } = await params;
    const isSignIn = path === 'sign-in';
    const isSignUp = path === 'sign-up';

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-6 selection:bg-action-emerald/30">
            {/* Atmosphere: Background Blooms */}
            <div className="bg-blooms">
                <div className="bloom-violet" />
                <div className="bloom-emerald" />
            </div>

            <main className="w-full max-w-[480px] relative z-10 animate-fade-blur">
                {/* Semantic Iconography Box */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 glass-icon-box rounded-3xl flex items-center justify-center shadow-2xl relative group">
                        <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {isSignIn ? (
                            <Fingerprint className="w-10 h-10 text-action-emerald relative z-10" />
                        ) : (
                            <Shield className="w-10 h-10 text-focus-violet relative z-10" />
                        )}
                    </div>
                </div>

                {/* The Card: Glassmorphism Refined */}
                <div className="glass-pane p-10 md:p-12 relative overflow-hidden group shadow-2xl">
                    {/* Subtle Scanline Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="text-center mb-10 space-y-3">
                            <h1 className="text-4xl font-bold tracking-tighter text-white">
                                {isSignIn ? 'Verify Identity' : 'Establish Identity'}
                            </h1>
                            <p className="text-telemetry-slate text-sm tracking-wide">
                                {isSignIn 
                                    ? 'Resuming 2026 Progress Audit'
                                    : 'Commencing 2026 Progress Baseline'}
                            </p>
                        </div>
                        
                        {isSignIn || isSignUp ? (
                            <AuthForm type={isSignIn ? 'sign-in' : 'sign-up'} />
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-white font-mono text-xs opacity-50 tracking-widest text-telemetry-slate">[ERR]: INVALID_PATH_TRAVERSAL</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Forensic Footer: System Telemetry */}
                <div className="mt-12 text-center space-y-4">
                    <p className="forensic-telemetry">
                        Technical Audit of the Self // Data Integrity Required
                    </p>
                    <div className="flex justify-center gap-6 opacity-20">
                        <div className="h-[1px] w-12 bg-white" />
                        <div className="h-[1px] w-4 bg-white" />
                        <div className="h-[1px] w-12 bg-white" />
                    </div>
                </div>
            </main>
        </div>
    );
}
