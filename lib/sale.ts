// lib/sale.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type PaymentMethod = "cash" | "transfer" | "pos_card";
export type SaleStatus = "paid" | "voided";

export interface SaleItemRecord {
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface SaleRecord {
    _id: string;
    clinicId: string;
    items: SaleItemRecord[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    soldBy: string;
    userId: string | null;
    status: SaleStatus;
    voidedBy?: string | null;
    voidReason?: string | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Checkout ───────────────────────────────────────────────────────────

export interface CartItem {
    itemId: string;
    quantity: number;
}

export interface CheckoutSalePayload {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    // Optional — link the sale to a registered pet owner, e.g. selected
    // from search during checkout. Omit for a walk-in/anonymous sale.
    userId?: string;
}

export async function checkoutSale(
    payload: CheckoutSalePayload
): Promise<SaleRecord> {
    try {
        const response = await api.post("/sales/checkout", payload);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error checking out sale:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error checking out sale:", error);
        }
        throw error;
    }
}

// ─── Void ───────────────────────────────────────────────────────────────
// Requires MANAGE_INVENTORY on the backend — clinic-role only.

export async function voidSale(
    saleId: string,
    reason: string
): Promise<{ message: string }> {
    try {
        const response = await api.patch(`/sales/${saleId}/void`, { reason });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error voiding sale:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error voiding sale:", error);
        }
        throw error;
    }
}

// ─── List ───────────────────────────────────────────────────────────────

export interface ListSalesParams {
    startDate?: string;
    endDate?: string;
    paymentMethod?: PaymentMethod;
    status?: SaleStatus;
}

export async function listSales(
    params: ListSalesParams = {}
): Promise<SaleRecord[]> {
    try {
        const response = await api.get("/sales", { params });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching sales:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching sales:", error);
        }
        throw error;
    }
}