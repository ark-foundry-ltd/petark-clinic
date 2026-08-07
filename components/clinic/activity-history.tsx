// components/clinic/activity-history.tsx

"use client";

import { useEffect, useState } from "react";
import { getAllActivity, type ActivityLogRecord } from "@/lib/activity";
import {
    ACTIVITY_ICONS,
    ACTIVITY_ICON_COLORS,
    timeAgo,
} from "@/utils/activity-display";
import { Circle, Loader2, RotateCw, History, Bell } from "lucide-react";

const PAGE_SIZE = 20;

function dayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOf(now) - startOf(date)) / 86_400_000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: diffDays > 365 ? "numeric" : undefined,
    });
}

function groupByDay(records: ActivityLogRecord[]): { label: string; items: ActivityLogRecord[] }[] {
    const groups: { label: string; items: ActivityLogRecord[] }[] = [];
    for (const record of records) {
        const label = dayLabel(record.createdAt);
        const last = groups[groups.length - 1];
        if (last && last.label === label) {
            last.items.push(record);
        } else {
            groups.push({ label, items: [record] });
        }
    }
    return groups;
}

export default function ActivityHistory() {
    const [activity, setActivity] = useState<ActivityLogRecord[]>([]);
    const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);
    const [failed, setFailed] = useState(false);
    const [reloadToken, setReloadToken] = useState(0);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const loading = lastLoadedAt === null && !failed;

    useEffect(() => {
        let cancelled = false;

        getAllActivity()
            .then((data) => {
                if (cancelled) return;
                setActivity(data);
                setFailed(false);
                setLastLoadedAt(Date.now());
            })
            .catch(() => {
                if (cancelled) return;
                setFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, [reloadToken]);

    const visible = activity.slice(0, visibleCount);
    const groups = groupByDay(visible);
    const hasMore = visibleCount < activity.length;

    return (
        <div className="rounded-md p-6 sm:p-8 m-4">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <Bell className="mb-1 h-5 w-5 text-slate-800" />
                        <h2 className="pry-ff text-base font-semibold text-slate-800">
                            Activity History
                        </h2>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 pry-ff">
                        Everything that&apos;s happened across the clinic
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center gap-3 py-16 text-center pry-ff text-acc-clr">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-sm text-slate-400">Loading activity…</p>
                </div>
            )}

            {failed && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <History className="h-5 w-5 text-slate-400" />
                    </span>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">Activity didn&apos;t load</p>
                        <p className="text-xs text-slate-400">Check your connection and try again.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setFailed(false);
                            setLastLoadedAt(null);
                            setReloadToken((t) => t + 1);
                        }}
                        className="mt-1 flex items-center gap-1.5 rounded-lg bg-acc-clr px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                        Try again
                    </button>
                </div>
            )}

            {!loading && !failed && activity.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <History className="h-5 w-5 text-slate-400" />
                    </span>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">No activity yet</p>
                        <p className="max-w-xs text-xs text-slate-400">
                            New patients, visits, and sales will show up here as they happen.
                        </p>
                    </div>
                </div>
            )}

            {!loading && !failed && activity.length > 0 && (
                <div className="space-y-8">
                    {groups.map((group) => (
                        <div key={group.label}>
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {group.label}
                            </h3>
                            <ul className="space-y-2.5">
                                {group.items.map((entry) => {
                                    const Icon = ACTIVITY_ICONS[entry.type] ?? Circle;
                                    const colorClass =
                                        ACTIVITY_ICON_COLORS[entry.type] ?? "text-slate-600 bg-slate-100";

                                    return (
                                        <li
                                            key={entry._id}
                                            className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
                                        >
                                            <span
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                            >
                                                <Icon className="h-4.5 w-4.5" />
                                            </span>
                                            <div className="min-w-0 flex-1 pt-1">
                                                <p className="sec-ff text-sm leading-snug text-slate-700">
                                                    {entry.message}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {timeAgo(entry.createdAt)}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}

                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                            className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Load more
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}