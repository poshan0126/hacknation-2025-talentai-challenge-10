"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, User, Menu, Bell, Settings, Crown, X, Users, BarChart, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { title: string; url: string; icon: any };

const navigationItems: NavItem[] = [
  { title: "Dashboard", url: "/recruiter", icon: Briefcase },
  { title: "Rankings", url: "/recrutranking", icon: Crown },
  { title: "Analytics", url: "/recruiter", icon: BarChart },
  { title: "Profile", url: "/recruiterprofile", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  useMemo(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);


  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gradient-to-r focus:from-[#667eea] focus:to-[#764ba2] focus:px-3 focus:py-1.5 focus:text-white"
      >
        Skip to content
      </a>

      <div className="grid h-full grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] min-h-0">
        {/* Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-sm",
            "lg:static lg:translate-x-0",
            "fixed inset-y-0 left-0 z-50 w-72 translate-x-[-100%] bg-white/90 shadow-sm transition-transform duration-300 ease-in-out",
            sidebarOpen && "translate-x-0",
            "overflow-hidden"
          )}
          aria-label="Primary"
        >
          {/* Sidebar header */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-[#667eea] to-[#764ba2] px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm shadow-sm">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold leading-tight">TalentAI Recruiter</h2>
                  <p className="text-xs text-white/80">Recruitment Platform</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg text-white hover:bg-white/15 lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar nav */}
          <div className="flex flex-1 flex-col px-3 py-4">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Navigation
            </p>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const ActiveIcon = item.icon;
                const active = isActive(item.url);
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-all",
                      active
                        ? "bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 text-[#667eea] shadow-sm border border-[#667eea]/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <ActiveIcon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        active ? "text-[#667eea]" : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    <span className="truncate font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Stats */}
            <div className="mt-6 space-y-3">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Quick stats
              </p>
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Active Jobs</span>
                  <span className="tabular-nums text-lg font-semibold text-emerald-600">47</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#667eea]/20 bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Applications</span>
                  <span className="tabular-nums text-lg font-semibold text-[#667eea]">342</span>
                </div>
              </div>
            </div>

            {/* User */}
            <div className="mt-auto rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="truncate text-xs text-gray-500">HR Manager</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Account settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <button
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Main content */}
        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-base font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">TalentAI Recruiter</h1>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main id="main" className="min-h-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
