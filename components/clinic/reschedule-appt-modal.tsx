"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { X, Calendar, Clock, Loader2, AlertCircle, ChevronDown, PawPrint, Lock } from "lucide-react";
import { toast } from "sonner";
import {
    getClinicAvailability,
    rescheduleAppointment,
    type ClinicDayAvailability,
} from "@/lib/appointment";
import ReminderPicker, {
    defaultReminderRows,
    toReminderInputs,
    validateReminderRows,
    type ReminderRow,
} from "@/components/reminders/reminder-picker";


/* ── helpers ── */
function to12Hour(time24: string): string {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function todayDateStr(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatCurrent(dateISO: string): string {
    const d = new Date(dateISO);
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} • ${timePart}`;
}

const REASON_OPTIONS = [
    "Owner Request",
    "Clinic Unavailable",
    "Vet Unavailable",
    "Emergency",
    "Weather",
    "Other",
];

interface RescheduleAppointmentModalProps {
    appointmentId: string;
    clinicId: string;
    currentDate: string; // ISO
    locked?: boolean;
    pet: {
        name: string;
        breed?: string;
        species?: string;
        photo?: string;
    };
    ownerName?: string;
    onRescheduled: (response: { date: string; status: string }) => void;
}

export default function RescheduleAppointmentModal({
    appointmentId,
    clinicId,
    currentDate,
    pet,
    ownerName,
    onRescheduled,
    locked,
}: Readonly<RescheduleAppointmentModalProps>) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime24, setSelectedTime24] = useState("");
    const [availability, setAvailability] = useState<ClinicDayAvailability | null>(null);
    const [availLoading, setAvailLoading] = useState(false);
    const [availError, setAvailError] = useState<string | null>(null);
    const [reason, setReason] = useState(REASON_OPTIONS[0]);
    const [reminderRows, setReminderRows] = useState<ReminderRow[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const minDate = todayDateStr();

    const router = useRouter();

    const goToUpgrade = () => {
        toast.error("Rescheduling is available on paid plans.", {
            action: { label: "Upgrade", onClick: () => router.push("/dashboard/profile/upgrade") },
        });
    };

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedDate("");
            setSelectedTime24("");
            setAvailability(null);
            setAvailError(null);
            setReason(REASON_OPTIONS[0]);
            setReminderRows(defaultReminderRows());
        }
    }, [isOpen]);

    useEffect(() => {
        if (!selectedDate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAvailability(null);
            return;
        }
        setSelectedTime24("");
        setAvailError(null);

        let cancelled = false;
        (async () => {
            setAvailLoading(true);
            try {
                const data = await getClinicAvailability(clinicId, selectedDate);
                if (!cancelled) setAvailability(data);
            } catch {
                if (!cancelled) {
                    setAvailError("Couldn't load the clinic's hours for that day.");
                    setAvailability(null);
                }
            } finally {
                if (!cancelled) setAvailLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [selectedDate, clinicId]);

    // Why the chosen time can't be booked (the server checks again; this just saves a round trip)
    const timeProblem = useMemo(() => {
        if (!selectedDate || !selectedTime24 || !availability || !availability.isOpen) return null;

        const { opensAt, closesAt, bookedTimes } = availability;
        if ((opensAt && selectedTime24 < opensAt) || (closesAt && selectedTime24 >= closesAt)) {
            return `Appointments run from ${opensAt ? to12Hour(opensAt) : "—"} to ${closesAt ? to12Hour(closesAt) : "—"}.`;
        }
        if (new Date(`${selectedDate}T${selectedTime24}`).getTime() < Date.now()) {
            return "That time has already passed.";
        }
        if (bookedTimes.includes(selectedTime24)) {
            return "Another appointment is already booked at that time.";
        }
        return null;
    }, [selectedDate, selectedTime24, availability]);

    // The new appointment time, used to preview when each "before" reminder will go out
    const newAppointmentISO = useMemo(() => {
        if (!selectedDate || !selectedTime24 || timeProblem) return null;
        const d = new Date(`${selectedDate}T${selectedTime24}`);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }, [selectedDate, selectedTime24, timeProblem]);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime24) {
            toast.error("Select a new date and time");
            return;
        }
        if (timeProblem) {
            toast.error(timeProblem);
            return;
        }
        const reminderProblem = validateReminderRows(reminderRows, !!newAppointmentISO);
        if (reminderProblem) {
            toast.error(reminderProblem);
            return;
        }

        setSubmitting(true);
        try {
            const time12 = to12Hour(selectedTime24);
            const response = await rescheduleAppointment(
                appointmentId,
                selectedDate,
                time12,
                reason,
                toReminderInputs(reminderRows)
            );
            if (response.locked) {
                setIsOpen(false);
                goToUpgrade();
                return;
            }

            const created = response.result.reminders?.created ?? 0;
            const skipped = response.result.reminders?.skipped ?? [];

            toast.success(
                `Appointment rescheduled to ${time12}${created ? ` · ${created} reminder${created !== 1 ? "s" : ""} set` : ""}`
            );
            if (skipped.length > 0) {
                toast.message(`${skipped.length} reminder${skipped.length !== 1 ? "s" : ""} skipped: ${skipped[0].reason}`);
            }

            onRescheduled({ date: response.result.date, status: response.result.status });
            setIsOpen(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (!err?.response) {
        toast.error("Network error — the appointment may still have been rescheduled. Please refresh to check.");
    } else {
        toast.error(
            err.response?.data?.message ??
                (typeof err.response?.data === "string" ? err.response.data : "Failed to reschedule appointment")
        );
    }
        } finally {
            setSubmitting(false);
        }
    };

    const closed = !!availability && !availability.isOpen;

    return (
        <>
            <button
                onClick={() => (locked ? goToUpgrade() : setIsOpen(true))}
                aria-disabled={locked}
                className={`w-full py-2.5 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    locked
                    ? "bg-gray-100 text-gray-400 border border-gray-200"
                    : "bg-acc-clr text-pry-clr hover:bg-emerald-500"
                }`}
            >
                {locked ? <Lock size={16} /> : <AlertCircle size={16} />}
                Reschedule
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
                    <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-sec-clr sec-ff">
                                Reschedule Appointment
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Pet info card */}
                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex items-center gap-3">
                                {pet.photo ? (
                                    <img
                                        src={pet.photo}
                                        alt={pet.name}
                                        className="w-11 h-11 rounded-full object-cover border border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center border border-white shadow-sm">
                                        <PawPrint size={18} className="text-indigo-500" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-sec-clr sec-ff truncate">
                                        {pet.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {[pet.breed || pet.species, ownerName].filter(Boolean).join(" • ")}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 mt-1.5 bg-white/70 border border-indigo-100 rounded-lg px-2 py-1">
                                        <Calendar size={11} className="text-indigo-400" />
                                        <span className="text-[11px] font-medium text-gray-600">
                                            Current: {formatCurrent(currentDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Date / Time row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">
                                        New Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            min={minDate}
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors [color-scheme:light]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">
                                        New Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={selectedTime24}
                                            min={availability?.opensAt ?? undefined}
                                            max={availability?.closesAt ?? undefined}
                                            onChange={(e) => setSelectedTime24(e.target.value)}
                                            disabled={!selectedDate || availLoading || !availability?.isOpen}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed [color-scheme:light]"
                                        />
                                        {availLoading && (
                                            <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* What the clinic's day looks like */}
                            {!selectedDate && (
                                <p className="text-xs text-gray-400 -mt-3">Pick a date to see the clinic&apos;s hours.</p>
                            )}
                            {availError && <p className="text-xs text-red-500 -mt-3">{availError}</p>}
                            {closed && (
                                <p className="text-xs text-red-500 -mt-3">
                                    {availability?.message ?? "The clinic is closed on this day."} Choose another date.
                                </p>
                            )}
                            {availability?.isOpen && (
                                <div className="-mt-3 space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-400" />
                                        Open {availability.opensAt ? to12Hour(availability.opensAt) : "—"} –{" "}
                                        {availability.closesAt ? to12Hour(availability.closesAt) : "—"}
                                    </p>
                                    {availability.bookedTimes.length > 0 && (
                                        <p className="text-xs text-gray-400">
                                            Already booked: {availability.bookedTimes.map(to12Hour).join(", ")}
                                        </p>
                                    )}
                                </div>
                            )}
                            {timeProblem && <p className="text-xs text-red-500 -mt-3">{timeProblem}</p>}

                            {/* Reason for change */}
                            <div>
                                <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">
                                    Reason for Change
                                </label>
                                <div className="relative">
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors"
                                    >
                                        {REASON_OPTIONS.map((r) => (
                                            <option key={r} value={r}>
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Reminders for the new time */}
                            <div>
                                <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">
                                    Reminders for the new time
                                </label>
                                <ReminderPicker
                                    value={reminderRows}
                                    onChange={setReminderRows}
                                    referenceDate={newAppointmentISO}
                                    referenceLabel="appointment"
                                    disabled={submitting}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-3 p-5 pt-0">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={submitting}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedDate || !selectedTime24 || !!timeProblem || submitting}
                                className="flex-1 bg-acc-clr hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Confirm Reschedule"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}