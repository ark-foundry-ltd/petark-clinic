// components/referrals/referral-analytics-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { getReferralWidget, type ReferralWidgetData } from "@/lib/analytics";

export default function ReferralAnalyticsWidget() {
    const [data, setData] = useState<ReferralWidgetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getReferralWidget()
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
            <div className="rounded-xl border border-gray-200 p-4">
                <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="rounded-xl border border-gray-200 p-4 bg-pry-clr">
            <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 pry-ff">Referral Activity</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Incoming</p>
                    <p className="text-lg font-semibold text-gray-900">{data.incoming.total}</p>
                    <p className="text-[11px] text-gray-400">{data.incoming.acceptanceRate}% accepted</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 mb-1">Outgoing</p>
                    <p className="text-lg font-semibold text-gray-900">{data.outgoing.total}</p>
                    <p className="text-[11px] text-gray-400">{data.outgoing.acceptanceRate}% accepted</p>
                </div>
            </div>
        </div>
    );
}