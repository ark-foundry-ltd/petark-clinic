// components/dashboard/dashboard-stats.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import {
    getDashboardStats,
    type DashboardData,
    type DashboardSections,
    type DashboardSectionKey,
} from "@/lib/dashboard";
import { BarChart, LineChart, type Pt } from "@/components/dashboard/mini-charts";

const SUBSCRIPTION_HREF = "/dashboard/profile/upgrade";
const naira = (n: number) => `₦${n.toLocaleString()}`;

interface Tile {
    value: string;
    sub: string;
    warn?: boolean;
}

// NOTE: hrefs other than analytics/subscription are guesses. Point them at your real routes.
const TILES: { key: DashboardSectionKey; label: string; href: string; read: (s: DashboardSections) => Tile }[] = [
    {
        key: "appointmentsToday",
        label: "Today's appointments",
        href: "/dashboard/appointments",
        read: (s) => ({
            value: String(s.appointmentsToday!.total),
            sub: `${s.appointmentsToday!.completed} done, ${s.appointmentsToday!.remaining} remaining`,
        }),
    },
    {
        key: "visits",
        label: "Patients/visits",
        href: "/dashboard/clinical/records",
        read: (s) => {
            const { thisWeek, lastWeek, completedThisWeek } = s.visits!;
            const pct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
            return {
                value: String(thisWeek),
                sub: pct === null ? `This week, ${completedThisWeek} completed` : `This week, ${pct >= 0 ? "+" : ""}${pct}% vs last week`,
            };
        },
    },
    {
        key: "revenue",
        label: "Revenue",
        href: "/dashboard/clinical/locations",
        read: (s) => ({ value: naira(s.revenue!.today), sub: `${naira(s.revenue!.thisWeek)} this week` }),
    },
    {
        key: "inventoryAlerts",
        label: "Inventory alerts",
        href: "/dashboard/clinical/locations",
        read: (s) => {
            const { lowStock, expiringSoon } = s.inventoryAlerts!;
            return { value: String(lowStock + expiringSoon), sub: `${lowStock} low stock, ${expiringSoon} expiring soon`, warn: lowStock + expiringSoon > 0 };
        },
    },
    {
        key: "followUps",
        label: "Upcoming follow-ups",
        href: "/dashboard/clinical",
        read: (s) => ({
            value: String(s.followUps!.upcoming),
            sub: `Next 7 days, ${s.followUps!.dueToday} due today, ${s.followUps!.overdue} overdue`,
        }),
    },
    {
        key: "recentActivity",
        label: "Recent activity",
        href: "/dashboard/clinical/activity",
        read: (s) => ({ value: String(s.recentActivity!.today), sub: "Actions logged today" }),
    },
    {
        key: "newPatients",
        label: "New patients",
        href: "/dashboard/clinical/patients",
        read: (s) => ({ value: String(s.newPatients!.thisWeek), sub: "Registered this week" }),
    },
    {
        key: "unpaidInvoices",
        label: "Unpaid invoices",
        href: "/dashboard/clinical/locations",
        read: (s) => ({
            value: naira(s.unpaidInvoices!.amount),
            sub: `${s.unpaidInvoices!.count} outstanding`,
            warn: s.unpaidInvoices!.count > 0,
        }),
    },
    {
        key: "pendingReferrals",
        label: "Pending referrals",
        href: "/dashboard/clinical/referrals",
        read: (s) => ({ value: String(s.pendingReferrals!.incoming), sub: "Incoming, awaiting response" }),
    },
];

const CHARTS: { key: DashboardSectionKey; title: string; sub: string; href: string; type: "bar" | "line" }[] = [
    { key: "revenueChart", title: "Revenue by month", sub: "Paid sales in ₦", href: "/dashboard/analytics", type: "line" },
    { key: "visitsChart", title: "Visits this week", sub: "Patients seen per day", href: "/dashboard/clinical/records", type: "bar" },
    { key: "appointmentsByHour", title: "Today's appointments by hour", sub: "Booked slots per hour", href: "/dashboard/appointments", type: "bar" },
    { key: "visitTrend", title: "Visit trend", sub: "Total visits per week, last 8 weeks", href: "/dashboard/analytics", type: "line" },
];

const cardCls = "rounded-xl border border-gray-100 p-5 block transition-colors hover:border-acc-clr/40 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-clr/40 bg-pry-clr";

function LockedCard({ label, plan }: Readonly<{ label: string; plan: string }>) {
    return (
        <Link href={SUBSCRIPTION_HREF} className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 block hover:border-violet-300">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 sec-ff">
                <Lock className="w-3.5 h-3.5" />
                {label}
            </div>
            <p className="mt-2 text-sm font-medium text-violet-600 capitalize">Available on {plan}</p>
        </Link>
    );
}

export default function DashboardStats({ locationId }: Readonly<{ locationId?: string }>) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setData(null);
        setError(null);
        getDashboardStats({ locationId })
            .then((res) => !cancelled && setData(res))
            .catch((e: Error) => !cancelled && setError(e.message));
        return () => {
            cancelled = true;
        };
    }, [locationId]);

    if (error) return <p className="text-sm text-red-500">Couldn't load dashboard stats: {error}</p>;

    if (!data) {
        return (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-gray-100" />
                ))}
            </div>
        );
    }

    const lockedPlan = (key: DashboardSectionKey) => data.locked.find((l) => l.key === key)?.requiredPlan;

    return (
        <div className="space-y-4">
            <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {TILES.map((t) => {
                    if (data.sections[t.key]) {
                        const { value, sub, warn } = t.read(data.sections);
                        return (
                            <Link key={t.key} href={t.href} className={cardCls}>
                                <div className="text-sm text-gray-500 sec-ff">{t.label}</div>
                                <div className={`text-3xl font-bold pry-ff mt-1 ${warn ? "text-orange-600" : "text-gray-900"}`}>{value}</div>
                                <div className="text-xs text-gray-400 sec-ff mt-0.5">{sub}</div>
                            </Link>
                        );
                    }
                    const plan = lockedPlan(t.key);
                    return plan ? <LockedCard key={t.key} label={t.label} plan={plan} /> : null;
                })}
            </section>

            <section className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                {CHARTS.map((c) => {
                    const points = data.sections[c.key] as Pt[] | undefined;
                    if (points) {
                        return (
                            <Link key={c.key} href={c.href} className={cardCls}>
                                <h3 className="text-sm font-semibold text-gray-900 pry-ff">{c.title}</h3>
                                <p className="text-xs text-gray-400 sec-ff mb-3">{c.sub}</p>
                                {c.type === "bar" ? <BarChart points={points} /> : <LineChart points={points} />}
                            </Link>
                        );
                    }
                    const plan = lockedPlan(c.key);
                    return plan ? <LockedCard key={c.key} label={c.title} plan={plan} /> : null;
                })}
            </section>
        </div>
    );
}