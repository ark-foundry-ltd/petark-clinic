"use client";

// components/clinic/book-appointment-modal.tsx

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarPlus, Clock, Loader2, PawPrint, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
    bookAppointmentForOwner,
    getClinicAvailability,
    type ClinicDayAvailability,
} from "@/lib/appointment";
import { searchClinicPatients, type ClinicPatientRecord } from "@/lib/clinic-patient";
import { getMe, getPlanInfo } from "@/lib/user";
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

function errorMessage(err: unknown, fallback: string): string {
    const data = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
    if (typeof data === "string") return data;
    return data?.message ?? fallback;
}

interface BookAppointmentModalProps {
    onBooked: () => void;
    initialPatient?: ClinicPatientRecord | null; // e.g. when opened from a patient's page
}

export default function BookAppointmentModal({
    onBooked,
    initialPatient = null,
}: Readonly<BookAppointmentModalProps>) {
    const [isOpen, setIsOpen] = useState(false);

    // patient
    const [patient, setPatient] = useState<ClinicPatientRecord | null>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ClinicPatientRecord[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // date & time
    const [date, setDate] = useState("");
    const [time24, setTime24] = useState("");
    const [availability, setAvailability] = useState<ClinicDayAvailability | null>(null);
    const [availLoading, setAvailLoading] = useState(false);
    const [availError, setAvailError] = useState<string | null>(null);

    // the rest
    const [notes, setNotes] = useState("");
    const [reminderRows, setReminderRows] = useState<ReminderRow[]>([]);
    const [remindersLocked, setRemindersLocked] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const minDate = todayDateStr();

    // Reset every time the modal opens, and check whether the plan includes reminders
    useEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPatient(initialPatient);
        setQuery("");
        setResults([]);
        setSearchError(null);
        setDate("");
        setTime24("");
        setAvailability(null);
        setAvailError(null);
        setNotes("");
        setReminderRows(defaultReminderRows());
        setRemindersLocked(false);

        let cancelled = false;
        getMe()
            .catch(() => null)
            .then((me) => {
                if (cancelled || !me) return;
                const { plan, status } = getPlanInfo(me);
                setRemindersLocked(plan === "free" || status !== "active");
            });
        return () => { cancelled = true; };
    }, [isOpen, initialPatient]);

    // Patient search (waits for a short pause in typing)
    useEffect(() => {
        if (!isOpen || patient) return;
        const q = query.trim();
        if (q.length < 2) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResults([]);
            setSearchError(null);
            setSearching(false);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setSearching(true);
            setSearchError(null);
            try {
                const { data } = await searchClinicPatients(q);
                if (!cancelled) setResults(data);
            } catch {
                if (!cancelled) {
                    setSearchError("Couldn't search patients. Please try again.");
                    setResults([]);
                }
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query, isOpen, patient]);

    // The clinic's hours for the chosen day
    useEffect(() => {
        if (!date) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAvailability(null);
            return;
        }
        setTime24("");
        setAvailError(null);

        let cancelled = false;
        (async () => {
            setAvailLoading(true);
            try {
                const data = await getClinicAvailability(date, date);
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
    }, [date]);

    // Why the chosen time can't be booked (the server checks again; this saves a round trip)
    const timeProblem = useMemo(() => {
        if (!date || !time24 || !availability || !availability.isOpen) return null;

        const { opensAt, closesAt, bookedTimes } = availability;
        if ((opensAt && time24 < opensAt) || (closesAt && time24 >= closesAt)) {
            return `Appointments run from ${opensAt ? to12Hour(opensAt) : "—"} to ${closesAt ? to12Hour(closesAt) : "—"}.`;
        }
        if (new Date(`${date}T${time24}`).getTime() < Date.now()) {
            return "That time has already passed.";
        }
        if (bookedTimes.includes(time24)) {
            return "Another appointment is already booked at that time.";
        }
        return null;
    }, [date, time24, availability]);

    // The appointment time, used to preview when each "before" reminder will go out
    const bookingISO = useMemo(() => {
        if (!date || !time24 || timeProblem) return null;
        const d = new Date(`${date}T${time24}`);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }, [date, time24, timeProblem]);

    // Can this owner actually be reached?
    const contactNote = useMemo(() => {
        if (!patient) return null;
        const { owner } = patient;
        const hasAccount = !!owner?._id;
        const hasPhone = !!owner?.phoneNumber;
        const hasEmail = !!owner?.email;

        if (!hasAccount && !hasPhone && !hasEmail) {
            return "This owner has no PetArk account and no phone number or email on file, so reminders can't be delivered.";
        }
        if (!hasAccount) {
            return "This owner has no PetArk account yet, so reminders go by SMS or email only.";
        }
        return null;
    }, [patient]);

    const handleSubmit = async () => {
        if (!patient || !date || !time24) {
            toast.error("Choose a patient, a date and a time");
            return;
        }
        if (timeProblem) {
            toast.error(timeProblem);
            return;
        }

        const rowsToSend = remindersLocked ? [] : reminderRows;
        const reminderProblem = validateReminderRows(rowsToSend, !!bookingISO);
        if (reminderProblem) {
            toast.error(reminderProblem);
            return;
        }

        setSubmitting(true);
        try {
            const result = await bookAppointmentForOwner({
                petId: patient.pet._id,
                date,
                time: to12Hour(time24),
                ...(notes.trim() ? { notes: notes.trim() } : {}),
                reminders: toReminderInputs(rowsToSend),
            });

            const created = result.reminders?.created ?? 0;
            const skipped = result.reminders?.skipped ?? [];

            toast.success(
                `Appointment booked for ${patient.pet.name} at ${to12Hour(time24)}${
                    created ? ` · ${created} reminder${created !== 1 ? "s" : ""} set` : ""
                }`
            );
            if (skipped.length > 0) {
                toast.message(`${skipped.length} reminder${skipped.length !== 1 ? "s" : ""} skipped: ${skipped[0].reason}`);
            }

            setIsOpen(false);
            onBooked();
        } catch (err) {
            toast.error(errorMessage(err, "Couldn't book the appointment"));
        } finally {
            setSubmitting(false);
        }
    };

    const closed = !!availability && !availability.isOpen;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc-clr text-pry-clr text-xs font-medium hover:bg-acc-clr/90 transition-colors whitespace-nowrap"
            >
                <CalendarPlus size={13} />
                Book appointment
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4 pb-14">
                    <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-sec-clr sec-ff">Book Appointment</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Patient */}
                            <div>
                                <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">Patient</label>

                                {patient ? (
                                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center border border-white shadow-sm shrink-0">
                                            <PawPrint size={18} className="text-indigo-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-sec-clr sec-ff truncate capitalize">
                                                {patient.pet.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate capitalize">
                                                {[patient.pet.breed || patient.pet.species, patient.owner?.fullname]
                                                    .filter(Boolean)
                                                    .join(" • ")}
                                            </p>
                                            {patient.owner?.phoneNumber && (
                                                <p className="text-xs text-gray-400 truncate">{patient.owner.phoneNumber}</p>
                                            )}
                                        </div>
                                        {!initialPatient && (
                                            <button
                                                onClick={() => setPatient(null)}
                                                disabled={submitting}
                                                className="text-xs font-medium text-acc-clr hover:opacity-80 shrink-0 disabled:opacity-50"
                                            >
                                                Change
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Search by pet name, owner, phone or registration no."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm text-sec-clr placeholder:text-gray-400 focus:outline-none focus:border-acc-clr focus:bg-white transition-colors"
                                            />
                                            {searching && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin pointer-events-none" />
                                            )}
                                        </div>

                                        {searchError && <p className="text-xs text-red-500">{searchError}</p>}

                                        {results.length > 0 && (
                                            <ul className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                                                {results.map((r) => (
                                                    <li key={r._id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPatient(r)}
                                                            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <p className="text-sm font-medium text-gray-900 capitalize">{r.pet.name}</p>
                                                            <p className="text-xs text-gray-500 capitalize">
                                                                {[r.pet.breed || r.pet.species, r.owner?.fullname, r.owner?.phoneNumber]
                                                                    .filter(Boolean)
                                                                    .join(" • ")}
                                                            </p>
                                                            {r.registrationNo && (
                                                                <p className="text-[11px] text-gray-400 mt-0.5">{r.registrationNo}</p>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {!searching && !searchError && query.trim().length >= 2 && results.length === 0 && (
                                            <p className="text-xs text-gray-400">
                                                No matching patients. Only patients registered at your clinic can be booked.
                                            </p>
                                        )}
                                        {query.trim().length < 2 && (
                                            <p className="text-xs text-gray-400">Type at least 2 characters to search.</p>
                                        )}
                                    </div>
                                )}

                                {contactNote && (
                                    <p className="flex items-start gap-1.5 text-xs text-amber-700 mt-2">
                                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                                        <span>{contactNote}</span>
                                    </p>
                                )}
                            </div>

                            {/* Date / Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">Date</label>
                                    <input
                                        type="date"
                                        min={minDate}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors [color-scheme:light]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={time24}
                                            min={availability?.opensAt ?? undefined}
                                            max={availability?.closesAt ?? undefined}
                                            onChange={(e) => setTime24(e.target.value)}
                                            disabled={!date || availLoading || !availability?.isOpen}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr focus:outline-none focus:border-acc-clr focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed [color-scheme:light]"
                                        />
                                        {availLoading && (
                                            <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!date && <p className="text-xs text-gray-400 -mt-3">Pick a date to see the clinic&apos;s hours.</p>}
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

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">
                                    Reason for visit <span className="font-normal text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    maxLength={500}
                                    rows={2}
                                    placeholder="e.g. Vaccination booster, limping on left leg"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-sec-clr placeholder:text-gray-400 focus:outline-none focus:border-acc-clr focus:bg-white transition-colors resize-none"
                                />
                            </div>

                            {/* Reminders */}
                            <div>
                                <label className="text-xs font-bold text-sec-clr sec-ff mb-1.5 block">Reminders for the owner</label>
                                <ReminderPicker
                                    value={reminderRows}
                                    onChange={setReminderRows}
                                    referenceDate={bookingISO}
                                    referenceLabel="appointment"
                                    locked={remindersLocked}
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
                                disabled={!patient || !date || !time24 || !!timeProblem || submitting}
                                className="flex-1 bg-acc-clr hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Book Appointment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}