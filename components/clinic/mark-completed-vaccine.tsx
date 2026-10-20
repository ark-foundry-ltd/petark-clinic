"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import {
    addDaysYmd,
    createVaccination,
    formatDate,
    getErrorMessage,
    lagosYmd,
    toApiDate,
    updateVaccination,
    type Vaccination,
} from "@/lib/vaccination";
import { primaryBtn } from "./vaccination-modal";

interface Props {
    vaccination: Vaccination; // the overdue dose
    onClose: () => void;
    onSaved: (message?: string) => void;
}

const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:bg-white focus:outline-none [color-scheme:light]";

export default function MarkCompletedVaccine({ vaccination, onClose, onSaved }: Readonly<Props>) {
    const today = lagosYmd(new Date());
    const [givenOn, setGivenOn] = useState(today);
    const [nextDue, setNextDue] = useState(""); // blank = use the vaccine's booster interval
    const [batchNumber, setBatchNumber] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);

        if (!givenOn) {
            setError("Select the date the vaccine was given.");
            return;
        }
        if (givenOn > today) {
            setError("The date given can't be in the future.");
            return;
        }
        if (nextDue && nextDue <= givenOn) {
            setError("Next due date must be after the date given.");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createVaccination({
                ...(vaccination.clinicPatientId
                    ? { clinicPatientId: vaccination.clinicPatientId }
                    : { petId: vaccination.petId }),
                vaccineId: vaccination.vaccineId,
                administeredAt: toApiDate(givenOn, "noon"),
                ...(nextDue ? { nextDueDate: toApiDate(nextDue) } : {}),
                ...(batchNumber.trim() ? { batchNumber: batchNumber.trim() } : {}),
                ...(notes.trim() ? { notes: notes.trim() } : {}),
            });

            // The new dose is saved. Clear leftover pending reminders on the old one; if this
            // fails the dose is still recorded, so it must not show as an error.
            try {
                await updateVaccination(vaccination._id, { reminders: [] });
            } catch {
                /* ignore */
            }

            const next = result.vaccination.nextDueDate;
            onSaved(
                next
                    ? `${vaccination.vaccineName} marked as completed. Next dose due ${formatDate(next)}.`
                    : `${vaccination.vaccineName} marked as completed.`
            );
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Could not mark this vaccination as completed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 pb-14 sm:items-center sm:px-4">
            <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-lg sm:max-w-md sm:rounded-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Mark as completed</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm">
                        <p className="font-medium text-gray-900">{vaccination.vaccineName}</p>
                        {vaccination.nextDueDate && (
                            <p className="text-xs text-red-700">Was due {formatDate(vaccination.nextDueDate)}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="mc-given" className="mb-1.5 block text-xs font-bold text-gray-900">
                            Date given
                        </label>
                        <input
                            id="mc-given"
                            type="date"
                            value={givenOn}
                            max={today}
                            onChange={(e) => setGivenOn(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="mc-next" className="mb-1.5 block text-xs font-bold text-gray-900">
                            Next due date <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                            id="mc-next"
                            type="date"
                            value={nextDue}
                            min={givenOn ? addDaysYmd(givenOn, 1) : undefined}
                            onChange={(e) => setNextDue(e.target.value)}
                            className={inputCls}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Leave blank to use this vaccine&apos;s booster interval.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="mc-batch" className="mb-1.5 block text-xs font-bold text-gray-900">
                            Batch number <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                            id="mc-batch"
                            type="text"
                            value={batchNumber}
                            onChange={(e) => setBatchNumber(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label htmlFor="mc-notes" className="mb-1.5 block text-xs font-bold text-gray-900">
                            Notes <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <textarea
                            id="mc-notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                </div>

                <div className="flex items-center gap-3 p-5 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !givenOn}
                        className={`${primaryBtn} flex flex-1 items-center justify-center gap-2 disabled:opacity-50`}
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}