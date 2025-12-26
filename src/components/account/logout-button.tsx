/**
 * Logout Button Component
 * 
 * Provides a logout button that signs out the user and redirects to sign-in page.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleLogout = async () => {
        startTransition(async () => {
            try {
                const { error } = await authClient.signOut();
                
                if (error) {
                    toast.error("Failed to sign out. Please try again.");
                    console.error("Logout error:", error);
                    return;
                }

                toast.success("Signed out successfully");
                router.push("/auth/sign-in");
                router.refresh();
            } catch (error) {
                toast.error("An unexpected error occurred");
                console.error("Logout error:", error);
            }
        });
    };

    return (
        <Button
            onClick={handleLogout}
            disabled={isPending}
            className="h-12 px-6 bg-bullshit-crimson/10 border border-bullshit-crimson/20 text-bullshit-crimson hover:bg-bullshit-crimson/20 hover:border-bullshit-crimson/30 font-mono uppercase tracking-widest rounded-xl transition-all duration-300"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing Out...
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </>
            )}
        </Button>
    );
}

