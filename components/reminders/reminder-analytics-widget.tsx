// components/reminders/reminder-analytics-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell, AlertCircle } from "lucide-react";
import { getReminderWidget, type ReminderWidgetData } from "@/lib/analytics";
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

export default function ReminderAnalyticsWidget() {
    const [data, setData] = useState<ReminderWidgetData | null>(null);
    const [usage, setUsage] = useState<UsageSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getReminderWidget(), getClinicUsage()])
            .then(([reminderData, usageData]) => {
                if (cancelled) return;
                setData(reminderData);
                setUsage(usageData);
            })
            .catch(() => {
                if (!cancelled) {
                    setData(null);
                    setUsage(null);
                }
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
            <div className="rounded-xl border border-gray-200 p-4">
                <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
            </div>
        );
    }

    if (!data) return null;

    const maxTrend = Math.max(...data.trend.map((p) => p.value), 1);

    return (
        <div className="rounded-xl border border-gray-200 p-4 bg-pry-clr">
            <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-acc-clr" />
                <h3 className="text-sm font-semibold text-gray-900 pry-ff">Reminders</h3>
            </div>

            {usage && (
                <div className="space-y-2.5 mb-4">
                    <UsageBar
                        label="Reminders this month"
                        count={usage.remindersPerMonth.count}
                        limit={usage.remindersPerMonth.limit}
                        unlimited={usage.remindersPerMonth.unlimited}
                    />
                    <UsageBar
                        label="Treatments this month"
                        count={usage.treatments.count}
                        limit={usage.treatments.limit}
                        unlimited={usage.treatments.unlimited}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <p className="text-xs text-gray-400">Upcoming</p>
                    <p className="text-sm font-semibold text-gray-900">{data.upcomingCount}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        {data.overdueCount > 0 && <AlertCircle className="h-3 w-3 text-red-500" />}
                        Overdue
                    </p>
                    <p className={`text-sm font-semibold ${data.overdueCount > 0 ? "text-red-600" : "text-gray-900"}`}>
                        {data.overdueCount}
                    </p>
                </div>
            </div>

            <p className="text-xs text-gray-400 mb-1.5">Reminders Sent (Trend)</p>
            <div className="flex items-end gap-1.5 h-16">
                {data.trend.map((p) => (
                    <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center h-12">
                            <div
                                className="w-full max-w-5 rounded-t bg-acc-clr/70"
                                style={{ height: `${Math.max(4, (p.value / maxTrend) * 100)}%` }}
                                title={`${p.value} sent`}
                            />
                        </div>
                        <span className="text-[9px] text-gray-400">{p.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}