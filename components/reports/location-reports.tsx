// components/reports/location-reports.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import {
    getSalesReport,
    getInventoryReport,
    type SalesReport,
    type InventoryReport,
    type MovementType,
} from "@/lib/report";

const MOVEMENT_LABELS: Record<MovementType, string> = {
    purchases: "Purchases",
    sales: "Sales",
    wastage: "Wastage",
    expiry: "Expired",
    adjustment: "Corrections",
    return: "Returns",
};

const PAYMENT_LABELS: Record<string, string> = {
    cash: "Cash",
    transfer: "Transfer",
    pos_card: "POS / Card",
};

interface LocationReportsProps {
    locationId: string;
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function startOfMonthISO(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function LocationReports({ locationId }: Readonly<LocationReportsProps>) {
    const [from, setFrom] = useState(startOfMonthISO());
    const [to, setTo] = useState(todayISO());
    const [appliedRange, setAppliedRange] = useState({ from, to });

    const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
    const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError(null);

        Promise.all([
            getSalesReport({ from: appliedRange.from, to: appliedRange.to, locationId }),
            getInventoryReport({ from: appliedRange.from, to: appliedRange.to, locationId }),
        ])
            .then(([sales, inventory]) => {
                if (cancelled) return;
                setSalesReport(sales);
                setInventoryReport(inventory);
            })
            .catch((err) => {
                if (cancelled) return;
                setLoadError(err instanceof Error ? err.message : "Couldn't load reports.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [appliedRange, locationId]);

    function applyRange() {
        if (new Date(from) > new Date(to)) {
            setLoadError("Start date must be before end date.");
            return;
        }
        setAppliedRange({ from, to });
    }

    function resetToThisMonth() {
        const newFrom = startOfMonthISO();
        const newTo = todayISO();
        setFrom(newFrom);
        setTo(newTo);
        setAppliedRange({ from: newFrom, to: newTo });
    }

    return (
        <div>
            {/* Date range controls */}
            <div className="mb-6 flex flex-wrap items-end gap-3">
                <div>
                    <label htmlFor="report-from" className="mb-1 block text-xs font-medium text-slate-500">
                        From
                    </label>
                    <input
                        id="report-from"
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>
                <div>
                    <label htmlFor="report-to" className="mb-1 block text-xs font-medium text-slate-500">
                        To
                    </label>
                    <input
                        id="report-to"
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>
                <button
                    type="button"
                    onClick={applyRange}
                    className="rounded-lg bg-acc-clr px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                    Apply
                </button>
                <button
                    type="button"
                    onClick={resetToThisMonth}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    This Month
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-acc-clr" />
                </div>
            ) : loadError ? (
                <p className="py-8 text-center text-sm text-red-500">{loadError}</p>
            ) : (
                <div className="space-y-8">
                    {/* ── Sales report ── */}
                    {salesReport && (
                        <section>
                            <h3 className="mb-3 text-sm font-semibold text-slate-800">Sales</h3>
                            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                <ReportStat label="Revenue" value={`₦${salesReport.totalRevenue.toLocaleString()}`} />
                                <ReportStat label="Cost" value={`₦${salesReport.totalCost.toLocaleString()}`} />
                                <ReportStat
                                    label="Gross Profit"
                                    value={`₦${salesReport.grossProfit.toLocaleString()}`}
                                    icon={salesReport.grossProfit >= 0 ? TrendingUp : TrendingDown}
                                    tone={salesReport.grossProfit >= 0 ? "positive" : "negative"}
                                />
                                <ReportStat label="Sales Count" value={salesReport.salesCount.toLocaleString()} />
                                <ReportStat label="Avg Sale" value={`₦${salesReport.avgSaleValue.toFixed(2)}`} />
                            </div>

                            {salesReport.voidedCount > 0 && (
                                <p className="mb-4 text-xs text-amber-600">
                                    {salesReport.voidedCount} voided sale{salesReport.voidedCount === 1 ? "" : "s"} in this range
                                    (₦{salesReport.voidedValue.toLocaleString()}, excluded from revenue above).
                                </p>
                            )}

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* By payment method */}
                                <div className="rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
                                    <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        By Payment Method
                                    </div>
                                    {salesReport.byPaymentMethod.length === 0 ? (
                                        <p className="px-4 py-6 text-center text-sm text-slate-400">No sales in this range.</p>
                                    ) : (
                                        <ul className="divide-y divide-slate-50">
                                            {salesReport.byPaymentMethod.map((row) => (
                                                <li key={row._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                                    <span className="text-slate-600">{PAYMENT_LABELS[row._id] ?? row._id}</span>
                                                    <span className="font-medium text-slate-800">
                                                        ₦{row.revenue.toLocaleString()} <span className="text-slate-400">({row.count})</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Top items */}
                                <div className="rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
                                    <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Top Selling Items
                                    </div>
                                    {salesReport.topItems.length === 0 ? (
                                        <p className="px-4 py-6 text-center text-sm text-slate-400">No sales in this range.</p>
                                    ) : (
                                        <ul className="divide-y divide-slate-50">
                                            {salesReport.topItems.map((item) => (
                                                <li key={item._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                                    <span className="truncate text-slate-600">{item.name}</span>
                                                    <span className="font-medium text-slate-800">
                                                        {item.quantitySold} sold · ₦{item.revenue.toLocaleString()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── Inventory movement report ── */}
                    {inventoryReport && (
                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-800">Inventory Movement</h3>
                                {inventoryReport.currentLowStockCount > 0 && (
                                    <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                                        <AlertTriangle className="h-3 w-3" />
                                        {inventoryReport.currentLowStockCount} item(s) currently low stock
                                    </span>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                                            <th className="px-4 py-2.5 font-medium">Type</th>
                                            <th className="px-4 py-2.5 font-medium">Quantity</th>
                                            <th className="px-4 py-2.5 font-medium">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Object.entries(inventoryReport.movements) as [MovementType, { quantity: number; value: number }][]).map(
                                            ([type, data]) => (
                                                <tr key={type} className="border-b border-slate-50 last:border-0">
                                                    <td className="px-4 py-2.5 text-slate-600">{MOVEMENT_LABELS[type]}</td>
                                                    <td className="px-4 py-2.5 text-slate-700">{data.quantity.toLocaleString()}</td>
                                                    <td className="px-4 py-2.5 font-medium text-slate-800">
                                                        ₦{data.value.toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                                Values use each movement&apos;s recorded unit cost — historical figures won&apos;t change if item prices are edited later.
                            </p>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

interface ReportStatProps {
    label: string;
    value: string;
    icon?: typeof TrendingUp;
    tone?: "positive" | "negative";
}

function ReportStat({ label, value, icon: Icon, tone }: Readonly<ReportStatProps>) {
    return (
        <div className="rounded-xl border border-slate-100 bg-pry-clr p-3 shadow-sm">
            <p className="mb-1 text-xs text-slate-400">{label}</p>
            <div className="flex items-center gap-1.5">
                {Icon && (
                    <Icon className={`h-3.5 w-3.5 ${tone === "negative" ? "text-red-500" : "text-acc-clr"}`} />
                )}
                <p className={`text-lg font-semibold ${tone === "negative" ? "text-red-600" : "text-slate-800"}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}