// lib/lab-results.ts
import api from "./api";
import axiosError from "axios";

export type LabTestType =
    | "hematology"
    | "microbiology"
    | "imaging"
    | "urinalysis"
    | "biochemistry"
    | "parasitology"
    | "other";

export type LabResultStatus = "pending" | "completed";

export interface LabFinding {
    parameter: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    flag?: "normal" | "high" | "low" | "critical";
}

export interface LabAttachment {
    url: string;
    filename: string;
    uploadedAt: string;
}

export interface LabResult {
    _id: string;
    visitId: string;
    petId: string;
    userId: string;
    clinicId: string;
    vetId: string | null;
    testName: string;
    testType: LabTestType;
    status: LabResultStatus;
    results: {
        summary: string | null;
        findings: LabFinding[];
    };
    attachments: LabAttachment[];
    orderedAt: string;
    resultedAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface LabResultResponse {
    status: string;
    data: LabResult;
}

interface LabResultsListResponse {
    status: string;
    results: number;
    data: LabResult[];
}

export interface AddLabResultPayload {
    visitId: string;
    petId: string;
    testName: string;
    testType: LabTestType;
    summary?: string;
    findings?: LabFinding[];
    notes?: string;
    orderedAt?: string;
    files?: File[];
}

function buildFormData(payload: Record<string, unknown>, files?: File[]): FormData {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (key === "findings") {
            form.append("findings", JSON.stringify(value));
        } else {
            form.append(key, String(value));
        }
    });
    files?.forEach((file) => form.append("attachments", file));
    return form;
}

export async function addLabResult(payload: AddLabResultPayload): Promise<LabResult> {
    try {
        const { files, ...rest } = payload;
        const form = buildFormData(rest, files);
        const response = await api.post<LabResultResponse>("/lab-results", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to add lab result");
        }
        throw new Error("An unexpected error occurred while adding the lab result");
    }
}

export async function getVisitLabResults(visitId: string): Promise<LabResult[]> {
    try {
        const response = await api.get<LabResultsListResponse>(`/lab-results/visit/${visitId}`);
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch lab results");
        }
        throw new Error("An unexpected error occurred while fetching lab results");
    }
}

export interface UpdateLabResultPayload {
    testName?: string;
    summary?: string;
    findings?: LabFinding[];
    notes?: string;
    status?: LabResultStatus;
    files?: File[];
}

export async function updateLabResult(
    labResultId: string,
    payload: UpdateLabResultPayload
): Promise<LabResult> {
    try {
        const { files, ...rest } = payload;
        const form = buildFormData(rest, files);
        const response = await api.patch<LabResultResponse>(`/lab-results/${labResultId}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to update lab result");
        }
        throw new Error("An unexpected error occurred while updating the lab result");
    }
}

export async function deleteLabResult(labResultId: string): Promise<void> {
    try {
        await api.delete(`/lab-results/${labResultId}`);
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to delete lab result");
        }
        throw new Error("An unexpected error occurred while deleting the lab result");
    }
}