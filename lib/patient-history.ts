// lib/patient-history.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

function logError(action: string, error: unknown) {
    if (error instanceof AxiosError) {
        console.error(`Error ${action}:`, error.response?.data || error.message);
    } else {
        console.error(`Error ${action}:`, error);
    }
}

// 402 (plan) or 403 (role) → show a "not available" card instead of an error
export function isRestrictedError(error: unknown): boolean {
    return (
        error instanceof AxiosError &&
        (error.response?.status === 402 || error.response?.status === 403)
    );
}

// ─── Visits ────────────────────────────────────────────────────────────────

export interface RecordPerson {
    fullname?: string;
    name?: string;
    clinicName?: string;
    role?: string;
    email?: string;
    specialization?: string;
}

export interface PatientVisit {
    _id: string;
    petId: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    vetId?: string | null;
    vet?: RecordPerson | null;
    vitals?: {
        weight?: string | number;
        temp?: string | number;
        pulse?: string | number;
        respiration?: string | number;
        appetite?: string | number;
        activity?: string | number;
    };
    soap?: {
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
    };
    servicesProvided?: unknown[];
    selectedServices?: unknown[];
    notes?: string;
}

export interface PatientVisitsResult {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: PatientVisit[];
}

export async function getPatientVisits(
    petId: string,
    page: number = 1
): Promise<PatientVisitsResult> {
    try {
        const response = await api.get("/visit/clinic", { params: { petId, page } });
        return response.data;
    } catch (error) {
        logError("fetching patient visits", error);
        throw error;
    }
}

// ─── Treatments (also used for vaccinations via the type filter) ───────────

export interface PatientTreatment {
    _id: string;
    petId: string;
    visitId?: string | null;
    type: string;
    name: string;
    dosage?: string | null;
    minDoseMg?: number | null;
    maxDoseMg?: number | null;
    unit?: string | null;
    frequency?: string | null;
    notes?: string | null;
    status: "completed" | "active" | "upcoming" | "overdue" | string;
    administeredAt?: string;
    nextDueAt?: string | null;
    createdAt?: string;
    vetId?: string | null;
    vet?: { fullname?: string } | null;
}

export interface TreatmentSummary {
    total: number;
    upcoming: number;
    overdue: number;
}

export interface PatientTreatmentsResult {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    timeline: PatientTreatment[];
    summary: TreatmentSummary;
}

export async function getPatientTreatments(
    petId: string,
    opts: { type?: string; page?: number; limit?: number } = {}
): Promise<PatientTreatmentsResult> {
    try {
        const response = await api.get(`/treatments/pet/${petId}`, {
            params: { type: opts.type, page: opts.page ?? 1, limit: opts.limit ?? 10 },
        });
        const { pagination, data } = response.data;
        return {
            pagination,
            timeline: data.timeline,
            summary: {
                total: data.summary.total,
                upcoming: data.summary.upcoming,
                overdue: data.summary.overdue,
            },
        };
    } catch (error) {
        logError("fetching patient treatments", error);
        throw error;
    }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getAdministeredByDisplay(record: {
    vetId?: string | null;
    vet?: RecordPerson | null;
}): string {
    const person = record.vet;
    const name = person?.fullname ?? person?.name ?? person?.clinicName;

    if (name) {
        // A clinic account that ran the visit shows its own name, not "Dr."
        return person?.role === "clinic" ? name : `Dr. ${name}`;
    }
    if (record.vetId) return "Vet";
    return "Clinic Staff";
}