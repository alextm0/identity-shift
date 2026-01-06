import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export function proxy(request: NextRequest) {
    // 1. Generate Nonce for CSP
    const nonce = btoa(crypto.randomUUID());

    // 2. Define CSP Header (Strict)
    // - Removed 'unsafe-eval'
    // - Replaced 'unsafe-inline' with nonce and strict-dynamic
    // - Tightened img-src to 'self', blob:, and data: (removed broad https:)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: lh3.googleusercontent.com avatars.githubusercontent.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    // 3. Handle Redirects and Authorization
    // Redirect legacy routes to dashboard equivalents
    if (request.nextUrl.pathname === "/sprints" || request.nextUrl.pathname.startsWith("/sprints/")) {
        return NextResponse.redirect(new URL('/dashboard/sprint', request.url));
    }
    if (request.nextUrl.pathname === "/planning" || request.nextUrl.pathname.startsWith("/planning/")) {
        return NextResponse.redirect(new URL('/dashboard/planning', request.url));
    }

    // Check for session cookie existence only (no API calls)
    const isProduction = env.NODE_ENV === 'production';
    const token = isProduction
        ? request.cookies.get("__Secure-neon-auth.session_token")?.value
        : (request.cookies.get("__Secure-neon-auth.session_token")?.value || request.cookies.get("neon-auth.session_token")?.value);

    // List of public paths that don't need auth
    const isPublicPath = request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/';

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    // 4. Set Headers and Proceed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};

