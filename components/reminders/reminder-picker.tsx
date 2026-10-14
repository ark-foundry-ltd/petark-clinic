"use client";

// components/reminders/reminder-picker.tsx

import { ChevronDown, Lock, Plus, Trash2 } from "lucide-react";
import type { ReminderChannel, ReminderInput } from "@/lib/reminders";

export interface ReminderRow {
    id: string;
    when: string;            // minutes before, as a string ("1440"), or "exact"
    at: string;              // datetime-local value, used when when === "exact"
    channels: ReminderChannel[];
    message: string;
}

export const MAX_REMINDER_ROWS = 10;
export const MAX_REMINDER_MESSAGE = 140;

const PRESETS = [
    { value: "15",    label: "15 minutes before" },
    { value: "30",    label: "30 minutes before" },
    { value: "60",    label: "1 hour before" },
    { value: "120",   label: "2 hours before" },
    { value: "1440",  label: "1 day before" },
    { value: "2880",  label: "2 days before" },
    { value: "10080", label: "1 week before" },
];

const CHANNELS: { value: ReminderChannel; label: string }[] = [
    { value: "sms",   label: "SMS" },
    { value: "push",  label: "Push" },
    { value: "email", label: "Email" },
];

let rowCounter = 0;

export function newReminderRow(partial: Partial<ReminderRow> = {}): ReminderRow {
    rowCounter += 1;
    return {
        id: `reminder-row-${rowCounter}`,
        when: "1440",
        at: "",
        channels: ["sms", "push"],
        message: "",
        ...partial,
    };
}

// Starting suggestion: 1 day and 1 hour before (the clinic can change or remove them)
export function defaultReminderRows(presets = true): ReminderRow[] {
    return presets
        ? [newReminderRow({ when: "1440" }), newReminderRow({ when: "60" })]
        : [newReminderRow({ when: "exact" })];
}

// Returns an error message, or null when the rows are fine to send.
// hasReference = the appointment / due date the "before" options count back from is known.
export function validateReminderRows(rows: ReminderRow[], hasReference: boolean): string | null {
    for (const r of rows) {
        if (r.channels.length === 0) {
            return "Choose at least one way to send each reminder (SMS, push or email).";
        }
        if (r.when === "exact") {
            if (!r.at || Number.isNaN(new Date(r.at).getTime())) {
                return "Pick a date and time for each exact-time reminder.";
            }
        } else if (!hasReference) {
            return "Pick the appointment date and time first.";
        }
        if (r.message.length > MAX_REMINDER_MESSAGE) {
            return `Messages can be at most ${MAX_REMINDER_MESSAGE} characters.`;
        }
    }
    return null;
}

export function toReminderInputs(rows: ReminderRow[]): ReminderInput[] {
    return rows.map((r) => ({
        ...(r.when === "exact"
            ? { at: new Date(r.at).toISOString() }
            : { minutesBefore: Number(r.when) }),
        channels: r.channels,
        ...(r.message.trim() ? { message: r.message.trim() } : {}),
    }));
}

function nowLocalInput(): string {
    const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 16);
}

function previewFor(
    row: ReminderRow,
    referenceISO: string | null | undefined,
    allowAfter: boolean,
    referenceLabel: string
): { text: string; bad: boolean } | null {
    let t: number;
    if (row.when === "exact") {
        if (!row.at) return null;
        t = new Date(row.at).getTime();
    } else {
        if (!referenceISO) return { text: `Pick the ${referenceLabel} first to see when this sends.`, bad: false };
        t = new Date(referenceISO).getTime() - Number(row.when) * 60000;
    }
    if (Number.isNaN(t)) return null;

    const when = new Date(t).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    if (t < Date.now() + 60000) {
        return { text: `${when}: that time has already passed, so this reminder will be skipped.`, bad: true };
    }
    if (referenceISO && !allowAfter && t >= new Date(referenceISO).getTime()) {
        return { text: `${when}: that is after the ${referenceLabel}, so this reminder will be skipped.`, bad: true };
    }
    return { text: `Sends ${when}`, bad: false };
}

