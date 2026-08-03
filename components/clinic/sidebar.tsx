"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";
import { useAuthStore } from "@/store/useStore";
import { logoutClinic } from "@/lib/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, exact: false },
  { name: "Clinical", href: "/dashboard/clinical", icon: FileText, exact: false },
  { name: "Profile", href: "/dashboard/profile", icon: User, exact: false },
];

function useLogout() {
  const router = useRouter();
  const { profile, logout: storeLogout } = useAuthStore();

  return async () => {
    if (!profile) {
      storeLogout();
      router.replace("/login");
      return;
    }
    await logoutClinic();
    router.replace("/login");
  };
}

function isRouteActive(pathname: string, href: string, exact: boolean = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function PlanBadge({ plan, status }: { plan?: string; status?: string }) {
  const isPro = !!plan && plan !== "free" && status === "active";

  if (isPro) {
    return (
      <span className="text-[9px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
        ✦ Pro
      </span>
    );
  }
  return (
    <span className="text-[9px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
      Free
    </span>
  );
}

// ─── Mobile Top Bar ───────────────────────────────────────────────────────────
export function MobileTopBar() {
  const { profile } = useAuthStore();
  const handleLogout = useLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm pry-ff shrink-0">
      <div className="flex items-center justify-between px-4 h-16">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/petark_logo.png"
            alt="PetArk logo"
            width={28}
            height={28}
            priority
          />
          <span className="text-lg font-bold text-gray-800 tracking-tight pry-ff">
            PetArk
          </span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-acc-clr flex items-center justify-center text-white font-semibold text-sm pry-ff">
              {profile?.clinicName?.charAt(0) || "P"}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 9 }}
                onClick={() => setIsDropdownOpen(false)}
              />
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                style={{ zIndex: 10 }}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate pry-ff">
                      {profile?.clinicName || "Pet Owner"}
                    </p>
                    <PlanBadge plan={profile?.subscription?.plan} status={profile?.subscription?.status} />
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {profile?.email || "petark@example.com"}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/profile/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
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
  const { profile } = useAuthStore();

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-100 shadow-sm h-screen shrink-0 transition-all duration-300 pry-ff ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-100 shrink-0 ${
          isCollapsed ? "justify-center" : "gap-3"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/petark_logo.png"
            alt="PetArk logo"
            width={32}
            height={32}
            priority
          />
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-800 tracking-tight">
              PetArk
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

        {!isCollapsed && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3">
              <div className="h-8 w-8 rounded-full bg-acc-clr flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {profile?.clinicName?.charAt(0) || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {profile?.clinicName || "Clinic"}
                  </p>
                  <PlanBadge plan={profile?.subscription?.plan} status={profile?.subscription?.status} />
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email || "petark@example.com"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}