// lib/user.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
}

export type StaffRole = "vet" | "receptionist" | "sales" | "custom";

export interface StaffMember {
    _id: string;
    fullname: string;
    email: string;
    role: StaffRole;
    customRoleId?: string | null;
    customRoleName?: string | null;
    clinicId: string;
    status: "invited" | "active" | "revoked";
    isEmailVerified: boolean;
    createdAt: string;
}

export interface ClinicService {
    _id: string;
    name: string;
    price: number;
}

export interface Subscription {
    plan: 'free' | 'pro' | 'standard' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    startedAt: string | null;
    expiresAt: string | null;
    paystackSubscriptionCode: string | null;
    paystackNextPaymentDate: string | null;
}

export interface User {
    id: string;
    clinicName: string;
    email: string;
    phoneNumber: string;
    address: Address;
    additionalDocuments: string[];
    servicesProvided: ClinicService[];
    animalsHandled: string[];
    status: string;
    startingTime: string;
    closingTime: string;
    daysOpen: string[];
    staff: StaffMember[];
    subscription: Subscription;
    registration?: {
        enabled: boolean;
        fee: number;
    };
}

export interface StaffProfile {
    id: string;
    fullname: string;
    email: string;
    role: StaffRole;
    customRoleId: string | null;
    customRoleName: string | null;
    clinicId: string;
    status: "invited" | "active" | "revoked";
    isEmailVerified: boolean;
    createdAt: string;
    clinicName: string;
    clinicPlan: 'free' | 'pro' | 'standard' | 'enterprise';
    clinicPlanStatus: 'active' | 'inactive' | 'cancelled';
    clinicRegistrationFee: number;     
    clinicRegistrationEnabled: boolean;
    clinicServicesProvided: ClinicService[]; 
}

export type MeResponse =
    | { role: "clinic"; permissions: string[]; clinic: User }
    | { role: Exclude<StaffRole, never>; permissions: string[]; profile: StaffProfile };

export function isClinicResponse(
    data: MeResponse
): data is { role: "clinic"; permissions: string[]; clinic: User } {
    return data.role === "clinic";
}

// Kept for existing clinic-only call sites — still hits the same /clinic/profile
// endpoint, which now branches server-side but only ever returns the clinic
// shape when called by a clinic-role user.
export async function getUser(): Promise<User> {
    try {
        const response = await api.get("/clinic/profile");
        return response.data.data.clinic as User;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error fetching user profile:", error.response?.data || error.message);
        } else {
            console.error("Error fetching user profile:", error);
        }
        throw error;
    }
}

// New: role-aware fetch, for use right after login when you don't yet know
// whether the logged-in user is a clinic owner or staff member.
export async function getMe(): Promise<MeResponse> {
    try {
        const response = await api.get("/clinic/profile");
        return response.data.data as MeResponse;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error fetching profile:", error.response?.data || error.message);
        } else {
            console.error("Error fetching profile:", error);
        }
        throw error;
    }
}

export function getServiceById(services: ClinicService[], serviceId: string): ClinicService | undefined {
    return services.find((service) => service._id === serviceId);
}

export function getServiceNamesFromIds(services: ClinicService[], serviceIds: string[]): string[] {
    return serviceIds
        .map((id) => getServiceById(services, id))
        .filter((service): service is ClinicService => service !== undefined)
        .map((service) => service.name);
}

export function calculateTotalFromServices(services: ClinicService[], serviceIds: string[]): number {
    return serviceIds
        .map((id) => getServiceById(services, id))
        .filter((service): service is ClinicService => service !== undefined)
        .reduce((total, service) => total + service.price, 0);
}

// update vet profile
export interface PricingEntry {
    type: string;
    fee: number;
}

export interface RegistrationSettings {
    enabled: boolean;
    fee: number;
}

export interface UpdateServicesPayload {
    address?: Partial<Address>;
    phone?: string;
    servicesProvided?: string[];
    animalsHandled?: string[];
    startingTime?: string;
    closingTime?: string;
    daysOpen?: string[];
    pricing?: PricingEntry[];
    registration?: RegistrationSettings;
}

export async function updateServices(payload: UpdateServicesPayload): Promise<Partial<User>> {
    try {
        const response = await api.patch("/clinic/services", payload);

        return {
            ...payload,
            ...response.data.data
        } as Partial<User>;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error updating clinic services:", error.response?.data || error.message);
        } else {
            console.error("Error updating clinic services:", error);
        }
        throw error;
    }
}