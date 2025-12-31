"use client";

import { useEffect, useState, useTransition } from "react";
import { getUserSessions, revokeSession } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Monitor } from "lucide-react";
import { toast } from "sonner";

interface Session {
    id: string;
    createdAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: Date;
}

export function SessionsList() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setLoading(true);
        const { sessions: data, error } = await getUserSessions();
        if (error) {
            toast.error(error);
        } else if (data) {
            setSessions(data);
        }
        setLoading(false);
    };

    const handleRevokeSession = async (sessionId: string) => {
        startTransition(async () => {
            const { error } = await revokeSession(sessionId);
            if (error) {
                toast.error(error);
            } else {
                toast.success("Session revoked successfully");
                await loadSessions();
            }
        });
    };

    const formatUserAgent = (userAgent: string | null) => {
        if (!userAgent) return "Unknown device";

        // Simple parsing - you can enhance this
        if (userAgent.includes("Chrome")) return "Chrome Browser";
        if (userAgent.includes("Firefox")) return "Firefox Browser";
        if (userAgent.includes("Safari")) return "Safari Browser";
        if (userAgent.includes("Edge")) return "Edge Browser";
        return "Unknown Browser";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-white/40" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-white/60 text-sm mb-4">
                You have <span className="text-focus-violet font-semibold">{sessions.length}</span> active session{sessions.length !== 1 ? "s" : ""}
            </p>

            {sessions.length === 0 ? (
                <p className="text-white/40 text-sm">No active sessions found.</p>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <Monitor className="h-4 w-4 text-focus-violet" />
                                <div>
                                    <p className="text-white text-sm font-medium">
                                        {formatUserAgent(session.userAgent)}
                                    </p>
                                    <p className="text-white/40 text-xs font-mono">
                                        {session.ipAddress || "Unknown IP"} • Created {new Date(session.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={isPending}
                                size="sm"
                                variant="ghost"
                                className="text-bullshit-crimson hover:text-bullshit-crimson hover:bg-bullshit-crimson/10"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {sessions.length > 1 && (
                <div className="pt-4 border-t border-white/5">
                    <p className="text-white/40 text-xs mb-3">
                        Each login creates a new session. Revoke sessions from devices you don't recognize.
                    </p>
                </div>
            )}
        </div>
    );
}
