// components/clinic/patient-details-modal.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X, Loader2, PawPrint, Pencil, Stethoscope, Droplet } from "lucide-react";
import { getClinicPatientById, type ClinicPatientRecord, type HealthProfile } from "@/lib/clinic-patient";
import UpdateHealthProfile from "./update-health-profile";

interface PatientDetailsModalProps {
    clinicPatientId: string;
    onClose: () => void;
    onStartVisit?: (patient: ClinicPatientRecord) => void;
}

function InfoRow({ label, value }: Readonly<{ label: string; value?: ReactNode }>) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-800 break-words">{value || "-"}</dd>
        </div>
    );
}

function Section({ title, action, children }: Readonly<{ title: string; action?: ReactNode; children: ReactNode }>) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">{title}</h3>
                {action}
            </div>
            {children}
        </section>
    );
}

function Chips({ items, tone }: Readonly<{ items: string[]; tone: "amber" | "red" | "gray" }>) {
    if (items.length === 0) return <span className="text-sm text-gray-400">None recorded</span>;
    const toneClass = {
        amber: "bg-amber-50 text-amber-700 border-amber-100",
        red: "bg-red-50 text-red-700 border-red-100",
        gray: "bg-gray-100 text-gray-700 border-gray-200",
    }[tone];
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span key={item} className={`px-3 py-1 rounded-full text-xs font-medium border ${toneClass}`}>
                    {item}
                </span>
            ))}
        </div>
    );
}

function HealthView({ hp }: Readonly<{ hp?: HealthProfile }>) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Blood type</p>
                    {hp?.bloodType ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-semibold">
                            <Droplet size={13} /> {hp.bloodType}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">Not recorded</span>
                    )}
                </div>
                <InfoRow
                    label="Neutered / spayed"
                    value={hp?.neutered === true ? "Yes" : hp?.neutered === false ? "No" : "Not recorded"}
                />
                <InfoRow label="Microchip no." value={hp?.microchipNo} />
            </div>

            <div>
                <p className="text-xs text-gray-400 mb-1.5">Allergies</p>
                <Chips items={hp?.allergies ?? []} tone="amber" />
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1.5">Known drug reactions</p>
                <Chips items={hp?.knownDrugReactions ?? []} tone="red" />
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1.5">Chronic conditions</p>
                <Chips items={hp?.chronicConditions ?? []} tone="gray" />
            </div>
            {hp?.notes && (
                <div>
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.notes}</p>
                </div>
            )}
        </div>
    );
}

export default function PatientDetailsModal({
    clinicPatientId,
    onClose,
    onStartVisit,
}: Readonly<PatientDetailsModalProps>) {
    const [patient, setPatient] = useState<ClinicPatientRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingHealth, setEditingHealth] = useState(false);

    // Lock background scroll + close on Escape
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getClinicPatientById(clinicPatientId);
                if (!cancelled) setPatient(data);
            } catch {
                if (!cancelled) setError("Failed to load patient details.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [clinicPatientId]);

    const pet = patient?.pet;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Patient details"
                onClick={(e) => e.stopPropagation()}
                className="bg-pry-clr pry-ff w-full sm:max-w-2xl lg:max-w-3xl max-h-[92dvh] sm:max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-xl"
            >
                {/* Header */}
                <div className="shrink-0 flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-acc-clr/10 shrink-0">
                            <PawPrint size={20} className="text-acc-clr" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-sec-clr truncate capitalize">
                                {pet?.name ?? "Patient details"}
                            </h2>
                            {patient && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-sec-clr">
                                    {patient.registrationNo}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-sec-clr hover:bg-gray-50 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
                        </div>
                    )}

                    {!loading && (error || !patient || !pet) && (
                        <p className="text-center text-sm text-red-600 py-10">
                            {error ?? "Patient not found."}
                        </p>
                    )}

                    {!loading && patient && pet && (
                        <>
                            <Section title="Pet">
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 capitalize">
                                    <InfoRow label="Species" value={pet.species} />
                                    <InfoRow label="Breed" value={pet.breed} />
                                    <InfoRow label="Gender" value={pet.gender} />
                                    <InfoRow
                                        label="Age"
                                        value={pet.age ? `${pet.age} ${pet.ageUnit ?? "yrs"}` : undefined}
                                    />
                                    <InfoRow label="Color" value={pet.color} />
                                    <InfoRow
                                        label="Weight"
                                        value={pet.weight ? `${pet.weight} ${pet.weightUnit ?? "kg"}` : undefined}
                                    />
                                </dl>
                            </Section>

                            <Section title="Owner">
                                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InfoRow label="Name" value={patient.owner?.fullname} />
                                    <InfoRow label="Phone" value={patient.owner?.phoneNumber} />
                                    <InfoRow label="Email" value={patient.owner?.email} />
                                </dl>
                            </Section>

                            <Section title="Registration">
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 capitalize">
                                    <InfoRow label="Status" value={patient.registrationStatus} />
                                    <InfoRow
                                        label="Fee"
                                        value={
                                            patient.registrationFee
                                                ? `₦${patient.registrationFee.toLocaleString()}`
                                                : "None"
                                        }
                                    />
                                    <InfoRow label="Fee waived" value={patient.feeWaived ? "Yes" : "No"} />
                                </dl>
                            </Section>

                            <Section
                                title="Health profile"
                                action={
                                    !editingHealth && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingHealth(true)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:opacity-80 transition"
                                        >
                                            <Pencil size={13} /> Edit
                                        </button>
                                    )
                                }
                            >
                                {editingHealth ? (
                                    <UpdateHealthProfile
                                        clinicPatientId={patient._id}
                                        initial={patient.healthProfile}
                                        onSaved={(hp) => {
                                            setPatient({ ...patient, healthProfile: hp });
                                            setEditingHealth(false);
                                        }}
                                        onCancel={() => setEditingHealth(false)}
                                    />
                                ) : (
                                    <HealthView hp={patient.healthProfile} />
                                )}
                            </Section>
                        </>
                    )}
                </div>

                {/* Footer */}
                {patient && (
                    <div className="shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-4 sm:px-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                            Close
                        </button>
                        {onStartVisit && (
                            <button
                                type="button"
                                onClick={() => onStartVisit(patient)}
                                className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                            >
                                <Stethoscope size={15} /> Start Visit
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}