import { LiquidSidebar } from "./liquid-sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#14141F] text-white selection:bg-emerald-500/30">
      {/* Background Blooms */}
      <div className="bg-blooms pointer-events-none">
        <div className="bloom-violet" />
        <div className="bloom-emerald" />
      </div>

      {/* Sidebar */}
      <LiquidSidebar />

      {/* Main Content Area */}
      <div className="pb-24 md:pb-0 md:pl-20 min-h-screen flex flex-col">
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

