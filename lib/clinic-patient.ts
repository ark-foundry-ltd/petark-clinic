// lib/clinic-patient.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export interface ReferredFrom {
    clinicId?: string;
    referralId?: string;
}

export interface PatientPet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    ageUnit?: "years" | "months";
    color?: string;
    weight?: number;
    weightUnit?: "kg" | "lbs";
    gender?: "male" | "female";
}

export interface PatientOwner {
    _id?: string;
    fullname: string;
    phoneNumber: string;
    email?: string;
}

export interface ClinicPatientRecord {
    _id: string;
    registrationNo: string;
    registrationStatus: string;
    registrationFee?: number;
    feeWaived?: boolean;
    clinicId: string;
    pet: PatientPet;
    owner?: PatientOwner;
}

// ─── Register: existing pet (petId), known owner + new pet (ownerId), ─────
// ─── or brand-new owner + pet (raw details) ────────────────────────────────

export interface RegisterPatientPayload {
    registrationNo: string; // required — staff-typed, unique per clinic

    // Present → existing pet path. Takes priority over ownerId if both present.
    petId?: string;

    // Present (and petId absent) → known owner, new pet path
    ownerId?: string;

    // New pet fields — required when petId is absent.
    // ownerName/ownerPhone only required when ownerId is ALSO absent (brand-new owner).
    petName?: string;
    species?: string;
    breed?: string;
    age?: string;
    ageUnit?: "years" | "months";
    color?: string;
    weight?: number;
    weightUnit?: "kg" | "lbs";
    gender?: "male" | "female";
    
    fullname?: string;
    phoneNumber?: string;
    email?: string;

    feeWaived?: boolean;
    waiverReason?: string;
    referredFrom?: ReferredFrom;
}

export async function registerPatient(
    payload: RegisterPatientPayload
): Promise<ClinicPatientRecord> {
    try {
        const response = await api.post("/patients/register-new", payload);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error registering patient:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error registering patient:", error);
        }
        throw error;
    }
}

// ─── Search: Find existing patients by reg no / name / phone ──────────────

export interface SearchClinicPatientsResult {
    count: number;
    data: ClinicPatientRecord[];
}

export async function searchClinicPatients(
    query: string
): Promise<SearchClinicPatientsResult> {
    try {
        const response = await api.get("/patients/search", {
            params: { q: query },
        });
        return {
            count: response.data.count,
            data: response.data.data,
        };
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error searching clinic patients:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error searching clinic patients:", error);
        }
        throw error;
    }
}

// ─── Get all patients registered at this clinic (paginated) ────────────────

export interface GetAllPatientsResult {
    count: number;
    total: number;
    page: number;
    totalPages: number;
    data: ClinicPatientRecord[];
}

export async function getAllPatients(
    page: number = 1,
    limit: number = 25
): Promise<GetAllPatientsResult> {
    try {
        const response = await api.get("/patients/all", {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching patients:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching patients:", error);
        }
        throw error;
    }
}

export interface ResolvedOwnerPet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    ageUnit?: "years" | "months";
    gender?: "male" | "female";
}

export interface ResolvedOwner {
    _id: string;
    fullname: string;
    phoneNumber: string;
    email: string;
}

export interface ResolveOwnerResult {
    owner: ResolvedOwner;
    pets: ResolvedOwnerPet[];
}

export async function resolveOwnerByEmail(
    email: string
): Promise<ResolveOwnerResult> {
    try {
        const response = await api.get("/clinic/resolve", {
            params: { email },
        });
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error resolving owner:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error resolving owner:", error);
        }
        throw error;
    }
}

export async function getClinicPatientById(id: string): Promise<ClinicPatientRecord> {
    try {
        const response = await api.get(`/patients/${id}`);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error fetching patient:", error.response?.data || error.message);
        } else {
            console.error("Error fetching patient:", error);
        }
        throw error;
    }
}