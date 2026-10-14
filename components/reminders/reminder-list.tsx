"use client";

// components/reminders/reminder-list.tsx

import { useEffect, useState } from "react";
import { BellRing, Loader2, Lock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
    getReminders,
    createReminders,
    cancelReminder,
    type Reminder,
    type ReminderChannel,
    type ReminderSourceType,
    type ReminderStatus,
    type ChannelResult,
} from "@/lib/reminders";
import ReminderPicker, {
    defaultReminderRows,
    toReminderInputs,
    validateReminderRows,
    type ReminderRow,
} from "@/components/reminders/reminder-picker";

const STATUS_STYLES: Record<ReminderStatus, { label: string; className: string }> = {
    pending:   { label: "Scheduled", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    sending:   { label: "Sending",   className: "bg-blue-50 text-blue-700 border border-blue-200" },
    completed: { label: "Sent",      className: "bg-green-50 text-green-700 border border-green-200" },
    failed:    { label: "Failed",    className: "bg-red-50 text-red-700 border border-red-200" },
    skipped:   { label: "Skipped",   className: "bg-gray-50 text-gray-700 border border-gray-200" },
    cancelled: { label: "Cancelled", className: "bg-gray-50 text-gray-500 border border-gray-200" },
};

const CHANNEL_LABELS: Record<ReminderChannel, string> = { sms: "SMS", push: "Push", email: "Email" };

const RESULT_STYLES: Record<ChannelResult, string> = {
    sent:    "text-green-700 bg-green-50 border-green-200",
    failed:  "text-red-700 bg-red-50 border-red-200",
    skipped: "text-gray-500 bg-gray-50 border-gray-200",
};

function formatWhen(iso: string): string {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function errorMessage(err: unknown, fallback: string): string {
    const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
    return data?.message ?? fallback;
}

interface ReminderListProps {
    sourceType: ReminderSourceType;
    sourceId: string;
    referenceDate?: string | null;   // appointment time / treatment due date (ISO)
    referenceLabel?: string;
    allowAfterReference?: boolean;
    canAdd?: boolean;                // false for finished appointments: history only
    locked?: boolean;                // plan doesn't include reminders
}

export default function ReminderList({
    sourceType,
    sourceId,
    referenceDate = null,
    referenceLabel = "appointment",
    allowAfterReference = false,
    canAdd = true,
    locked = false,
}: Readonly<ReminderListProps>) {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [adding, setAdding] = useState(false);
    const [rows, setRows] = useState<ReminderRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setError(null);
            try {
                const data = await getReminders(sourceType, sourceId);
                if (!cancelled) setReminders(data);
            } catch {
                if (!cancelled) setError("Couldn't load reminders.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [sourceType, sourceId, refreshKey]);

    function startAdding() {
        setRows(defaultReminderRows());
        setAdding(true);
    }

    async function handleSave() {
        if (rows.length === 0) {
            toast.error("Add at least one reminder");
            return;
        }
        const problem = validateReminderRows(rows, !!referenceDate);
        if (problem) {
            toast.error(problem);
            return;
        }

        setSaving(true);
        try {
            const { count, skipped } = await createReminders({
                sourceType,
                sourceId,
                reminders: toReminderInputs(rows),
            });
            if (count > 0) toast.success(`${count} reminder${count !== 1 ? "s" : ""} scheduled`);
            if (skipped.length > 0) {
                toast.message(`${skipped.length} skipped: ${skipped[0].reason}`);
            }
            setAdding(false);
            setRefreshKey((k) => k + 1);
        } catch (err) {
            toast.error(errorMessage(err, "Couldn't schedule reminders"));
        } finally {
            setSaving(false);
        }
    }

    async function handleCancel(reminderId: string) {
        setCancellingId(reminderId);
        try {
            await cancelReminder(reminderId);
            toast.success("Reminder cancelled");
            setRefreshKey((k) => k + 1);
        } catch (err) {
            toast.error(errorMessage(err, "Couldn't cancel that reminder"));
        } finally {
            setCancellingId(null);
        }
    }

    return (
        <div className="bg-pry-clr rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-linear-to-r from-sky-50 to-cyan-50 px-6 py-4 border-b border-sky-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <BellRing size={20} className="text-sky-600" />
                    <h2 className="font-semibold text-gray-900">Reminders</h2>
                </div>
                {canAdd && !locked && !adding && (
                    <button
                        onClick={startAdding}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc-clr text-pry-clr text-xs font-medium hover:bg-acc-clr/90 transition-colors"
                    >
                        <Plus size={13} />
                        Add reminders
                    </button>
                )}
            </div>

            <div className="p-6 space-y-4">
                {locked && (
                    <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-500">
                        <Lock size={14} className="mt-0.5 shrink-0" />
                        <span>Scheduled reminders are available on paid plans.</span>
                    </div>
                )}

                {adding && (
                    <div className="space-y-4">
                        <ReminderPicker
                            value={rows}
                            onChange={setRows}
                            referenceDate={referenceDate}
                            referenceLabel={referenceLabel}
                            allowAfterReference={allowAfterReference}
                            disabled={saving}
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setAdding(false)}
                                disabled={saving}
                                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-acc-clr hover:bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule"}
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-14 bg-gray-100 rounded-xl" />
                        <div className="h-14 bg-gray-100 rounded-xl" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                ) : reminders.length === 0 ? (
                    !adding && <p className="text-sm text-gray-400">No reminders set for this {referenceLabel}.</p>
                ) : (
                    <ul className="space-y-2">
                        {reminders.map((r) => {
                            const status = STATUS_STYLES[r.status] ?? STATUS_STYLES.skipped;
                            const results = Object.entries(r.results ?? {}) as [ReminderChannel, ChannelResult][];
                            return (
                                <li key={r._id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{formatWhen(r.dueDate)}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {(r.channels ?? []).map((c) => CHANNEL_LABELS[c]).join(" · ") || "—"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                                                {status.label}
                                            </span>
                                            {r.status === "pending" && (
                                                <button
                                                    onClick={() => handleCancel(r._id)}
                                                    disabled={cancellingId === r._id}
                                                    aria-label="Cancel reminder"
                                                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500 transition-colors disabled:opacity-50"
                                                >
                                                    {cancellingId === r._id
                                                        ? <Loader2 size={14} className="animate-spin" />
                                                        : <X size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {r.message && <p className="text-xs text-gray-600">&ldquo;{r.message}&rdquo;</p>}

                                    {results.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {results.map(([channel, result]) => (
                                                <span
                                                    key={channel}
                                                    className={`px-2 py-0.5 rounded-full text-[11px] border ${RESULT_STYLES[result]}`}
                                                >
                                                    {CHANNEL_LABELS[channel]}: {result}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {["failed", "skipped", "cancelled"].includes(r.status) && r.lastError && (
                                        <p className="text-xs text-gray-500">{r.lastError}</p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}