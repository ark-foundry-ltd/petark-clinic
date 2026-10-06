// components/inventory/batch-fields.tsx
"use client";

import { useId } from "react";

interface BatchFieldsProps {
    expiryDate: string;
    batchNumber: string;
    onExpiryDateChange: (value: string) => void;
    onBatchNumberChange: (value: string) => void;
    disabled?: boolean;
    hint?: string;
    // Allow picking a date that has already passed (used when correcting an existing batch)
    allowPast?: boolean;
}

export default function BatchFields({
    expiryDate,
    batchNumber,
    onExpiryDateChange,
    onBatchNumberChange,
    disabled,
    hint,
    allowPast = false,
}: Readonly<BatchFieldsProps>) {
    const id = useId();
    // Local date as YYYY-MM-DD (toISOString would give the UTC date)
    const today = new Date().toLocaleDateString("en-CA");

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
                <label htmlFor={`${id}-expiry`} className="mb-1 block text-xs font-medium text-slate-500">
                    Expiry date <span className="text-slate-300">(recommended)</span>
                </label>
                <input
                    id={`${id}-expiry`}
                    type="date"
                    min={allowPast ? undefined : today}
                    value={expiryDate}
                    onChange={(e) => onExpiryDateChange(e.target.value)}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                    {hint ?? "We'll alert you before this stock expires. Leave blank if it doesn't expire."}
                </p>
            </div>
            <div>
                <label htmlFor={`${id}-lot`} className="mb-1 block text-xs font-medium text-slate-500">
                    Batch / lot number <span className="text-slate-300">(optional)</span>
                </label>
                <input
                    id={`${id}-lot`}
                    type="text"
                    value={batchNumber}
                    onChange={(e) => onBatchNumberChange(e.target.value)}
                    disabled={disabled}
                    placeholder="e.g. LOT-2291"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr disabled:opacity-60"
                />
            </div>
        </div>
    );
}