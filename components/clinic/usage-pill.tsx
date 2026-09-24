// components/clinic/usage-pill.tsx
"use client";

interface UsagePillProps {
    label: string;
    count: number;
    limit: number;
    unlimited: boolean;
}

export default function UsagePill({ label, count, limit, unlimited }: Readonly<UsagePillProps>) {
    if (unlimited) {
        return (
            <span className="text-xs text-gray-400 sec-ff">
                {label}: {count} used
            </span>
        );
    }

    const pct = limit > 0 ? (count / limit) * 100 : 0;
    const colorClass =
        pct >= 90 ? "text-red-600" : pct >= 75 ? "text-amber-600" : "text-gray-500";

    return (
        <span className={`text-xs sec-ff font-medium ${colorClass}`}>
            {label}: {count}/{limit}
        </span>
    );
}