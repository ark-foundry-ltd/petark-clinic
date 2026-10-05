// components/inventory/expiry-badge.tsx
"use client";

const DAY_MS = 24 * 60 * 60 * 1000;
const WARN_DAYS = 30; // keep in step with INVENTORY_EXPIRY_LEAD_DAYS on the backend

export default function ExpiryBadge({ expiry }: Readonly<{ expiry?: string | null }>) {
    if (!expiry) {
        return (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-400">
                No expiry set
            </span>
        );
    }

    // Expiry dates are stored at UTC midnight, so compare against today's local date taken as UTC
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((new Date(expiry).getTime() - today) / DAY_MS);

    const dateStr = new Date(expiry).toLocaleDateString("en-NG", {
        dateStyle: "medium",
        timeZone: "UTC",
    });

    let tone = "bg-gray-100 text-gray-700";
    let label = dateStr;
    if (days < 0) {
        tone = "bg-red-50 text-red-700";
        label = `Expired ${dateStr}`;
    } else if (days <= WARN_DAYS) {
        tone = "bg-amber-50 text-amber-700";
        label = days === 0 ? "Expires today" : `${days}d left · ${dateStr}`;
    }

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${tone}`}>
            {label}
        </span>
    );
}