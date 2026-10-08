"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { ClinicPatientRecord } from "@/lib/clinic-patient";
import UpdateHealthProfile from "@/components/clinic/update-health-profile";
import { InfoRow, Section, HealthView } from "@/components/patients/info-blocks";

export default function OverviewTab({
    patient,
    onChange,
}: Readonly<{ patient: ClinicPatientRecord; onChange: (p: ClinicPatientRecord) => void }>) {
    const [editing, setEditing] = useState(false);
    const { pet } = patient;

    return (
        <div className="space-y-6">
            <Section title="Pet">
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 capitalize">
                    <InfoRow label="Species" value={pet.species} />
                    <InfoRow label="Breed" value={pet.breed} />
                    <InfoRow label="Gender" value={pet.gender} />
                    <InfoRow label="Age" value={pet.age ? `${pet.age} ${pet.ageUnit ?? "yrs"}` : undefined} />
                    <InfoRow label="Color" value={pet.color} />
                    <InfoRow label="Weight" value={pet.weight ? `${pet.weight} ${pet.weightUnit ?? "kg"}` : undefined} />
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
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 capitalize">
                    <InfoRow label="Status" value={patient.registrationStatus} />
                    <InfoRow
                        label="Registered"
                        value={patient.registeredAt ? new Date(patient.registeredAt).toLocaleDateString() : undefined}
                    />
                    <InfoRow label="Fee" value={patient.registrationFee ? `₦${patient.registrationFee.toLocaleString()}` : "None"} />
                    <InfoRow label="Fee waived" value={patient.feeWaived ? "Yes" : "No"} />
                </dl>
            </Section>

            <Section
                title="Health profile"
                action={
                    !editing && (
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:opacity-80 transition"
                        >
                            <Pencil size={13} /> Edit
                        </button>
                    )
                }
            >
                {editing ? (
                    <UpdateHealthProfile
                        clinicPatientId={patient._id}
                        initial={patient.healthProfile}
                        onSaved={(hp) => {
                            onChange({ ...patient, healthProfile: hp });
                            setEditing(false);
                        }}
                        onCancel={() => setEditing(false)}
                    />
                ) : (
                    <HealthView hp={patient.healthProfile} />
                )}
            </Section>
        </div>
    );
}