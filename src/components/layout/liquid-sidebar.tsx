"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Sparkles,
  BarChart3,
  User,
  Compass,
  CalendarDays,
  CalendarRange,
  Calendar,
  Settings,
  MoreVertical,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: Sparkles, label: "Planning", href: "/dashboard/planning" },
  { icon: Target, label: "Sprint", href: "/dashboard/sprint" },
  { icon: Calendar, label: "Daily", href: "/dashboard/daily" },
  { icon: CalendarDays, label: "Weekly", href: "/dashboard/weekly" },
  { icon: CalendarRange, label: "Monthly", href: "/dashboard/monthly" },
];

function MobileMoreMenu({ pathname, navItems }: { pathname: string; navItems: NavItem[] }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300",
          navItems.some(item => pathname === item.href) ? "text-focus-violet" : "text-white/40"
        )}
      >
        <MoreVertical className="h-5 w-5" />
        {navItems.some(item => pathname === item.href) && (
          <div className="absolute -bottom-0.5 h-0.5 w-8 bg-focus-violet rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
        )}
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="text-white uppercase tracking-tight">More</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    isActive
                      ? "bg-focus-violet/10 border border-focus-violet/20 text-focus-violet"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-mono text-xs uppercase tracking-widest">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/account/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                pathname === "/account/settings"
                  ? "bg-focus-violet/10 border border-focus-violet/20 text-focus-violet"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-widest">Settings</span>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LiquidSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 z-50 flex-col items-center py-8 bg-white/5 backdrop-blur-xl border-r border-white/10">
        <div className="mb-12">
          <Link href="/dashboard" className="h-12 w-12 flex items-center justify-center group">
            <div className="w-10 h-10 rounded-lg bg-focus-violet/20 flex items-center justify-center group-hover:bg-focus-violet/30 transition-colors">
              <Activity className="h-6 w-6 text-focus-violet" />
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative"
              >
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300 group-hover:bg-white/5",
                  isActive ? "text-focus-violet glass-icon-box shadow-[0_0_20px_rgba(139,92,246,0.15)]" : "text-white/40 hover:text-white"
                )}>
                  <item.icon className="h-6 w-6" />
                </div>

                <div className="absolute left-full ml-4 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-xs font-mono uppercase tracking-widest z-[100]">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <Link href="/account/settings">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300 hover:bg-white/5",
              pathname === "/account/settings" ? "text-focus-violet" : "text-white/40"
            )}>
              <User className="h-6 w-6" />
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Bar - Core Navigation + More Menu */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm h-14 z-50 flex items-center justify-around px-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
        {/* Core navigation items - first 4 */}
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              <div className={cn(
                "transition-all duration-300",
                isActive ? "text-focus-violet -translate-y-0.5 scale-110" : "text-white/40"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              {isActive && (
                <div className="absolute -bottom-0.5 h-0.5 w-8 bg-focus-violet rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              )}
            </Link>
          );
        })}

        {/* More Menu - shows dropdown for remaining items */}
        <MobileMoreMenu pathname={pathname} navItems={navItems.slice(4)} />
      </nav>
    </>
  );
}

