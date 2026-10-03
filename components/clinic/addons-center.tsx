// components/clinic/addons-center.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, Loader2, Minus, Plus, Stethoscope } from "lucide-react";
import {
    ADDON_PRICING,
    MAX_PACKS_PER_PURCHASE,
    getMyAddonPurchases,
    getUsageSummary,
    initiateAddonPurchase,
    type AddonPurchase,
    type AddonResource,
    type UsageSummary,
} from "@/lib/addons";

interface ResourceConfig {
    id: AddonResource;
    title: string;
    unit: string;
    blurb: string;
    icon: typeof Bell;
}

const RESOURCES: ResourceConfig[] = [
    {
        id: "treatments",
        title: "Treatments",
        unit: "treatments",
        blurb: "Record more treatments this month.",
        icon: Stethoscope,
    },
    {
        id: "remindersPerMonth",
        title: "Reminders",
        unit: "reminders",
        blurb: "Send more appointment and follow-up reminders this month.",
        icon: Bell,
    },
];

const RESOURCE_TITLE: Record<AddonResource, string> = {
    treatments: "Treatments",
    remindersPerMonth: "Reminders",
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

export default function AddonsCenter() {
    const [usage, setUsage] = useState<UsageSummary | null>(null);
    const [purchases, setPurchases] = useState<AddonPurchase[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [packs, setPacks] = useState<Record<AddonResource, number>>({
        treatments: 1,
        remindersPerMonth: 1,
    });
    const [buying, setBuying] = useState<AddonResource | null>(null);
    const loading = usage === null && !error;

    useEffect(() => {
        let cancelled = false;

        Promise.all([getUsageSummary(), getMyAddonPurchases()])
            .then(([u, p]) => {
                if (cancelled) return;
                setUsage(u);
                setPurchases(p);
            })
            .catch(() => {
                if (cancelled) return;
                setError("We couldn't load your usage. Please refresh the page.");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function changePacks(resource: AddonResource, delta: number) {
        setPacks((prev) => ({
            ...prev,
            [resource]: Math.min(MAX_PACKS_PER_PURCHASE, Math.max(1, prev[resource] + delta)),
        }));
    }

    async function handleBuy(resource: AddonResource) {
        setBuying(resource);
        try {
            const { authorizationUrl } = await initiateAddonPurchase({
                resource,
                packs: packs[resource],
            });
            window.location.assign(authorizationUrl);
        } catch (err) {
            console.error("Add-on checkout failed:", err);
            toast.error("We couldn't start checkout. Please try again.");
            setBuying(null);
        }
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 pry-ff">
            <div className="mb-8">
                <span className="mb-3 inline-block rounded-full bg-acc-clr/10 px-3 py-1 text-xs font-medium text-acc-clr">
                    Add-ons
                </span>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Need more this month?
                </h1>
                <p className="sec-ff mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                    Add 20 more treatments or reminders for {formatNaira(5000)}. Add-ons apply to
                    the current month only and do not roll over. Buy as many as you need.
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

            <div className="grid gap-6 md:grid-cols-2">
                {RESOURCES.map((config) => {
                    const Icon = config.icon;
                    const row = usage?.[config.id];
                    const pricing = ADDON_PRICING[config.id];
                    const count = packs[config.id];
                    const units = pricing.unitsPerPurchase * count;
                    const price = pricing.price * count;
                    const isBuying = buying === config.id;

                    const limit = row?.limit ?? 0;
                    const pct = row && !row.unlimited && limit > 0 ? Math.min(100, (row.count / limit) * 100) : 0;
                    const barColor = pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-acc-clr";

                    return (
                        <section
                            key={config.id}
                            className="rounded-2xl border border-slate-100 bg-pry-clr p-5 shadow-sm sm:p-6"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-acc-clr/10 text-acc-clr">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        {config.title}
                                    </h2>
                                    <p className="sec-ff text-xs text-slate-500">{config.blurb}</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="mt-6 space-y-3">
                                    <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                                    <div className="h-2 animate-pulse rounded bg-slate-100" />
                                    <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                                </div>
                            ) : row?.unlimited ? (
                                <p className="sec-ff mt-6 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                    Your plan includes unlimited {config.unit}. No add-on needed.
                                </p>
                            ) : (
                                <>
                                    <div className="mt-6">
                                        <div className="flex items-baseline justify-between text-sm">
                                            <span className="font-medium text-slate-900">
                                                {row?.count ?? 0} of {limit} used
                                            </span>
                                            {(row?.addonBoost ?? 0) > 0 && (
                                                <span className="sec-ff text-xs text-green-700">
                                                    includes +{row?.addonBoost} add-on
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all ${barColor}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-3">
                                        <div className="inline-flex items-center rounded-lg border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => changePacks(config.id, -1)}
                                                disabled={count <= 1}
                                                aria-label="Fewer packs"
                                                className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="min-w-[3.5rem] text-center text-sm font-semibold text-slate-900">
                                                {count} {count === 1 ? "pack" : "packs"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => changePacks(config.id, 1)}
                                                disabled={count >= MAX_PACKS_PER_PURCHASE}
                                                aria-label="More packs"
                                                className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="sec-ff text-right text-xs text-slate-500">
                                            +{units} {config.unit}
                                            <br />
                                            <span className="text-sm font-semibold text-slate-900">
                                                {formatNaira(price)}
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleBuy(config.id)}
                                        disabled={buying !== null}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-acc-clr py-2.5 text-sm font-semibold text-white shadow-sm shadow-acc-clr/30 hover:opacity-90 disabled:opacity-60"
                                    >
                                        {isBuying && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {isBuying
                                            ? "Redirecting to checkout..."
                                            : `Buy +${units} ${config.unit}`}
                                    </button>
                                </>
                            )}
                        </section>
                    );
                })}
            </div>

            <p className="sec-ff mt-4 text-xs text-slate-400">
                Need more every month?{" "}
                <Link href="/dashboard/profile/upgrade" className="font-medium text-acc-clr hover:underline">
                    Upgrading your plan
                </Link>{" "}
                is usually better value.
            </p>

            <section className="mt-8 rounded-2xl border border-slate-100 bg-pry-clr p-5 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-slate-900">Add-on history</h2>
                {loading ? (
                    <div className="mt-4 space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                        ))}
                    </div>
                ) : purchases.length > 0 ? (
                    <ul className="mt-4 divide-y divide-slate-100">
                        {purchases.map((p) => (
                            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900">
                                        +{p.units} {RESOURCE_TITLE[p.resource]?.toLowerCase() ?? p.resource}
                                    </p>
                                    <p className="sec-ff text-xs text-slate-500">
                                        {formatDate(p.purchasedAt)}
                                        {p.source === "admin_grant" ? " · Added by PetArk" : ""}
                                    </p>
                                </div>
                                <span className="shrink-0 text-sm font-semibold text-slate-700">
                                    {p.price > 0 ? formatNaira(p.price) : "Free"}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="sec-ff mt-4 text-sm text-slate-500">
                        Your add-on purchases will be listed here.
                    </p>
                )}
            </section>
        </div>
    );
}