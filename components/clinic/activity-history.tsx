// components/clinic/activity-history.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
    getAllActivity,
    type ActivityLogRecord,
    type ActivityType,
} from "@/lib/activity";
import {
    ACTIVITY_ICONS,
    ACTIVITY_ICON_COLORS,
    ACTIVITY_TYPE_LABELS,
    fullTimestamp,
    timeAgo,
} from "@/utils/activity-display";
import { Circle, Loader2, Bell } from "lucide-react";

type FilterTab = "all" | ActivityType;

// A handful of broad tabs rather than one per type — mirrors how most
// notification centers group things (All / mentions / requests) instead of
// forcing a dropdown with 14 options up front.
const QUICK_FILTERS: { label: string; types: ActivityType[] | null }[] = [
    { label: "All", types: null },
    { label: "Sales", types: ["sale_made", "sale_voided"] },
    { label: "Patients & Visits", types: ["patient_new", "visit_new", "visit_completed"] },
    {
        label: "Appointments",
        types: ["appointment_booked", "appointment_scheduled"],
    },
    {
        label: "Referrals",
        types: [
            "referral_sent",
            "referral_received",
            "referral_accepted",
            "referral_declined",
        ],
    },
    { label: "Stock", types: ["stock_low"] },
];

function dayLabel(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

export default function ActivityHistory() {
    const [activity, setActivity] = useState<ActivityLogRecord[]>([]);
    const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState(0);
    const loading = lastLoadedAt === null;

    useEffect(() => {
        let cancelled = false;

        getAllActivity()
            .then((data) => {
                if (cancelled) return;
                setActivity(data);
                setLastLoadedAt(Date.now());
            })
            .catch(() => {
                if (cancelled) return;
                setActivity([]);
                setLastLoadedAt(Date.now());
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const types = QUICK_FILTERS[activeFilter].types;
        if (!types) return activity;
        return activity.filter((entry) => types.includes(entry.type));
    }, [activity, activeFilter]);

    // Group by calendar day, preserving the newest-first order the API returns
    const groups = useMemo(() => {
        const map = new Map<string, ActivityLogRecord[]>();
        for (const entry of filtered) {
            const key = new Date(entry.createdAt).toDateString();
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(entry);
        }
        return Array.from(map.entries());
    }, [filtered]);

    return (
        <div className="mx-auto max-w-4xl pry-ff">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-pry-clr/95 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-slate-700" />
                    <h1 className="pry-ff text-xl font-semibold text-slate-800">
                        Activity Logs
                    </h1>
                </div>

                {/* Segmented filter tabs */}
                <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
                    {QUICK_FILTERS.map((filter, i) => (
                        <button
                            key={filter.label}
                            type="button"
                            onClick={() => setActiveFilter(i)}
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                activeFilter === i
                                    ? "bg-acc-clr text-pry-clr"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
                {loading && (
                    <div className="py-16 text-center text-acc-clr">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-16 text-center">
                        <Bell className="h-8 w-8 text-slate-200" />
                        <p className="text-sm text-slate-400">Nothing here yet.</p>
                    </div>
                )}

                {!loading && groups.length > 0 && (
                    <div className="space-y-5">
                        {groups.map(([dayKey, entries]) => (
                            <div key={dayKey}>
                                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {dayLabel(entries[0].createdAt)}
                                </h2>

                                <div className="overflow-hidden rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
                                    <ul className="divide-y divide-slate-50">
                                        {entries.map((entry) => {
                                            const Icon = ACTIVITY_ICONS[entry.type] ?? Circle;
                                            const colorClass =
                                                ACTIVITY_ICON_COLORS[entry.type] ??
                                                "text-slate-600 bg-slate-100";

                                            return (
                                                <li
                                                    key={entry._id}
                                                    className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70"
                                                >
                                                    <span
                                                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="sec-ff text-sm leading-snug text-slate-700">
                                                            {entry.message}
                                                        </p>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-xs text-slate-400">
                                                                {timeAgo(entry.createdAt)}
                                                            </span>
                                                            <span className="text-slate-300">·</span>
                                                            <span
                                                                className="text-xs text-slate-400"
                                                                title={fullTimestamp(entry.createdAt)}
                                                            >
                                                                {ACTIVITY_TYPE_LABELS[entry.type] ??
                                                                    entry.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}