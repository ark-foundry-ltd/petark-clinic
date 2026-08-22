// lib/auth.ts

import api from "./api";
import { AxiosError } from "axios";
import { unsubscribeFromPush } from "@/lib/push";

interface Address {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
}

interface RegisterData {
    clinicName: string;
    ownerName: string;
    email: string;
    password: string;
    address: Address;
    phoneNumber: string;
    licenseNumber: string;
    licenseDocument: File;
    ownerIDCard: File;
    ownerPassport?: File | null;
}

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    role?: "clinic" | "vet" | "receptionist" | "sales" | "custom";
    message?: string;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

export async function registerClinic(data: RegisterData) {
    try {
        const formData = new FormData();

        formData.append("clinicName", data.clinicName);
        formData.append("ownerName", data.ownerName);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("phoneNumber", data.phoneNumber);
        formData.append("licenseNumber", data.licenseNumber);

        formData.append("street", data.address.street);
        formData.append("city", data.address.city);
        formData.append("state", data.address.state);
        formData.append("country", data.address.country);
        if (data.address.zipCode) {
            formData.append("zipCode", data.address.zipCode);
        }

        formData.append("licenseDocument", data.licenseDocument);
        formData.append("ownerIDCard", data.ownerIDCard);

        if (data.ownerPassport) {
            formData.append("ownerPassport", data.ownerPassport);
        }

        // Don't set Content-Type manually — axios/the browser needs to
        // generate the multipart boundary itself.
        const response = await api.post("/auth/clinic/register", formData);
        return response.data;
    }
    catch (error) {
        if (error instanceof AxiosError) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            if (axiosError.response) {
                console.error("Server error:", axiosError.response.status);
                console.error("Error data:", axiosError.response.data);
                throw {
                    status: axiosError.response.status,
                    message: axiosError.response.data?.message || axiosError.response.data?.error || "Registration failed",
                    errors: axiosError.response.data?.errors,
                };
            }
            else if (axiosError.request) {
                console.error("No response from server:", axiosError.request);
                throw { status: 0, message: "Unable to connect to server. Please check your internet connection." };
            }
            else {
                console.error("Error setting up request:", axiosError.message);
                throw { status: 0, message: axiosError.message || "An unexpected error occurred" };
            }
        }
        console.error("Non-Axios error:", error);
        throw { status: 500, message: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
}

export async function loginClinic(data: LoginData) {
    try {
        const response = await api.post<LoginResponse>("/auth/clinic/login", data);
        
        // Store the clinic_token in localStorage
        if (response.data.token) {
            localStorage.setItem("clinic_token", response.data.token);
        }
        
        return response.data;
    }
    catch (error) {
        if (error instanceof AxiosError) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            
            if (axiosError.response) {
                console.error("Server error:", axiosError.response.status);
                console.error("Error data:", axiosError.response.data);
                
                throw {
                    status: axiosError.response.status,
                    message: axiosError.response.data?.message || axiosError.response.data?.error || "Login failed",
                    errors: axiosError.response.data?.errors,
                };
            } 
            else if (axiosError.request) {
                console.error("No response from server:", axiosError.request);
                throw {
                    status: 0,
                    message: "Unable to connect to server. Please check your internet connection.",
                };
            }
            else {
                console.error("Error setting up request:", axiosError.message);
                throw {
                    status: 0,
                    message: axiosError.message || "An unexpected error occurred",
                };
            }
        }
        
        console.error("Non-Axios error:", error);
        throw {
            status: 500,
            message: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

// Updated logout function with clinic_token
export async function logoutClinic(): Promise<void> {
    try {
        // Attempt to call logout endpoint if it exists
        await api.post("/auth/clinic/logout");
    } catch (error) {
        // Ignore errors from logout endpoint - we still want to clear local state
        console.error("Logout API error (ignoring):", error);
    } finally {
        // Always clear local storage and any auth data
        if (typeof window !== "undefined") {
            localStorage.removeItem("clinic_token");
            sessionStorage.clear();
            // Clear any other auth-related data
            localStorage.removeItem("user");
            localStorage.removeItem("clinic");
        }
    }
}

// Optional: Get current clinic token
export function getClinicToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("clinic_token");
    }
    return null;
}

// Optional: Check if clinic is logged in
export function isClinicAuthenticated(): boolean {
    return !!getClinicToken();
}

export function handleApiError(error: unknown): { message: string; status: number; errors?: Record<string, string[]> } {
    if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        
        if (axiosError.response) {
            // Handle unauthorized (token expired)
            if (axiosError.response.status === 401) {
                // Auto logout if token expired
                logoutClinic();
            }
            
            return {
                status: axiosError.response.status,
                message: axiosError.response.data?.message || axiosError.response.data?.error || "Request failed",
                errors: axiosError.response.data?.errors,
            };
        } else if (axiosError.request) {
            return {
                status: 0,
                message: "Unable to connect to server. Please check your connection.",
            };
        } else {
            return {
                status: 0,
                message: axiosError.message || "Request failed",
            };
        }
    }
    
    return {
        status: 500,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
}

// Optional: Refresh token function
export async function refreshClinicToken(): Promise<string | null> {
    try {
        const response = await api.post<{ token: string }>("/auth/clinic/refresh-token");
        const newToken = response.data.token;
        
        if (newToken && typeof window !== "undefined") {
            localStorage.setItem("clinic_token", newToken);
        }
        
        return newToken;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        await logoutClinic();
        return null;
    }
}