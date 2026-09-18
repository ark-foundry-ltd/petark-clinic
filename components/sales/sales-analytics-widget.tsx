// components/sales/sales-analytics-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { getSalesWidget, type SalesWidgetData } from "@/lib/analytics";

interface SalesAnalyticsWidgetProps {
    locationId?: string;
}

export default function SalesAnalyticsWidget({ locationId }: Readonly<SalesAnalyticsWidgetProps>) {
    const [data, setData] = useState<SalesWidgetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getSalesWidget({ locationId })
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch(() => {
                if (!cancelled) setData(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [locationId]);

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-100 bg-pry-clr p-4 shadow-sm">
                <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
        );
    }

    if (!data) return null;

    const maxTrend = Math.max(...data.trend.map((p) => p.value), 1);

    return (
        <div className="rounded-xl border border-slate-100 bg-pry-clr p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 sec-ff">
                <TrendingUp className="h-4 w-4 text-acc-clr" />
                <h3 className="text-sm font-semibold text-slate-800">
                    {data.scope === "personal" ? "Your Sales" : "Clinic Sales"}
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 sec-ff">
                <div>
                    <p className="text-xs text-slate-400">Today</p>
                    <p className="text-sm font-semibold text-slate-800">₦{data.today.revenue.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400">{data.today.count} sale{data.today.count === 1 ? "" : "s"}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">This Week</p>
                    <p className="text-sm font-semibold text-slate-800">₦{data.thisWeek.revenue.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400">{data.thisWeek.count} sale{data.thisWeek.count === 1 ? "" : "s"}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">This Month</p>
                    <p className="text-sm font-semibold text-slate-800">₦{data.thisMonth.revenue.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400">{data.thisMonth.count} sale{data.thisMonth.count === 1 ? "" : "s"}</p>
                </div>
            </div>

            <div className="flex items-end gap-1.5 h-16 sec-ff">
                {data.trend.map((p) => (
                    <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center h-12">
                            <div
                                className="w-full max-w-5 rounded-t bg-acc-clr/70"
                                style={{ height: `${Math.max(4, (p.value / maxTrend) * 100)}%` }}
                                title={`₦${p.value.toLocaleString()}`}
                            />
                        </div>
                        <span className="text-[9px] text-slate-400">{p.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}