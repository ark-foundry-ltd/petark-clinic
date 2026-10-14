// lib/appointment.ts

import api from "./api";
import axiosError from "axios";
import type { ReminderInput, SkippedReminder } from "./reminders";

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

// Update appointment status.
// When confirming, `reminders` lets the clinic choose when the owner is reminded
// (replaces any reminders not yet sent). Ignored for other statuses.
// Note: the backend answers with { appointmentId, status, reminders? } under `data`,
// not a full appointment, so callers shouldn't rely on the returned object.
export async function updateAppointmentStatus(
    appointmentId: string,
    status: Appointment["status"],
    reminders?: ReminderInput[]
): Promise<Appointment> {
    try {
        const response = await api.patch<{ status: string; data: { appointment: Appointment } }>(
            `/appointment/${appointmentId}/status`,
            { status, ...(reminders ? { reminders } : {}) }
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

export interface RemindersSummary {
    created: number;
    skipped: SkippedReminder[];
}

export interface RescheduleResult {
  appointmentId: string;
  date: string;
  status: string;
  reminders?: RemindersSummary;
}

export type RescheduleResponse =
  | { locked: false; result: RescheduleResult }
  | { locked: true; requiredPlan: string; currentPlan: string };

export async function rescheduleAppointment(
    appointmentId: string,
    date: string,
    time: string,
    reason: string,
    reminders?: ReminderInput[]
): Promise<RescheduleResponse> {
    const token = localStorage.getItem("token") || "";

    const response = await api.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointment/${appointmentId}/reschedule`,
        { date, time, reason, ...(reminders ? { reminders } : {}) },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const body = response.data;
    if (body.locked) {
        return { locked: true, requiredPlan: body.requiredPlan, currentPlan: body.currentPlan };
    }
    return { locked: false, result: body.data as RescheduleResult };
}

// One day of the clinic's calendar. There are no fixed slots: any time between
// opensAt and closesAt can be booked, except times already taken.
export interface ClinicDayAvailability {
  isOpen: boolean;
  day?: string;
  opensAt: string | null;  // "HH:mm"
  closesAt: string | null; // "HH:mm" (appointments must START before this)
  bookedTimes: string[];   // "HH:mm" of appointments already booked that day
  message?: string;
}

export async function getClinicAvailability(
  _clinicId: string,
  date: string
): Promise<ClinicDayAvailability> {
  try {
    const response = await api.get<{ status: string; data: ClinicDayAvailability }>(
        "/appointment/clinic/availability",
        { params: { date } }
    );
    return response.data.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      console.error("Error fetching clinic availability:", error.response?.data || error.message);
    } else {
      console.error("Error fetching clinic availability:", error);
    }
    throw error;
  }
}

export interface BookForOwnerInput {
  petId: string;
  date: string;  // YYYY-MM-DD (clinic-local)
  time: string;  // "hh:mm AM/PM"
  notes?: string;
  reminders?: ReminderInput[];
}

export interface BookForOwnerResult {
  appointmentId: string;
  date: string;
  status: string;
  pet: { _id: string; name: string };
  reminders: RemindersSummary;
}

// A clinic books on behalf of an owner (booked as confirmed straight away)
export async function bookAppointmentForOwner(input: BookForOwnerInput): Promise<BookForOwnerResult> {
  const response = await api.post<{ status: string; data: BookForOwnerResult }>(
    "/appointment/clinic/book",
    input
  );
  return response.data.data;
}