// lib/location.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

export interface Location {
    _id: string;
    clinicId: string;
    name: string;
    address: string;
    phoneNumber: string | null;
    isPrimary: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationPayload {
    name: string;
    address: string;
    phoneNumber?: string;
}

export interface UpdateLocationPayload {
    name?: string;
    address?: string;
    phoneNumber?: string;
}

function logError(label: string, error: unknown) {
    if (error instanceof AxiosError) {
        console.error(label, error.response?.data || error.message);
    } else {
        console.error(label, error);
    }
}

export async function listLocations(): Promise<Location[]> {
    try {
        const response = await api.get("/locations", {
            headers: { "Cache-Control": "no-cache" },
        });
        return response.data.data.locations;
    } catch (error) {
        logError("Error fetching locations:", error);
        throw error;
    }
}

export async function createLocation(
    payload: CreateLocationPayload
): Promise<{ locationId: string; name: string; address: string; isPrimary: boolean }> {
    try {
        const response = await api.post("/locations", payload);
        return response.data.data;
    } catch (error) {
        logError("Error creating location:", error);
        throw error;
    }
}

export async function updateLocation(
    locationId: string,
    payload: UpdateLocationPayload
): Promise<Location> {
    try {
        const response = await api.patch(`/locations/${locationId}`, payload);
        return response.data.data.location;
    } catch (error) {
        logError("Error updating location:", error);
        throw error;
    }
}

export async function toggleLocationStatus(
    locationId: string,
    isActive: boolean
): Promise<{ locationId: string; isActive: boolean }> {
    try {
        const response = await api.patch(`/locations/${locationId}/status`, { isActive });
        return response.data.data;
    } catch (error) {
        logError("Error toggling location status:", error);
        throw error;
    }
}