// components/dashboard/activity-feed.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentActivity, type ActivityLogRecord } from "@/lib/activity";
import {
    ACTIVITY_ICONS,
    ACTIVITY_ICON_COLORS,
    timeAgo,
} from "@/utils/activity-display";
import { Circle, Loader2, ArrowRight } from "lucide-react";

export default function ActivityFeed() {
    const [activity, setActivity] = useState<ActivityLogRecord[]>([]);
    const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);
    const loading = lastLoadedAt === null;

    useEffect(() => {
        let cancelled = false;

        getRecentActivity()
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

    return (
        <div className="rounded-xl border border-slate-100 bg-pry-clr p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="pry-ff text-sm font-semibold text-slate-800">
                    Recent Activity
                </h2>
                <Link
                    href="/dashboard/clinical/activity"
                    className="flex items-center gap-1 text-xs font-medium text-acc-clr hover:underline"
                >
                    View all
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {loading && (
                <div className="py-6 text-center text-sm text-acc-clr">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                </div>
            )}

            {!loading && activity.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-400">
                    No recent activity yet.
                </div>
            )}

            {!loading && activity.length > 0 && (
                <ul className="space-y-3">
                    {activity.map((entry) => {
                        const Icon = ACTIVITY_ICONS[entry.type] ?? Circle;
                        const colorClass =
                            ACTIVITY_ICON_COLORS[entry.type] ?? "text-slate-600 bg-slate-100";

                        return (
                            <li key={entry._id} className="flex items-start gap-3">
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="sec-ff text-sm text-slate-700">
                                        {entry.message}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {timeAgo(entry.createdAt)}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}