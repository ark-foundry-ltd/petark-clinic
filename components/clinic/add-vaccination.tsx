"use client";

import { useEffect, useState, type FormEvent } from "react";
import ReminderPicker, {
    toReminderInputs,
    validateReminderRows,
    type ReminderRow,
} from "@/components/reminders/reminder-picker";
import {
    addDaysYmd,
    createVaccination,
    daysBetween,
    getErrorMessage,
    getVaccines,
    lagosYmd,
    toApiDate,
    updateVaccine,
    type PatientRef,
    type VaccineDefinition,
} from "@/lib/vaccination";
import { dueReferenceISO, rowsFromDefaults, rowsToDefaults } from "./reminder-rows";
import VaccinationModal, { fieldClass, labelClass, primaryBtn, secondaryBtn } from "./vaccination-modal";

interface Props {
    patient: PatientRef;
    visitId?: string; // link the dose to the visit it was given in
    canRemind: boolean; // false on the Free plan
    onClose: () => void;
    onSaved: (notice?: string) => void;
}

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

export default function AddVaccination({ patient, visitId, canRemind, onClose, onSaved }: Props) {
    const [vaccines, setVaccines] = useState<VaccineDefinition[]>([]);
    const [name, setName] = useState("");
    const [givenYmd, setGivenYmd] = useState(lagosYmd(new Date()));
    const [dueYmd, setDueYmd] = useState("");
    const [batch, setBatch] = useState("");
    const [notes, setNotes] = useState("");
    const [rows, setRows] = useState<ReminderRow[]>([]);
    const [saveDefaults, setSaveDefaults] = useState(false);
    const [dueTouched, setDueTouched] = useState(false);
    const [rowsTouched, setRowsTouched] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Suggestions are a convenience, so a failure here just means an empty list
    useEffect(() => {
        getVaccines().then(setVaccines).catch(() => undefined);
    }, []);

    const matched = vaccines.find((v) => v.name.toLowerCase() === normalize(name).toLowerCase());
    const remindersEnabled = canRemind && !!dueYmd;

    const handleNameChange = (value: string) => {
        setName(value);
        const m = vaccines.find((v) => v.name.toLowerCase() === normalize(value).toLowerCase());
        if (!m) return;
        const nextDue = !dueTouched && m.boosterIntervalDays ? addDaysYmd(givenYmd, m.boosterIntervalDays) : dueYmd;
        if (nextDue !== dueYmd) setDueYmd(nextDue);
        if (!rowsTouched && nextDue && m.reminderDefaults.length) setRows(rowsFromDefaults(m.reminderDefaults, nextDue));
    };

    const handleGivenChange = (value: string) => {
        setGivenYmd(value);
        if (!dueTouched && matched?.boosterIntervalDays && value) setDueYmd(addDaysYmd(value, matched.boosterIntervalDays));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const vaccineName = normalize(name);
        if (!vaccineName) return setError("Enter the vaccine name");
        if (!givenYmd) return setError("Pick the date it was given");
        if (dueYmd && dueYmd <= givenYmd) return setError("Next due date must be after the date given");
        if (remindersEnabled) {
            const problem = validateReminderRows(rows, true);
            if (problem) return setError(problem);
        }

        setSubmitting(true);
        try {
            const result = await createVaccination({
                ...patient,
                ...(visitId ? { visitId } : {}),
                ...(matched ? { vaccineId: matched._id } : { vaccineName }),
                administeredAt: toApiDate(givenYmd, "noon"),
                nextDueDate: dueYmd ? toApiDate(dueYmd) : null,
                batchNumber: batch.trim() || undefined,
                notes: notes.trim() || undefined,
                // rows already hold the vaccine's defaults (or what the user changed them to)
                ...(remindersEnabled ? { reminders: toReminderInputs(rows) } : {}),
            });

            if (saveDefaults && remindersEnabled && rows.length) {
                try {
                    await updateVaccine(result.vaccine._id, {
                        boosterIntervalDays: daysBetween(givenYmd, dueYmd),
                        reminderDefaults: rowsToDefaults(rows, dueYmd),
                    });
                } catch {
                    // the dose is saved; not being able to store defaults shouldn't undo it
                }
            }

            const notices: string[] = [];
            if (result.remindersSkipped === "plan") notices.push("Reminders aren't included in the Free plan.");
            if (result.skippedReminders.length > 0) {
                notices.push(`${result.skippedReminders.length} reminder(s) skipped: ${result.skippedReminders[0].reason}.`);
            }
            onSaved(notices.length ? `Vaccination saved. ${notices.join(" ")}` : undefined);
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Could not save the vaccination"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <VaccinationModal title="Add vaccination" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClass}>Vaccine</label>
                    <input
                        list="vaccine-suggestions"
                        className={fieldClass}
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Rabies"
                        autoFocus
                    />
                    <datalist id="vaccine-suggestions">
                        {vaccines
                            .filter((v) => v.isActive)
                            .map((v) => (
                                <option key={v._id} value={v.name} />
                            ))}
                    </datalist>
                    {normalize(name) && !matched && (
                        <p className="mt-1 text-xs text-gray-500">&ldquo;{normalize(name)}&rdquo; will be added to your vaccine list.</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Date given</label>
                        <input
                            type="date"
                            className={fieldClass}
                            value={givenYmd}
                            max={lagosYmd(new Date())}
                            onChange={(e) => handleGivenChange(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Next due (optional)</label>
                        <input
                            type="date"
                            className={fieldClass}
                            value={dueYmd}
                            min={givenYmd ? addDaysYmd(givenYmd, 1) : undefined}
                            onChange={(e) => {
                                setDueTouched(true);
                                setDueYmd(e.target.value);
                            }}
                        />
                    </div>
                </div>
                {matched?.boosterIntervalDays && !dueTouched && (
                    <p className="-mt-2 text-xs text-gray-500">Due date filled in from this vaccine&apos;s {matched.boosterIntervalDays}-day booster interval.</p>
                )}

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
                    {!canRemind ? (
                        <ReminderPicker value={[]} onChange={() => undefined} locked />
                    ) : !dueYmd ? (
                        <p className="text-sm text-gray-500">Set a next due date to schedule reminders.</p>
                    ) : (
                        <>
                            <ReminderPicker
                                value={rows}
                                onChange={(next) => {
                                    setRowsTouched(true);
                                    setRows(next);
                                }}
                                referenceDate={dueReferenceISO(dueYmd)}
                                referenceLabel="due date"
                                disabled={submitting}
                            />
                            {rows.length > 0 && (
                                <label className="mt-3 flex items-start gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={saveDefaults}
                                        onChange={(e) => setSaveDefaults(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 accent-green-600"
                                    />
                                    Use these times and the booster interval as the default for{" "}
                                    {normalize(name) || "this vaccine"} next time
                                </label>
                            )}
                        </>
                    )}
                </div>

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className={secondaryBtn} disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" className={primaryBtn} disabled={submitting}>
                        {submitting ? "Saving…" : "Save vaccination"}
                    </button>
                </div>
            </form>
        </VaccinationModal>
    );
}