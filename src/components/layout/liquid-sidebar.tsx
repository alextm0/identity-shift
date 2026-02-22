"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Sparkles,
  User,
  CalendarDays,
  CalendarRange,
  Calendar,
  Settings,
  MoreVertical,
  Activity,
  X,
  ChevronRight,
  ChevronDown
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
  shortLabel?: string;
}

const isItemActive = (href: string, pathname: string) => {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
};

const coreNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Identity Shift", shortLabel: "Home", href: "/dashboard" },
  { icon: Target, label: "Sprint", shortLabel: "Sprint", href: "/dashboard/sprint" },
  { icon: Calendar, label: "Daily Log", shortLabel: "Daily", href: "/dashboard/daily" },
];

const advancedNavItems: NavItem[] = [
  { icon: Sparkles, label: "Planning", shortLabel: "Plan", href: "/dashboard/planning" },
  { icon: CalendarDays, label: "Weekly Review", shortLabel: "Weekly", href: "/dashboard/weekly" },
  { icon: CalendarRange, label: "Monthly Review", shortLabel: "Monthly", href: "/dashboard/monthly" },
];

function MobileMoreMenu({ pathname, navItems }: { pathname: string; navItems: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const hasActiveItem = navItems.some(item => isItemActive(item.href, pathname));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group py-2",
          "active:scale-95"
        )}
        aria-label="More navigation options"
      >
        {/* Active background glow */}
        {hasActiveItem && (
          <div className="absolute inset-2 rounded-2xl bg-focus-violet/10 blur-md animate-pulse" />
        )}

        {/* Icon */}
        <div className={cn(
          "relative transition-all duration-500 mb-0.5",
          hasActiveItem
            ? "text-focus-violet -translate-y-1 scale-110 drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]"
            : "text-white/40 group-hover:text-white/70 group-active:scale-90"
        )}>
          <MoreVertical className="h-5.5 w-5.5" />
        </div>

        {/* Label */}
        <span className={cn(
          "caption transition-all duration-300 font-medium",
          hasActiveItem
            ? "text-focus-violet opacity-100"
            : "text-white/30 opacity-0 group-hover:opacity-100"
        )}>
          More
        </span>

        {/* Active indicator bar - Organic Pill */}
        {hasActiveItem && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-12 bg-gradient-to-r from-transparent via-focus-violet to-transparent rounded-full shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden bg-[#0C0C12]/95 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.8)] rounded-[32px]">
          <DialogHeader className="p-8 pb-5 border-b border-white/[0.05] bg-gradient-to-br from-white/[0.03] to-transparent">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="label text-white/90">Navigation Matrix</span>
                <span className="caption text-white/40">Select destination</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all duration-300 active:scale-90 border border-transparent hover:border-white/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = isItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4.5 rounded-2xl transition-all duration-500 group/item relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-br from-focus-violet/20 to-focus-violet/5 border border-focus-violet/40 text-focus-violet shadow-[0_12px_24px_rgba(139,92,246,0.15)]"
                      : "bg-white/[0.03] border border-white/[0.06] text-white/60 hover:bg-white/[0.08] hover:border-white/15 hover:text-white/90 active:scale-[0.97]"
                  )}
                >
                  {/* Subtle active glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-focus-violet/5 blur-xl animate-pulse" />
                  )}

                  {/* Icon with refined background */}
                  <div className={cn(
                    "p-3 rounded-xl transition-all duration-500 relative flex items-center justify-center",
                    isActive
                      ? "bg-focus-violet/30 text-focus-violet shadow-[inset_0_0_15px_rgba(139,92,246,0.3)]"
                      : "bg-white/[0.05] text-white/50 group-hover/item:bg-white/[0.1] group-hover/item:text-white/70 border border-white/[0.08] group-hover/item:border-white/20"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-500",
                      isActive ? "scale-110 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "group-hover/item:scale-110"
                    )} />
                  </div>

                  <div className="flex flex-col flex-1 gap-0.5">
                    <span className={cn(
                      "label text-sm tracking-normal transition-all duration-300",
                      isActive ? "text-white font-semibold" : "text-white/80 group-hover/item:text-white"
                    )}>
                      {item.label}
                    </span>
                    <span className="caption text-[10px] uppercase tracking-widest opacity-40">
                      {isActive ? "Currently Active" : "Access Module"}
                    </span>
                  </div>

                  {/* Enhanced chevron indicator */}
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-all duration-500",
                    isActive
                      ? "text-focus-violet opacity-100 translate-x-0"
                      : "text-white/20 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0"
                  )} />
                </Link>
              );
            })}

            {/* Separator */}
            <div className="relative h-px my-6 px-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
            </div>

            <Link
              href="/account/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-4 p-4.5 rounded-2xl transition-all duration-500 group/item relative overflow-hidden",
                isItemActive("/account/settings", pathname)
                  ? "bg-gradient-to-br from-focus-violet/20 to-focus-violet/5 border border-focus-violet/40 text-focus-violet shadow-[0_12px_24px_rgba(139,92,246,0.15)]"
                  : "bg-white/[0.03] border border-white/[0.06] text-white/60 hover:bg-white/[0.08] hover:border-white/15 hover:text-white/90 active:scale-[0.97]"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl transition-all duration-500 relative flex items-center justify-center",
                isItemActive("/account/settings", pathname)
                  ? "bg-focus-violet/30 text-focus-violet shadow-[inset_0_0_15px_rgba(139,92,246,0.3)]"
                  : "bg-white/[0.05] text-white/50 group-hover/item:bg-white/[0.1] group-hover/item:text-white/70 border border-white/[0.08] group-hover/item:border-white/20"
              )}>
                <Settings className={cn(
                  "h-5 w-5 transition-all duration-500",
                  isItemActive("/account/settings", pathname) ? "scale-110 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "group-hover/item:scale-110"
                )} />
              </div>

              <div className="flex flex-col flex-1 gap-0.5">
                <span className={cn(
                  "label text-sm tracking-normal transition-all duration-300",
                  isItemActive("/account/settings", pathname) ? "text-white font-semibold" : "text-white/80 group-hover/item:text-white"
                )}>
                  System Settings
                </span>
                <span className="caption text-[10px] uppercase tracking-widest opacity-40">
                  Profile & Configuration
                </span>
              </div>

              <ChevronRight className={cn(
                "h-4 w-4 transition-all duration-500",
                isItemActive("/account/settings", pathname)
                  ? "text-focus-violet opacity-100 translate-x-0"
                  : "text-white/20 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0"
              )} />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LiquidSidebar() {
  const pathname = usePathname();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar - Premium Aesthetic */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 z-50 flex-col items-center py-10 bg-[#0C0C12]/80 backdrop-blur-3xl border-r border-white/[0.08] shadow-[10px_0_40px_rgba(0,0,0,0.4)]">
        {/* Subtle Side Glow */}
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-focus-violet/20 to-transparent" />

        {/* Logo / Brand - Organic Pulse */}
        <div className="mb-14 relative">
          <Link
            href="/dashboard"
            className="h-14 w-14 flex items-center justify-center group relative translate-y-0 hover:-translate-y-1 transition-transform duration-500"
            aria-label="Go to dashboard"
          >
            {/* Layered Glows */}
            <div className="absolute inset-0 rounded-2xl bg-focus-violet/40 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl scale-125" />
            <div className="absolute inset-0 rounded-2xl bg-focus-violet/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl animate-pulse" />

            {/* Logo container: The Fusion Core */}
            <div className="relative w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#1A1A2E] to-[#0C0C12] flex items-center justify-center border border-white/[0.12] group-hover:border-focus-violet/60 shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_48px_rgba(139,92,246,0.4)] transition-all duration-500 group-active:scale-90 overflow-hidden">
              {/* Internal shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent group-hover:animate-[shimmer_2s_infinite] rotate-45" />

              <Activity className="h-5.5 w-5.5 text-focus-violet relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            </div>
          </Link>
        </div>

        {/* Navigation Items - Liquid Pods */}
        <nav className="flex-1 flex flex-col gap-4 w-full px-3">
          {coreNavItems.map((item) => {
            const isActive = isItemActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex justify-center"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Magnetic Indicator */}
                {isActive && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-focus-violet rounded-r-full shadow-[0_0_20px_rgba(139,92,246,0.8)] z-20">
                    <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                  </div>
                )}

                {/* Icon Container: The Glass Pod */}
                <div className={cn(
                  "relative p-3.5 rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden",
                  isActive
                    ? "bg-focus-violet/15 text-focus-violet border border-focus-violet/50 shadow-[0_0_20px_rgba(139,92,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)] active-pill"
                    : "text-white/40 hover:text-white/90 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.1] active:scale-90"
                )}>
                  {/* Active highlight reflection */}
                  {isActive && (
                    <>
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-focus-violet/40 to-transparent" />
                      <div className="absolute inset-0 bg-focus-violet/5 blur-md" />
                    </>
                  )}

                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-500 relative z-10",
                    isActive ? "scale-110 drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]" : "group-hover:scale-115"
                  )} />

                  {/* Liquid Backdrop */}
                  {isActive && (
                    <>
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-focus-violet/10 blur-xl opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-b from-focus-violet/[0.05] to-transparent" />
                    </>
                  )}
                </div>

                {/* Premium Floating Tooltip */}
                <div className="absolute left-full ml-5 px-5 py-3.5 bg-[#0C0C12]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_15px_45px_rgba(0,0,0,0.7)] group-hover:translate-x-0 -translate-x-4">
                  <div className="flex flex-col gap-0.5 relative z-10">
                    <div className="label text-[13px] text-white tracking-wider font-semibold">{item.label}</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-focus-violet/10 to-transparent opacity-40" />
                  <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-tr-2xl" />
                </div>
              </Link>
            );
          })}

          {/* Separator + Advanced toggle */}
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mx-auto my-2" />

          {/* Advanced toggle button */}
          <button
            onClick={() => setAdvancedOpen(v => !v)}
            className="group relative flex justify-center w-full"
            aria-label="Advanced features"
            title="Advanced"
          >
            <div className={cn(
              "relative p-3 rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden",
              advancedOpen
                ? "bg-white/[0.07] text-white/60 border border-white/10"
                : "text-white/20 hover:text-white/50 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08]"
            )}>
              <ChevronDown className={cn(
                "h-4 w-4 transition-all duration-300",
                advancedOpen ? "rotate-180 text-white/60" : "text-white/20"
              )} />
            </div>
            {/* Tooltip */}
            <div className="absolute left-full ml-5 px-5 py-3.5 bg-[#0C0C12]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_15px_45px_rgba(0,0,0,0.7)] group-hover:translate-x-0 -translate-x-4">
              <div className="label text-[13px] text-white/60 tracking-wider">Advanced</div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-40" />
            </div>
          </button>

          {/* Advanced nav items - shown when expanded */}
          {advancedOpen && advancedNavItems.map((item) => {
            const isActive = isItemActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex justify-center"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white/30 rounded-r-full z-20" />
                )}
                <div className={cn(
                  "relative p-3.5 rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden",
                  isActive
                    ? "bg-white/10 text-white/70 border border-white/20"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] active:scale-90"
                )}>
                  <item.icon className="h-4.5 w-4.5 transition-all duration-500 relative z-10" />
                </div>
                <div className="absolute left-full ml-5 px-5 py-3.5 bg-[#0C0C12]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_15px_45px_rgba(0,0,0,0.7)] group-hover:translate-x-0 -translate-x-4">
                  <div className="label text-[12px] text-white/60 tracking-wider">{item.label}</div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-40" />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Global Control Separator */}
        <div className="w-10 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent my-6" />

        {/* Account Module - Refined */}
        <div className="w-full px-3 mb-6">
          <Link
            href="/account/settings"
            className="group relative flex justify-center"
            aria-label="Account settings"
          >
            {isItemActive("/account/settings", pathname) && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-focus-violet rounded-r-full shadow-[0_0_20px_rgba(139,92,246,0.8)] z-20" />
            )}

            <div className={cn(
              "relative p-3.5 rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden",
              isItemActive("/account/settings", pathname)
                ? "bg-gradient-to-br from-white/[0.1] to-white/[0.02] text-focus-violet border border-focus-violet/40 shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                : "text-white/40 hover:text-white/90 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.1] active:scale-90"
            )}>
              <User className={cn(
                "h-5 w-5 transition-all duration-500 relative z-10",
                isItemActive("/account/settings", pathname) ? "scale-110 drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]" : "group-hover:scale-115"
              )} />

              {isItemActive("/account/settings", pathname) && (
                <div className="absolute inset-0 bg-gradient-to-b from-focus-violet/[0.05] to-transparent" />
              )}
            </div>

            <div className="absolute left-full ml-5 px-5 py-3.5 bg-[#0C0C12]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap z-[100] shadow-[0_15px_45px_rgba(0,0,0,0.7)] group-hover:translate-x-0 -translate-x-4">
              <div className="flex flex-col gap-0.5">
                <div className="label text-[13px] text-white tracking-wider font-semibold">Account Core</div>
                <div className="caption text-[10px] text-white/40 uppercase tracking-[0.2em]">Identity Management</div>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-focus-violet/10 to-transparent opacity-40" />
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar - Organic Float */}
      <nav
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-lg h-18 z-50 flex items-center justify-around px-2 bg-[#0C0C12]/80 backdrop-blur-3xl border border-white/[0.12] rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Superior reflection highlight */}
        <div className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Core navigation items (all 3 core) */}
        {coreNavItems.map((item) => {
          const isActive = isItemActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group py-1.5"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Magnetic active glow */}
              {isActive && (
                <div className="absolute inset-2 rounded-2xl bg-focus-violet/20 blur-xl scale-110 -z-10 animate-pulse" />
              )}

              {/* Icon Matrix */}
              <div className={cn(
                "relative transition-all duration-500 mb-1 z-10 flex items-center justify-center",
                isActive
                  ? "text-focus-violet -translate-y-1.5 scale-125 drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                  : "text-white/40 group-active:scale-95"
              )}>
                <item.icon className="h-5.5 w-5.5" />

                {isActive && (
                  <div className="absolute inset-0 bg-white/10 blur-[4px] rounded-full scale-150 -z-10" />
                )}
              </div>

              {/* Dynamic Label */}
              <span className={cn(
                "caption transition-all duration-500 font-bold uppercase tracking-widest text-[9px]",
                isActive
                  ? "text-white opacity-100"
                  : "text-white/30 opacity-60 group-hover:opacity-80"
              )}>
                {item.shortLabel || item.label}
              </span>

              {/* Organic Indicator Bar */}
              {isActive && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-8 bg-focus-violet rounded-full shadow-[0_0_15px_rgba(139,92,246,1)] z-20" />
              )}
            </Link>
          );
        })}

        {/* More Menu Module with advanced items only */}
        <MobileMoreMenu pathname={pathname} navItems={advancedNavItems} />
      </nav>
    </>
  );
}
