// components/dashboard/analytics-card.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { getAnalyticsOverview, type AnalyticsOverview } from "@/lib/analytics";

const TIER_LABELS: Record<string, string> = {
    starter: "Starter",
    standard: "Standard",
    pro: "Pro",
    enterprise: "Enterprise",
};

export default function AnalyticsCard() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getAnalyticsOverview()
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch(() => {
                if (!cancelled) setData(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 p-5">
                <Loader2 className="w-4 h-4 text-bg-acc animate-spin" />
            </div>
        );
    }

    const isFree = !data || data.tier === "free" || data.locked;

    if (isFree) {
        return (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 pry-ff">Clinic Analytics</h3>
                        <p className="text-sm text-gray-500 sec-ff mt-0.5">
                            Detailed clinic performance insights are available on Pro.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/profile/subscription")}
                            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            See what Pro unlocks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tierLabel = TIER_LABELS[data.tier] ?? data.tier;
    const isFullTier = data.tier === "pro" || data.tier === "enterprise";

    // Small preview number — revenue trend's latest point, if present
    const latestRevenue = data.revenueTrend?.[data.revenueTrend.length - 1]?.value;

    return (
        <div className="rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-acc-clr/10 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 text-acc-clr" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 pry-ff">Clinic Analytics</h3>
                        <p className="text-sm text-gray-500 sec-ff mt-0.5">
                            {isFullTier
                                ? "Track your clinic's performance, trends and activity."
                                : `Your ${tierLabel} plan includes revenue and appointment trends.`}
                        </p>
                        {latestRevenue !== undefined && (
                            <p className="text-xs text-gray-400 mt-1">
                                This month: ₦{latestRevenue.toLocaleString()} revenue
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => router.push("/dashboard/analytics")}
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-acc-clr hover:underline"
            >
                View Analytics
                <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {!isFullTier && (
                <p className="mt-2 text-xs text-gray-400 sec-ff">
                    Upgrade to Pro for staff performance and weekly visit breakdowns.
                </p>
            )}
        </div>
    );
}