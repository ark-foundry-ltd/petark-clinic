// lib/visit.ts

import api from "./api";
import axiosError from "axios";
import { type ClinicService } from "./user";

interface Vitals {
    weight: number | null;
    temp: number | null;
    pulse: number | null;
    respiration: number | null;
    appetite: "normal" | "reduced" | "increased" | "absent" | null;
    activity: "active" | "lethargic" | "hyperactive" | "normal" | null;
}

interface Billing {
    total: number;
}

export type PaymentMethod = "cash" | "transfer" | "pos_card";

interface FollowUp {
    serviceId: string | null;
    serviceName: string;
    date: string | null;
    time: string | null;
    notes: string;
    createdAt: string;
}

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string;
    gender: "male" | "female";
    photo?: string;
}

interface Vet {
    _id: string;
    name?: string;
}

interface SOAP {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export interface CompleteVisitPayload {
    soap: {
        subjective?: string;
        objective: string;
        assessment: string;
        plan: string;
    };
}

export interface CompleteVisitAIPayload {
    roughNotes: string;
}

interface ApiVisitResponse {
    _id: string;
    appointmentId: string;
    petId: string;
    userId: string;
    clinicId: string;
    vetId: string | null;
    status: "in-progress" | "completed";
    vitals: Vitals;
    soap: SOAP;
    servicesProvided?: string[] | ClinicService[];
    selectedServices?: ClinicService[];
    followUps: FollowUp[];
    billing: Billing;
    paymentStatus: "unpaid" | "paid";
    paymentMethod?: PaymentMethod;
    paidBy?: string;
    createdAt: string;
    completedAt: string | null;
    paidAt: string | null;
    pet: Pet;
    vet?: Vet;
}


export interface Visit extends ApiVisitResponse {
    administeredBy: string;
}

interface GetVisitResponse {
    status: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: number;
    data: ApiVisitResponse[];
}

export interface CreateVisitPayload {
    appointmentId?: string;
    clinicPatientId?: string;
    vetId?: string;
    servicesProvided?: string[];
    vitals?: Partial<Vitals>;
    chiefComplaint?: string;
    followUps?: Omit<FollowUp, "createdAt">[];
}

interface CreateVisitResponse {
    status: string;
    data: ApiVisitResponse;
}

export interface UpdateVisitVitalsPayload {
    vitals?: Partial<Vitals>;
}

interface UpdateVisitVitalsResponse {
    status: string;
    data: {
        visit: ApiVisitResponse;
    };
}

export interface MarkVisitPaidPayload {
    paymentMethod: PaymentMethod;
}

export interface VitalsTrendPoint {
    date: string;
    label: string;
    temp: number | null;
    pulse: number | null;
    respiration: number | null;
    appetite: string | null;
    activity: string | null;
    diagnosis: string | null;
}

export interface WeightTrendPoint {
    date: string;
    label: string;
    weight: number | null;
    diagnosis: string | null;
}

export interface PetTrendsResponse {
    status: string;
    results: number;
    data: {
        vitalsTrend: VitalsTrendPoint[];
        weightTrend: WeightTrendPoint[];
    };
}

// ─── API Functions ─────────────────────────────────────────────────────────

export async function createVisit(payload: CreateVisitPayload): Promise<ApiVisitResponse> {
    try {
        const response = await api.post<CreateVisitResponse>("/visit", payload);
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to create visit");
        }
        throw new Error("An unexpected error occurred while creating visit");
    }
}

export async function updateVisitVitals(
    visitId: string,
    payload: UpdateVisitVitalsPayload
): Promise<ApiVisitResponse> {
    try {
        const response = await api.patch<UpdateVisitVitalsResponse>(
            `/visit/vitals/${visitId}`,
            payload
        );
        return response.data.data.visit;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to update visit");
        }
        throw new Error("An unexpected error occurred while updating visit");
    }
}

export async function getVisit(): Promise<Visit[]> {
    try {
        const response = await api.get<GetVisitResponse>("/visit/clinic");

        const visits: Visit[] = response.data.data.map((visit: ApiVisitResponse) => ({
            ...visit,
            administeredBy: visit.vetId ? "Vet" : "Clinic",
        }));

        return visits;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch visit");
        }
        throw new Error("An unexpected error occurred while fetching visit");
    }
}

// ─── Helper Functions ──────────────────────────────────────────────────────

export function getAdministeredByDisplay(visit: Visit): string {
    if (visit.vetId && visit.vet?.name) {
        return `Dr. ${visit.vet.name}`;
    }
    if (visit.vetId) {
        return "Vet";
    }
    return "Clinic Staff";
}

export async function completeVisit(
    visitId: string,
    payload: CompleteVisitPayload
): Promise<ApiVisitResponse> {
    try {
        const response = await api.patch<{ status: string; data: ApiVisitResponse }>(
            `/visit/complete/${visitId}`,
            payload
        );
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to complete visit");
        }
        throw new Error("An unexpected error occurred while completing visit");
    }
}

export async function completeVisitWithAI(
    visitId: string,
    payload: CompleteVisitAIPayload
): Promise<ApiVisitResponse> {
    try {
        const response = await api.patch<{ status: string; data: ApiVisitResponse }>(
            `/visit/complete/${visitId}/ai`,
            payload
        );
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            const meta = error.response?.data?.meta;
            if (meta?.code === 'PLAN_UPGRADE_REQUIRED') {
                throw { isUpgradeRequired: true, ...meta };
            }
            throw new Error(error.response?.data?.message || "Failed to complete visit with AI");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function markVisitPaid(
    visitId: string,
    payload: MarkVisitPaidPayload
): Promise<ApiVisitResponse> {
    try {
        const response = await api.patch<{ status: string; data: ApiVisitResponse }>(
            `/visit/${visitId}/mark-paid`,
            payload
        );
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to mark visit as paid");
        }
        throw new Error("An unexpected error occurred while marking visit as paid");
    }
}

export async function getPetTrends(petId: string): Promise<PetTrendsResponse['data']> {
    try {
        const response = await api.get<PetTrendsResponse>(`/visit/pro/trends/${petId}`);
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch pet trends");
        }
        throw new Error("An unexpected error occurred while fetching trends");
    }
}

export async function getCurrentVisitForPatient(clinicPatientId: string): Promise<ApiVisitResponse | null> {
    try {
        const response = await api.get<{ status: string; data: ApiVisitResponse | null }>(
            `/visit/patient/${clinicPatientId}/current`
        );
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to check for an existing visit");
        }
        throw new Error("An unexpected error occurred while checking for an existing visit");
    }
}