// lib/inventory.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type InventoryCategory =
    | "medication"
    | "vaccine"
    | "consumable"
    | "surgical"
    | "lab_reagent"
    | "other";

export interface InventoryImage {
    url: string;
    publicId: string;
}

export interface InventoryItemRecord {
    _id: string;
    clinicId: string;
    name: string;
    category: InventoryCategory;
    unit: string;
    sku: string;
    // Omitted entirely (not just null) for roles without VIEW_INVENTORY_COST —
    // shapeItemForRole strips this key server-side, it doesn't zero it out.
    costPrice?: number;
    sellingPrice: number;
    currentStock: number;
    reorderThreshold: number | null;
    requiresBatchTracking: boolean;
    isActive: boolean;
    images: InventoryImage[];
    createdAt: string;
    updatedAt: string;
}

// ─── Create ─────────────────────────────────────────────────────────────

export interface CreateInventoryItemPayload {
    name: string;
    category: InventoryCategory;
    unit: string;
    sku: string;
    costPrice?: number;
    sellingPrice: number;
    reorderThreshold?: number;
    requiresBatchTracking?: boolean;
}

export async function createInventoryItem(
    payload: CreateInventoryItemPayload
): Promise<InventoryItemRecord> {
    try {
        const response = await api.post("/inventory", payload);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error creating inventory item:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error creating inventory item:", error);
        }
        throw error;
    }
}

// ─── List ───────────────────────────────────────────────────────────────

export interface ListInventoryItemsParams {
    category?: InventoryCategory;
    lowStockOnly?: boolean;
    search?: string;
}

export async function listInventoryItems(
    params: ListInventoryItemsParams = {}
): Promise<InventoryItemRecord[]> {
    try {
        const response = await api.get("/inventory", {
            params: {
                ...params,
                lowStockOnly: params.lowStockOnly ? "true" : undefined,
            },
        });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching inventory items:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching inventory items:", error);
        }
        throw error;
    }
}

// ─── Get single item ────────────────────────────────────────────────────

export async function getInventoryItem(
    itemId: string
): Promise<InventoryItemRecord> {
    try {
        const response = await api.get(`/inventory/${itemId}`);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching inventory item:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching inventory item:", error);
        }
        throw error;
    }
}

// ─── Update (fields + optional image upload/removal) ───────────────────
// Sent as multipart/form-data whenever images are attached or removed,
// since the backend's updateInventoryItem reads new files off req.files
// (multer) and removeImagePublicIds off req.body — a plain JSON PATCH
// still works for field-only updates with no image changes.

export interface UpdateInventoryItemPayload {
    name?: string;
    category?: InventoryCategory;
    unit?: string;
    costPrice?: number;
    sellingPrice?: number;
    reorderThreshold?: number;
    requiresBatchTracking?: boolean;
    isActive?: boolean;
    // New image files to upload — max 2 total (existing + new) enforced server-side
    newImages?: File[];
    // publicIds of existing images to delete from Cloudinary + strip from the doc
    removeImagePublicIds?: string[];
}

export async function updateInventoryItem(
    itemId: string,
    payload: UpdateInventoryItemPayload
): Promise<InventoryItemRecord> {
    const { newImages, removeImagePublicIds, ...fields } = payload;
    const hasFiles = newImages && newImages.length > 0;
    const hasRemovals = removeImagePublicIds && removeImagePublicIds.length > 0;

    try {
        if (hasFiles || hasRemovals) {
            const formData = new FormData();

            Object.entries(fields).forEach(([key, value]) => {
                if (value !== undefined) formData.append(key, String(value));
            });

            if (hasRemovals) {
                formData.append(
                    "removeImagePublicIds",
                    JSON.stringify(removeImagePublicIds)
                );
            }

            if (hasFiles) {
                newImages.forEach((file) => formData.append("images", file));
            }

            const response = await api.patch(`/inventory/${itemId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        }

        const response = await api.patch(`/inventory/${itemId}`, fields);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error updating inventory item:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error updating inventory item:", error);
        }
        throw error;
    }
}

// ─── Manual stock adjustment ────────────────────────────────────────────

export type StockAdjustmentType =
    | "purchase"
    | "adjustment"
    | "wastage"
    | "expiry";

export interface AdjustStockPayload {
    quantity: number; // signed — positive for purchase/restock, negative for wastage/expiry
    type: StockAdjustmentType;
    note?: string;
}

export async function adjustStock(
    itemId: string,
    payload: AdjustStockPayload
): Promise<{ message: string }> {
    try {
        const response = await api.post(`/inventory/${itemId}/adjust`, payload);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error adjusting stock:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error adjusting stock:", error);
        }
        throw error;
    }
}