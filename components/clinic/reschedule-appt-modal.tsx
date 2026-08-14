"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Clock, Loader2, AlertCircle, ChevronDown, PawPrint } from "lucide-react";
import { toast } from "sonner";
import {
    getClinicAvailability,
    rescheduleAppointment,
    type ClinicAvailabilitySlot,
} from "@/lib/appointment";

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
    pet: {
        name: string;
        breed?: string;
        species?: string;
        photo?: string;
    };
    ownerName?: string;
    onRescheduled: (result: { date: string; status: string }) => void;
}

export default function RescheduleAppointmentModal({
    appointmentId,
    clinicId,
    currentDate,
    pet,
    ownerName,
    onRescheduled,
}: RescheduleAppointmentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime24, setSelectedTime24] = useState("");
    const [slots, setSlots] = useState<ClinicAvailabilitySlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [reason, setReason] = useState(REASON_OPTIONS[0]);
    const [submitting, setSubmitting] = useState(false);

    const minDate = todayDateStr();

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedDate("");
            setSelectedTime24("");
            setSlots([]);
            setSlotsError(null);
            setReason(REASON_OPTIONS[0]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!selectedDate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSlots([]);
            return;
        }
        setSelectedTime24("");
        setSlotsError(null);
        (async () => {
            setSlotsLoading(true);
            try {
                const data = await getClinicAvailability(clinicId, selectedDate);
                setSlots(data);
            } catch {
                setSlotsError("Couldn't load available times.");
                setSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        })();
    }, [selectedDate, clinicId]);

    const morningSlots = slots.filter((s) => parseInt(s.time.split(":")[0], 10) < 12);
    const afternoonSlots = slots.filter((s) => parseInt(s.time.split(":")[0], 10) >= 12);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime24) {
            toast.error("Select a new date and time");
            return;
        }
        setSubmitting(true);
        try {
            const time12 = to12Hour(selectedTime24);
            const result = await rescheduleAppointment(
                appointmentId,
                selectedDate,
                time12,
                reason
            );
            toast.success(`Appointment rescheduled to ${time12}`);
            onRescheduled({ date: result.date, status: result.status });
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

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-acc-clr text-pry-clr py-2.5 px-4 rounded-xl font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
                <AlertCircle size={16} />
                Reschedule
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
                    <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
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
                                        <select
                                            value={selectedTime24}
                                            onChange={(e) => setSelectedTime24(e.target.value)}
                                            disabled={!selectedDate || slotsLoading || slots.length === 0}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {!selectedDate
                                                    ? "Select date first"
                                                    : slotsLoading
                                                      ? "Loading..."
                                                      : slots.length === 0
                                                        ? "No slots"
                                                        : "Select slot"}
                                            </option>
                                            {morningSlots.length > 0 && (
                                                <optgroup label="Morning">
                                                    {morningSlots.map((s) => (
                                                        <option key={s.time} value={s.time} disabled={!s.available}>
                                                            {to12Hour(s.time)}{!s.available ? " — booked" : ""}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            {afternoonSlots.length > 0 && (
                                                <optgroup label="Afternoon">
                                                    {afternoonSlots.map((s) => (
                                                        <option key={s.time} value={s.time} disabled={!s.available}>
                                                            {to12Hour(s.time)}{!s.available ? " — booked" : ""}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </select>
                                        {slotsLoading ? (
                                            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                                        ) : (
                                            <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {slotsError && (
                                <p className="text-xs text-red-500 -mt-3">{slotsError}</p>
                            )}

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
                                disabled={!selectedDate || !selectedTime24 || submitting}
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