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

interface Vet {
    _id: string;
    fullname: string;
    email: string;
    role: string;
    clinicId: string;
    status: string;
    isEmailVerified: boolean;
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
    vets: Vet[];
    subscription: Subscription;
    registration?: {
        enabled: boolean;
        fee: number;
    };
}

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

// Changed the return type from Promise<User> to Promise<Partial<User>>
export async function updateServices(payload: UpdateServicesPayload): Promise<Partial<User>> {
    try {
        const response = await api.patch("/clinic/services", payload);
        
        // We merge the payload sent with the exact response data from the backend
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