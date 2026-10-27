// components/layout/dashboard-header.tsx
// Shared by the clinic and staff dashboards. LEFT: where you are (page title, greeting on home).
// RIGHT: notification bell + your name/initials with the account menu.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useStore";
import { getPlanInfo, PLAN_LABELS, type Plan } from "@/lib/plan";
import { ensurePushSubscription } from "@/lib/push";
import NotificationBell from "@/components/clinic/notification-bell";
import { useLogout } from "@/hooks/use-logout";

type HeaderProfile = {
    clinicName?: string;
    ownerName?: string; // clinic owner
    fullname?: string; // staff
    email?: string;
    customRoleName?: string | null;
} | null;

const ROLE_LABELS: Record<string, string> = {
    clinic: "Clinic owner",
    vet: "Vet",
    receptionist: "Receptionist",
    sales: "Sales",
};

const HOME_PATHS = ["/dashboard", "/staff-dashboard"];
const TITLE_OVERRIDES: Record<string, string> = { pos: "POS" };

// "/dashboard/sales-history" -> "Sales history". Skips record ids so nested pages still read well.
function pageTitle(pathname: string): string | null {
    const segments = pathname.split("/").filter(Boolean).slice(1); // drop "dashboard" / "staff-dashboard"
    const meaningful = segments.filter((s) => !/^[0-9a-f]{24}$/i.test(s) && !/^\d+$/.test(s));
    const last = meaningful[meaningful.length - 1];
    if (!last) return null;
    return TITLE_OVERRIDES[last] ?? last.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

// ─── Plan badge (clinic owner's account menu) ───────────────────────────────
const BADGE_STYLES: Record<string, string> = {
    enterprise: "bg-amber-800 text-white",
    pro: "bg-violet-600 text-white",
    standard: "bg-blue-600 text-white",
    cms_standard: "bg-teal-600 text-white",
    starter: "bg-green-600 text-white",
    cms_starter: "bg-emerald-600 text-white",
};

function PlanBadge({ plan, status }: Readonly<{ plan?: string; status?: string }>) {
    const style = plan && status === "active" ? BADGE_STYLES[plan] : undefined;
    if (!style) {
        return (
            <span className="text-[9px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                Free
            </span>
        );
    }
    return (
        <span className={`text-[9px] font-semibold ${style} px-1.5 py-0.5 rounded-full shrink-0`}>
            {plan === "pro" ? "✦ Pro" : PLAN_LABELS[plan as Plan]}
        </span>
    );
}

export default function DashboardHeader() {
    const pathname = usePathname();
    const profileRaw = useAuthStore((s) => s.profile);
    const profile = profileRaw as HeaderProfile;
    const role = useAuthStore((s) => s.role);
    const handleLogout = useLogout();

    const [menuOpen, setMenuOpen] = useState(false);
    const [greeting, setGreeting] = useState("Welcome");
    const menuRef = useRef<HTMLDivElement>(null);

    const isOwner = role === "clinic";
    const homeHref = isOwner ? "/dashboard" : "/staff-dashboard";
    const isHome = HOME_PATHS.includes(pathname);

    const displayName = (isOwner ? profile?.ownerName : profile?.fullname) ?? profile?.clinicName ?? "Account";
    const firstName = displayName.split(" ")[0];
    const initials =
        displayName.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
    const roleLabel =
        role === "custom" ? profile?.customRoleName ?? "Staff" : ROLE_LABELS[role ?? ""] ?? "Staff";

    const title = isHome ? "Dashboard" : pageTitle(pathname) ?? "Dashboard";

    // Computed after mount so server and client render the same markup
    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    }, []);

    // Re-attach this device's push subscription to the signed-in account (never prompts)
    useEffect(() => {
        ensurePushSubscription().catch(() => {});
    }, []);

    // Close the menu on outside click / Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

    const { plan, status } = getPlanInfo(profileRaw as Parameters<typeof getPlanInfo>[0]);

    return (
        <header className="sticky top-0 z-30 h-16 shrink-0 bg-white border-b border-gray-200 pry-ff flex items-center justify-between gap-3 px-4 md:px-6">
            {/* LEFT: where you are */}
            <div className="flex items-center gap-3 min-w-0">
                {/* The sidebar is hidden on mobile, so the brand lives here */}
                <Link href={homeHref} className="md:hidden shrink-0" aria-label="PetArk home">
                    <Image src="/petark_logo.png" alt="PetArk logo" width={28} height={28} priority />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-base md:text-lg font-semibold tracking-tight text-gray-900 truncate">{title}</h1>
                    {isHome && (
                        <p className="hidden sm:block text-xs text-gray-500 truncate">
                            {greeting}, {firstName}
                        </p>
                    )}
                </div>
            </div>

            {/* RIGHT: bell + account */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <NotificationBell />

                <div ref={menuRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-haspopup="true"
                        aria-expanded={menuOpen}
                        className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                    >
                        <span className="h-8 w-8 rounded-full bg-acc-clr flex items-center justify-center text-white font-semibold text-sm">
                            {initials}
                        </span>
                        <span className="hidden md:block text-left min-w-0 max-w-40">
                            <span className="block text-sm font-medium text-gray-800 truncate">{displayName}</span>
                            <span className="block text-xs text-gray-500 truncate">{roleLabel}</span>
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                                    {isOwner && <PlanBadge plan={plan} status={status} />}
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {isOwner ? profile?.email : `${roleLabel} · ${profile?.clinicName ?? "Clinic"}`}
                                </p>
                            </div>
                            <div className="py-1">
                                {isOwner && (
                                    <Link
                                        href="/dashboard/profile/settings"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <UserCircle2 className="h-4 w-4 text-gray-500" />
                                        Profile
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}