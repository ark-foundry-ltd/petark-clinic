// lib/usage.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

export interface ResourceUsage {
    resource: string;
    count: number;
    limit: number;
    remaining: number;
    unlimited: boolean;
}

export interface UsageSummary {
    staff: ResourceUsage;
    customRoles: ResourceUsage;
    treatments: ResourceUsage;
    remindersPerMonth: ResourceUsage;
    locations: ResourceUsage;
}

export async function getClinicUsage(): Promise<UsageSummary> {
    try {
        const response = await api.get("/usage");
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching usage:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching usage:", error);
        throw error;
    }
}