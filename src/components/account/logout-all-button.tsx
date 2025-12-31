"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LogoutAllButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleLogoutAll = async () => {
        if (!confirm("This will sign you out on all devices. Continue?")) {
            return;
        }

        startTransition(async () => {
            try {
                // Sign out - this will invalidate all sessions
                const { error } = await authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            toast.success("Signed out from all devices");
                            router.push("/auth/sign-in");
                            router.refresh();
                        },
                    },
                });

                if (error) {
                    toast.error("Failed to sign out. Please try again.");
                    console.error("Logout error:", error);
                    return;
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
                console.error("Logout error:", error);
            }
        });
    };

    return (
        <Button
            onClick={handleLogoutAll}
            disabled={isPending}
            variant="outline"
            className="h-10 px-4 bg-transparent border border-bullshit-crimson/30 text-bullshit-crimson hover:bg-bullshit-crimson/10 hover:border-bullshit-crimson/40 font-mono text-xs uppercase tracking-wider rounded-lg transition-all duration-300"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Signing Out...
                </>
            ) : (
                <>
                    <LogOut className="h-3 w-3 mr-2" />
                    Sign Out All Devices
                </>
            )}
        </Button>
    );
}
