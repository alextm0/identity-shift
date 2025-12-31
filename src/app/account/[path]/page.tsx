import { AccountView } from '@neondatabase/neon-js/auth/react/ui';
import { accountViewPaths } from '@neondatabase/neon-js/auth/react/ui/server';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({
    params
}: {
    params: Promise<{ path: string }>
}) {
    const { path } = await params;

    const getPageTitle = (path: string) => {
        const titles: Record<string, string> = {
            'settings': 'Settings',
            'profile': 'Profile',
            'security': 'Security',
            'sessions': 'Sessions',
            'notifications': 'Notifications',
        };
        return titles[path] || 'Account';
    };

    return (
        <DashboardShell>
            <div className="max-w-4xl mx-auto py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-0 space-y-6 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white uppercase">
                            Account <span className="text-white/20 font-light">{"//"}</span> <span className="text-focus-violet">{getPageTitle(path)}</span>
                        </h1>
                        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/40 mt-2 md:mt-3">
                            Manage your account settings and preferences
                        </p>
                    </div>
                </div>

                {/* Account View Wrapper */}
                <div className="account-view-wrapper">
                    <AccountView path={path} />
                </div>
            </div>
        </DashboardShell>
    );
}
