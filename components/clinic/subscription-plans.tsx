// components/subscription/subscription-plans.tsx

"use client";

import { useEffect, useState } from "react";
import {
    getSubscriptionStatus,
    initiateSubscriptionUpgrade,
    type SubscriptionPlan,
    type PurchasablePlan,
} from "@/lib/subscription";
import { Check, Loader2, Zap, Rocket, Sparkles, Building2 } from "lucide-react";

interface PlanDefinition {
    id: SubscriptionPlan;
    name: string;
    icon: typeof Zap;
    price: string;
    period?: string;
    tagline: string;
    features: string[];
    purchasable: boolean;
    highlighted?: boolean;
}

const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    price: "₦0",
    tagline: "Get started with core clinic management",
    features: [
      "1 staff account",
      "Appointments & scheduling",
      "Basic manual SOAP notes",
      "Pet profiles & visit history",
      "Unlimited patients",
      "Unlimited treatments",
    ],
    purchasable: false,
  },
  {
    id: "standard",
    name: "Standard",
    icon: Rocket,
    price: "₦31,000",
    period: "/mo",
    tagline: "For growing clinics that need inventory & POS",
    features: [
      "Up to 5 staff accounts",
      "Up to 5 custom roles",
      "1 additional branch",
      "Unlimited patients",
      "Unlimited inventory & POS",
      "Unlimited reminders",
      "Unlimited treatments",
      "Everything in Free",
    ],
    purchasable: true,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    price: "₦41,000",
    period: "/mo",
    tagline: "For clinics that need advanced tools and analytics",
    features: [
      "Up to 12 staff accounts",
      "Up to 12 custom roles",
      "Up to 3 additional branches",
      "Unlimited patients",
      "Unlimited inventory & POS",
      "Unlimited reminders",
      "Unlimited treatments",
      "AI SOAP formatting & discharge summaries",
      "Vitals trends & drug dosage calculator",
      "Revenue & appointment analytics",
      "Cross-clinic referrals",
    ],
    purchasable: true,
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    tagline: "For multi-location and franchise clinics",
    features: [
      "Unlimited staff accounts",
      "Unlimited custom roles",
      "Unlimited branches",
      "Unlimited patients",
      "Unlimited inventory & POS",
      "Unlimited reminders",
      "Unlimited treatments",
      "Custom pricing",
      "Dedicated support",
      "Custom enterprise solutions",
    ],
    purchasable: false,
  },
];

export default function SubscriptionPlans() {
    const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(
        null
    );
    const [upgradingPlan, setUpgradingPlan] = useState<PurchasablePlan | null>(
        null
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const loading = currentPlan === null && !errorMessage;

    useEffect(() => {
        let cancelled = false;

        getSubscriptionStatus()
            .then((data) => {
                if (cancelled) return;
                setCurrentPlan(data.plan);
            })
            .catch(() => {
                if (cancelled) return;
                setErrorMessage("Couldn't load your current plan.");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleUpgrade(targetPlan: PurchasablePlan) {
        setErrorMessage(null);
        setUpgradingPlan(targetPlan);
        try {
            const { authorizationUrl } = await initiateSubscriptionUpgrade({
                targetPlan,
            });
            window.location.assign(authorizationUrl);
        } catch {
            setErrorMessage("Couldn't start checkout. Please try again.");
            setUpgradingPlan(null);
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-14 pry-ff">
            <div className="mb-12 text-center">
                <span className="mb-3 inline-block rounded-full bg-acc-clr/10 px-3 py-1 text-xs font-medium text-acc-clr">
                    Pricing
                </span>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Choose the plan that fits your clinic
                </h1>
                <p className="sec-ff mx-auto mt-3 max-w-md text-sm text-slate-500">
                    Every plan starts simple. Upgrade whenever your clinic is ready
                    for more.
                </p>
            </div>

            {errorMessage && (
                <div className="mx-auto mb-8 max-w-md rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const isUpgrading = upgradingPlan === plan.id;
                    const Icon = plan.icon;

                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border bg-pry-clr p-6 transition-all duration-200 ${
                                plan.highlighted
                                    ? "border-acc-clr shadow-lg shadow-acc-clr/10 lg:-translate-y-2"
                                    : "border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md"
                            }`}
                        >
                            {plan.highlighted && (
                                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-acc-clr px-3.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-sm">
                                    MOST POPULAR
                                </span>
                            )}

                            <div
                                className={`mb-4 mt-2 flex h-11 w-11 items-center justify-center rounded-xl ${
                                    plan.highlighted
                                        ? "bg-acc-clr text-white"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                {plan.name}
                            </h2>
                            <p className="sec-ff mt-1 text-xs leading-snug text-slate-500">
                                {plan.tagline}
                            </p>

                            <div className="mt-5 flex h-9 items-baseline gap-1">
                                <span className="text-3xl font-bold tracking-tight text-slate-900">
                                    {plan.price}
                                </span>
                                <span className="text-sm font-medium text-slate-400">
                                    {plan.period ?? ""}
                                </span>
                            </div>

                            <div className="my-5 h-px bg-slate-100" />

                            <ul className="flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2.5 text-sm text-slate-600"
                                    >
                                        <span
                                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                                plan.highlighted
                                                    ? "bg-acc-clr/10 text-acc-clr"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </span>
                                        <span className="leading-snug">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6">
                                {loading ? (
                                    <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                                ) : isCurrent ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-400"
                                    >
                                        Current Plan
                                    </button>
                                ) : plan.purchasable ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleUpgrade(plan.id as PurchasablePlan)
                                        }
                                        disabled={upgradingPlan !== null}
                                        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                                            plan.highlighted
                                                ? "bg-acc-clr text-white shadow-sm shadow-acc-clr/30 hover:opacity-90"
                                                : "bg-slate-900 text-white hover:opacity-90"
                                        }`}
                                    >
                                        {isUpgrading && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        {isUpgrading ? "Redirecting..." : `Choose ${plan.name}`}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full rounded-lg border border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-400"
                                    >
                                        {plan.id === "enterprise" ? "Coming Soon" : "Not Available"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}