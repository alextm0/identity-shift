/**
 * Middleware for route protection and authorization.
 *
 * Following Next.js 16+ best practices:
 * - Checks for session cookie existence only (no API calls)
 * - Real authorization happens in page/route handlers using verifySession()
 *
 * Cookie naming:
 * - Production: __Secure-neon-auth.session_token (secure HTTPS-only)
 * - Development: neon-auth.session_token (fallback for local)
 *
 * Neon Auth uses Better Auth with a custom "neon-auth" prefix and follows
 * secure cookie conventions (__Secure- prefix) in production environments.
 *
 * Reference: Next.js authentication guide
 * https://nextjs.org/docs/app/guides/authentication#middleware
 */

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    // Redirect legacy routes to dashboard equivalents
    if (request.nextUrl.pathname === "/sprints" || request.nextUrl.pathname.startsWith("/sprints/")) {
        return NextResponse.redirect(new URL('/dashboard/sprint', request.url));
    }
    if (request.nextUrl.pathname === "/planning" || request.nextUrl.pathname.startsWith("/planning/")) {
        return NextResponse.redirect(new URL('/dashboard/planning', request.url));
    }

    // TEMPORARY: Log all cookies to debug production issue
    const allCookies = request.cookies.getAll();
    console.log('[Middleware] Path:', request.nextUrl.pathname);
    console.log('[Middleware] All cookies:', allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));

    // Check for session cookie existence only (no API calls)
    // Neon Auth uses Better Auth with custom prefix "neon-auth"
    // In production, it uses __Secure- prefix for secure cookies
    const token =
        request.cookies.get("__Secure-neon-auth.session_token")?.value ||
        request.cookies.get("neon-auth.session_token")?.value; // fallback for local dev

    // If no session token exists, redirect to sign-in
    if (!token) {
        console.log('[Middleware] No session token found, redirecting to sign-in');
        return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    console.log('[Middleware] Session token found, allowing request');

    // Allow request to proceed - real authorization happens in page handlers
    // using verifySession() which properly validates the session via API
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/account/:path*",
        "/dashboard",
        "/dashboard/:path*",
        "/sprints",
        "/sprints/:path*",
        "/planning",
        "/planning/:path*",
        "/review",
        "/review/:path*",
        // Add more protected areas here as needed
    ],
};

