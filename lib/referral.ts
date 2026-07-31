// lib/referral.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type ReferralStatus = "pending" | "accepted" | "declined";

export interface ReferralPetSummary {
    _id: string;
    name: string;
    species: string;
    breed?: string | null;
}

export interface ReferralClinicSummary {
    _id: string;
    clinicName: string;
}

export interface ReferralRecord {
    _id: string;
    petId: string;
    fromClinicId: string;
    toClinicId: string;
    referredBy: string;
    reason: string;
    clinicalSummary: string;
    sharedRecords: string[];
    status: ReferralStatus;
    acceptedBy: string | null;
    respondedAt: string | null;
    createdAt: string;
    updatedAt: string;
    pet?: ReferralPetSummary;
    fromClinic?: ReferralClinicSummary;
    toClinic?: ReferralClinicSummary;
    // The _id of the clinicPatients doc this referral produced once accepted —
    // populated by listReferrals via a lookup on referredFrom.referralId.
    // null/undefined for pending or declined referrals.
    clinicPatientId?: string | null;
}

// Raw clinicPatient doc as inserted by acceptReferral — flat ids, not the
// populated shape (pet/owner nested) used by @/lib/clinic-patient elsewhere.
export interface ReferralClinicPatient {
    _id: string;
    petId: string;
    clinicId: string;
    registrationNo: string;
    registrationStatus: string;
    registrationFee: number;
    feeWaived: boolean;
    waiverReason: string | null;
    collectedBy: string | null;
    referredFrom: {
        clinicId: string;
        referralId: string;
    };
    registeredBy: string;
    registeredAt: string;
    createdAt: string;
    updatedAt: string;
}

// Read-only shape of a visit as returned by getSharedRecords — matches the
// $project fields in that endpoint exactly (no billing/payment fields,
// since the receiving clinic has no business seeing the referring clinic's
// pricing/payment data, only the clinical content).
export interface SharedRecordVisit {
    _id: string;
    vitals: {
        weight: number | null;
        temp: number | null;
        pulse: number | null;
        respiration: number | null;
        appetite: string | null;
        activity: string | null;
    };
    soap: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    };
    servicesProvided: string[];
    selectedServices: Array<{ _id: string; name?: string; price?: number }>;
    status: string;
    createdAt: string;
    completedAt: string | null;
}

// ─── Create: referring clinic sends a pet to another clinic ───────────────

export interface CreateReferralPayload {
    petId: string;
    toClinicId: string;
    reason: string;
    clinicalSummary?: string;
    sharedRecords?: string[];
}

// POST /api/referrals returns { referralId, ...referral } at the top level,
// not nested — mirror that shape rather than wrapping it.
export interface CreateReferralResult extends ReferralRecord {
    referralId: string;
}

export async function createReferral(
    payload: CreateReferralPayload
): Promise<CreateReferralResult> {
    try {
        const response = await api.post("/referrals", payload);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error creating referral:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error creating referral:", error);
        }
        throw error;
    }
}

// ─── Accept: receiving clinic accepts a pending referral ──────────────────

export interface AcceptReferralPayload {
    feeWaived?: boolean;
    waiverReason?: string;
}

export interface AcceptReferralResult {
    referral: ReferralRecord;
    clinicPatient: ReferralClinicPatient;
    // true when the pet was already an active patient at the receiving
    // clinic — acceptReferral skips creating a duplicate registration and
    // reuses the existing clinicPatients record in that case.
    alreadyPatient: boolean;

}

export async function acceptReferral(
    referralId: string,
    payload: AcceptReferralPayload = {}
): Promise<AcceptReferralResult> {
    try {
        const response = await api.patch(
            `/referrals/${referralId}/accept`,
            payload
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error accepting referral:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error accepting referral:", error);
        }
        throw error;
    }
}

// ─── Decline: receiving clinic declines a pending referral ────────────────

export async function declineReferral(
    referralId: string
): Promise<{ message: string }> {
    try {
        const response = await api.patch(`/referrals/${referralId}/decline`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error declining referral:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error declining referral:", error);
        }
        throw error;
    }
}

// ─── List: inbound or outbound referrals for the logged-in clinic ─────────

export interface ListReferralsParams {
    direction?: "inbound" | "outbound";
    status?: ReferralStatus;
}

export async function listReferrals(
    params: ListReferralsParams = {}
): Promise<ReferralRecord[]> {
    try {
        const response = await api.get("/referrals", { params });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching referrals:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching referrals:", error);
        }
        throw error;
    }
}

// ─── Shared records: read-only visits a referral explicitly shared ────────
// Backed by getSharedRecords in referralController.js — the deliberate,
// narrow exception to per-clinic data isolation. Authorized for either side
// of the referral (from or to clinic).

export async function getSharedRecords(
    referralId: string
): Promise<SharedRecordVisit[]> {
    try {
        const response = await api.get(`/referrals/${referralId}/shared-records`);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching shared records:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching shared records:", error);
        }
        throw error;
    }
}

// ─── Clinics: search other clinics on the platform (referral target picker) ─
// Backed by searchClinics in referralController.js — kept in this file since
// its only consumer is the referral flow.

// Matches CLINIC_PUBLIC_PROJECTION in referralController.js exactly —
// no password, tokens, or pushSubscription ever come back here.
export interface ClinicSearchResult {
    _id: string;
    clinicName: string;
    email: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    phoneNumber?: string;
    licenseNumber?: string;
    status?: string;
    startingTime?: string;
    closingTime?: string;
    daysOpen?: string[];
    serviceProvided?: string;
    animalsHandled?: string;
}

export interface SearchClinicsResult {
    count: number;
    data: ClinicSearchResult[];
}

export async function searchClinics(
    q?: string
): Promise<SearchClinicsResult> {
    try {
        const response = await api.get("/referrals/clinics", {
            params: q ? { q } : {},
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error searching clinics:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error searching clinics:", error);
        }
        throw error;
    }
}