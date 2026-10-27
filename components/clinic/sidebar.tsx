// components/clinic/sidebar.tsx  (clinic owner)
// The account block, plan badge and top bar moved to DashboardHeader; the sidebar keeps navigation
// and the clinic name only.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";
import { useAuthStore } from "@/store/useStore";
import { useLogout } from "@/hooks/use-logout";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, exact: false },
  { name: "Clinical", href: "/dashboard/clinical", icon: FileText, exact: false },
  { name: "Profile", href: "/dashboard/profile", icon: User, exact: false },
];

function isRouteActive(pathname: string, href: string, exact: boolean = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pry-ff z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-all duration-150 active:scale-90 ${
                isActive ? "text-acc-clr" : "text-gray-400 hover:text-acc-clr"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const handleLogout = useLogout();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const profile = useAuthStore((s) => s.profile) as { clinicName?: string } | null;

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-100 shadow-sm h-screen shrink-0 transition-all duration-300 pry-ff ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo + clinic name */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-100 shrink-0 ${
          isCollapsed ? "justify-center" : "gap-3"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0" title={profile?.clinicName}>
          <Image src="/petark_logo.png" alt="PetArk logo" width={32} height={32} priority />
          {!isCollapsed && (
            <span className="text-base font-semibold text-gray-800 tracking-tight truncate">
              {profile?.clinicName || "PetArk"}
            </span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4">
        {!isCollapsed && (
          <p className="px-3 mb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Menu
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(pathname, item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.96] ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } ${
                    isActive
                      ? "bg-acc-clr text-white shadow-sm"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 space-y-1 shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-150 active:scale-[0.96] ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className={`flex items-center w-full px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all duration-150 ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}