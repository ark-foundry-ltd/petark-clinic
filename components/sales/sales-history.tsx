// components/sales/sales-history.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { listSales, voidSale, type SaleRecord, type PaymentMethod, type SaleStatus } from "@/lib/sales";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    cash: "Cash",
    transfer: "Transfer",
    pos_card: "POS / Card",
};

const STATUS_STYLES: Record<SaleStatus, string> = {
    paid: "bg-green-50 text-green-700 border-green-100",
    voided: "bg-red-50 text-red-700 border-red-100",
};

interface SalesHistoryProps {
    locationId: string;
    canVoid?: boolean;
}

export default function SalesHistory({ locationId, canVoid = true }: Readonly<SalesHistoryProps>) {
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const [status, setStatus] = useState<SaleStatus | "all">("all");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "all">("all");

    const [voidingId, setVoidingId] = useState<string | null>(null);
    const [voidReason, setVoidReason] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError(null);
        listSales({
            locationId,
            status: status === "all" ? undefined : status,
            paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
        })
            .then((data) => {
                if (cancelled) return;
                setSales(data);
            })
            .catch(() => {
                if (cancelled) return;
                setLoadError("Couldn't load sales history.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [locationId, status, paymentMethod, reloadToken]);

    async function handleVoid(saleId: string) {
        if (!voidReason.trim()) {
            toast.error("Enter a reason to void this sale.");
            return;
        }
        setVoidingId(saleId);
        try {
            await voidSale(saleId, { reason: voidReason.trim() });
            toast.success("Sale voided — stock restored.");
            setVoidReason("");
            setReloadToken((t) => t + 1);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't void this sale.");
        } finally {
            setVoidingId(null);
        }
    }

    const colCount = canVoid ? 6 : 5;

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SaleStatus | "all")}
                    className="rounded-lg border border-slate-200 bg-pry-clr px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-acc-clr"
                >
                    <option value="all">All statuses</option>
                    <option value="paid">Paid</option>
                    <option value="voided">Voided</option>
                </select>

                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | "all")}
                    className="rounded-lg border border-slate-200 bg-pry-clr px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-acc-clr"
                >
                    <option value="all">All payment methods</option>
                    {(Object.entries(PAYMENT_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Items</th>
                            <th className="px-4 py-3 font-medium">Total</th>
                            <th className="px-4 py-3 font-medium">Payment</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            {canVoid && <th className="px-4 py-3 font-medium">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-8 text-center text-slate-400">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-acc-clr" />
                                </td>
                            </tr>
                        )}

                        {!loading && loadError && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-8 text-center text-red-500">
                                    {loadError}
                                </td>
                            </tr>
                        )}

                        {!loading && !loadError && sales.length === 0 && (
                            <tr>
                                <td colSpan={colCount} className="px-4 py-8 text-center text-slate-400">
                                    No sales yet at this location.
                                </td>
                            </tr>
                        )}

                        {!loading && !loadError && sales.map((sale) => (
                            <tr key={sale._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                                <td className="px-4 py-3 text-slate-600">
                                    {new Date(sale.createdAt).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {sale.items.length} item{sale.items.length === 1 ? "" : "s"}
                                    <div className="text-xs text-slate-400 truncate max-w-[220px]">
                                        {sale.items.map((i) => i.name).join(", ")}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    ₦{sale.totalAmount.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {PAYMENT_LABELS[sale.paymentMethod]}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[sale.status]}`}>
                                        {sale.status === "paid" ? "Paid" : "Voided"}
                                    </span>
                                    {sale.status === "voided" && sale.voidReason && (
                                        <div className="mt-1 text-xs text-slate-400">{sale.voidReason}</div>
                                    )}
                                </td>
                                {canVoid && (
                                    <td className="px-4 py-3">
                                        {sale.status === "paid" && (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    placeholder="Void reason"
                                                    value={voidingId === sale._id ? voidReason : ""}
                                                    onChange={(e) => {
                                                        setVoidingId(sale._id);
                                                        setVoidReason(e.target.value);
                                                    }}
                                                    className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleVoid(sale._id)}
                                                    disabled={voidingId === sale._id && voidReason === ""}
                                                    className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Void
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}