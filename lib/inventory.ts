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

export interface StockByLocation {
    locationId: string;
    locationName: string;
    currentStock: number;
    reorderThreshold: number | null;
    isLow: boolean;
}

export interface InventoryItemRecord {
    _id: string;
    clinicId: string;
    name: string;
    category: InventoryCategory;
    unit: string;
    sku: string;
    costPrice?: number;
    sellingPrice: number;
    currentStock: number;
    isLowStock: boolean;
    reorderThreshold: number | null;
    requiresBatchTracking: boolean;
    expiryDate: string | null;
    expiryReminderSent?: boolean;
    isActive: boolean;
    images: InventoryImage[];
    stockByLocation?: StockByLocation[];
    hasStockAtLocation?: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Create ─────────────────────────────────────────────────────────────

export interface CreateInventoryItemPayload {
    name: string;
    category: InventoryCategory;
    unit: string;
    sku: string;
    locationId: string;
    initialStock: number;
    costPrice?: number;
    sellingPrice: number;
    reorderThreshold?: number;
    requiresBatchTracking?: boolean;
    expiryDate?: string;
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

// ─── Add an existing catalog item to another location ──────────────────

export interface AddItemToLocationPayload {
    locationId: string;
    initialStock: number;
}

export async function addItemToLocation(
    itemId: string,
    payload: AddItemToLocationPayload
): Promise<{ clinicId: string; itemId: string; locationId: string; currentStock: number }> {
    try {
        const response = await api.post(`/inventory/${itemId}/locations`, payload);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error adding item to location:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error adding item to location:", error);
        }
        throw error;
    }
}

// ─── List ───────────────────────────────────────────────────────────────

export interface ListInventoryItemsParams {
    category?: InventoryCategory;
    lowStockOnly?: boolean;
    search?: string;
    locationId?: string;
    page?: number;
    limit?: number;
}

export interface ListInventoryItemsResult {
    items: InventoryItemRecord[];
    total: number;
    page: number;
    totalPages: number;
}

export async function listInventoryItems(
    params: ListInventoryItemsParams = {}
): Promise<ListInventoryItemsResult> {
    try {
        const response = await api.get("/inventory", {
            params: {
                ...params,
                lowStockOnly: params.lowStockOnly ? "true" : undefined,
            },
        });
        return {
            items: response.data.data,
            total: response.data.total,
            page: response.data.page,
            totalPages: response.data.totalPages,
        };
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
    itemId: string,
    locationId?: string
): Promise<InventoryItemRecord> {
    try {
        const response = await api.get(`/inventory/${itemId}`, {
            params: locationId ? { locationId } : undefined,
        });
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

export interface UpdateInventoryItemPayload {
    name?: string;
    category?: InventoryCategory;
    unit?: string;
    costPrice?: number;
    sellingPrice?: number;
    reorderThreshold?: number;
    requiresBatchTracking?: boolean;
    isActive?: boolean;
    expiryDate?: string | null;
    newImages?: File[];
    removeImagePublicIds?: string[];
}

export async function updateInventoryItem(
    itemId: string,
    payload: UpdateInventoryItemPayload
): Promise<InventoryItemRecord> {
    if (!itemId || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
        throw new Error('Invalid item ID format');
    }

    const { newImages, removeImagePublicIds, ...fields } = payload;
    const hasFiles = !!newImages?.length;
    const hasRemovals = !!removeImagePublicIds?.length;

    const NUMERIC_FIELDS = ['sellingPrice', 'costPrice', 'reorderThreshold'] as const;
    const BOOLEAN_FIELDS = ['requiresBatchTracking', 'isActive'] as const;

    try {
        let response;

        if (hasFiles || hasRemovals) {
            const formData = new FormData();

            for (const [key, value] of Object.entries(fields)) {
                if (value === undefined || value === null) continue;

                if ((NUMERIC_FIELDS as readonly string[]).includes(key)) {
                    const numValue = Number(value);
                    if (Number.isNaN(numValue)) {
                        throw new Error(`${key} must be a valid number`);
                    }
                    formData.append(key, numValue.toString());
                } else if ((BOOLEAN_FIELDS as readonly string[]).includes(key)) {
                    formData.append(key, value ? 'true' : 'false');
                } else {
                    formData.append(key, String(value));
                }
            }

            if (hasRemovals) {
                formData.append('removeImagePublicIds', JSON.stringify(removeImagePublicIds));
            }

            if (hasFiles) {
                newImages.forEach((file) => formData.append('images', file));
            }

            response = await api.patch(`/inventory/${itemId}`, formData);
        } else {
            const jsonPayload: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(fields)) {
                if (value === undefined) continue;
                if ((NUMERIC_FIELDS as readonly string[]).includes(key) && typeof value === 'string') {
                    const numValue = Number(value);
                    if (Number.isNaN(numValue)) {
                        throw new Error(`${key} must be a valid number`);
                    }
                    jsonPayload[key] = numValue;
                } else {
                    jsonPayload[key] = value;
                }
            }
            response = await api.patch(`/inventory/${itemId}`, jsonPayload);
        }

        if (!response.data?.data) {
            throw new Error('Invalid response from server');
        }
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error('Error updating inventory item:', error.response?.data ?? message, `Item ID: ${itemId}`);

            if (error.response?.status === 404) {
                throw new Error('Item not found. It may have been deleted by another user.');
            }
            throw new Error(`Failed to update item: ${message}`);
        }
        if (error instanceof Error) throw error;
        console.error('Error updating inventory item:', error);
        throw error;
    }
}

// ─── Manual stock adjustment — now per-location ─────────────────────────

export type StockAdjustmentType =
    | "purchase"
    | "adjustment"
    | "wastage"
    | "expiry";

export interface AdjustStockPayload {
    locationId: string;
    quantity: number;
    type: StockAdjustmentType;
    note?: string;
    unitCost?: number;
}

export async function adjustStock(
    itemId: string,
    payload: AdjustStockPayload
): Promise<{ message: string }> {
    if (!payload.locationId) {
        throw new Error("locationId is required");
    }
    if (payload.type === "purchase" && (payload.unitCost === undefined || payload.unitCost < 0)) {
        throw new Error("unitCost is required for purchase adjustments");
    }
    try {
        const response = await api.post(`/inventory/${itemId}/adjust`, payload);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message;
            console.error("Error adjusting stock:", error.response?.data || error.message);
            throw new Error(message);
        }
        console.error("Error adjusting stock:", error);
        throw error;
    }
}

// ─── Stats ──────────────────────────────────────────────────────────────

export interface InventoryStats {
    totalSkus: number;
    lowStock: number;
    inventoryValue: number;
    monthlyGrowthPercent: number;
}

export async function getInventoryStats(locationId?: string): Promise<InventoryStats> {
    try {
        const response = await api.get("/inventory/stats", {
            params: locationId ? { locationId } : undefined,
        });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching inventory stats:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching inventory stats:", error);
        }
        throw error;
    }
}