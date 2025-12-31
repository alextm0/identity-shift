'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, User, Shield } from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthFormProps {
    type: 'sign-in' | 'sign-up';
}

export function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isEmailSent, setIsEmailSent] = React.useState(false);

    const isSignIn = type === 'sign-in';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;

        try {
            if (isSignIn) {
                await authClient.signIn.email({
                    email,
                    password,
                }, {
                    onSuccess: () => {
                        router.push('/dashboard');
                        router.refresh();
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message || "Identity verification failed.");
                    }
                });
            } else {
                await authClient.signUp.email({
                    email,
                    password,
                    name,
                }, {
                    onSuccess: () => {
                        router.push('/dashboard');
                        router.refresh();
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message || "Failed to establish identity.");
                    }
                });
            }
        } catch {
            setError("Unexpected system error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLink = async () => {
        const email = (document.getElementById('email') as HTMLInputElement)?.value;
        if (!email) {
            setError("Input identifier required.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // @ts-expect-error magicLink is not in the type definition yet but exists on authClient.signIn
            await authClient.signIn.magicLink({
                email,
                callbackURL: '/dashboard',
            }, {
                onSuccess: () => {
                    setIsEmailSent(true);
                },
                onError: (ctx: { error: { message?: string } }) => {
                    setError(ctx.error.message || "Telemetry transmission failed.");
                }
            });
        } catch {
            setError("Unexpected system error.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-10"
            >
                <div className="mx-auto w-20 h-20 glass-icon-box rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <Mail className="w-10 h-10 text-action-emerald" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Identity Token Sent</h2>
                    <p className="text-telemetry-slate text-sm max-w-xs mx-auto leading-relaxed">
                        Verify your inbox to proceed with the 2026 Progress Audit.
                    </p>
                </div>
                <Button
                    variant="glass"
                    className="mt-6 px-8 rounded-xl border-white/5 font-mono text-[10px] tracking-widest"
                    onClick={() => setIsEmailSent(false)}
                >
                    Return to Verification
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-bullshit-crimson/5 border border-bullshit-crimson/20 text-bullshit-crimson text-xs font-mono uppercase tracking-wider mb-6"
                        >
                            [ERROR]: {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {type === 'sign-up' && (
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-telemetry-slate ml-1 text-[10px] uppercase tracking-widest">Descriptor</Label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-telemetry-slate opacity-50 group-focus-within:text-action-emerald transition-colors" />
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter legal or chosen name"
                                className="pl-12 h-12 rounded-xl input-audit group-focus-within:border-action-emerald/30"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-telemetry-slate ml-1 text-[10px] uppercase tracking-widest">Identity Identifier</Label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-telemetry-slate opacity-50 group-focus-within:text-action-emerald transition-colors" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            className="pl-12 h-12 rounded-xl input-audit group-focus-within:border-action-emerald/30"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-telemetry-slate ml-1 text-[10px] uppercase tracking-widest">Access Key</Label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-telemetry-slate opacity-50 group-focus-within:text-focus-violet transition-colors" />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-12 h-12 rounded-xl input-audit group-focus-within:border-focus-violet/30"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="glass"
                    className="w-full h-14 rounded-xl mt-4 font-mono text-xs uppercase tracking-[0.2em] bg-action-emerald/10 border-action-emerald/20 text-action-emerald hover:bg-action-emerald/20 emerald-glow"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        isSignIn ? 'Establish Connection' : 'Register Identity'
                    )}
                </Button>
            </form>

            <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5" />
                <span className="flex-shrink mx-4 text-[10px] uppercase tracking-[0.3em] text-telemetry-slate opacity-30">Alternative</span>
                <div className="flex-grow border-t border-white/5" />
            </div>

            <Button
                variant="outline"
                className="w-full h-14 rounded-xl border-white/5 text-telemetry-slate hover:text-white transition-colors text-[10px] uppercase tracking-widest"
                onClick={handleMagicLink}
                disabled={isLoading}
            >
                <Shield className="mr-3 h-5 w-5 opacity-70" />
                Dynamic Access Code
            </Button>

            <div className="text-center">
                <Link
                    href={isSignIn ? '/auth/sign-up' : '/auth/sign-in'}
                    className="text-[10px] uppercase tracking-[0.2em] text-telemetry-slate hover:text-white transition-colors"
                >
                    {isSignIn ? "New Identity Registration" : "Existing Identity Verification"}
                </Link>
            </div>
        </div>
    );
}

