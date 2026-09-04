// components/inventory/inventory-table.tsx

import { ChevronLeft, ChevronRight, Pencil, Loader2 } from "lucide-react";
import type { InventoryItemRecord } from "@/lib/inventory";
import { CATEGORY_LABELS } from "@/components/inventory/filter-bar";

interface InventoryTableProps {
    items: InventoryItemRecord[];
    loading: boolean;
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onEditItem: (item: InventoryItemRecord) => void;
    canManage?: boolean;
}

export default function InventoryTable({
    items,
    loading,
    page,
    pageSize,
    totalCount,
    onPageChange,
    onEditItem,
    canManage = true,
}: Readonly<InventoryTableProps>) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const colCount = canManage ? 7 : 6;

    return (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-pry-clr shadow-sm">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3 font-medium">Thumbnail</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Unit</th>
                        <th className="px-4 py-3 font-medium">Current Stock</th>
                        <th className="px-4 py-3 font-medium">Selling Price</th>
                        {canManage && <th className="px-4 py-3 font-medium">Actions</th>}
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

                    {!loading && items.length === 0 && (
                        <tr>
                            <td colSpan={colCount} className="px-4 py-8 text-center text-slate-400">
                                No items match your search.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        items.map((item) => {
                            const isLow =
                                item.reorderThreshold != null &&
                                item.currentStock <= item.reorderThreshold;
                            const stockPct = item.reorderThreshold
                                ? Math.min(100, (item.currentStock / (item.reorderThreshold * 3 || 1)) * 100)
                                : 100;

                            return (
                                <tr
                                    key={item._id}
                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                                >
                                    <td className="px-4 py-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                                            {item.images?.[0] && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.images[0].url}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-800">{item.name}</div>
                                        <div className="text-xs text-slate-400">SKU: {item.sku}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                            {CATEGORY_LABELS[item.category]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-medium ${
                                                    isLow ? "text-red-500" : "text-slate-700"
                                                }`}
                                            >
                                                {item.currentStock} {item.unit}
                                            </span>
                                            {isLow && (
                                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                                                    LOW STOCK
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${
                                                    isLow ? "bg-amber-400" : "bg-acc-clr"
                                                }`}
                                                style={{ width: `${stockPct}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-700">
                                        ₦{item.sellingPrice.toFixed(2)}
                                    </td>
                                    {canManage && (
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                aria-label={`Edit ${item.name}`}
                                                onClick={() => onEditItem(item)}
                                                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                <span>
                    Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalCount)} of {totalCount} entries
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        aria-label="Previous page"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="rounded-md bg-acc-clr px-2.5 py-1 text-xs font-medium text-pry-clr">
                        {page}
                    </span>
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        aria-label="Next page"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}