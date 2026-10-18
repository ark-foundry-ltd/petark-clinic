// components/vaccinations/reminder-rows.ts
//
// Glue between a vaccine's saved reminder defaults (days before + time) and the shared
// ReminderPicker rows (minutes before, or an exact time).

import type { ReminderChannel } from "@/lib/reminders";
import { newReminderRow, type ReminderRow } from "@/components/reminders/reminder-picker";
import { addDaysYmd, daysBetween, lagosYmd, type ReminderDefault } from "@/lib/vaccination";

// "N before" counts back from the due date at this time (Lagos). The backend uses the same reference.
const REFERENCE_TIME = "09:00";

// The options ReminderPicker offers, in minutes
const PRESET_MINUTES = new Set(["15", "30", "60", "120", "1440", "2880", "10080"]);

// Pass this as the picker's referenceDate so its "Sends …" preview matches what the backend schedules
export const dueReferenceISO = (dueYmd: string): string =>
    new Date(`${dueYmd}T${REFERENCE_TIME}:00+01:00`).toISOString();

const referenceMs = (dueYmd: string): number => Date.parse(dueReferenceISO(dueYmd));

// datetime-local value (browser time) for an instant
const toLocalInput = (ms: number): string =>
    new Date(ms - new Date(ms).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// Saved defaults -> picker rows for a given due date. Defaults that aren't one of the picker's
// presets become an exact-time row.
export function rowsFromDefaults(defaults: ReminderDefault[], dueYmd: string): ReminderRow[] {
    return defaults.map((d) => {
        const at = Date.parse(`${addDaysYmd(dueYmd, -d.daysBefore)}T${d.time || "09:00"}:00+01:00`);
        const minutes = String(Math.round((referenceMs(dueYmd) - at) / 60000));
        const channels: { channels?: ReminderChannel[] } = d.channels?.length ? { channels: d.channels } : {};
        return PRESET_MINUTES.has(minutes)
            ? newReminderRow({ when: minutes, ...channels })
            : newReminderRow({ when: "exact", at: toLocalInput(at), ...channels });
    });
}

// Picker rows -> defaults to store on the vaccine (rows after the due date can't be defaults)
export function rowsToDefaults(rows: ReminderRow[], dueYmd: string): ReminderDefault[] {
    const out: ReminderDefault[] = [];
    for (const r of rows) {
        const ms = r.when === "exact" ? new Date(r.at).getTime() : referenceMs(dueYmd) - Number(r.when) * 60000;
        if (Number.isNaN(ms)) continue;
        const date = new Date(ms);
        const daysBefore = daysBetween(lagosYmd(date), dueYmd);
        if (daysBefore < 0 || daysBefore > 365) continue;
        const time = date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
            timeZone: "Africa/Lagos",
        });
        out.push({ daysBefore, time, channels: r.channels });
    }
    return out;
}