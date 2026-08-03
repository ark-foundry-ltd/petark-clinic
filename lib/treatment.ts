// lib/treatment.ts

import api from "./api";
import { AxiosError } from "axios";

export type TreatmentStatus = "active" | "completed" | "overdue" | "upcoming";

export interface Treatment {
    _id: string;
    petId: string;
    userId: string;
    clinicId: string;
    vetId: string | null;
    visitId: string | null;
    type: string;
    name: string;
    dosage: string | null;
    minDoseMg: number | null;
    maxDoseMg: number | null;
    unit: string | null;
    frequency: string | null;
    administeredAt: string;
    nextDueAt: string | null;
    notes: string | null;
    status: TreatmentStatus;
    reminderSent1Day?: boolean;
    reminderSent7Day?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TreatmentSummary {
    total: number;
    upcoming: number;
    overdue: number;
    upcomingItems: Treatment[];
    overdueItems: Treatment[];
}

export interface PlanUsage {
    plan: string;
    used: number;
    limit: number | null;
    unlimited: boolean;
    remaining: number | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface TreatmentTimelineResponse {
    status: string;
    results: number;
    pagination: Pagination;
    data: {
        timeline: Treatment[];
        summary: TreatmentSummary;
        planUsage: PlanUsage;
    };
}

export interface AddTreatmentPayload {
    petId: string;
    visitId?: string;
    type: string;
    name: string;
    dosage?: string;
    minDoseMg?: number;
    maxDoseMg?: number;
    unit?: string;
    frequency?: string;
    administeredAt?: string;
    nextDueAt?: string;
    notes?: string;
}

export async function getPetTreatmentTimeline(
    petId: string,
    options?: { type?: string; page?: number; limit?: number }
): Promise<TreatmentTimelineResponse> {
    try {
        const params = new URLSearchParams();
        if (options?.type) params.set("type", options.type);
        if (options?.page) params.set("page", String(options.page));
        if (options?.limit) params.set("limit", String(options.limit));

        const query = params.toString();
        const url = query
            ? `/treatments/pet/${petId}?${query}`
            : `/treatments/pet/${petId}`;

        const response = await api.get<TreatmentTimelineResponse>(url);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to fetch treatments");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function addTreatment(payload: AddTreatmentPayload): Promise<Treatment> {
    try {
        const response = await api.post<{ status: string; data: Treatment }>(
            "/treatments",
            payload
        );
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to add treatment");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function updateTreatment(
    treatmentId: string,
    payload: Partial<AddTreatmentPayload> & { status?: TreatmentStatus }
): Promise<Treatment> {
    try {
        const response = await api.patch<{ status: string; data: Treatment }>(
            `/treatments/${treatmentId}`,
            payload
        );
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to update treatment");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function deleteTreatment(treatmentId: string): Promise<void> {
    try {
        await api.delete(`/treatments/${treatmentId}`);
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to delete treatment");
        }
        throw new Error("An unexpected error occurred");
    }
}