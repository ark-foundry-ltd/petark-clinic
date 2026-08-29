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

export interface SubscriptionRecord {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    billingCycle: BillingCycle | null;
    startedAt: string | null;
    expiresAt: string | null;
    paystackSubscriptionCode: string | null;
    paystackNextPaymentDate: string | null;
    pendingReference?: string | null;
    trial: TrialInfo | null;
}

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

// ─── Usage add-ons (treatments/reminders only — see planLimitMiddleware.js
// on the backend for the actual enforcement) ───────────────────────────────

export type AddonResource = "treatments" | "remindersPerMonth";

interface AddonPricingEntry {
    unitsPerPurchase: number;
    price: number;
}

export const ADDON_PRICING: Record<AddonResource, AddonPricingEntry> = {
    treatments: { unitsPerPurchase: 20, price: 5000 },
    remindersPerMonth: { unitsPerPurchase: 20, price: 5000 },
};

// ─── Initiate upgrade ───────────────────────────────────────────────────

export interface InitiateUpgradePayload {
    targetPlan: PurchasablePlan;
    billingCycle: BillingCycle;
}

export interface InitiateUpgradeResult {
    authorizationUrl: string;
    reference: string;
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