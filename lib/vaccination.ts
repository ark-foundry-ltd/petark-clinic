// lib/vaccination.ts

import axios from "axios";
import api from "./api";
import type { ReminderChannel } from "./reminders";

// Where the backend mounts vaccinationRoute (api baseURL already ends in /api/v1)
const VACCINATIONS_BASE = "/vaccinations";
const TZ = "Africa/Lagos";
const DAY_MS = 86_400_000;

export const MAX_REMINDERS = 5;
export const MAX_MESSAGE_LENGTH = 320;
export const REMINDER_CHANNELS: ReminderChannel[] = ["push", "sms", "email"];
export const DEFAULT_REMINDER_CHANNELS: ReminderChannel[] = ["push", "sms"];
export const CHANNEL_LABELS: Record<ReminderChannel, string> = { push: "App", sms: "SMS", email: "Email" };
export const MESSAGE_PLACEHOLDERS = "{owner} {pet} {vaccine} {clinic} {dueDate}";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReminderDefault {
    daysBefore: number;
    time: string; // HH:mm, Lagos time
    channels?: ReminderChannel[];
}

export interface VaccineDefinition {
    _id: string;
    name: string;
    species: string[];
    boosterIntervalDays: number | null;
    reminderDefaults: ReminderDefault[];
    messageTemplate: string | null;
    isActive: boolean;
}

export interface Vaccination {
    _id: string;
    clinicId: string;
    petId: string;
    clinicPatientId: string | null;
    vaccineId: string;
    vaccineName: string;
    administeredAt: string;
    nextDueDate: string | null;
    batchNumber: string | null;
    visitId: string | null;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

// One reminder as the backend takes it (same `at` key as ReminderInput in lib/reminders.ts)
export interface VaccinationReminderInput {
    at: string; // ISO
    channels?: ReminderChannel[];
    message?: string; // placeholders: {owner} {pet} {vaccine} {clinic} {dueDate}
}

// Which patient a vaccination list / form is for: a clinic patient record, or just the pet
// (the appointment page only knows the pet)
export type PatientRef =
    | { clinicPatientId: string; petId?: undefined }
    | { petId: string; clinicPatientId?: undefined };

export interface CreateVaccinationInput {
    clinicPatientId?: string;
    petId?: string;
    vaccineId?: string; // pick an existing vaccine…
    vaccineName?: string; // …or type a new one (it is added to the clinic's list)
    administeredAt?: string;
    nextDueDate?: string | null; // omit = use the vaccine's booster interval, null = no due date
    batchNumber?: string;
    visitId?: string;
    notes?: string;
    reminders?: VaccinationReminderInput[]; // omit = vaccine defaults, [] = none
}

export interface UpdateVaccinationInput {
    administeredAt?: string;
    nextDueDate?: string | null;
    batchNumber?: string | null;
    notes?: string;
    // Sending nextDueDate or reminders replaces the still-pending reminders
    reminders?: VaccinationReminderInput[];
}

export interface ReminderOutcome {
    remindersScheduled: number;
    remindersSkipped: "plan" | null; // "plan" = clinic is on Free, records saved but no reminders
}

export interface CreateVaccinationResult extends ReminderOutcome {
    vaccination: Vaccination;
    vaccine: { _id: string; name: string };
}

export interface UpdateVaccinationResult extends ReminderOutcome {
    vaccination: Vaccination;
    remindersCleared: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getVaccines(includeInactive = false): Promise<VaccineDefinition[]> {
    const response = await api.get<{ vaccines: VaccineDefinition[] }>(`${VACCINATIONS_BASE}/definitions`, {
        params: includeInactive ? { all: true } : undefined,
    });
    return response.data.vaccines;
}

export async function updateVaccine(
    id: string,
    patch: Partial<Pick<VaccineDefinition, "name" | "species" | "boosterIntervalDays" | "reminderDefaults" | "messageTemplate" | "isActive">>
): Promise<VaccineDefinition> {
    const response = await api.patch<{ vaccine: VaccineDefinition }>(`${VACCINATIONS_BASE}/definitions/${id}`, patch);
    return response.data.vaccine;
}

export async function getVaccinations(patient: PatientRef): Promise<Vaccination[]> {
    const response = await api.get<{ vaccinations: Vaccination[] }>(VACCINATIONS_BASE, {
        params: patient,
    });
    return response.data.vaccinations;
}

export async function createVaccination(input: CreateVaccinationInput): Promise<CreateVaccinationResult> {
    const response = await api.post<CreateVaccinationResult>(VACCINATIONS_BASE, input);
    return response.data;
}

export async function updateVaccination(id: string, input: UpdateVaccinationInput): Promise<UpdateVaccinationResult> {
    const response = await api.patch<UpdateVaccinationResult>(`${VACCINATIONS_BASE}/${id}`, input);
    return response.data;
}

export async function deleteVaccination(id: string): Promise<void> {
    await api.delete(`${VACCINATIONS_BASE}/${id}`);
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
    if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        return message || err.message || fallback;
    }
    return err instanceof Error ? err.message : fallback;
}

// ─── Dates (everything is Lagos time) ────────────────────────────────────────

// YYYY-MM-DD in Lagos, the format <input type="date"> uses
export const lagosYmd = (d: Date | string): string => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });

