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

export interface SalesWidgetPeriod {
    revenue: number;
    count: number;
}

export interface SalesWidgetData {
    scope: "personal" | "clinic";
    today: SalesWidgetPeriod;
    thisWeek: SalesWidgetPeriod;
    thisMonth: SalesWidgetPeriod;
    trend: TrendPoint[];
}

export async function getSalesWidget(params: AnalyticsParams = {}): Promise<SalesWidgetData> {
    try {
        const response = await api.get("/analytics/sales-widget", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching sales widget:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching sales widget:", error);
        throw error;
    }
}

export interface InventoryWidgetData {
    totalSkus: number;
    lowStockCount: number;
    movementTrend: TrendPoint[];
}

export async function getInventoryWidget(params: AnalyticsParams = {}): Promise<InventoryWidgetData> {
    try {
        const response = await api.get("/analytics/inventory-widget", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching inventory widget:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching inventory widget:", error);
        throw error;
    }
}

export interface AppointmentWidgetData {
    scope: "personal" | "clinic";
    today: number;
    thisWeek: { total: number; completed: number };
    trend: TrendPoint[];
}

export async function getAppointmentWidget(params: AnalyticsParams = {}): Promise<AppointmentWidgetData> {
    try {
        const response = await api.get("/analytics/appointment-widget", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching appointment widget:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching appointment widget:", error);
        throw error;
    }
}

export interface ReferralStatusSummary {
    pending: number;
    accepted: number;
    declined: number;
    total: number;
    acceptanceRate: number;
}

export interface ReferralWidgetData {
    incoming: ReferralStatusSummary;
    outgoing: ReferralStatusSummary;
    incomingTrend: TrendPoint[];
    outgoingTrend: TrendPoint[];
}

export async function getReferralWidget(): Promise<ReferralWidgetData> {
    try {
        const response = await api.get("/analytics/referral-widget");
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching referral widget:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching referral widget:", error);
        throw error;
    }
}

export interface ReminderWidgetData {
    trend: any;
    totalReminders: number;
    remindersSentThisMonth: number;
    remindersLimit: number;
    unlimited: boolean;
    overdueCount: number;
    upcomingCount: number;
}

export async function getReminderWidget(): Promise<ReminderWidgetData> {
    try {
        const response = await api.get("/analytics/reminder-widget");
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching referral widget:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching referral widget:", error);
        throw error;
    }
}