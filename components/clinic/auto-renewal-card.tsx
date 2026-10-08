// components/clinic/auto-renewal-card.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useDisableAutoRenew } from "@/hooks/use-subscription";
import type { SubscriptionRecord } from "@/lib/subscription";

interface AutoRenewalCardProps {
    subscription: SubscriptionRecord;
    // Called after auto-renewal was switched off on the server
    onTurnedOff: () => void;
    // Called when the clinic wants it ON: the parent ticks the checkout box and scrolls to it
    onRequestEnable: () => void;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AutoRenewalCard({
    subscription,
    onTurnedOff,
    onRequestEnable,
}: AutoRenewalCardProps) {
    const [confirming, setConfirming] = useState(false);
    const { disable, pending, error, clearError } = useDisableAutoRenew();

    // Only a paid, live subscription has anything to renew
    const eligible =
        subscription.plan !== "free" &&
        subscription.status === "active" &&
        !subscription.isTrial &&
        !!subscription.expiresAt;

    if (!eligible || !subscription.expiresAt) return null;

    const expiry = formatDate(subscription.expiresAt);
    const planLabel = capitalize(subscription.plan);
    const on = subscription.autoRenew;
    const failure = on ? subscription.renewal : null;

    async function handleConfirmOff() {
        const ok = await disable();
        if (ok) {
            setConfirming(false);
            onTurnedOff();
        }
    }

    return (
        <div className="mx-auto mb-8 max-w-xl rounded-xl border border-slate-200 bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <RefreshCw className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Auto-renewal:{" "}
                            <span className={on ? "text-green-700" : "text-slate-500"}>
                                {on ? "ON" : "OFF"}
                            </span>
                        </p>
                        <p className="sec-ff mt-1 text-xs leading-snug text-slate-500">
                            {on
                                ? `Your ${planLabel} plan renews automatically at the end of the period (${expiry}). Payment details are securely handled by Paystack.`
                                : `Your ${planLabel} plan expires on ${expiry}. Renew manually to keep your features, or turn on auto-renewal when you pay.`}
                        </p>
                    </div>
                </div>

                {on && !confirming && (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sec-ff"
                    >
                        Turn off
                    </button>
                )}

                {!on && (
                    <button
                        type="button"
                        onClick={onRequestEnable}
                        className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-pry-clr sec-ff transition hover:opacity-90"
                    >
                        Turn on
                    </button>
                )}
            </div>

            {!on && (
                <p className="sec-ff mt-3 text-xs leading-snug text-slate-400">
                    Turning it on takes you to checkout: choose your plan below with the
                    auto-renewal box ticked and pay by card.
                </p>
            )}

            {failure && (
                <div
                    role="status"
                    className="mt-3 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                        Your last renewal payment didn&apos;t go through
                        {failure.lastFailureReason ? ` (${failure.lastFailureReason})` : ""}. We&apos;ll
                        try again automatically (attempt {failure.failedAttempts} of{" "}
                        {failure.maxAttempts} failed).
                    </span>
                </div>
            )}

            {confirming && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-xs text-slate-700">
                        Turn off auto-renewal? You won&apos;t be charged again automatically, and
                        you&apos;ll need to renew manually before {expiry} to keep your plan.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={handleConfirmOff}
                            disabled={pending}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Turn off auto-renewal
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setConfirming(false);
                                clearError();
                            }}
                            disabled={pending}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            Keep it on
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p role="alert" className="mt-3 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}