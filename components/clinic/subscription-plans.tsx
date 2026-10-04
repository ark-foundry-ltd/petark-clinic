// components/clinic/subscription-plans.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getSubscriptionStatus,
    initiateSubscriptionUpgrade,
    previewCredit,
    PLAN_PRICING,
    type SubscriptionPlan,
    type SubscriptionRecord,
    type PurchasablePlan,
    type BillingCycle,
} from "@/lib/subscription";
import { Check, Loader2, Zap, Layers, Rocket, Sparkles, Building2, Gift } from "lucide-react";

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
    tagline: "Get to know PetArk with the essentials of clinic management",
    features: [
      "1 staff account",
      "Primary clinic location",
      "Appointment management",
      "Manual SOAP notes",
      "Pet profiles and visit history",
      "Unlimited patients",
      "10 treatments per month",
      "10 reminders per month",
      "Self-service help center and setup guides",
    ],
    purchasable: false,
  },
  {
    id: "starter",
    name: "Starter",
    icon: Layers,
    tagline: "For small clinics moving from paper to digital records",
    features: [
      "Up to 3 staff accounts",
      "Up to 3 custom roles",
      "Primary clinic location",
      "Unlimited patients",
      "25 inventory SKUs",
      "80 treatments per month",
      "80 reminders per month",
      "Inventory and point of sale (POS)",
      "Treatment and visit summaries",
      "Basic clinic, sales and inventory reports",
      "Email support during business hours",
      "Onboarding checklist and Excel/CSV import template",
      "Everything in Free",
    ],
    purchasable: true,
  },
  {
    id: "standard",
    name: "Standard",
    icon: Rocket,
    tagline: "For growing clinics that need more capacity and hands-on help",
    features: [
      "Up to 8 staff accounts",
      "Up to 8 custom roles",
      "1 additional branch",
      "Unlimited patients",
      "100 inventory SKUs",
      "160 treatments per month",
      "160 reminders per month",
      "Lab results",
      "Drug dosage calculator",
      "Priority support",
      "Guided onboarding session",
      "Assisted Excel/CSV data migration",
      "Everything in Starter",
    ],
    purchasable: true,
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    tagline: "For busy, multi-branch clinics that need advanced tools and no limits",
    features: [
      "Up to 15 staff accounts",
      "Up to 15 custom roles",
      "Up to 2 additional branches",
      "Unlimited patients",
      "Unlimited inventory and POS",
      "Unlimited treatments",
      "Unlimited reminders (fair use)",
      "Vitals trends",
      "Revenue and appointment analytics",
      "Cross-clinic referrals",
      "Dedicated onboarding and managed data migration",
      "Staff training and go-live assistance",
      "Same-day support for standard issues",
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
    const [useCredit, setUseCredit] = useState(true);
    const loading = subscription === null && !errorMessage;

    const creditBalance = subscription?.creditBalance ?? 0;
    const applyingCredit = useCredit && creditBalance > 0;

    useEffect(() => {
        let cancelled = false;

        getSubscriptionStatus()
            .then((data) => {
                if (cancelled) return;
                setSubscription(data);
            })
            .catch(() => {
                if (cancelled) return;
                setErrorMessage("We couldn't load your current plan. Please refresh the page.");
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
                useCredit,
            });
            window.location.assign(authorizationUrl);
        } catch (err) {
            console.error("Upgrade checkout failed:", err);
            setErrorMessage("We couldn't start checkout. Please try again.");
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

    function listPriceFor(planId: PurchasablePlan): number {
        return PLAN_PRICING[planId][billingCycle];
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 pry-ff">
            <div className="mb-8 text-center">
                <span className="mb-3 inline-block rounded-full bg-acc-clr/10 px-3 py-1 text-xs font-medium text-acc-clr">
                    Pricing
                </span>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Choose the plan that fits your clinic
                </h1>
                <p className="sec-ff mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
                    Start with a 30-day free trial of every Pro feature. Then stay
                    on the plan that suits you, and upgrade whenever your clinic
                    needs more.
                </p>
            </div>

            {/* Billing cycle toggle */}
            <div className="mb-6 flex flex-col items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition sm:px-4 sm:py-1.5 ${
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
                        className={`rounded-full px-5 py-2 text-sm font-medium transition sm:px-4 sm:py-1.5 ${
                            billingCycle === "annual"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Annual
                    </button>
                </div>
                {billingCycle === "annual" && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-center text-xs font-semibold text-green-700 border border-green-100">
                        Pay for 10 months, get 12
                    </span>
                )}
            </div>

            {/* Referral credit */}
            <div className="mb-10 flex flex-col items-center gap-2">
                {creditBalance > 0 && (
                    <div className="flex max-w-md flex-col items-center gap-2 rounded-xl border border-acc-clr/20 bg-acc-clr/5 px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-slate-900">
                            You have {formatNaira(creditBalance)} in referral credit
                        </p>
                        <p className="sec-ff text-xs leading-snug text-slate-500">
                            Credit covers up to half of any plan payment. Whatever is left
                            carries over to your next payment.
                        </p>
                        <label className="mt-1 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={useCredit}
                                onChange={(e) => setUseCredit(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 accent-acc-clr"
                            />
                            Use my credit at checkout
                        </label>
                    </div>
                )}
                <Link
                    href="/dashboard/profile/refer-and-earn"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:underline"
                >
                    <Gift className="h-3.5 w-3.5" />
                    Refer a clinic and earn {formatNaira(5000)} credit
                </Link>
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="mx-auto mb-8 max-w-md rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600"
                >
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
                {PLANS.map((plan) => {
                    const isCurrent = subscription?.plan === plan.id;
                    const isUpgrading = upgradingPlan === plan.id;
                    const Icon = plan.icon;
                    const { price, period } = priceFor(plan.id);

                    const credit =
                        plan.purchasable && applyingCredit
                            ? previewCredit(listPriceFor(plan.id as PurchasablePlan), creditBalance)
                            : null;

                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border bg-pry-clr p-5 transition-all duration-200 sm:p-6 ${
                                plan.highlighted
                                    ? "border-acc-clr shadow-lg shadow-acc-clr/10 xl:-translate-y-2"
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
                            <p className="sec-ff mt-1 min-h-[2.5rem] text-xs leading-snug text-slate-500">
                                {plan.tagline}
                            </p>

                            <div className="mt-5 flex h-9 items-baseline gap-1">
                                <span className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    {price}
                                </span>
                                <span className="text-sm font-medium text-slate-400">
                                    {period ?? ""}
                                </span>
                            </div>

                            {/* Same height on every card so the rows stay aligned */}
                            {applyingCredit && (
                                <div className="sec-ff mt-2 min-h-[2.5rem] text-xs leading-snug">
                                    {credit && (
                                        <>
                                            <p className="text-green-700">
                                                Referral credit: −{formatNaira(credit.credit)}
                                            </p>
                                            <p className="font-semibold text-slate-900">
                                                You pay {formatNaira(credit.youPay)}
                                                {period ?? ""}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

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
                                        Current plan
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
                                            ? "Redirecting to checkout..."
                                            : plan.id === "free"
                                              ? "Get started"
                                              : `Choose ${plan.name}`}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="w-full rounded-lg border border-dashed border-slate-200 py-2.5 text-sm font-medium text-slate-400"
                                    >
                                        {plan.id === "enterprise"
                                            ? "Coming soon"
                                            : "No checkout required"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="sec-ff mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-slate-400">
                Reminders are sent automatically through browser/PWA notifications
                and email. PWA notifications require a supported browser or the
                installed app, and notification permission from your client. Email
                is used when PWA notifications are unavailable.
            </p>
        </div>
    );
}