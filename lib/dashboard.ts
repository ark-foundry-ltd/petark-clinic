// lib/dashboard.ts

import api from "@/lib/api";
import { AxiosError } from "axios";
import type { AnalyticsTier, TrendPoint } from "@/lib/analytics";

export interface DashboardSections {
    // number stats
    appointmentsToday?: { total: number; completed: number; remaining: number };
    visits?: { thisWeek: number; lastWeek: number; completedThisWeek: number };
    revenue?: { today: number; thisWeek: number };
    inventoryAlerts?: { lowStock: number; expiringSoon: number };
    followUps?: { upcoming: number; dueToday: number; overdue: number };
    recentActivity?: { today: number };
    newPatients?: { thisWeek: number };
    unpaidInvoices?: { count: number; amount: number };
    pendingReferrals?: { incoming: number };
    // charts
    revenueChart?: TrendPoint[];
    visitsChart?: TrendPoint[];
    appointmentsByHour?: TrendPoint[];
    visitTrend?: TrendPoint[];
}

export type DashboardSectionKey = keyof DashboardSections;

export interface DashboardData {
    tier: AnalyticsTier;
    sections: DashboardSections;
    locked: { key: DashboardSectionKey; requiredPlan: AnalyticsTier }[];
}

export async function getDashboardStats(params: { locationId?: string } = {}): Promise<DashboardData> {
    try {
        const response = await api.get("/dashboard", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching dashboard:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching dashboard:", error);
        throw error;
    }
}