export const addDaysYmd = (ymd: string, days: number): string => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

export const daysBetween = (fromYmd: string, toYmd: string): number =>
    Math.round((Date.parse(toYmd) - Date.parse(fromYmd)) / DAY_MS);

// Date inputs give YYYY-MM-DD; send them as Lagos time so the right day is kept
export const toApiDate = (ymd: string, at: "start" | "noon" = "start"): string =>
    `${ymd}T${at === "noon" ? "12:00" : "00:00"}:00+01:00`;

export const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });

export const formatDateTime = (iso: string): string =>
    new Date(iso).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ,
    });

export type DueStatus = "overdue" | "due-soon" | "upcoming" | "none";

export function getDueStatus(nextDueDate: string | null): DueStatus {
    if (!nextDueDate) return "none";
    const diff = daysBetween(lagosYmd(new Date()), lagosYmd(nextDueDate));
    if (diff < 0) return "overdue";
    return diff <= 14 ? "due-soon" : "upcoming";
}

// Only the newest dose of each vaccine can be "overdue"; older doses were superseded
export function latestDoseIds(vaccinations: Vaccination[]): Set<string> {
    const latest = new Map<string, Vaccination>();
    for (const v of vaccinations) {
        const current = latest.get(v.vaccineId);
        if (!current || new Date(v.administeredAt) > new Date(current.administeredAt)) latest.set(v.vaccineId, v);
    }
    return new Set([...latest.values()].map((v) => v._id));
}

// ─── Reminder rows (form state) ──────────────────────────────────────────────

export interface ReminderRow {
    key: string;
    daysBefore: number;
    time: string; // HH:mm
    channels: ReminderChannel[];
    message: string;
}

export const newReminderRow = (over: Partial<ReminderRow> = {}): ReminderRow => ({
    key: Math.random().toString(36).slice(2),
    daysBefore: 7,
    time: "09:00",
    channels: [...DEFAULT_REMINDER_CHANNELS],
    message: "",
    ...over,
});

export const rowsFromDefaults = (defaults: ReminderDefault[] = []): ReminderRow[] =>
    defaults.map((d) =>
        newReminderRow({
            daysBefore: d.daysBefore,
            time: d.time || "09:00",
            channels: d.channels?.length ? d.channels : [...DEFAULT_REMINDER_CHANNELS],
        })
    );

export const rowsToDefaults = (rows: ReminderRow[]): ReminderDefault[] =>
    rows.map((r) => ({ daysBefore: r.daysBefore, time: r.time, channels: r.channels }));

// When a row will go out: N days before the due date, at that time (Lagos)
export const reminderAt = (dueYmd: string, daysBefore: number, time: string): Date =>
    new Date(`${addDaysYmd(dueYmd, -daysBefore)}T${time}:00+01:00`);

export function rowsToInputs(rows: ReminderRow[], dueYmd: string): VaccinationReminderInput[] {
    return rows.map((r) => ({
        at: reminderAt(dueYmd, r.daysBefore, r.time).toISOString(),
        channels: r.channels,
        ...(r.message.trim() ? { message: r.message.trim() } : {}),
    }));
}

// Returns a message to show the user, or null when the rows are fine to send
export function validateRows(rows: ReminderRow[], dueYmd: string): string | null {
    if (!rows.length) return null;
    if (!dueYmd) return "Set a next due date to schedule reminders";
    if (rows.length > MAX_REMINDERS) return `You can set up to ${MAX_REMINDERS} reminders`;

    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const label = `Reminder ${i + 1}`;
        if (!Number.isInteger(r.daysBefore) || r.daysBefore < 0) return `${label}: enter how many days before (0 or more)`;
        if (!/^\d{2}:\d{2}$/.test(r.time)) return `${label}: pick a time`;
        if (!r.channels.length) return `${label}: choose at least one channel`;
        if (r.message.length > MAX_MESSAGE_LENGTH) return `${label}: message is longer than ${MAX_MESSAGE_LENGTH} characters`;
        if (reminderAt(dueYmd, r.daysBefore, r.time).getTime() <= Date.now()) {
            return `${label} would already be in the past. Use fewer days before, or a later due date.`;
        }
    }
    return null;
}