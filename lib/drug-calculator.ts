// lib/drug-calculator.ts


import api from "./api";
import { AxiosError } from "axios";

export interface DrugDoseInfo {
    min: number;
    max: number;
    unit: string;
    frequency?: string;
    duration?: string;
    warning?: string;
}

export interface Drug {
    id: string;
    key: string;
    name: string;
    category: string;
    species: string[];
}

export interface AddDrugPayload {
    name: string;
    category?: string;
    doses: Record<string, DrugDoseInfo>;
    warnings?: string[];
    contraindications?: string[];
}

export interface CustomDosePayload {
    min: number;
    max: number;
    unit: string;
    frequency?: string;
    duration?: string;
}

export interface CalculateDosagePayload {
    drug: string;
    weight: number;
    species: string;
    concentration?: string;
    customDose?: CustomDosePayload;
}

export interface VolumeInfo {
    concentration: string;
    minVolumeML: number;
    maxVolumeML: number;
}

export interface DosageResult {
    drug: string;
    category: string;
    species: string;
    weight: string;
    minDose?: string;
    maxDose?: string;
    minDoseMg?: number;
    maxDoseMg?: number;
    doseRange?: string;
    frequency: string;
    duration: string;
    volumeInfo?: VolumeInfo;
    warnings: string[];
    note?: string;
}

export interface CalculateDosageResponse {
    status: string;
    source: "formulary" | "custom";
    data: DosageResult;
}

export async function listDrugs(): Promise<Drug[]> {
    try {
        const response = await api.get<{ status: string; results: number; data: { drugs: Drug[] } }>(
            "/drug-calculator/drugs"
        );
        return response.data.data.drugs;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to fetch drug formulary");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function addDrug(payload: AddDrugPayload): Promise<Drug> {
    try {
        const response = await api.post<{ status: string; data: Drug }>(
            "/drug-calculator/drugs",
            payload
        );
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to add drug");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function updateDrug(
    drugId: string,
    payload: Partial<AddDrugPayload>
): Promise<Drug> {
    try {
        const response = await api.patch<{ status: string; data: Drug }>(
            `/drug-calculator/drugs/${drugId}`,
            payload
        );
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to update drug");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function deleteDrug(drugId: string): Promise<void> {
    try {
        await api.delete(`/drug-calculator/drugs/${drugId}`);
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to delete drug");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function calculateDosage(
    payload: CalculateDosagePayload
): Promise<CalculateDosageResponse> {
    try {
        const response = await api.post<CalculateDosageResponse>(
            "/drug-calculator/calculate",
            payload
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to calculate dosage");
        }
        throw new Error("An unexpected error occurred");
    }
}