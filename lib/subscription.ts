// lib/subscription.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "inactive" | "cancelled";

export interface SubscriptionRecord {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startedAt: string | null;
    expiresAt: string | null;
    paystackSubscriptionCode: string | null;
    paystackNextPaymentDate: string | null;
    // set while an upgrade is awaiting Paystack callback confirmation,
    // cleared once subscriptionPaystackCallback processes it
    pendingReference?: string | null;
}

// ─── Initiate upgrade (Free → Pro) ─────────────────────────────────────

export interface InitiateUpgradeResult {
    authorizationUrl: string;
    reference: string;
}

export async function initiateSubscriptionUpgrade(): Promise<InitiateUpgradeResult> {
    try {
        const response = await api.post("/subscription/upgrade");
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