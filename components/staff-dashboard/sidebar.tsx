// components/staff-dashboard/sidebar.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  PawPrint,
  Package,
  ArrowLeftRight,
  BarChart3,
  ShoppingCart,
  Receipt,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";
import { useAuthStore } from "@/store/useStore";
import { logoutClinic } from "@/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  need?: string; // permission required to show this link — omit for always-visible
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/staff-dashboard", icon: LayoutDashboard, exact: true },
  { name: "Appointments", href: "/staff-dashboard/appointments", icon: Calendar, need: "manage_appointments" },
  { name: "Patients", href: "/staff-dashboard/patients", icon: PawPrint, need: "view_patients" },
  { name: "Inventory", href: "/staff-dashboard/inventory", icon: Package, need: "view_inventory" },
  { name: "POS", href: "/staff-dashboard/pos", icon: ShoppingCart, need: "access_pos" },
  { name: "Sales History", href: "/staff-dashboard/sales-history", icon: Receipt, need: "view_sales_history" },
  { name: "Referrals", href: "/staff-dashboard/referrals", icon: ArrowLeftRight, need: "view_referrals" },
  { name: "Reports", href: "/staff-dashboard/reports", icon: BarChart3, need: "view_reports" },
];

const ROLE_LABELS: Record<string, string> = {
  vet: "Vet",
  receptionist: "Receptionist",
  sales: "Sales",
};

function isRouteActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function useVisibleNavItems() {
  const permissions = useAuthStore((s) => s.permissions);
  const hasAll = permissions.includes("all_permissions");
  return NAV_ITEMS.filter((item) => !item.need || hasAll || permissions.includes(item.need));
}

function useLogout() {
  const router = useRouter();
  return async () => {
    await logoutClinic();
    router.replace("/login");
  };
}

// ─── Mobile Top Bar ───────────────────────────────────────────────────────
export function StaffMobileTopBar() {
  const profile = useAuthStore((s) => s.profile) as {
    fullname?: string;
    role?: string;
    customRoleName?: string | null;
    clinicName?: string;
    email?: string;
  } | null;
  const role = useAuthStore((s) => s.role);
  const handleLogout = useLogout();
  const [open, setOpen] = useState(false);

  const roleLabel =
    role === "custom" ? profile?.customRoleName ?? "Custom Role" : ROLE_LABELS[role ?? ""] ?? role;

  const initials = (profile?.fullname ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm pry-ff shrink-0">
      <div className="flex items-center justify-between px-4 h-16">
        <Link href="/staff-dashboard" className="flex items-center gap-2">
          <Image src="/petark_logo.png" alt="PetArk logo" width={28} height={28} priority />
          <span className="text-lg font-bold text-gray-800 tracking-tight pry-ff">PetArk</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-acc-clr flex items-center justify-center text-white font-semibold text-sm">
              {initials || "?"}
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0" style={{ zIndex: 9 }} onClick={() => setOpen(false)} />
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                style={{ zIndex: 10 }}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{profile?.fullname ?? "Staff"}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {roleLabel} · {profile?.clinicName ?? "Clinic"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Mobile Bottom Nav ──────────────────────────────────────────────────────
export function StaffMobileBottomNav() {
  const pathname = usePathname();
  const items = useVisibleNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pry-ff z-50">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-all active:scale-90 ${
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

// ─── Desktop Sidebar ────────────────────────────────────────────────────────
export function StaffSidebar() {
  const pathname = usePathname();
  const handleLogout = useLogout();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const items = useVisibleNavItems();
  const profile = useAuthStore((s) => s.profile) as {
    fullname?: string;
    clinicName?: string;
    email?: string;
  } | null;
  const role = useAuthStore((s) => s.role);

  const roleLabel = ROLE_LABELS[role ?? ""] ?? role;

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-100 shadow-sm h-screen shrink-0 transition-all duration-300 pry-ff ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-100 shrink-0 ${
          isCollapsed ? "justify-center" : "gap-3"
        }`}
      >
        <Link href="/staff-dashboard" className="flex items-center gap-3">
          <Image src="/petark_logo.png" alt="PetArk logo" width={32} height={32} priority />
          {!isCollapsed && <span className="text-lg font-bold text-gray-800 tracking-tight">PetArk</span>}
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        {!isCollapsed && (
          <p className="px-3 mb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
        )}
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(pathname, item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all active:scale-[0.96] ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } ${isActive ? "bg-acc-clr text-white shadow-sm" : "hover:bg-gray-100 text-gray-700"}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-1 shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all active:scale-[0.96] ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className={`flex items-center w-full px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all ${
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
                {(profile?.fullname ?? "").charAt(0) || "S"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{profile?.fullname ?? "Staff"}</p>
                <p className="text-xs text-gray-500 truncate">{roleLabel} · {profile?.clinicName ?? "Clinic"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}