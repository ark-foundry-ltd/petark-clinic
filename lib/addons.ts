// lib/addons.ts
import api from "@/lib/api";
import { AxiosError } from "axios";
import { ADDON_PRICING, type AddonResource } from "@/lib/subscription";

export { ADDON_PRICING };
export type { AddonResource };

// Usage lives in lib/usage.ts; re-exported here so the add-ons page has one import
export { getClinicUsage as getUsageSummary } from "@/lib/usage";
export type { ResourceUsage, UsageSummary } from "@/lib/usage";

// Must match MAX_PACKS_PER_PURCHASE on the backend
export const MAX_PACKS_PER_PURCHASE = 20;

export interface AddonCheckout {
    authorizationUrl: string;
    reference: string;
    // ₦ that Paystack will charge
    amount: number;
    units: number;
}

export interface AddonPurchase {
    id: string;
    resource: AddonResource;
    units: number;
    packs: number;
    price: number;
    month: string;
    source: "purchase" | "admin_grant";
    purchasedAt: string;
}

function logError(label: string, error: unknown) {
    if (error instanceof AxiosError) {
        console.error(label, error.response?.data || error.message);
    } else {
        console.error(label, error);
    }
}

export async function initiateAddonPurchase(payload: {
    resource: AddonResource;
    packs: number;
}): Promise<AddonCheckout> {
    try {
        const response = await api.post("/addons/purchase", payload);
        return response.data.data;
    } catch (error) {
        logError("Error starting add-on purchase:", error);
        throw error;
    }
}

export async function getMyAddonPurchases(): Promise<AddonPurchase[]> {
    try {
        const response = await api.get("/addons");
        return response.data.data;
    } catch (error) {
        logError("Error fetching add-on purchases:", error);
        throw error;
    }
}