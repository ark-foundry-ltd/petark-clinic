// components/inventory/inventory-analytics-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle } from "lucide-react";
import { getInventoryWidget, type InventoryWidgetData } from "@/lib/analytics";

interface InventoryAnalyticsWidgetProps {
    locationId?: string;
}

export default function InventoryAnalyticsWidget({ locationId }: Readonly<InventoryAnalyticsWidgetProps>) {
    const [data, setData] = useState<InventoryWidgetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getInventoryWidget({ locationId })
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

    const maxTrend = Math.max(...data.movementTrend.map((p) => p.value), 1);

    return (
        <div className="rounded-xl border border-slate-100 bg-pry-clr p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-acc-clr" />
                <h3 className="text-sm font-semibold text-slate-800">Inventory Overview</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <p className="text-xs text-slate-400">Total SKUs</p>
                    <p className="text-sm font-semibold text-slate-800">{data.totalSkus.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">Low Stock</p>
                    <p className={`text-sm font-semibold flex items-center gap-1 ${data.lowStockCount > 0 ? "text-amber-600" : "text-slate-800"}`}>
                        {data.lowStockCount > 0 && <AlertTriangle className="h-3.5 w-3.5" />}
                        {data.lowStockCount.toLocaleString()}
                    </p>
                </div>
            </div>

            <p className="text-xs text-slate-400 mb-1.5">Movement Value Trend</p>
            <div className="flex items-end gap-1.5 h-16">
                {data.movementTrend.map((p) => (
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