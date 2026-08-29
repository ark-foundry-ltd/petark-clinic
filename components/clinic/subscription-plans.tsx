// components/subscription/subscription-plans.tsx

"use client";

import { useEffect, useState } from "react";
import {
    getSubscriptionStatus,
    initiateSubscriptionUpgrade,
    PLAN_PRICING,
    type SubscriptionPlan,
    type SubscriptionRecord,
    type PurchasablePlan,
    type BillingCycle,
} from "@/lib/subscription";
import { Check, Loader2, Zap, Layers, Rocket, Sparkles, Building2 } from "lucide-react";

interface PlanDefinition {
    id: SubscriptionPlan;
    name: string;
    icon: typeof Zap;
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
    tagline: "Explore PetArk with core clinic management",
    features: [
      "1 staff account",
      "Primary clinic location",
      "Appointments management only",
      "Basic manual SOAP notes",
      "Pet profiles & visit history",
      "Unlimited patients",
      "10 treatments / month",
      "10 reminders / month",
      "No inventory & POS",
      "No lab results",
      "No drug dosage calculator",
      "No advanced analytics",
      "No cross-clinic referrals",
    ],
    purchasable: false,
  },
  {
    id: "starter",
    name: "Starter",
    icon: Layers,
    tagline: "For small clinics ready to go digital",
    features: [
      "Up to 3 staff accounts",
      "Up to 3 custom roles",
      "Primary clinic location",
      "Unlimited patients",
      "25 inventory SKUs",
      "80 treatments / month",
      "80 reminders / month",
      "Inventory & POS",
      "Basic clinic reports",
      "Treatment & visit summaries",
      "Basic sales/inventory reports",
      "Everything in Free",
    ],
    purchasable: true,
  },
  {
    id: "standard",
    name: "Standard",
    icon: Rocket,
    tagline: "For growing clinics that need more capacity",
    features: [
      "Up to 8 staff accounts",
      "Up to 8 custom roles",
      "1 additional branch",
      "Unlimited patients",
      "100 inventory SKUs",
      "160 treatments / month",
      "160 reminders / month",
      "Inventory & POS",
      "Lab results",
      "Drug dosage calculator",
      "Everything in Starter",
    ],
    purchasable: true,
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    tagline: "For clinics that need advanced tools and unlimited capacity",
    features: [
      "Up to 15 staff accounts",
      "Up to 15 custom roles",
      "Up to 2 additional branches",
      "Unlimited patients",
      "Unlimited inventory & POS",
      "Unlimited treatments",
      "Unlimited reminders",
      "Lab results",
      "Drug dosage calculator",
      "AI SOAP formatting & discharge summaries",
      "Vitals trends",
      "Revenue & appointment analytics",
      "Cross-clinic referrals",
      "Everything in Standard",
    ],
    purchasable: true,
  },
//   {
//     id: "enterprise",
//     name: "Enterprise",
//     icon: Building2,
//     tagline: "For multi-location and franchise clinics",
//     features: [
//       "Unlimited staff accounts",
//       "Unlimited custom roles",
//       "Unlimited branches",
//       "Unlimited patients",
//       "Unlimited inventory & POS",
//       "Unlimited treatments",
//       "Unlimited reminders",
//       "Lab results",
//       "Drug dosage calculator",
//       "Custom pricing",
//       "Dedicated support",
//       "Custom enterprise solutions",
//     ],
//     purchasable: false,
//   },
];

function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString("en-NG")}`;
}

export default function SubscriptionPlans() {
    const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const [upgradingPlan, setUpgradingPlan] = useState<PurchasablePlan | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const loading = subscription === null && !errorMessage;

    useEffect(() => {
        let cancelled = false;

        getSubscriptionStatus()
            .then((data) => {
                if (cancelled) return;
                setSubscription(data);
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
                billingCycle,
            });
            window.location.assign(authorizationUrl);
        } catch (err) {
            console.error("Upgrade checkout failed:", err);
            setErrorMessage("Couldn't start checkout. Please try again.");
            setUpgradingPlan(null);
        }
    }

    function priceFor(planId: SubscriptionPlan): { price: string; period?: string } {
        if (planId === "free") return { price: "₦0" };
        if (planId === "enterprise") return { price: "Custom" };

        const pricing = PLAN_PRICING[planId as PurchasablePlan];
        if (billingCycle === "monthly") {
            return { price: formatNaira(pricing.monthly), period: "/mo" };
        }
        return { price: formatNaira(pricing.annual), period: "/yr" };
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-14 pry-ff">
            <div className="mb-8 text-center">
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

            {/* Billing cycle toggle */}
            <div className="mb-10 flex flex-col items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                            billingCycle === "monthly"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        onClick={() => setBillingCycle("annual")}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                            billingCycle === "annual"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Annual
                    </button>
                </div>
                {billingCycle === "annual" && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-100">
                        Get 2 months free
                    </span>
                )}
            </div>

            {errorMessage && (
                <div className="mx-auto mb-8 max-w-md rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {PLANS.map((plan) => {
                    const isCurrent = subscription?.plan === plan.id;
                    const isUpgrading = upgradingPlan === plan.id;
                    const Icon = plan.icon;
                    const { price, period } = priceFor(plan.id);

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

                            <div className="mt-5 flex items-baseline gap-1 h-9">
                                <span className="text-3xl font-bold tracking-tight text-slate-900">
                                    {price}
                                </span>
                                <span className="text-sm font-medium text-slate-400">
                                    {period ?? ""}
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
                                        {isUpgrading
                                            ? "Redirecting..."
                                            : plan.id === "free"
                                              ? "Get Started"
                                              : `Choose ${plan.name}`}
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