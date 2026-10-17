"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReminderChannel } from "@/lib/reminders";
import {
    CHANNEL_LABELS,
    MAX_MESSAGE_LENGTH,
    MAX_REMINDERS,
    MESSAGE_PLACEHOLDERS,
    REMINDER_CHANNELS,
    formatDateTime,
    newReminderRow,
    reminderAt,
    type ReminderRow,
} from "@/lib/vaccination";
import { fieldClass, labelClass } from "./vaccination-modal";

interface Props {
    rows: ReminderRow[];
    onChange: (rows: ReminderRow[]) => void;
    dueYmd: string;
}

// The reminder rows shared by the add and update forms
export default function VaccinationReminderFields({ rows, onChange, dueYmd }: Props) {
    const [openMessages, setOpenMessages] = useState<Record<string, boolean>>({});

    const update = (key: string, patch: Partial<ReminderRow>) =>
        onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

    const toggleChannel = (row: ReminderRow, channel: ReminderChannel) => {
        const channels = row.channels.includes(channel)
            ? row.channels.filter((c) => c !== channel)
            : [...row.channels, channel];
        update(row.key, { channels });
    };

    return (
        <div className="space-y-3">
            {rows.length === 0 && (
                <p className="text-sm text-gray-500">No reminders. The owner won&apos;t be messaged for this dose.</p>
            )}

            {rows.map((row, i) => {
                const canPreview =
                    !!dueYmd && Number.isInteger(row.daysBefore) && row.daysBefore >= 0 && /^\d{2}:\d{2}$/.test(row.time);
                const messageOpen = openMessages[row.key] || row.message.length > 0;

                return (
                    <div key={row.key} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="w-24">
                                <label className={labelClass}>Days before</label>
                                <input
                                    type="number"
                                    min={0}
                                    className={fieldClass}
                                    value={Number.isFinite(row.daysBefore) ? row.daysBefore : ""}
                                    onChange={(e) =>
                                        update(row.key, {
                                            daysBefore: e.target.value === "" ? NaN : Math.max(0, Math.floor(Number(e.target.value))),
                                        })
                                    }
                                />
                            </div>
                            <div className="w-32">
                                <label className={labelClass}>Time</label>
                                <input
                                    type="time"
                                    className={fieldClass}
                                    value={row.time}
                                    onChange={(e) => update(row.key, { time: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
                                aria-label={`Remove reminder ${i + 1}`}
                                className="mb-1 ml-auto rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4">
                            {REMINDER_CHANNELS.map((channel) => (
                                <label key={channel} className="flex items-center gap-1.5 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={row.channels.includes(channel)}
                                        onChange={() => toggleChannel(row, channel)}
                                        className="h-4 w-4 accent-green-600"
                                    />
                                    {CHANNEL_LABELS[channel]}
                                </label>
                            ))}
                        </div>

                        {canPreview && (
                            <p className="mt-2 text-xs text-gray-500">
                                Goes out {formatDateTime(reminderAt(dueYmd, row.daysBefore, row.time).toISOString())}
                            </p>
                        )}

                        {messageOpen ? (
                            <div className="mt-3">
                                <label className={labelClass}>Custom message (optional)</label>
                                <textarea
                                    rows={3}
                                    maxLength={MAX_MESSAGE_LENGTH}
                                    className={fieldClass}
                                    value={row.message}
                                    placeholder="Leave empty to use the standard wording"
                                    onChange={(e) => update(row.key, { message: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-gray-500">You can use: {MESSAGE_PLACEHOLDERS}</p>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setOpenMessages((m) => ({ ...m, [row.key]: true }))}
                                className="mt-3 text-xs font-medium text-green-700 hover:underline"
                            >
                                Write a custom message
                            </button>
                        )}
                    </div>
                );
            })}

            {rows.length < MAX_REMINDERS && (
                <button
                    type="button"
                    onClick={() => onChange([...rows, newReminderRow()])}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:underline"
                >
                    <Plus className="h-4 w-4" /> Add reminder
                </button>
            )}
        </div>
    );
}