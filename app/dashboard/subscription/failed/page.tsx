// app/dashboard/subscription/failed/page.tsx

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";

function SubscriptionFailedContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
            <XCircle className="mb-4 h-10 w-10 text-red-500" />
            <h1 className="pry-ff mb-2 text-xl font-semibold text-slate-800">
                Payment didn&apos;t go through
            </h1>
            <p className="sec-ff mb-6 text-sm text-slate-500">
                We couldn&apos;t confirm your payment. You haven&apos;t been charged for a
                plan you don&apos;t have — no changes were made to your subscription.
                {reference && (
                    <span className="mt-2 block text-xs text-slate-400">
                        Reference: {reference}
                    </span>
                )}
            </p>
            <div className="flex gap-3">
                <Link
                    href="/dashboard/upgrade"
                    className="rounded-lg bg-acc-clr px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 pry-ff"
                >
                    Try Again
                </Link>
                <Link
                    href="/dashboard"
                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 pry-ff"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default function SubscriptionFailedPage() {
    return (
        <Suspense fallback={null}>
            <SubscriptionFailedContent />
        </Suspense>
    );
}