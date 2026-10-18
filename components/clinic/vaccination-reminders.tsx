"use client";

import { useCallback, useEffect, useState } from "react";
import {
    cancelReminder,
    getReminders,
    type Reminder,
    type ReminderChannel,
    type ReminderStatus,
} from "@/lib/reminders";
import { formatDateTime, getErrorMessage } from "@/lib/vaccination";

// Was exported from lib/vaccination; it lives here now that nothing else uses it
const CHANNEL_LABELS: Record<ReminderChannel, string> = { push: "App", sms: "SMS", email: "Email" };

const STATUS_STYLES: Record<ReminderStatus, string> = {
    pending: "bg-blue-50 text-blue-700",
    sending: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
    skipped: "bg-gray-100 text-gray-600",
    cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<ReminderStatus, string> = {
    pending: "Scheduled",
    sending: "Sending",
    completed: "Sent",
    failed: "Failed",
    skipped: "Skipped",
    cancelled: "Cancelled",
};

interface Props {
    vaccinationId: string;
    readOnly?: boolean;
}

// The reminders scheduled for one vaccination, with cancel for the ones not yet sent
export default function VaccinationReminders({ vaccinationId, readOnly = false }: Props) {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setError(null);
            const data = await getReminders("vaccination", vaccinationId);
            setReminders([...data].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        } catch (err) {
            setError(getErrorMessage(err, "Could not load reminders"));
        } finally {
            setLoading(false);
        }
    }, [vaccinationId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleCancel = async (id: string) => {
        setCancelling(id);
        try {
            await cancelReminder(id);
            await load();
        } catch (err) {
            setError(getErrorMessage(err, "Could not cancel this reminder"));
        } finally {
            setCancelling(null);
        }
    };

    if (loading) return <p className="text-sm text-gray-500">Loading reminders…</p>;

    return (
        <div className="space-y-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && reminders.length === 0 && <p className="text-sm text-gray-500">No reminders for this dose.</p>}

            {reminders.map((r) => (
                <div key={r._id} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{formatDateTime(r.dueDate)}</p>
                        <p className="text-xs text-gray-500">
                            {(r.channels ?? []).map((c) => CHANNEL_LABELS[c]).join(" + ") || "No channel"}
                            {r.results &&
                                ` · ${Object.entries(r.results)
                                    .map(([channel, result]) => `${channel} ${result}`)
                                    .join(", ")}`}
                        </p>
                        {r.message && <p className="mt-1 line-clamp-2 text-xs text-gray-600">{r.message}</p>}
                        {r.lastError && r.status !== "completed" && <p className="mt-1 text-xs text-red-600">{r.lastError}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                        </span>
                        {!readOnly && r.status === "pending" && (
                            <button
                                type="button"
                                disabled={cancelling === r._id}
                                onClick={() => handleCancel(r._id)}
                                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
                            >
                                {cancelling === r._id ? "Cancelling…" : "Cancel"}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}