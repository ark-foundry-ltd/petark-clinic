// lib/appointment.ts

import api from "./api";
import axiosError from "axios";

export type DateRange = "today" | "7days" | "1month" | "last_month" | "all";

export interface AppointmentPet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    gender?: string;
    photo?: string;
}

export interface AppointmentUser {
    _id: string;
    fullname: string;
    email: string;
    phone?: string;
}

export interface AppointmentVet {
    _id: string;
    fullname: string;
    email: string;
}

export interface Appointment {
    _id: string;
    userId: string;
    petId: string;
    clinicId: string;
    vetId: string | null;
    appointmentDate: string;
    appointmentTime: string;
    date?: string; // for backwards compatibility
    notes?: string;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "missed" | "expired";
    createdAt: string;
    updatedAt?: string;
    confirmedBy?: string;
    confirmedAt?: string;
    notificationsSent?: string[];
    user?: AppointmentUser;
    vet?: AppointmentVet;
    pet?: AppointmentPet;
}

export interface AppointmentsPage {
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
    count: number;
}

interface AppointmentsResponse {
    status: "success" | "error";
    count: number;
    total: number;
    page: number;
    totalPages: number;
    appointments: Appointment[];
}

export interface GetAppointmentsParams {
    page?: number;
    range?: DateRange;
    status?: Appointment["status"];
}

export interface AppointmentStats {
    today: number;
    thisWeek: number;
    weekChange: number;
    pending: number;
    pendingPct: number;
    total: number;
}

export async function getAppointmentStats(): Promise<AppointmentStats> {
    try {
        const response = await api.get<{ status: string; stats: AppointmentStats }>("/appointment/stats");
        return response.data.stats;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            console.error("Error fetching appointment stats:", error.response?.data || error.message);
        } else {
            console.error("Error fetching appointment stats:", error);
        }
        throw error;
    }
}

export async function getAppointments(params: GetAppointmentsParams): Promise<AppointmentsPage> {
    try {
        const query: Record<string, string> = {};
        if (params.page != null)                          query.page   = String(params.page);
        if (params.range != null && params.range !== "all") query.range  = params.range;
        if (params.status != null)                        query.status = params.status;

        const response = await api.get<AppointmentsResponse>("/appointment/clinics", { params: query });
        const { appointments, total, page, totalPages, count } = response.data;
        return { appointments, total, page, totalPages, count };
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            console.error("Error fetching appointments:", error.response?.data || error.message);
        } else {
            console.error("Error fetching appointments:", error);
        }
        throw error;
    }
}

export async function getAppointmentById(appointmentId: string): Promise<Appointment> {
    try {
        const response = await api.get<{ status: string; data: { appointment: Appointment } }>(
            `/appointment/clinics/${appointmentId}`,
            {
                headers: {
                    'Cache-Control': 'no-cache',
                },
                // Add this to see raw response time
                transformResponse: [(data) => {
                    console.log('Response received at:', new Date().toISOString());
                    return JSON.parse(data);
                }],
            }
        );
        return response.data.data.appointment;
    } catch (error) {
        console.error("Error fetching appointment:", error);
        throw error;
    }
}

// update appointment status
export async function updateAppointmentStatus(
    appointmentId: string,
    status: Appointment["status"]
): Promise<Appointment> {
    try {
        const response = await api.patch<{ status: string; data: { appointment: Appointment } }>(
            `/appointment/${appointmentId}/status`,
            { status }
        );
        return response.data.data.appointment;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            console.error("Error updating appointment status:", error.response?.data || error.message);
        } else {
            console.error("Error updating appointment status:", error);
        }
        throw error;
    }
}

export interface RescheduleResult {
  appointmentId: string;
  date: string;
  status: string;
}

export async function rescheduleAppointment(
    appointmentId: string,
    date: string, // YYYY-MM-DD
    time: string,  // "10:30 AM"
    reason: string
): Promise<RescheduleResult> {
    const token = localStorage.getItem("token") || "";

    const response = await api.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointment/${appointmentId}/reschedule`,
        { date, time, reason },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data.data as RescheduleResult;
}

export interface ClinicAvailabilitySlot {
  time: string;
  available: boolean;
}

export async function getClinicAvailability(
  clinicId: string,
  date: string
): Promise<ClinicAvailabilitySlot[]> {
  try {
    const response = await api.get<{ status: string; data: { slots: ClinicAvailabilitySlot[] } }>(
      `/appointment/clinic/${clinicId}/availability`,
      { params: { date } }
    );
    return response.data.data.slots;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      console.error("Error fetching clinic availability:", error.response?.data || error.message);
    } else {
      console.error("Error fetching clinic availability:", error);
    }
    throw error;
  }
}