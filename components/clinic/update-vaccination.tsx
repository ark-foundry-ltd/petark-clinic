"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
    addDaysYmd,
    getErrorMessage,
    getVaccines,
    lagosYmd,
    rowsFromDefaults,
    rowsToInputs,
    toApiDate,
    updateVaccination,
    validateRows,
    type ReminderRow,
    type UpdateVaccinationInput,
    type Vaccination,
    type VaccineDefinition,
} from "@/lib/vaccination";
import VaccinationModal, { fieldClass, labelClass, primaryBtn, secondaryBtn } from "./vaccination-modal";
import VaccinationReminderFields from "./vaccination-reminder-field";
import VaccinationReminders from "./vaccination-reminders";

interface Props {
    vaccination: Vaccination;
    canRemind: boolean;
    onClose: () => void;
    onSaved: (notice?: string) => void;
}

export default function UpdateVaccination({ vaccination, canRemind, onClose, onSaved }: Props) {
    const originalGiven = lagosYmd(vaccination.administeredAt);
    const originalDue = vaccination.nextDueDate ? lagosYmd(vaccination.nextDueDate) : "";

    const [definition, setDefinition] = useState<VaccineDefinition | null>(null);
    const [givenYmd, setGivenYmd] = useState(originalGiven);
    const [dueYmd, setDueYmd] = useState(originalDue);
    const [batch, setBatch] = useState(vaccination.batchNumber ?? "");
    const [notes, setNotes] = useState(vaccination.notes ?? "");
    const [reschedule, setReschedule] = useState(false);
    const [rows, setRows] = useState<ReminderRow[]>([]);
    const [seeded, setSeeded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dueChanged = dueYmd !== originalDue;
    // Changing the due date clears the pending reminders, so new ones have to be set
    const rescheduling = canRemind && (dueChanged || reschedule);

    useEffect(() => {
        getVaccines(true)
            .then((all) => setDefinition(all.find((v) => v._id === vaccination.vaccineId) ?? null))
            .catch(() => undefined);
    }, [vaccination.vaccineId]);

    // First time the reminder section opens, start from the vaccine's defaults
    useEffect(() => {
        if (rescheduling && !seeded) {
            setSeeded(true);
            if (definition?.reminderDefaults.length) setRows(rowsFromDefaults(definition.reminderDefaults));
        }
    }, [rescheduling, seeded, definition]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!givenYmd) return setError("Pick the date it was given");
        if (dueYmd && dueYmd <= givenYmd) return setError("Next due date must be after the date given");
        if (rescheduling && dueYmd) {
            const problem = validateRows(rows, dueYmd);
            if (problem) return setError(problem);
        }

        const payload: UpdateVaccinationInput = {};
        if (givenYmd !== originalGiven) payload.administeredAt = toApiDate(givenYmd, "noon");
        if (dueChanged) payload.nextDueDate = dueYmd ? toApiDate(dueYmd) : null;
        if (batch.trim() !== (vaccination.batchNumber ?? "")) payload.batchNumber = batch.trim() || null;
        if (notes.trim() !== (vaccination.notes ?? "")) payload.notes = notes.trim();
        if (rescheduling && dueYmd) payload.reminders = rowsToInputs(rows, dueYmd);

        if (Object.keys(payload).length === 0) return onClose();

        setSubmitting(true);
        try {
            const result = await updateVaccination(vaccination._id, payload);
            onSaved(
                result.remindersSkipped === "plan"
                    ? "Vaccination updated. Reminders aren't included in the Free plan."
                    : undefined
            );
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Could not update the vaccination"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <VaccinationModal title={`Edit ${vaccination.vaccineName}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Date given</label>
                        <input
                            type="date"
                            className={fieldClass}
                            value={givenYmd}
                            max={lagosYmd(new Date())}
                            onChange={(e) => setGivenYmd(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Next due (optional)</label>
                        <input
                            type="date"
                            className={fieldClass}
                            value={dueYmd}
                            min={givenYmd ? addDaysYmd(givenYmd, 1) : undefined}
                            onChange={(e) => setDueYmd(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Batch number (optional)</label>
                    <input className={fieldClass} value={batch} onChange={(e) => setBatch(e.target.value)} />
                </div>

                <div>
                    <label className={labelClass}>Notes (optional)</label>
                    <textarea rows={2} className={fieldClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Reminders to the owner</h3>

                    <VaccinationReminders vaccinationId={vaccination._id} />

                    {!canRemind ? (
                        <p className="mt-3 text-sm text-gray-500">Reminders are available on paid plans.</p>
                    ) : (
                        <div className="mt-4">
                            {dueChanged ? (
                                <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                    You changed the due date, so the reminders still waiting to go out will be replaced.
                                    {dueYmd ? " Set the new ones below." : " With no due date, none will be scheduled."}
                                </p>
                            ) : (
                                <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={reschedule}
                                        onChange={(e) => setReschedule(e.target.checked)}
                                        className="h-4 w-4 accent-green-600"
                                    />
                                    Replace the reminders still waiting to go out
                                </label>
                            )}

                            {rescheduling && dueYmd && (
                                <VaccinationReminderFields rows={rows} dueYmd={dueYmd} onChange={setRows} />
                            )}
                        </div>
                    )}
                </div>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className={secondaryBtn} disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" className={primaryBtn} disabled={submitting}>
                        {submitting ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </VaccinationModal>
    );
}