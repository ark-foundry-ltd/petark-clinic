// lib/subscription.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type SubscriptionPlan = "free" | "standard" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "inactive" | "cancelled";
export type BillingCycle = "monthly" | "annual";

// Plans actually purchasable through initiateSubscriptionUpgrade —
// enterprise is "coming soon" and isn't in PLAN_PRICING on the backend yet.
export type PurchasablePlan = "standard" | "pro";

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
    annualDiscountEligible: boolean;
    annualDiscountRate: number;
}

// ─── Pricing (display only — mirrors backend PLAN_PRICING; the real charge
// is always resolved server-side in initiateSubscriptionUpgrade) ───────────

interface PlanPricingEntry {
    monthly: number;
    annual: {
        standard: number;
        discounted: number;
    };
}

export const PLAN_PRICING: Record<PurchasablePlan, PlanPricingEntry> = {
    standard: {
        monthly: 28000,
        annual: {
            standard: 280000,
            discounted: 238000,
        },
    },
    pro: {
        monthly: 38000,
        annual: {
            standard: 380000,
            discounted: 323000,
        },
    },
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