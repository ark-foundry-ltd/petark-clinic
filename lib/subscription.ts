// lib/subscription.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type SubscriptionPlan = "free" | "starter" | "standard" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "inactive" | "cancelled";
export type BillingCycle = "monthly" | "annual";

// Plans actually purchasable through initiateSubscriptionUpgrade —
// enterprise is "coming soon" and isn't in PLAN_PRICING on the backend yet.
export type PurchasablePlan = "starter" | "standard" | "pro";

export interface TrialInfo {
    startedAt: string | null;
    endsAt: string | null;
    convertedAt: string | null;
}

// Present only while auto-renewal is ON and at least one renewal payment has failed.
export interface RenewalInfo {
    failedAttempts: number;
    maxAttempts: number;
    nextAttemptAt: string | null;
    lastFailureReason: string | null;
}

export interface SubscriptionRecord {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    billingCycle: BillingCycle | null;
    startedAt: string | null;
    expiresAt: string | null;
    paystackSubscriptionCode: string | null;
    paystackNextPaymentDate: string | null;
    pendingReference?: string | null;
    // true while the clinic is on the free 30-day Pro trial (not a purchase)
    isTrial?: boolean;
    // Whether the subscription renews automatically through Paystack.
    // The authorization code itself never reaches the browser.
    autoRenew: boolean;
    renewal: RenewalInfo | null;
    trial: TrialInfo | null;
    // Referral credit (₦) available to spend on subscription payments
    creditBalance: number;
}

// ─── Auto-renewal consent ───────────────────────────────────────────────────
// Shown next to the (initially unticked) checkbox at checkout. If you change this
// wording, bump AUTO_RENEW_CONSENT_VERSION in services/subscriptionBilling.js.

export const AUTO_RENEW_CONSENT_TEXT =
    "Enable automatic renewal. Your subscription will automatically renew at the end of each billing period. Payment details are securely handled by Paystack. You can turn off auto-renewal at any time.";

// ─── Pricing (display only — mirrors backend PLAN_PRICING; the real charge
// is always resolved server-side in initiateSubscriptionUpgrade) ───────────
// Flat monthly/annual — annual is simply "2 months free" (10 months' price
// for 12), no separate discount tier or eligibility check.

interface PlanPricingEntry {
    monthly: number;
    annual: number;
}

export const PLAN_PRICING: Record<PurchasablePlan, PlanPricingEntry> = {
    starter: {
        monthly: 15000,
        annual: 150000,
    },
    standard: {
        monthly: 30000,
        annual: 300000,
    },
    pro: {
        monthly: 40000,
        annual: 400000,
    },
};

// ─── Referral credit (display only — mirrors MAX_CREDIT_SHARE on the backend;
// the real amount is always computed server-side) ───────────────────────────
// Credit can cover at most half of any single payment; whatever is left over
// stays on the balance for the next payment.

export const MAX_CREDIT_SHARE = 0.5;

export function previewCredit(
    listPrice: number,
    balance: number
): { credit: number; youPay: number } {
    const credit = Math.min(
        Math.max(balance, 0),
        Math.floor(listPrice * MAX_CREDIT_SHARE)
    );
    return { credit, youPay: listPrice - credit };
}

// ─── Usage add-ons (treatments, reminders and inventory SKUs — see
// planLimitMiddleware.js on the backend for the actual enforcement) ─────────

export type AddonResource = "treatments" | "remindersPerMonth" | "inventorySkus";

interface AddonPricingEntry {
    unitsPerPurchase: number;
    price: number;
}

export const ADDON_PRICING: Record<AddonResource, AddonPricingEntry> = {
    treatments: { unitsPerPurchase: 20, price: 5000 },
    remindersPerMonth: { unitsPerPurchase: 20, price: 5000 },
    inventorySkus: { unitsPerPurchase: 20, price: 5000 },
};

// ─── Initiate upgrade ───────────────────────────────────────────────────

export interface InitiateUpgradePayload {
    targetPlan: PurchasablePlan;
    billingCycle: BillingCycle;
    // Defaults to true on the server; send false to pay the full price
    useCredit?: boolean;
    // true  = the clinic ticked the consent box (enables auto-renewal, card payments only)
    // false = unticked (turns auto-renewal off if it was on)
    // omit  = leave the current setting unchanged
    autoRenew?: boolean;
}

export interface InitiateUpgradeResult {
    authorizationUrl: string;
    reference: string;
    // What Paystack will actually charge (₦), after credit
    amount: number;
    listPrice: number;
    creditApplied: number;
}

export async function initiateSubscriptionUpgrade(
    payload: InitiateUpgradePayload
): Promise<InitiateUpgradeResult> {
    try {
        const response = await api.post("/subscription/upgrade", payload);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error initiating subscription upgrade:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error initiating subscription upgrade:", error);
        }
        throw error;
    }
}

// ─── Get current subscription status ───────────────────────────────────

export async function getSubscriptionStatus(): Promise<SubscriptionRecord> {
    try {
        const response = await api.get("/subscription/status", {
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
            },
        });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching subscription status:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching subscription status:", error);
        }
        throw error;
    }
}

// ─── Turn auto-renewal off ─────────────────────────────────────────────
// There is intentionally no "turn on" call: enabling needs a fresh card
// authorization, which only happens through checkout with the consent box ticked.

export async function disableAutoRenew(): Promise<{ autoRenew: false }> {
    try {
        const response = await api.post("/subscription/auto-renew/disable");
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error disabling auto-renewal:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error disabling auto-renewal:", error);
        }
        throw error;
    }
}