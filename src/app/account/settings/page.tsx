import { getRequiredSession } from "@/lib/auth/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { ExportDataButton } from "@/components/account/export-data-button";
import { LogoutButton } from "@/components/account/logout-button";
import { LogoutAllButton } from "@/components/account/logout-all-button";
import { SessionsList } from "@/components/account/sessions-list";
import { User, Shield, Database } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage() {
    const session = await getRequiredSession();

    return (
        <DashboardShell>
            <div className="max-w-4xl mx-auto space-y-8 py-12 px-4 md:px-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white uppercase">
                            Account <span className="text-white/20 font-light">{"//"}</span> <span className="text-focus-violet">Settings</span>
                        </h1>
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40 mt-4">
                            Manage your account and data
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <GlassPanel className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="h-5 w-5 text-focus-violet" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Profile</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 block">
                                    Name
                                </label>
                                <p className="text-white text-lg">{session.user.name || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 block">
                                    Email
                                </label>
                                <p className="text-white text-lg">{session.user.email || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2 block">
                                    User ID
                                </label>
                                <p className="text-white/60 text-sm font-mono">{session.user.id}</p>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Data Management Section */}
                    <GlassPanel className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="h-5 w-5 text-action-emerald" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Data Management</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-white/60 mb-4">
                                    Export all your data as a JSON file for backup or migration purposes.
                                </p>
                                <ExportDataButton />
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Security Section */}
                    <GlassPanel className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="h-5 w-5 text-bullshit-crimson" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Security</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-white/60 text-sm">
                                    Your data is encrypted and stored securely. All actions require authentication.
                                </p>
                                <p className="text-white/40 text-xs font-mono">
                                    Last login: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">
                                    Active Sessions
                                </p>
                                <SessionsList />
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">
                                    Sign Out
                                </p>
                                <div className="flex gap-3">
                                    <LogoutButton />
                                    <LogoutAllButton />
                                </div>
                            </div>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </DashboardShell>
    );
}

