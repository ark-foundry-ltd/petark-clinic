// components/inventory/batch-fields.tsx
"use client";

interface BatchFieldsProps {
    expiryDate: string;
    batchNumber: string;
    onExpiryDateChange: (value: string) => void;
    onBatchNumberChange: (value: string) => void;
}

export default function BatchFields({
    expiryDate,
    batchNumber,
    onExpiryDateChange,
    onBatchNumberChange,
}: Readonly<BatchFieldsProps>) {
    // Local date as YYYY-MM-DD (toISOString would give the UTC date)
    const today = new Date().toLocaleDateString("en-CA");

    return (
        <div className="grid gap-3 md:grid-cols-2">
            <div>
                <label className="block text-sm font-medium text-sec-clr mb-1">
                    Expiry date <span className="text-gray-400 font-normal">(recommended)</span>
                </label>
                <input
                    type="date"
                    min={today}
                    value={expiryDate}
                    onChange={(e) => onExpiryDateChange(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
                />
                <p className="text-xs text-gray-400 mt-1">
                    We&apos;ll alert you before this stock expires. Leave blank if it doesn&apos;t expire.
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-sec-clr mb-1">
                    Batch / lot number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                    value={batchNumber}
                    onChange={(e) => onBatchNumberChange(e.target.value)}
                    placeholder="e.g. LOT-2291"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
                />
            </div>
        </div>
    );
}