// components/inventory/add-item-modal.tsx
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import {
    createInventoryItem,
    type InventoryCategory,
    type CreateInventoryItemPayload,
} from "@/lib/inventory";
import { CATEGORY_LABELS } from "@/components/inventory/filter-bar";
import HelpTooltip from "@/components/inventory/help-tooltip";

interface AddItemModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).filter(
    ([value]) => value !== "all"
) as [InventoryCategory, string][];

interface FormState {
    name: string;
    category: InventoryCategory | "";
    unit: string;
    sku: string;
    currentStock: string;
    costPrice: string;
    sellingPrice: string;
    reorderThreshold: string;
    requiresBatchTracking: boolean;
}

const EMPTY_FORM: FormState = {
    name: "",
    category: "",
    unit: "",
    sku: "",
    currentStock: "",
    costPrice: "",
    sellingPrice: "",
    reorderThreshold: "",
    requiresBatchTracking: false,
};

export default function AddItemModal({
    open,
    onClose,
    onCreated,
}: Readonly<AddItemModalProps>) {
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    function reset() {
        setForm(EMPTY_FORM);
        setError(null);
        setSubmitting(false);
    }

    function handleClose() {
        if (submitting) return; // don't let a stray click drop an in-flight submit
        reset();
        onClose();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!form.name.trim() || !form.category || !form.unit.trim() || !form.sku.trim()) {
            setError("Name, category, unit, and SKU are required.");
            return;
        }

        const currentStock = Number(form.currentStock);
        if (form.currentStock === "" || Number.isNaN(currentStock) || currentStock < 0) {
            setError("Current stock is required and can't be negative.");
            return;
        }

        const sellingPrice = Number(form.sellingPrice);
        if (form.sellingPrice === "" || Number.isNaN(sellingPrice) || sellingPrice < 0) {
            setError("Selling price is required and can't be negative.");
            return;
        }

        const payload: CreateInventoryItemPayload = {
            name: form.name.trim(),
            category: form.category,
            unit: form.unit.trim(),
            sku: form.sku.trim(),
            currentStock,
            sellingPrice,
            requiresBatchTracking: form.requiresBatchTracking,
        };
        if (form.costPrice !== "") payload.costPrice = Number(form.costPrice);
        if (form.reorderThreshold !== "") {
            payload.reorderThreshold = Number(form.reorderThreshold);
        }

        setSubmitting(true);
        try {
            await createInventoryItem(payload);
            reset();
            onCreated();
            onClose();
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? (err.response?.data as { message?: string } | undefined)?.message
                    : undefined;
            setError(message || "Couldn't add this item. Try again.");
            setSubmitting(false);
        }
    }

    return (
        // items-end + pb-20 anchors the sheet to the bottom on mobile with room
        // left below it for a bottom nav bar; sm:items-center + sm:pb-4 restores
        // the normal centered dialog on wider screens.
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 pb-20 sm:items-center sm:p-4 sm:pb-4">
            <div className="flex max-h-[80vh] w-full flex-col rounded-t-2xl bg-pry-clr shadow-lg sm:max-h-[85vh] sm:max-w-lg sm:rounded-xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-slate-800">Add inventory item</h2>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={handleClose}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                        {error && (
                            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="item-name" className="mb-1 block text-xs font-medium text-slate-500">
                                    Name
                                </label>
                                <input
                                    id="item-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                    placeholder="e.g. Amoxicillin 250mg"
                                />
                            </div>

                            <div>
                                <label htmlFor="item-category" className="mb-1 block text-xs font-medium text-slate-500">
                                    Category
                                </label>
                                <select
                                    id="item-category"
                                    value={form.category}
                                    onChange={(e) => update("category", e.target.value as InventoryCategory)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                >
                                    <option value="" disabled>
                                        Select category
                                    </option>
                                    {CATEGORY_OPTIONS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <label htmlFor="item-current-stock" className="text-xs font-medium text-slate-500">
                                        Current stock
                                    </label>
                                    <HelpTooltip
                                        label="What is current stock?"
                                        text="How many you have right now, counted in the unit you set below — e.g. 40, with unit set to 'tablets' means 40 tablets."
                                    />
                                </div>
                                <input
                                    id="item-current-stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.currentStock}
                                    onChange={(e) => update("currentStock", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                    placeholder="e.g. 40"
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <label htmlFor="item-unit" className="text-xs font-medium text-slate-500">
                                        Unit
                                    </label>
                                    <HelpTooltip
                                        label="What is unit?"
                                        text="What you're counting — e.g. tablets, vial, box, ml. Combined with current stock above, e.g. '40 tablets'."
                                    />
                                </div>
                                <input
                                    id="item-unit"
                                    type="text"
                                    value={form.unit}
                                    onChange={(e) => update("unit", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                    placeholder="e.g. vial, box, tablet"
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <label htmlFor="item-sku" className="text-xs font-medium text-slate-500">
                                        SKU
                                    </label>
                                    <HelpTooltip
                                        label="What is SKU?"
                                        text="Your clinic's own code for this item, used to tell items apart and prevent duplicates. Must be unique within your clinic — you choose the format. eg. AMOX-250"
                                    />
                                </div>
                                <input
                                    id="item-sku"
                                    type="text"
                                    value={form.sku}
                                    onChange={(e) => update("sku", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                    placeholder="Unique per clinic"
                                />
                            </div>

                            <div>
                                <label htmlFor="item-selling-price" className="mb-1 block text-xs font-medium text-slate-500">
                                    Selling price
                                </label>
                                <input
                                    id="item-selling-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.sellingPrice}
                                    onChange={(e) => update("sellingPrice", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label htmlFor="item-cost-price" className="mb-1 block text-xs font-medium text-slate-500">
                                    Cost price <span className="text-slate-300">(optional)</span>
                                </label>
                                <input
                                    id="item-cost-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.costPrice}
                                    onChange={(e) => update("costPrice", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <label htmlFor="item-reorder" className="text-xs font-medium text-slate-500">
                                        Reorder threshold <span className="text-slate-300">(optional)</span>
                                    </label>
                                    <HelpTooltip
                                        label="What is reorder threshold?"
                                        text="When stock falls to this number or below, the item is flagged Low Stock on the dashboard. It's just an alert — it won't stop stock from going lower."
                                    />
                                </div>
                                <input
                                    id="item-reorder"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.reorderThreshold}
                                    onChange={(e) => update("reorderThreshold", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                    placeholder="Alert when stock falls to this"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 pt-6">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.requiresBatchTracking}
                                        onChange={(e) => update("requiresBatchTracking", e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-acc-clr focus:ring-acc-clr"
                                    />
                                    Track by batch / expiry
                                </label>
                                <HelpTooltip
                                    label="What is track by batch / expiry?"
                                    text="Turn this on for items with expiry dates, like meds and vaccines. Stock is tracked in separate batches, and the earliest-expiring batch is used first. Leave it off for a simple running count (bandages, gloves, etc.)."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-acc-clr px-4 py-2 text-sm font-medium text-pry-clr shadow-sm hover:bg-acc-clr disabled:opacity-60"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Add item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}