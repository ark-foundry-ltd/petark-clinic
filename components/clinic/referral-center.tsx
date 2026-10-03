// components/clinic/referral-center.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Copy, Gift, Users, Wallet } from "lucide-react";
import {
    getMyCredit,
    getMyReferrals,
    getReferralCode,
    type GrowthReferralStatus,
    type MyCredit,
    type MyReferrals,
    type ReferralCode,
} from "@/lib/growth-referral";

// Set NEXT_PUBLIC_APP_URL (e.g. https://app.usepetark.com) in .env.local and
// in Vercel. If it's missing, the current domain is used instead.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

// Builds the absolute signup link for a referral code
function buildReferralLink(code: string): string {
    const origin = APP_URL || window.location.origin;
    return `${origin}/signup?ref=${code}`;
}

const STATUS_META: Record<GrowthReferralStatus, { label: string; className: string }> = {
    signed_up: { label: "Signed up", className: "bg-slate-100 text-slate-600" },
    converted: { label: "Subscribed", className: "bg-blue-50 text-blue-700" },
    rewarded: { label: "Reward earned", className: "bg-green-50 text-green-700" },
    rejected: { label: "Not eligible", className: "bg-red-50 text-red-600" },
};

function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString("en-NG")}`;
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function StatCard({
    icon: Icon,
    label,
    value,
    loading,
}: Readonly<{ icon: typeof Users; label: string; value: string; loading: boolean }>) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-pry-clr p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon className="h-4 w-4 text-acc-clr" />
                {label}
            </div>
            {loading ? (
                <div className="mt-3 h-7 w-20 animate-pulse rounded bg-slate-100" />
            ) : (
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            )}
        </div>
    );
}

export default function ReferralCenter() {
    const [code, setCode] = useState<ReferralCode | null>(null);
    const [referrals, setReferrals] = useState<MyReferrals | null>(null);
    const [credit, setCredit] = useState<MyCredit | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<"code" | "link" | null>(null);
    const loading = !code && !error;

    // `code` is only set after the data loads in the browser, so using
    // window.location inside buildReferralLink is safe here.
    const shareLink = code ? buildReferralLink(code.code) : "";

    useEffect(() => {
        let cancelled = false;

        Promise.all([getReferralCode(), getMyReferrals(), getMyCredit()])
            .then(([c, r, cr]) => {
                if (cancelled) return;
                setCode(c);
                setReferrals(r);
                setCredit(cr);
            })
            .catch(() => {
                if (cancelled) return;
                setError("We couldn't load your referral details. Please refresh the page.");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function copy(text: string, which: "code" | "link") {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(which);
            toast.success(which === "code" ? "Referral code copied" : "Referral link copied");
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast.error("Couldn't copy. Please copy it manually.");
        }
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 pry-ff">
            <div className="mb-8">
                <span className="mb-3 inline-block rounded-full bg-acc-clr/10 px-3 py-1 text-xs font-medium text-acc-clr">
                    Refer &amp; Earn
                </span>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Earn {formatNaira(5000)} for every clinic you bring to PetArk
                </h1>
                <p className="sec-ff mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                    Share your link. When a clinic signs up with it and subscribes to a paid
                    plan, {formatNaira(5000)} is added to your credit balance. Credit covers up
                    to half of any subscription payment, and what is left carries over to your
                    next payment.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-8 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            {/* Link + code */}
            <section className="mb-6 rounded-2xl border border-slate-100 bg-pry-clr p-5 shadow-sm sm:p-6">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Your referral link</p>
                        {loading ? (
                            <div className="mt-2 h-10 animate-pulse rounded-lg bg-slate-100" />
                        ) : (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    readOnly
                                    value={shareLink}
                                    onFocus={(e) => e.currentTarget.select()}
                                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-acc-clr"
                                />
                                <button
                                    type="button"
                                    onClick={() => shareLink && copy(shareLink, "link")}
                                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-acc-clr px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    {copied === "link" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {copied === "link" ? "Copied" : "Copy link"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-500">Your code</p>
                        {loading ? (
                            <div className="mt-2 h-10 w-40 animate-pulse rounded-lg bg-slate-100" />
                        ) : (
                            <button
                                type="button"
                                onClick={() => code && copy(code.code, "code")}
                                className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-acc-clr/50 bg-acc-clr/5 px-4 py-2.5 text-sm font-bold tracking-widest text-acc-clr hover:bg-acc-clr/10"
                            >
                                {code?.code}
                                {copied === "code" ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Clinics referred"
                    value={String(referrals?.stats.total ?? 0)}
                    loading={loading}
                />
                <StatCard
                    icon={Gift}
                    label="Subscribed"
                    value={String(referrals?.stats.converted ?? 0)}
                    loading={loading}
                />
                <StatCard
                    icon={Wallet}
                    label="Credit balance"
                    value={formatNaira(credit?.balance ?? 0)}
                    loading={loading}
                />
                <StatCard
                    icon={Wallet}
                    label="Credit used"
                    value={formatNaira(credit?.totalUsed ?? 0)}
                    loading={loading}
                />
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Referrals */}
                <section className="rounded-2xl border border-slate-100 bg-pry-clr p-5 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900">Clinics you referred</h2>
                    {loading ? (
                        <div className="mt-4 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                            ))}
                        </div>
                    ) : referrals && referrals.referrals.length > 0 ? (
                        <ul className="mt-4 divide-y divide-slate-100">
                            {referrals.referrals.map((r) => {
                                const meta = STATUS_META[r.status];
                                return (
                                    <li
                                        key={r.id}
                                        className="flex items-center justify-between gap-3 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-900">
                                                {r.clinicName ?? "A PetArk clinic"}
                                            </p>
                                            <p className="sec-ff text-xs text-slate-500">
                                                Joined {formatDate(r.createdAt)}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                                            >
                                                {meta.label}
                                            </span>
                                            {r.rewardNote && (
                                                <p className="sec-ff mt-1 text-xs text-green-700">
                                                    {r.rewardNote}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="sec-ff mt-4 text-sm text-slate-500">
                            No referrals yet. Share your link and they will show up here when a
                            clinic signs up with it.
                        </p>
                    )}
                </section>

                {/* Credit history */}
                <section className="rounded-2xl border border-slate-100 bg-pry-clr p-5 shadow-sm sm:p-6">
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-base font-semibold text-slate-900">Credit history</h2>
                        {credit && (
                            <span className="sec-ff text-xs text-slate-500">
                                Earned {formatNaira(credit.totalEarned)} in total
                            </span>
                        )}
                    </div>
                    {loading ? (
                        <div className="mt-4 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                            ))}
                        </div>
                    ) : credit && credit.history.length > 0 ? (
                        <ul className="mt-4 divide-y divide-slate-100">
                            {credit.history.map((h) => (
                                <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900">
                                            {h.type === "earned"
                                                ? "Referral reward"
                                                : `Applied to ${h.plan ?? "subscription"} plan`}
                                        </p>
                                        <p className="sec-ff text-xs text-slate-500">
                                            {formatDate(h.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 text-sm font-semibold ${
                                            h.type === "earned" ? "text-green-700" : "text-slate-700"
                                        }`}
                                    >
                                        {h.type === "earned" ? "+" : "−"}
                                        {formatNaira(h.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="sec-ff mt-4 text-sm text-slate-500">
                            Your earned and used credit will be listed here.
                        </p>
                    )}

                    {credit && credit.balance > 0 && (
                        <Link
                            href="/dashboard/profile/upgrade"
                            className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Use credit on a plan
                        </Link>
                    )}
                </section>
            </div>
        </div>
    );
}