// components/inventory/update-item-modal.tsx
"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { InventoryItemRecord, UpdateInventoryItemPayload } from "@/lib/inventory";
import { updateInventoryItem } from "@/lib/inventory";
import { CATEGORY_LABELS } from "@/components/inventory/filter-bar";
import HelpTooltip from "@/components/inventory/help-tooltip";
import AdjustStock from "@/components/inventory/adjust-stock";

const MAX_IMAGES = 2;

interface UpdateItemModalProps {
    item: InventoryItemRecord | null;
    locationId: string;
    open: boolean;
    onClose: () => void;
    onUpdated: (item: InventoryItemRecord) => void;
    onStockAdjusted: (item: InventoryItemRecord) => void;
}

interface FormState {
    name: string;
    category: InventoryItemRecord["category"] | "";
    unit: string;
    costPrice: string;
    sellingPrice: string;
    reorderThreshold: string;
    requiresBatchTracking: boolean;
    isActive: boolean;
    newImages: File[];
    removeImagePublicIds: string[];
}

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).filter(
    ([value]) => value !== "all"
) as [InventoryItemRecord["category"], string][];

function toFormState(item: InventoryItemRecord): FormState {
    return {
        name: item.name,
        category: item.category,
        unit: item.unit,
        costPrice: item.costPrice === undefined ? "" : String(item.costPrice),
        sellingPrice: String(item.sellingPrice),
        reorderThreshold:
            item.reorderThreshold === null || item.reorderThreshold === undefined
                ? ""
                : String(item.reorderThreshold),
        requiresBatchTracking: item.requiresBatchTracking,
        isActive: item.isActive,
        newImages: [],
        removeImagePublicIds: [],
    };
}

