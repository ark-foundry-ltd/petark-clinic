// components/clinic/usage-addon.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import UsagePill from "@/components/clinic/usage-pill";
import AddonBuyModal from "@/components/clinic/addon-buy-modal";
import { useResourceUsage } from "@/hooks/useResourceUsage";
import type { AddonResource } from "@/lib/addons";

interface UsageAddonProps {
    resource: AddonResource;
    label: string;
    // Bump to refetch usage (e.g. after the clinic creates something)
    refreshKey?: number;
    // Fraction of the limit at which "Buy more" appears. 0.75 by default
    // (matches the backend warning notification). Use 0 for an always-visible
    // tiny link.
    showAt?: number;
    // false = render only the "Buy more" link (no pill, no "Limit reached"
    // label). For places that already show their own usage numbers.
    showPill?: boolean;
    className?: string;
}

export default function UsageAddon({
    resource,
    label,
    refreshKey = 0,
    showAt = 0.75,
    showPill = true,
    className = "",
}: Readonly<UsageAddonProps>) {
    const usage = useResourceUsage(resource, refreshKey);
    const [open, setOpen] = useState(false);

    if (!usage) return null;

    // The plan doesn't include this at all (e.g. inventory on Free), so an
    // add-on can't be bought; the clinic needs to upgrade first.
    if (!usage.unlimited && usage.baseLimit === 0) {
        if (!showPill) return null;
        return (
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
                <span className="text-xs text-gray-400 sec-ff">
                    {label}: not included in your plan
                </span>
                <Link
                    href="/dashboard/profile/upgrade"
                    className="text-xs font-semibold text-acc-clr hover:underline sec-ff"
                >
                    Upgrade
                </Link>
            </div>
        );
    }

    const pct = !usage.unlimited && usage.limit > 0 ? usage.count / usage.limit : 0;
    const atLimit = !usage.unlimited && usage.count >= usage.limit;
    const showBuy = usage.addonEligible && pct >= showAt;

    return (
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
            {showPill && (
                <UsagePill
                    label={label}
                    count={usage.count}
                    limit={usage.limit}
                    unlimited={usage.unlimited}
                />
            )}

            {showPill && atLimit && (
                <span className="text-xs font-medium text-red-600 sec-ff">Limit reached</span>
            )}

            {showBuy && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={`text-xs font-semibold hover:underline sec-ff ${
                        atLimit ? "text-red-600" : "text-acc-clr"
                    }`}
                >
                    Buy more
                </button>
            )}

            {open && <AddonBuyModal resource={resource} onClose={() => setOpen(false)} />}
        </div>
    );
}