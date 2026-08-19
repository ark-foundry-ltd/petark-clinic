// lib/reports.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

export type PaymentMethod = "cash" | "transfer" | "pos_card";

export interface ReportDateRange {
    from: string;
    to: string;
}

export interface ReportParams {
    from?: string; // ISO date string — defaults to start of current month on the backend
    to?: string;   // ISO date string — defaults to now on the backend
    locationId?: string;
}

// ─── Sales report ───────────────────────────────────────────────────────

export interface SalesByPaymentMethod {
    _id: PaymentMethod;
    revenue: number;
    count: number;
}

export interface SalesByLocation {
    locationId: string | null;
    locationName: string;
    revenue: number;
    count: number;
}

export interface TopSoldItem {
    _id: string;
    name: string;
    quantitySold: number;
    revenue: number;
}

export interface SalesReport {
    range: ReportDateRange;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    salesCount: number;
    avgSaleValue: number;
    voidedCount: number;
    voidedValue: number;
    byPaymentMethod: SalesByPaymentMethod[];
    // Only populated when no locationId is passed — always empty when
    // scoped to a single location, since it'd just be a one-row echo.
    byLocation: SalesByLocation[];
    topItems: TopSoldItem[];
}

export async function getSalesReport(params: ReportParams = {}): Promise<SalesReport> {
    try {
        const response = await api.get("/reports/sales", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching sales report:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching sales report:", error);
        throw error;
    }
}

// ─── Inventory movement report ───────────────────────────────────────────

export type MovementType = "purchases" | "sales" | "wastage" | "expiry" | "adjustment" | "return";

export interface MovementSummary {
    quantity: number;
    value: number;
}

export interface InventoryReport {
    range: ReportDateRange;
    movements: Record<MovementType, MovementSummary>;
    currentLowStockCount: number;
}

export async function getInventoryReport(params: ReportParams = {}): Promise<InventoryReport> {
    try {
        const response = await api.get("/reports/inventory", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error fetching inventory report:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error fetching inventory report:", error);
        throw error;
    }
}