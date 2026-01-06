import { DashboardShell } from '@/components/layout/dashboard-shell';

export const dynamic = 'force-dynamic';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* The shared Identity Shift header and content */}
        {children}
      </div>
    </DashboardShell>
  );
}
