// lib/subscription.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type SubscriptionPlan = "free" | "standard" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "inactive" | "cancelled";

// Plans actually purchasable through initiateSubscriptionUpgrade —
// enterprise is "coming soon" and isn't in PLAN_PRICES_KOBO on the backend yet.
export type PurchasablePlan = "standard" | "pro";

export interface SubscriptionRecord {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startedAt: string | null;
    expiresAt: string | null;
    paystackSubscriptionCode: string | null;
    paystackNextPaymentDate: string | null;
    pendingReference?: string | null;
}

// ─── Initiate upgrade ───────────────────────────────────────────────────

export interface InitiateUpgradePayload {
    targetPlan: PurchasablePlan;
}

export interface InitiateUpgradeResult {
    authorizationUrl: string;
    reference: string;
}

export async function initiateSubscriptionUpgrade(
    payload: InitiateUpgradePayload
): Promise<InitiateUpgradeResult> {
    try {
        // billingCycle is hardcoded to "monthly" for now — there's no cycle
        // selector in the UI yet. Revisit if/when annual billing is added.
        const response = await api.post("/subscription/upgrade", {
            ...payload,
            billingCycle: "monthly",
        });
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
        const response = await api.get("/subscription/status");
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