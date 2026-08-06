// components/inventory/adjust-stock.tsx
"use client";

import { useState } from "react";
import { Loader2, Plus, Minus } from "lucide-react";
import { adjustStock, type StockAdjustmentType } from "@/lib/inventory";
import HelpTooltip from "@/components/inventory/help-tooltip";

interface AdjustStockProps {
    itemId: string;
    currentStock: number;
    unit: string;
    disabled?: boolean;
    // Called after a successful adjustment with the new stock total —
    // computed client-side (endpoint only returns a status message, not the item).
    onAdjusted: (newCurrentStock: number) => void;
}

const TYPE_LABELS: Record<StockAdjustmentType, string> = {
    purchase: "Purchase / restock",
    adjustment: "Correction",
    wastage: "Wastage",
    expiry: "Expired",
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS) as [StockAdjustmentType, string][];

export default function AdjustStock({
    itemId,
    currentStock,
    unit,
    disabled,
    onAdjusted,
}: Readonly<AdjustStockProps>) {
    const [direction, setDirection] = useState<"add" | "remove">("add");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<StockAdjustmentType>("adjustment");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleAdjust() {
        setError(null);

        const parsed = Number(amount);
        if (amount === "" || !Number.isInteger(parsed) || parsed <= 0) {
            setError("Enter a whole number greater than 0.");
            return;
        }

        const signedQuantity = direction === "add" ? parsed : -parsed;
        const projected = currentStock + signedQuantity;

        if (projected < 0) {
            setError(`Can't remove ${parsed} — only ${currentStock} ${unit} in stock.`);
            return;
        }

        setSubmitting(true);
        try {
            await adjustStock(itemId, {
                quantity: signedQuantity,
                type,
                note: note.trim() || undefined,
            });
            onAdjusted(projected);
            setAmount("");
            setNote("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't adjust stock. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-2 flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500">Adjust stock</span>
                <HelpTooltip
                    label="Why can't I just type a new stock number?"
                    text="Every stock change needs a reason so there's a record of what happened — restocks, corrections, wastage, and expiries all get logged."
                />
            </div>

            {error && (
                <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-end gap-2">
                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setDirection("add")}
                        disabled={disabled || submitting}
                        aria-pressed={direction === "add"}
                        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition ${
                            direction === "add" ? "bg-acc-clr text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                    <button
                        type="button"
                        onClick={() => setDirection("remove")}
                        disabled={disabled || submitting}
                        aria-pressed={direction === "remove"}
                        className={`flex items-center gap-1 border-l border-slate-200 px-3 py-2 text-sm font-medium transition ${
                            direction === "remove" ? "bg-red-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                        <Minus className="h-3.5 w-3.5" /> Remove
                    </button>
                </div>

                <div className="w-24">
                    <label htmlFor="adjust-amount" className="sr-only">Amount</label>
                    <input
                        id="adjust-amount"
                        type="number"
                        min="1"
                        step="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={disabled || submitting}
                        placeholder={unit}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                    />
                </div>

                <div className="min-w-[9.5rem] flex-1">
                    <label htmlFor="adjust-type" className="sr-only">Reason</label>
                    <select
                        id="adjust-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as StockAdjustmentType)}
                        disabled={disabled || submitting}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                    >
                        {TYPE_OPTIONS.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    onClick={handleAdjust}
                    disabled={disabled || submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-acc-clr px-3 py-2 text-sm font-medium text-pry-clr hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Apply
                </button>
            </div>

            <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={disabled || submitting}
                placeholder="Note (optional)"
                className="mt-2 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
            />
        </div>
    );
}