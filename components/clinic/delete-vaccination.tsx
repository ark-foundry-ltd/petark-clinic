"use client";

import { useState } from "react";
import { deleteVaccination, formatDate, getErrorMessage, type Vaccination } from "@/lib/vaccination";
import VaccinationModal, { secondaryBtn } from "./vaccination-modal";

interface Props {
    vaccination: Vaccination;
    onClose: () => void;
    onDeleted: () => void;
}

export default function DeleteVaccination({ vaccination, onClose, onDeleted }: Props) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        try {
            await deleteVaccination(vaccination._id);
            onDeleted();
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete the vaccination"));
            setDeleting(false);
        }
    };

    return (
        <VaccinationModal title="Delete vaccination" onClose={onClose}>
            <p className="text-sm text-gray-700">
                Delete the <strong>{vaccination.vaccineName}</strong> dose given on {formatDate(vaccination.administeredAt)}?
                Reminders for it that haven&apos;t gone out yet will be cancelled. This can&apos;t be undone.
            </p>

            {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={onClose} className={secondaryBtn} disabled={deleting}>
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                    {deleting ? "Deleting…" : "Delete"}
                </button>
            </div>
        </VaccinationModal>
    );
}