export default function UpdateItemModal({
    item,
    locationId,
    open,
    onClose,
    onUpdated,
    onStockAdjusted,
}: Readonly<UpdateItemModalProps>) {
    const [form, setForm] = useState<FormState>(() =>
        item ? toFormState(item) : {
            name: "", category: "", unit: "", costPrice: "",
            sellingPrice: "", reorderThreshold: "", requiresBatchTracking: false,
            isActive: true, newImages: [], removeImagePublicIds: [],
        }
    );
    const [stockDisplay, setStockDisplay] = useState(item?.currentStock ?? 0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open || !item) return null;

    const selectedItem = item;
    const selectedItemImages = selectedItem.images ?? [];
    const keptExistingCount = selectedItemImages.length - form.removeImagePublicIds.length;
    const remainingSlots = Math.max(0, MAX_IMAGES - keptExistingCount);

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function handleClose() {
        if (submitting) return;
        setError(null);
        onClose();
    }

    function toggleImageRemoval(publicId: string) {
        setForm((current) => {
            const removeImagePublicIds = current.removeImagePublicIds.includes(publicId)
                ? current.removeImagePublicIds.filter((id) => id !== publicId)
                : [...current.removeImagePublicIds, publicId];
            return { ...current, removeImagePublicIds };
        });
        setError(null);
    }

    function handleNewImagesSelected(files: File[]) {
        setError(null);
        if (files.length > remainingSlots) {
            setError(
                remainingSlots === 0
                    ? "This item already has the maximum of 2 images. Remove one first to add a new one."
                    : `Only ${remainingSlots} slot(s) left — remove an existing image, or select fewer files.`
            );
            update("newImages", files.slice(0, remainingSlots));
            return;
        }
        update("newImages", files);
    }

    function handleStockAdjusted(newCurrentStock: number) {
        setStockDisplay(newCurrentStock);
        onStockAdjusted({ ...selectedItem, currentStock: newCurrentStock, updatedAt: new Date().toISOString() });
    }

    async function handleSubmit(e: { preventDefault: () => void }) {
        e.preventDefault();
        setError(null);

        if (!/^[0-9a-fA-F]{24}$/.test(selectedItem._id)) {
            setError("Invalid item ID format. Please refresh and try again.");
            return;
        }
        if (!form.name.trim() || !form.category || !form.unit.trim()) {
            setError("Name, category, and unit are required.");
            return;
        }
        const sellingPrice = Number(form.sellingPrice);
        if (form.sellingPrice === "" || Number.isNaN(sellingPrice) || sellingPrice < 0) {
            setError("Selling price is required and can't be negative.");
            return;
        }
        let costPrice: number | undefined;
        if (form.costPrice !== "") {
            costPrice = Number(form.costPrice);
            if (Number.isNaN(costPrice) || costPrice < 0) {
                setError("Cost price can't be negative.");
                return;
            }
        }
        let reorderThreshold: number | undefined;
        if (form.reorderThreshold !== "") {
            reorderThreshold = Number(form.reorderThreshold);
            if (Number.isNaN(reorderThreshold) || reorderThreshold < 0) {
                setError("Reorder threshold can't be negative.");
                return;
            }
        }
        if (keptExistingCount + form.newImages.length > MAX_IMAGES) {
            setError(
                `Max ${MAX_IMAGES} images total — you're keeping ${keptExistingCount} existing and adding ${form.newImages.length} new.`
            );
            return;
        }

        const payload: UpdateInventoryItemPayload = {};
        if (form.name.trim() !== selectedItem.name) payload.name = form.name.trim();
        if (form.category !== selectedItem.category) payload.category = form.category;
        if (form.unit.trim() !== selectedItem.unit) payload.unit = form.unit.trim();
        if (sellingPrice !== selectedItem.sellingPrice) payload.sellingPrice = sellingPrice;
        if (costPrice !== selectedItem.costPrice) payload.costPrice = costPrice;
        if (reorderThreshold !== (selectedItem.reorderThreshold ?? undefined)) {
            payload.reorderThreshold = reorderThreshold;
        }
        if (form.requiresBatchTracking !== selectedItem.requiresBatchTracking) {
            payload.requiresBatchTracking = form.requiresBatchTracking;
        }
        if (form.isActive !== selectedItem.isActive) payload.isActive = form.isActive;
        if (form.newImages.length) payload.newImages = form.newImages;
        if (form.removeImagePublicIds.length) payload.removeImagePublicIds = form.removeImagePublicIds;

        if (Object.keys(payload).length === 0) {
            setError("No changes to save.");
            return;
        }

        setSubmitting(true);
        try {
            const updatedItem = await updateInventoryItem(selectedItem._id, payload);
            onUpdated(updatedItem);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't update this item. Please try again.");
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 pb-20 sm:items-center sm:p-4 sm:pb-4">
            <div className="flex max-h-[80vh] w-full flex-col rounded-t-2xl bg-pry-clr shadow-lg sm:max-h-[85vh] sm:max-w-2xl sm:rounded-xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Edit inventory item</h2>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Update the item that belongs to this inventory record.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={handleClose}
                        disabled={submitting}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
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
                                    disabled={submitting}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
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
                                    onChange={(e) => update("category", e.target.value as FormState["category"])}
                                    disabled={submitting}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                                >
                                    <option value="" disabled>Select category</option>
                                    {CATEGORY_OPTIONS.map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-slate-500">Current stock</span>
                                    <HelpTooltip
                                        label="Why is this read-only?"
                                        text="Stock changes go through 'Adjust stock' below so there's always a record of what happened and why."
                                    />
                                </div>
                                <div className="flex h-[38px] items-center rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                                    {stockDisplay} {form.unit || selectedItem.unit}
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <label htmlFor="item-unit" className="text-xs font-medium text-slate-500">Unit</label>
                                    <HelpTooltip label="What is unit?" text="What you're counting, e.g. tablets, vial, box, ml." />
                                </div>
                                <input
                                    id="item-unit"
                                    type="text"
                                    value={form.unit}
                                    onChange={(e) => update("unit", e.target.value)}
                                    disabled={submitting}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                                    placeholder="e.g. vial, box, tablet"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <AdjustStock
                                    itemId={selectedItem._id}
                                    locationId={locationId}
                                    currentStock={stockDisplay}
                                    unit={form.unit || selectedItem.unit}
                                    disabled={submitting}
                                    onAdjusted={handleStockAdjusted}
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
                                    disabled={submitting}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
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
                                    disabled={submitting}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center gap-1.5">
                                    <label htmlFor="item-reorder" className="text-xs font-medium text-slate-500">
                                        Reorder threshold <span className="text-slate-300">(optional)</span>
                                    </label>
                                    <HelpTooltip label="What is reorder threshold?" text="When stock falls to this number or below, the item is flagged low stock on the dashboard." />
                                </div>
                                <input
                                    id="item-reorder"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.reorderThreshold}
                                    onChange={(e) => update("reorderThreshold", e.target.value)}
                                    disabled={submitting}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                                    placeholder="Alert when stock falls to this"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 pt-6 sm:col-span-2">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.requiresBatchTracking}
                                        onChange={(e) => update("requiresBatchTracking", e.target.checked)}
                                        disabled={submitting}
                                        className="h-4 w-4 rounded border-slate-300 text-acc-clr focus:ring-acc-clr disabled:opacity-60"
                                    />
                                    <span>Track by batch / expiry</span>
                                </label>
                                <HelpTooltip label="What is track by batch / expiry?" text="Turn this on for items with expiry dates, like meds and vaccines." />
                            </div>

                            <div className="flex items-center gap-1.5 sm:col-span-2">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => update("isActive", e.target.checked)}
                                        disabled={submitting}
                                        className="h-4 w-4 rounded border-slate-300 text-acc-clr focus:ring-acc-clr disabled:opacity-60"
                                    />
                                    <span>Active in inventory</span>
                                </label>
                            </div>

                            <div className="sm:col-span-2">
                                <div className="mb-2 flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-slate-500">Existing images</span>
                                    <HelpTooltip label="Image removal" text="Click an image to mark it for removal. Click it again to keep it. Removal only happens once you save." />
                                </div>
                                {selectedItemImages.length === 0 ? (
                                    <p className="text-sm text-slate-400">No images are attached to this item.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {selectedItemImages.map((image) => {
                                            const markedForRemoval = form.removeImagePublicIds.includes(image.publicId);
                                            return (
                                                <button
                                                    key={image.publicId}
                                                    type="button"
                                                    onClick={() => toggleImageRemoval(image.publicId)}
                                                    disabled={submitting}
                                                    aria-pressed={markedForRemoval}
                                                    className={`group overflow-hidden rounded-lg border p-1 text-left transition ${
                                                        markedForRemoval ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
                                                    } ${submitting ? "cursor-not-allowed opacity-60" : ""}`}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={image.url}
                                                        alt=""
                                                        className={`h-24 w-full rounded-md object-cover ${markedForRemoval ? "opacity-50" : ""}`}
                                                    />
                                                    <div className={`mt-2 px-1 pb-1 text-xs font-medium ${markedForRemoval ? "text-red-500" : "text-slate-500"}`}>
                                                        {markedForRemoval ? "Will be removed — click to undo" : "Click to remove"}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="item-images" className="mb-1 block text-xs font-medium text-slate-500">
                                    Add new images <span className="text-slate-300">(optional)</span>
                                </label>
                                <input
                                    id="item-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    disabled={submitting || remainingSlots === 0}
                                    onChange={(e) => handleNewImagesSelected(Array.from(e.target.files ?? []))}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-60"
                                />
                                <div className="mt-2 text-xs text-slate-400">
                                    {remainingSlots === 0
                                        ? "Image limit reached — remove an existing image above to add a new one."
                                        : `${remainingSlots} of ${MAX_IMAGES} slot(s) available`}
                                    {form.newImages.length > 0 && ` · ${form.newImages.length} file(s) selected`}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-lg bg-acc-clr px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}