// components/inventory/adjust-stock.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Minus, Pencil } from "lucide-react";
import {
    adjustStock,
    addItemToLocation,
    getInventoryItem,
    updateBatch,
    type InventoryBatch,
    type StockAdjustmentType,
} from "@/lib/inventory";
import HelpTooltip from "@/components/inventory/help-tooltip";
import BatchFields from "@/components/inventory/batch-fields";
import ExpiryBadge from "@/components/inventory/expiry-badge";
import { toast } from "sonner";

interface AdjustStockProps {
    itemId: string;
    locationId: string;
    currentStock: number;
    unit: string;
    hasStockAtLocation?: boolean;
    // Whether this item tracks batches (from the saved item, not an unsaved form toggle)
    requiresBatchTracking?: boolean;
    disabled?: boolean;
    // nearestExpiry is only passed for batch-tracked items, after batches were refreshed —
    // it lets the parent keep the table's Expiry column current.
    onAdjusted: (newCurrentStock: number, nearestExpiry?: string | null) => void;
}

const TYPE_LABELS: Record<StockAdjustmentType, string> = {
    purchase: "Purchase / restock",
    adjustment: "Correction",
    wastage: "Wastage",
    expiry: "Expired",
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS) as [StockAdjustmentType, string][];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-NG", { dateStyle: "medium", timeZone: "UTC" });
}

function batchLabel(batch: InventoryBatch, unit: string) {
    const lot = batch.batchNumber ? `Lot ${batch.batchNumber}` : "No lot no.";
    const exp = batch.expiryDate ? `exp ${formatDate(batch.expiryDate)}` : "no expiry";
    return `${lot} · ${exp} · ${batch.quantityRemaining} ${unit}`;
}

// Closest real expiry among the batches (ISO dates sort correctly as strings)
function nearestExpiryOf(batches: InventoryBatch[]): string | null {
    const dates = batches.map((b) => b.expiryDate).filter((d): d is string => !!d).sort();
    return dates[0] ?? null;
}

