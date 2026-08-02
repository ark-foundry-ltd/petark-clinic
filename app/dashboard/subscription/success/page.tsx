// app/dashboard/subscription/success/page.tsx

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    getSubscriptionStatus,
    type SubscriptionRecord,
} from "@/lib/subscription";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
    free: "Free",
    standard: "Standard",
    pro: "Pro",
    enterprise: "Enterprise",
};

function SubscriptionSuccessContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");

    const [subscription, setSubscription] = useState<SubscriptionRecord | null>(
        null
    );
    const [error, setError] = useState(false);
    const loading = subscription === null && !error;

    useEffect(() => {
        let cancelled = false;

        getSubscriptionStatus()
            .then((data) => {
                if (cancelled) return;
                setSubscription(data);
            })
            .catch(() => {
                if (cancelled) return;
                setError(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
            {loading && (
                <>
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-acc-clr" />
                    <p className="sec-ff text-sm text-slate-500">
                        Confirming your subscription...
                    </p>
                </>
            )}

            {!loading && error && (
                <>
                    <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
                    <h1 className="pry-ff mb-2 text-xl font-semibold text-slate-800">
                        Payment received, still confirming
                    </h1>
                    <p className="sec-ff mb-6 text-sm text-slate-500">
                        Your payment went through, but we couldn&apos;t confirm your plan
                        update just now. This usually resolves within a minute — refresh
                        this page, or contact support if it persists.
                        {reference && (
                            <span className="mt-2 block text-xs text-slate-400">
                                Reference: {reference}
                            </span>
                        )}
                    </p>
                    <Link
                        href="/dashboard"
                        className="rounded-lg bg-acc-clr px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                    >
                        Back to Dashboard
                    </Link>
                </>
            )}

            {!loading && !error && subscription && (
                <>
                    <CheckCircle2 className="mb-4 h-10 w-10 text-acc-clr" />
                    <h1 className="pry-ff mb-2 text-xl font-semibold text-slate-800">
                        You&apos;re on {PLAN_LABELS[subscription.plan] ?? subscription.plan}!
                    </h1>
                    <p className="sec-ff mb-6 text-sm text-slate-500">
                        Your subscription is active
                        {subscription.expiresAt &&
                            ` until ${new Date(subscription.expiresAt).toLocaleDateString(
                                undefined,
                                { dateStyle: "medium" }
                            )}`}
                        . All {PLAN_LABELS[subscription.plan] ?? subscription.plan} features
                        are now unlocked.
                    </p>
                    <Link
                        href="/dashboard"
                        className="rounded-lg bg-acc-clr px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 pry-ff"
                    >
                        Go to Dashboard
                    </Link>
                </>
            )}
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <Suspense fallback={null}>
            <SubscriptionSuccessContent />
        </Suspense>
    );
}