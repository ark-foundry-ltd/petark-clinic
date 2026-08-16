// lib/sales.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

export type PaymentMethod = "cash" | "transfer" | "pos_card";
export type SaleStatus = "paid" | "voided";

export interface SaleLineItem {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unitCost: number | null;
    subtotal: number;
    lineCost: number;
}

export interface SaleRecord {
    _id: string;
    clinicId: string;
    locationId: string;
    items: SaleLineItem[];
    totalAmount: number;
    totalCost: number;
    grossProfit: number;
    paymentMethod: PaymentMethod;
    soldBy: string;
    userId: string | null;
    status: SaleStatus;
    voidedBy?: string;
    voidReason?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Checkout ───────────────────────────────────────────────────────────

export interface CheckoutCartItem {
    itemId: string;
    quantity: number;
}

export interface CheckoutSalePayload {
    items: CheckoutCartItem[];
    paymentMethod: PaymentMethod;
    locationId: string;
    userId?: string;
}

export async function checkoutSale(payload: CheckoutSalePayload): Promise<SaleRecord> {
    if (!payload.locationId) {
        throw new Error("locationId is required — which branch is this sale at?");
    }
    try {
        const response = await api.post("/sales/checkout", payload);
        if (!response.data?.data) {
            throw new Error("Invalid response from server");
        }
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error checking out sale:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error checking out sale:", error);
        throw error;
    }
}

// ─── List ───────────────────────────────────────────────────────────────

export interface ListSalesParams {
    startDate?: string;
    endDate?: string;
    paymentMethod?: PaymentMethod;
    status?: SaleStatus;
    locationId?: string;
}

export async function listSales(params: ListSalesParams = {}): Promise<SaleRecord[]> {
    try {
        const response = await api.get("/sales", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error fetching sales:", error.response?.data || error.message);
        } else {
            console.error("Error fetching sales:", error);
        }
        throw error;
    }
}

// ─── Void ───────────────────────────────────────────────────────────────

export interface VoidSalePayload {
    reason: string;
}

export async function voidSale(saleId: string, payload: VoidSalePayload): Promise<void> {
    if (!/^[0-9a-fA-F]{24}$/.test(saleId)) {
        throw new Error("Invalid sale ID format");
    }
    if (!payload.reason.trim()) {
        throw new Error("A reason is required to void a sale");
    }
    try {
        await api.patch(`/sales/${saleId}/void`, payload);
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error voiding sale:", error.response?.data || error.message, `Sale ID: ${saleId}`);
            throw new Error(message);
        }
        console.error("Error voiding sale:", error);
        throw error;
    }
}