export default function AdjustStock({
    itemId,
    locationId,
    currentStock,
    unit,
    hasStockAtLocation = true,
    requiresBatchTracking = false,
    disabled,
    onAdjusted,
}: Readonly<AdjustStockProps>) {
    const [direction, setDirection] = useState<"add" | "remove">("add");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<StockAdjustmentType>("adjustment");
    const [unitCost, setUnitCost] = useState("");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Batch-tracked items
    const [expiryDate, setExpiryDate] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    const [batchId, setBatchId] = useState(""); // "" = earliest expiry first
    const [batches, setBatches] = useState<InventoryBatch[]>([]);

    // Editing one batch's expiry / lot (saves on its own — no need for the form's Save button)
    const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
    const [editExpiry, setEditExpiry] = useState("");
    const [editLot, setEditLot] = useState("");
    const [savingBatch, setSavingBatch] = useState(false);

    // First-time-at-this-location: an initial stock count, not an adjustment
    const [startingStock, setStartingStock] = useState("");

    const isPurchase = type === "purchase";
    const isBatchTracked = requiresBatchTracking;

    // Load the batches at this location
    useEffect(() => {
        if (!isBatchTracked || !hasStockAtLocation) return;
        let cancelled = false;
        getInventoryItem(itemId, locationId)
            .then((full) => {
                if (!cancelled) setBatches(full.batches ?? []);
            })
            .catch(() => {
                if (!cancelled) setBatches([]);
            });
        return () => {
            cancelled = true;
        };
    }, [itemId, locationId, isBatchTracked, hasStockAtLocation]);

    // Re-fetch after a change; returns the fresh list (or null if the fetch failed)
    async function refreshBatches(): Promise<InventoryBatch[] | null> {
        try {
            const full = await getInventoryItem(itemId, locationId);
            const fresh = full.batches ?? [];
            setBatches(fresh);
            return fresh;
        } catch {
            return null;
        }
    }

    function resetBatchInputs() {
        setExpiryDate("");
        setBatchNumber("");
        setBatchId("");
    }

    function handleTypeChange(next: StockAdjustmentType) {
        setType(next);
        setError(null);
        if (next === "purchase") setDirection("add");
        if (next !== "purchase") setUnitCost("");
    }

    function startEditBatch(b: InventoryBatch) {
        setError(null);
        setEditingBatchId(b._id);
        setEditExpiry(b.expiryDate ? b.expiryDate.slice(0, 10) : "");
        setEditLot(b.batchNumber ?? "");
    }

    function cancelEditBatch() {
        setEditingBatchId(null);
        setError(null);
    }

    async function handleSaveBatch() {
        if (!editingBatchId) return;
        setError(null);
        setSavingBatch(true);
        try {
            const { merged } = await updateBatch(itemId, editingBatchId, {
                expiryDate: editExpiry || null, // blank clears the expiry
                batchNumber: editLot.trim() || null,
            });
            setEditingBatchId(null);
            const fresh = await refreshBatches();
            // Total stock is unchanged — this just lets the parent refresh the Expiry column
            onAdjusted(currentStock, fresh ? nearestExpiryOf(fresh) : undefined);
            toast.success(
                merged
                    ? "Batches merged — they now share the same expiry date."
                    : "Batch updated."
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't update this batch. Please try again.");
        } finally {
            setSavingBatch(false);
        }
    }

    async function handleAddToLocation() {
        setError(null);
        const parsed = Number(startingStock);
        if (startingStock === "" || Number.isNaN(parsed) || parsed < 0) {
            setError("Enter a starting stock count of 0 or more.");
            return;
        }
        setSubmitting(true);
        try {
            await addItemToLocation(itemId, {
                locationId,
                initialStock: parsed,
                expiryDate: isBatchTracked && parsed > 0 && expiryDate ? expiryDate : undefined,
                batchNumber: isBatchTracked && parsed > 0 && batchNumber.trim() ? batchNumber.trim() : undefined,
            });
            const fresh = isBatchTracked ? await refreshBatches() : null;
            onAdjusted(parsed, fresh ? nearestExpiryOf(fresh) : undefined);
            setStartingStock("");
            resetBatchInputs();
            toast.success("Item is now stocked at this location.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't add this item here. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleAdjust() {
        setError(null);

        const parsed = Number(amount);
        if (amount === "" || !Number.isInteger(parsed) || parsed <= 0) {
            setError("Enter a whole number greater than 0.");
            return;
        }

        let parsedUnitCost: number | undefined;
        if (isPurchase) {
            parsedUnitCost = Number(unitCost);
            if (unitCost === "" || Number.isNaN(parsedUnitCost) || parsedUnitCost < 0) {
                setError("Enter the unit cost paid for this purchase.");
                return;
            }
        }

        const signedQuantity = direction === "add" ? parsed : -parsed;
        const projected = currentStock + signedQuantity;

        if (projected < 0) {
            setError(`Can't remove ${parsed} — only ${currentStock} ${unit} in stock.`);
            return;
        }

        const adding = direction === "add";
        const removing = direction === "remove";

        if (isBatchTracked && adding && expiryDate) {
            const today = new Date().toLocaleDateString("en-CA");
            if (expiryDate < today) {
                setError("Expiry date can't be in the past.");
                return;
            }
        }

        if (isBatchTracked && removing && batchId) {
            const chosen = batches.find((b) => b._id === batchId);
            if (chosen && parsed > chosen.quantityRemaining) {
                setError(`That batch only has ${chosen.quantityRemaining} ${unit}.`);
                return;
            }
        }

        setSubmitting(true);
        try {
            await adjustStock(itemId, {
                locationId,
                quantity: signedQuantity,
                type,
                note: note.trim() || undefined,
                unitCost: isPurchase ? parsedUnitCost : undefined,
                // New stock goes into the batch with this expiry (blank = the "no expiry" batch)
                expiryDate: isBatchTracked && adding && expiryDate ? expiryDate : undefined,
                batchNumber: isBatchTracked && adding && batchNumber.trim() ? batchNumber.trim() : undefined,
                // Removals take from the chosen batch, or earliest-expiry-first when none is chosen
                batchId: isBatchTracked && removing && batchId ? batchId : undefined,
            });
            const fresh = isBatchTracked ? await refreshBatches() : null;
            onAdjusted(projected, fresh ? nearestExpiryOf(fresh) : undefined);
            setAmount("");
            setUnitCost("");
            setNote("");
            resetBatchInputs();
            toast.success(`Stock ${direction === "add" ? "added" : "removed"} successfully.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't adjust stock. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!hasStockAtLocation) {
        return (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                <div className="mb-2 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-amber-700">
                        Not yet stocked at this location
                    </span>
                    <HelpTooltip
                        label="Why can't I adjust stock here?"
                        text="This item exists in your catalog, but has never been tracked at this branch. Set a starting count to begin tracking it here — after that, use the usual Add/Remove adjustments."
                    />
                </div>

                {error && (
                    <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-600">
                        {error}
                    </div>
                )}

                <div className="flex flex-wrap items-end gap-2">
                    <div className="w-28">
                        <label htmlFor="starting-stock" className="sr-only">Starting stock</label>
                        <input
                            id="starting-stock"
                            type="number"
                            min="0"
                            step="1"
                            value={startingStock}
                            onChange={(e) => setStartingStock(e.target.value)}
                            disabled={disabled || submitting}
                            placeholder={`0 ${unit}`}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToLocation}
                        disabled={disabled || submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Start Stocking Here
                    </button>
                </div>

                {isBatchTracked && (
                    <div className="mt-3">
                        <BatchFields
                            expiryDate={expiryDate}
                            batchNumber={batchNumber}
                            onExpiryDateChange={setExpiryDate}
                            onBatchNumberChange={setBatchNumber}
                            disabled={disabled || submitting}
                            hint="Applies to the starting stock above."
                        />
                    </div>
                )}
            </div>
        );
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

            {isBatchTracked && batches.length > 0 && (
                <div className="mb-3 rounded-md border border-slate-200 bg-white">
                    <p className="px-2.5 pt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Batches at this location
                    </p>
                    <ul className="divide-y divide-slate-100">
                        {batches.map((b) => (
                            <li key={b._id} className="px-2.5 py-1.5 text-xs">
                                {editingBatchId === b._id ? (
                                    <div className="space-y-2 py-1">
                                        <BatchFields
                                            expiryDate={editExpiry}
                                            batchNumber={editLot}
                                            onExpiryDateChange={setEditExpiry}
                                            onBatchNumberChange={setEditLot}
                                            disabled={savingBatch}
                                            allowPast
                                            hint="Fixing a date? If another batch here already has it, the two are merged. Clear it if the stock doesn't expire."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={cancelEditBatch}
                                                disabled={savingBatch}
                                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveBatch}
                                                disabled={savingBatch}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-acc-clr px-3 py-1.5 text-xs font-medium text-pry-clr hover:opacity-90 disabled:opacity-60"
                                            >
                                                {savingBatch && <Loader2 className="h-3 w-3 animate-spin" />}
                                                Save batch
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-slate-600">
                                            {b.batchNumber ? `Lot ${b.batchNumber}` : "No lot number"}
                                        </span>
                                        <ExpiryBadge expiry={b.expiryDate} />
                                        <span className="font-medium text-slate-700">
                                            {b.quantityRemaining} {unit}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Edit batch expiry and lot number"
                                            onClick={() => startEditBatch(b)}
                                            disabled={disabled || submitting || savingBatch}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

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
                        disabled={disabled || submitting || isPurchase}
                        aria-pressed={direction === "add"}
                        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition ${
                            direction === "add" ? "bg-acc-clr text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                        } disabled:cursor-not-allowed`}
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                    <button
                        type="button"
                        onClick={() => setDirection("remove")}
                        disabled={disabled || submitting || isPurchase}
                        aria-pressed={direction === "remove"}
                        className={`flex items-center gap-1 border-l border-slate-200 px-3 py-2 text-sm font-medium transition ${
                            direction === "remove" ? "bg-red-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                        } disabled:cursor-not-allowed`}
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
                        onChange={(e) => handleTypeChange(e.target.value as StockAdjustmentType)}
                        disabled={disabled || submitting}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                    >
                        {TYPE_OPTIONS.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                {isPurchase && (
                    <div className="w-32">
                        <label htmlFor="adjust-unit-cost" className="sr-only">Unit cost paid</label>
                        <input
                            id="adjust-unit-cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={unitCost}
                            onChange={(e) => setUnitCost(e.target.value)}
                            disabled={disabled || submitting}
                            placeholder="Unit cost"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                        />
                    </div>
                )}

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

            {isPurchase && (
                <p className="mt-1.5 text-[11px] text-slate-400">
                    Enter what you actually paid per {unit} {" "} for this restock — it&apos;s recorded against this purchase for expense reporting, separate from the item&apos;s listed cost price.
                </p>
            )}

            {/* Stock coming in on a batch-tracked item: which expiry / lot is it? */}
            {isBatchTracked && direction === "add" && (
                <div className="mt-3">
                    <BatchFields
                        expiryDate={expiryDate}
                        batchNumber={batchNumber}
                        onExpiryDateChange={setExpiryDate}
                        onBatchNumberChange={setBatchNumber}
                        disabled={disabled || submitting}
                        hint="Stock with the same expiry date joins the existing batch. Leave blank if it doesn't expire."
                    />
                </div>
            )}

            {/* Stock going out of a batch-tracked item: automatic, or from a specific batch */}
            {isBatchTracked && direction === "remove" && batches.length > 0 && (
                <div className="mt-3">
                    <label htmlFor="adjust-batch" className="mb-1 block text-xs font-medium text-slate-500">
                        Take from
                    </label>
                    <select
                        id="adjust-batch"
                        value={batchId}
                        onChange={(e) => setBatchId(e.target.value)}
                        disabled={disabled || submitting}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                    >
                        <option value="">Earliest expiry first (automatic)</option>
                        {batches.map((b) => (
                            <option key={b._id} value={b._id}>
                                {batchLabel(b, unit)}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-[11px] text-slate-400">
                        Writing off expired stock? Pick the expired batch so the right one is reduced.
                    </p>
                </div>
            )}

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