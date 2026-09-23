// components/clinic/usage-summary-card.tsx
"use client";

import { useEffect, useState } from "react";
import { getClinicUsage, type UsageSummary } from "@/lib/usage";

function UsageBar({ label, count, limit, unlimited }: Readonly<{ label: string; count: number; limit: number; unlimited: boolean }>) {
    const pct = unlimited ? 0 : Math.min(100, (count / Math.max(1, limit)) * 100);
    return (
        <div>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-700">
                    {unlimited ? `${count} used` : `${count} / ${limit}`}
                </span>
            </div>
            {!unlimited && (
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-acc-clr"}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export default function UsageSummaryCard() {
    const [usage, setUsage] = useState<UsageSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getClinicUsage()
            .then((data) => {
                if (!cancelled) setUsage(data);
            })
            .catch(() => {
                if (!cancelled) setUsage(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 p-5 space-y-3">
                <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
            </div>
        );
    }

    if (!usage) return null;

    return (
        <div className="rounded-xl border border-gray-100 p-5 space-y-3 bg-pry-clr">
            <h3 className="text-sm font-semibold text-gray-900 pry-ff">Plan Usage</h3>
            <UsageBar label="Staff" count={usage.staff.count} limit={usage.staff.limit} unlimited={usage.staff.unlimited} />
            <UsageBar label="Custom Roles" count={usage.customRoles.count} limit={usage.customRoles.limit} unlimited={usage.customRoles.unlimited} />
            <UsageBar label="Locations" count={usage.locations.count} limit={usage.locations.limit} unlimited={usage.locations.unlimited} />
            <UsageBar label="Treatments (Month)" count={usage.treatments.count} limit={usage.treatments.limit} unlimited={usage.treatments.unlimited} />
            <UsageBar label="Reminders (Month)" count={usage.remindersPerMonth.count} limit={usage.remindersPerMonth.limit} unlimited={usage.remindersPerMonth.unlimited} />
        </div>
    );
}