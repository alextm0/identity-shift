/**
 * Redirect Utilities
 * 
 * Provides utilities for handling redirects after successful mutations.
 * Server actions return redirect hints, and client-side hooks handle the actual redirects.
 */

import { redirect } from "next/navigation";

/**
 * Redirect paths for different actions
 */
export const REDIRECT_PATHS = {
    dashboard: "/dashboard",
    daily: "/dashboard/daily",
    weekly: "/dashboard/weekly",
    monthly: "/dashboard/monthly",
    sprint: "/dashboard/sprint",
    planning: "/planning",
    sprints: "/sprints",
} as const;

/**
 * Redirect hint type for action responses
 */
export type RedirectHint = keyof typeof REDIRECT_PATHS | string | null;

/**
 * Gets the redirect path for a given hint
 */
export function getRedirectPath(hint: RedirectHint): string | null {
    if (!hint) return null;
    return REDIRECT_PATHS[hint as keyof typeof REDIRECT_PATHS] || hint;
}

/**
 * Client-side redirect utility
 * Use this in mutation hooks after successful actions
 * Note: This function should be called from client components with useRouter
 */
export function getRedirectPathForClient(path: RedirectHint): string | null {
    return getRedirectPath(path);
}

export function serverRedirect(path: RedirectHint) {
    if (typeof window !== 'undefined') return; // Only works server-side
    const targetPath = getRedirectPath(path);
    if (targetPath) {
        redirect(targetPath);
    }
}

