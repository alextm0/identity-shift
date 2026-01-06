'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error boundary for dashboard page.
 * Handles errors that occur during dashboard rendering or data fetching.
 */
export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    // Check if error is an authorization error
    const isUnauthorized = error.message === 'Unauthorized' ||
        error.message.includes('Unauthorized') ||
        error.message.includes('session');

    useEffect(() => {
        // If unauthorized, redirect to sign-in after a brief delay
        if (!isUnauthorized) return;

        const timer = setTimeout(() => {
            router.push('/auth/sign-in');
        }, 2000);
        return () => clearTimeout(timer);
    }, [isUnauthorized, router]);

    if (isUnauthorized) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Authentication Required</CardTitle>
                        </div>
                        <CardDescription>
                            You need to be signed in to access the dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Redirecting you to the sign-in page...
                            </p>
                            <Button
                                onClick={() => router.push('/auth/sign-in')}
                                className="w-full"
                            >
                                Go to Sign In
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle>Something went wrong</CardTitle>
                    </div>
                    <CardDescription>
                        An error occurred while loading the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-3 bg-destructive/10 rounded-md">
                            <p className="text-sm text-destructive font-mono">
                                {process.env.NODE_ENV === 'development' ? error.message : 'An error occurred. Please try again or contact support.'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={reset}
                                variant="outline"
                                className="flex-1"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="flex-1"
                            >
                                Go Home
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

