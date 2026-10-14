// lib/reminders.ts

import api from "./api";

// Where the backend mounts reminderRoutes. Change this if yours is mounted somewhere else.
const REMINDERS_BASE = "/reminders";

export type ReminderChannel = "push" | "sms" | "email";
export type ReminderStatus = "pending" | "sending" | "completed" | "failed" | "skipped" | "cancelled";
export type ChannelResult = "sent" | "failed" | "skipped";
export type ReminderSourceType = "appointment" | "treatment" | "visit" | "patient" | "manual";

// What the clinic chooses: an exact time (at) OR minutes counted back from the
// appointment / treatment date (minutesBefore).
export interface ReminderInput {
    at?: string; // ISO
    minutesBefore?: number;
    channels?: ReminderChannel[];
    message?: string;
    audience?: "owner" | "clinic";
}

export interface Reminder {
    _id: string;
    sourceType: ReminderSourceType;
    sourceId: string | null;
    dueDate: string; // when it is (or was) due to go out
    status: ReminderStatus;
    channels?: ReminderChannel[];
    audience?: "owner" | "clinic";
    message?: string | null;
    title?: string | null;
    lastError?: string | null;
    results?: Partial<Record<ReminderChannel, ChannelResult>> | null;
    notifiedAt?: string | null;
    createdAt: string;
}

export interface SkippedReminder {
    at: string;
    reason: string;
}

export interface CreateRemindersResult {
    count: number;
    skipped: SkippedReminder[];
}

export async function getReminders(sourceType: ReminderSourceType, sourceId: string): Promise<Reminder[]> {
    const response = await api.get<{ status: string; data: Reminder[] }>(`${REMINDERS_BASE}/alarms`, {
        params: { sourceType, sourceId },
    });
    return response.data.data;
}

export async function createReminders(input: {
    sourceType: ReminderSourceType;
    sourceId: string;
    reminders: ReminderInput[];
    title?: string;
}): Promise<CreateRemindersResult> {
    const response = await api.post<{ status: string; count: number; skipped: SkippedReminder[] }>(
        `${REMINDERS_BASE}/alarms`,
        input
    );
    return { count: response.data.count, skipped: response.data.skipped ?? [] };
}

// Only works while the reminder is still scheduled (not yet sent)
export async function cancelReminder(reminderId: string): Promise<void> {
    await api.patch(`${REMINDERS_BASE}/alarms/${reminderId}`, { cancel: true });
}