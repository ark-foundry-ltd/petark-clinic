// lib/usage.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

export interface ResourceUsage {
    resource: string;
    count: number;
    // Unlimited resources are Infinity here (the API sends null, because JSON
    // can't carry Infinity; getClinicUsage converts it back). Check
    // `unlimited` before showing a number.
    limit: number;
    remaining: number;
    unlimited: boolean;
    // What the plan allows before add-ons
    baseLimit: number;
    // Extra units from add-ons that currently apply (0 when none)
    addonBoost: number;
    // true only when buying a pack would actually work for this clinic
    addonEligible: boolean;
    // "month": resets every month. "permanent": stays while the plan includes it.
    addonScope: "month" | "permanent";
}

export interface UsageSummary {
    staff: ResourceUsage;
    customRoles: ResourceUsage;
    treatments: ResourceUsage;
    remindersPerMonth: ResourceUsage;
    locations: ResourceUsage;
    inventorySkus: ResourceUsage;
}

// What the API actually sends
type RawResourceUsage = Omit<
    ResourceUsage,
    "limit" | "remaining" | "baseLimit" | "addonBoost" | "addonEligible" | "addonScope"
> & {
    limit: number | null;
    remaining: number | null;
    baseLimit?: number | null;
    addonBoost?: number;
    addonEligible?: boolean;
    addonScope?: "month" | "permanent";
};

function normalize(raw: RawResourceUsage): ResourceUsage {
    return {
        ...raw,
        limit: raw.limit ?? Infinity,
        remaining: raw.remaining ?? Infinity,
        baseLimit: raw.baseLimit ?? Infinity,
        addonBoost: raw.addonBoost ?? 0,
        addonEligible: raw.addonEligible ?? false,
        addonScope: raw.addonScope ?? "month",
    };
}

export async function getClinicUsage(): Promise<UsageSummary> {
    try {
        const response = await api.get("/usage", {
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });

        const raw = response.data.data as Record<string, RawResourceUsage>;
        return Object.fromEntries(
            Object.entries(raw).map(([key, value]) => [key, normalize(value)])
        ) as unknown as UsageSummary;
    } catch (error) {
        // Work out the message once, in the catch's own scope, so every path can use it
        let message = "Failed to load usage";
        let expected = false;

        if (error instanceof AxiosError) {
            message = error.response?.data?.message || error.message;
            // 403 just means "staff account, not the clinic owner": expected, not an error
            expected = error.response?.status === 403;
            if (!expected) {
                console.error("Error fetching usage:", error.response?.data || error.message);
            }
        } else {
            if (error instanceof Error) message = error.message;
            console.error("Error fetching usage:", error);
        }

        throw new Error(message);
    }
}