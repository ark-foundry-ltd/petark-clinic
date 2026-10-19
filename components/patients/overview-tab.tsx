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
        <div className="space-y-8">
            {/* Pet and owner sit side by side on large screens */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 lg:divide-x lg:divide-gray-100">
                <div className="lg:pr-8">
                    <Section title="Pet">
                        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 capitalize">
                            <InfoRow label="Species" value={pet.species} />
                            <InfoRow label="Breed" value={pet.breed} />
                            <InfoRow label="Gender" value={pet.gender} />
                            <InfoRow label="Age" value={pet.age ? `${pet.age} ${pet.ageUnit ?? "yrs"}` : undefined} />
                            <InfoRow label="Color" value={pet.color} />
                            <InfoRow
                                label="Weight"
                                value={pet.weight ? `${pet.weight} ${pet.weightUnit ?? "kg"}` : undefined}
                            />
                        </dl>
                    </Section>
                </div>

                <div className="lg:pl-8">
                    <Section title="Owner">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                            <InfoRow label="Name" value={patient.owner?.fullname} />
                            <InfoRow label="Phone" value={patient.owner?.phoneNumber} />
                            <div className="sm:col-span-2 min-w-0 wrap-break-word">
                                <InfoRow label="Email" value={patient.owner?.email} />
                            </div>
                        </dl>
                    </Section>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
                <Section title="Registration">
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 capitalize">
                        <InfoRow label="Status" value={patient.registrationStatus} />
                        <InfoRow
                            label="Registered"
                            value={
                                patient.registeredAt
                                    ? new Date(patient.registeredAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                      })
                                    : undefined
                            }
                        />
                        <InfoRow
                            label="Fee"
                            value={patient.registrationFee ? `₦${patient.registrationFee.toLocaleString()}` : "None"}
                        />
                        <InfoRow label="Fee waived" value={patient.feeWaived ? "Yes" : "No"} />
                    </dl>
                </Section>
            </div>

            <div className="border-t border-gray-100 pt-8">
                <Section
                    title="Health profile"
                    action={
                        !editing && (
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-sec-clr bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                            >
                                <Pencil size={13} /> Edit profile
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
        </div>
    );
}