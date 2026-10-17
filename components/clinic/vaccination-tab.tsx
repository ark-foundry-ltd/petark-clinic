"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getDueStatus,
    getErrorMessage,
    getVaccinations,
    latestDoseIds,
    type PatientRef,
    type Vaccination,
} from "@/lib/vaccination";
import AddVaccination from "./add-vaccination";
import DeleteVaccination from "./delete-vaccination";
import ListVaccination from "./list-vaccination";
import { primaryBtn } from "./vaccination-modal";
import UpdateVaccination from "./update-vaccination";

type ModalState =
    | { type: "add" }
    | { type: "edit"; vaccination: Vaccination }
    | { type: "delete"; vaccination: Vaccination }
    | null;

interface Props {
    clinicPatientId?: string; // pass either the clinic patient record…
    petId?: string; // …or just the pet (e.g. from the appointment page)
    visitId?: string; // on a visit page: doses recorded here are linked to that visit
    canRemind: boolean; // false on the Free plan (records still work, reminders don't)
    canManage?: boolean; // add / edit / delete
}

// Drop <VaccinationTab clinicPatientId={...} /> or <VaccinationTab petId={...} /> in, plus canRemind
export default function VaccinationTab({ clinicPatientId, petId, visitId, canRemind, canManage = true }: Props) {
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState>(null);

    const patient = useMemo<PatientRef | null>(
        () => (clinicPatientId ? { clinicPatientId } : petId ? { petId } : null),
        [clinicPatientId, petId]
    );

    const load = useCallback(async () => {
        if (!patient) {
            setLoading(false);
            return;
        }
        try {
            setError(null);
            setVaccinations(await getVaccinations(patient));
        } catch (err) {
            setError(getErrorMessage(err, "Could not load vaccinations"));
        } finally {
            setLoading(false);
        }
    }, [patient]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(null), 6000);
        return () => clearTimeout(t);
    }, [notice]);

    const { overdue, dueSoon } = useMemo(() => {
        const latest = latestDoseIds(vaccinations);
        const statuses = vaccinations.filter((v) => latest.has(v._id)).map((v) => getDueStatus(v.nextDueDate));
        return {
            overdue: statuses.filter((s) => s === "overdue").length,
            dueSoon: statuses.filter((s) => s === "due-soon").length,
        };
    }, [vaccinations]);

    const handleSaved = (message?: string) => {
        if (message) setNotice(message);
        load();
    };

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Vaccinations</h2>
                    {(overdue > 0 || dueSoon > 0) && (
                        <p className="text-sm text-gray-600">
                            {overdue > 0 && <span className="font-medium text-red-600">{overdue} overdue</span>}
                            {overdue > 0 && dueSoon > 0 && " · "}
                            {dueSoon > 0 && <span className="font-medium text-amber-600">{dueSoon} due soon</span>}
                        </p>
                    )}
                </div>
                {canManage && (
                    <button type="button" onClick={() => setModal({ type: "add" })} className={`${primaryBtn} inline-flex items-center gap-1.5`}>
                        <Plus className="h-4 w-4" /> Add vaccination
                    </button>
                )}
            </div>

            {notice && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            {loading ? (
                <p className="text-sm text-gray-500">Loading vaccinations…</p>
            ) : (
                <ListVaccination
                    vaccinations={vaccinations}
                    canManage={canManage}
                    canRemind={canRemind}
                    onEdit={(vaccination) => setModal({ type: "edit", vaccination })}
                    onDelete={(vaccination) => setModal({ type: "delete", vaccination })}
                />
            )}

            {modal?.type === "add" && patient && (
                <AddVaccination
                    patient={patient}
                    visitId={visitId}
                    canRemind={canRemind}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
            {modal?.type === "edit" && (
                <UpdateVaccination
                    vaccination={modal.vaccination}
                    canRemind={canRemind}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
            {modal?.type === "delete" && (
                <DeleteVaccination
                    vaccination={modal.vaccination}
                    onClose={() => setModal(null)}
                    onDeleted={() => load()}
                />
            )}
        </section>
    );
}