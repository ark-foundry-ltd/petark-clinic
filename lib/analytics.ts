// lib/analytics.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

export interface TrendPoint {
    label: string;
    value: number;
}

export interface AppointmentTrend {
    total: TrendPoint[];
    byStatus?: Record<string, TrendPoint[]>;
}

export interface StaffPerformance {
    salesByStaff: { staffId: string | null; name: string; revenue: number; salesCount: number }[];
    appointmentsByVet: { staffId: string | null; name: string; completedCount: number }[];
}

export interface WeeklyVisits {
    dailyVisits: { label: string; total: number; completed: number }[];
    totalThisWeek: number;
    completedThisWeek: number;
}

export interface AnalyticsSnapshot {
    revenue: number;
    salesCount: number;
    appointmentCount: number;
    newPatientsCount: number;
    activeStaffCount: number;
}

export interface AnalyticsRange {
    from: string;
    to: string;
}

export type AnalyticsTier = "free" | "starter" | "standard" | "pro" | "enterprise";

export interface AnalyticsOverview {
    tier: AnalyticsTier;
    locked?: boolean; // true only for free
    range?: AnalyticsRange;
    snapshot?: AnalyticsSnapshot;
    revenueTrend?: TrendPoint[];
    appointmentTrend?: AppointmentTrend;
    patientGrowthTrend?: TrendPoint[];
    staffPerformance?: StaffPerformance;
    weeklyVisits?: WeeklyVisits;
}

export interface AnalyticsParams {
    locationId?: string;
}

export async function getAnalyticsOverview(params: AnalyticsParams = {}): Promise<AnalyticsOverview> {
    try {
        const response = await api.get("/analytics/overview", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching analytics:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching analytics:", error);
        throw error;
    }
}