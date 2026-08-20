// lib/activity.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export type ActivityType =
    | 'patient_new'
    | 'appointment_booked'
    | 'appointment_rescheduled'
    | 'appointment_updated'
    | 'visit_new'
    | 'visit_completed'
    | 'sale_made'
    | 'sale_voided'
    | 'stock_low'
    | 'referral_sent'
    | 'referral_received'
    | 'referral_accepted'
    | 'referral_declined'
    | 'staff_invited'
    | 'staff_joined'
    | 'staff_invite_revoked'
    | 'staff_removed'
    | 'staff_restored'
    | 'staff_role_changed'
    | 'treatment_added'
    | 'treatment_updated'
    | 'treatment_deleted'
    | 'payment_received'
    | 'missed_appointment'

export interface ActivityLogRecord {
    _id: string;
    clinicId: string;
    type: ActivityType;
    message: string;
    actorId: string | null;
    relatedId: string | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Recent (limit 4 — for the dashboard widget) ───────────────────────

export async function getRecentActivity(): Promise<ActivityLogRecord[]> {
    try {
        const response = await api.get("/activity/recent");
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching recent activity:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching recent activity:", error);
        }
        throw error;
    }
}

// ─── All (unbounded — for the "view all" screen) ───────────────────────

export async function getAllActivity(): Promise<ActivityLogRecord[]> {
    try {
        const response = await api.get("/activity");
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching activity:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching activity:", error);
        }
        throw error;
    }
}