interface ReminderPickerProps {
    value: ReminderRow[];
    onChange: (rows: ReminderRow[]) => void;
    referenceDate?: string | null;   // ISO: the appointment time / treatment due date
    referenceLabel?: string;         // "appointment" | "due date"
    allowAfterReference?: boolean;   // true for treatments (an "overdue" nudge is useful)
    presets?: boolean;               // false for standalone reminders with nothing to count back from
    locked?: boolean;                // plan doesn't include reminders
    disabled?: boolean;
}

export default function ReminderPicker({
    value,
    onChange,
    referenceDate = null,
    referenceLabel = "appointment",
    allowAfterReference = false,
    presets = true,
    locked = false,
    disabled = false,
}: Readonly<ReminderPickerProps>) {
    if (locked) {
        return (
            <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-500">
                <Lock size={14} className="mt-0.5 shrink-0" />
                <span>Scheduled reminders are available on paid plans.</span>
            </div>
        );
    }

    function update(id: string, patch: Partial<ReminderRow>) {
        onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }

    function remove(id: string) {
        onChange(value.filter((r) => r.id !== id));
    }

    function add() {
        onChange([...value, newReminderRow({ when: presets ? "1440" : "exact" })]);
    }

    function toggleChannel(row: ReminderRow, channel: ReminderChannel) {
        const next = row.channels.includes(channel)
            ? row.channels.filter((c) => c !== channel)
            : [...row.channels, channel];
        update(row.id, { channels: next });
    }

    return (
        <div className="space-y-3">
            {value.length === 0 && (
                <p className="text-xs text-gray-400">No reminders. The owner won&apos;t be reminded about this {referenceLabel}.</p>
            )}

            {value.map((row) => {
                const preview = previewFor(row, referenceDate, allowAfterReference, referenceLabel);
                return (
                    <div key={row.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <select
                                    value={row.when}
                                    onChange={(e) => update(row.id, { when: e.target.value })}
                                    disabled={disabled}
                                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm text-sec-clr focus:outline-none focus:border-acc-clr transition-colors disabled:opacity-60"
                                >
                                    {presets && PRESETS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                    <option value="exact">Exact date &amp; time</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(row.id)}
                                disabled={disabled}
                                aria-label="Remove reminder"
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>

                        {row.when === "exact" && (
                            <input
                                type="datetime-local"
                                min={nowLocalInput()}
                                value={row.at}
                                onChange={(e) => update(row.id, { at: e.target.value })}
                                disabled={disabled}
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-sec-clr focus:outline-none focus:border-acc-clr transition-colors [color-scheme:light]"
                            />
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            {CHANNELS.map((c) => {
                                const on = row.channels.includes(c.value);
                                return (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => toggleChannel(row, c.value)}
                                        disabled={disabled}
                                        aria-pressed={on}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-60 ${
                                            on
                                                ? "bg-acc-clr text-pry-clr border-acc-clr"
                                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div>
                            <input
                                type="text"
                                value={row.message}
                                maxLength={MAX_REMINDER_MESSAGE}
                                onChange={(e) => update(row.id, { message: e.target.value })}
                                disabled={disabled}
                                placeholder="Custom message (optional, otherwise we write it)"
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-sec-clr placeholder:text-gray-400 focus:outline-none focus:border-acc-clr transition-colors"
                            />
                            {row.message.length > 0 && (
                                <p className="text-[11px] text-gray-400 mt-1 text-right">
                                    {row.message.length}/{MAX_REMINDER_MESSAGE}
                                </p>
                            )}
                        </div>

                        {preview && (
                            <p className={`text-xs ${preview.bad ? "text-red-500" : "text-gray-500"}`}>{preview.text}</p>
                        )}
                    </div>
                );
            })}

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={add}
                    disabled={disabled || value.length >= MAX_REMINDER_ROWS}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Plus size={14} />
                    Add reminder
                </button>
                <p className="text-[11px] text-gray-400">Each reminder uses one from your monthly allowance</p>
            </div>
        </div>
    );
}