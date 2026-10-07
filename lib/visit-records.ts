// lib/visit-records.ts

import api from "./api";
import axiosError from "axios";
import type { CustomVitalValue } from "./visit";

export interface VisitRecordPet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string;
    gender: "male" | "female";
    photo?: string;
}

export interface VisitRecordVet {
    _id: string;
    name?: string;
    email?: string;
    specialization?: string;
}

export interface VisitRecordVitals {
    weight: number | null;
    temp: number | null;
    pulse: number | null;
    respiration: number | null;
    appetite: "normal" | "reduced" | "increased" | "absent" | null;
    activity: "active" | "lethargic" | "hyperactive" | "normal" | null;
    // Keyed by custom field _id. Older visits have none, so read as `custom ?? {}`
    custom?: Record<string, CustomVitalValue>;
}

export interface VisitRecordSOAP {
    subjective: string;  // chief complaint — set at createVisit
    objective: string;   // clinical findings — set at completeVisit
    assessment: string;  // diagnosis — set at completeVisit
    plan: string;        // treatment/follow-up — set at completeVisit
}

export interface VisitRecordFollowUp {
    serviceId: string | null;
    serviceName: string;
    date: string | null;
    time: string | null;
    notes: string;
    createdAt: string;
}

export interface VisitRecordService {
    _id: string;
    name: string;
    price?: number;
}

export interface VisitRecordBilling {
    professionalFee: number;
    vat: number;
    total: number;
}

export interface VisitRecord {
    _id: string;
    appointmentId: string;
    petId: string;
    userId: string;
    clinicId: string;
    vetId: string | null;
    status: "in-progress" | "completed";
    vitals: VisitRecordVitals;
    soap: VisitRecordSOAP;
    followUps: VisitRecordFollowUp[];
    servicesProvided: string[];
    selectedServices: VisitRecordService[];
    billing: VisitRecordBilling;
    paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
    createdAt: string;
    completedAt: string | null;
    paidAt: string | null;
    pet?: VisitRecordPet;
    vet?: VisitRecordVet;
}

export interface VisitRecordsPage {
    data: VisitRecord[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: number;
}

interface VisitRecordsResponse {
    status: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: number;
    data: VisitRecord[];
}

export interface GetVisitRecordsParams {
    page?: number;
    status?: VisitRecord["status"];
}

export async function getVisitRecords(params: GetVisitRecordsParams = {}): Promise<VisitRecordsPage> {
    try {
        const query: Record<string, string> = {};
        if (params.page != null)   query.page   = String(params.page);
        if (params.status != null) query.status = params.status;

        const response = await api.get<VisitRecordsResponse>("/visit/clinic", { params: query });
        const { data, page, limit, total, totalPages, results } = response.data;
        return { data, page, limit, total, totalPages, results };
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch visit records");
        }
        throw new Error("An unexpected error occurred while fetching visit records");
    }
}

export function getAdministeredBy(visit: VisitRecord): string {
    if (visit.vet?.name) return `Dr. ${visit.vet.name}`;
    if (visit.vetId)     return "Vet";
    return "Clinic Staff";
}