// components/clinic/patient-component.tsx

/* The main component for patient registration,
* allowing users to either search for existing patients or register new ones.
*/

"use client";

import { useState } from "react";
import PatientRegistrationFlow from "@/components/clinic/patient-registration-flow";
import SearchPatient from "@/components/clinic/search-patient";
import { ClinicPatientRecord } from "@/lib/clinic-patient";

type Tab = "existing" | "new";

interface PatientComponentProps {
    registrationFee: number;
    registrationEnabled: boolean;
    onProceedToVisit: (patient: ClinicPatientRecord) => void;
    getPatientHref: (patient: ClinicPatientRecord) => string;
}

export default function PatientComponent({
    registrationFee,
    registrationEnabled,
    onProceedToVisit,
    getPatientHref,
}: Readonly<PatientComponentProps>) {
    const [tab, setTab] = useState<Tab>("existing");
    const [prefill, setPrefill] = useState<{ name?: string; phone?: string }>({});

    const handleRegisterAsNew = (values: { name?: string; phone?: string }) => {
        setPrefill(values);
        setTab("new");
    };

    const handleRegistered = (patient: ClinicPatientRecord) => {
        setPrefill({});
        onProceedToVisit(patient);
    };

    return (
        <div className="w-full pry-ff">
            <div className="flex items-center justify-between mb-6 p-4">
                <h2 className="text-lg font-bold text-sec-clr">Patient Registration</h2>

                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setTab("existing")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                            tab === "existing"
                                ? "bg-pry-clr text-sec-clr shadow-sm"
                                : "text-gray-500"
                        }`}
                    >
                        Existing Patient
                    </button>
                    <button
                        onClick={() => setTab("new")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                            tab === "new"
                                ? "bg-pry-clr text-sec-clr shadow-sm"
                                : "text-gray-500"
                        }`}
                    >
                        New Patient
                    </button>
                </div>
            </div>

            {tab === "existing" ? (
                <SearchPatient
                    onProceedToVisit={onProceedToVisit}
                    getPatientHref={getPatientHref}
                    onRegisterAsNew={handleRegisterAsNew}
                />
            ) : (
                <PatientRegistrationFlow
                    registrationFee={registrationFee}
                    registrationEnabled={registrationEnabled}
                    prefillOwnerFullname={prefill.name}
                    prefillOwnerPhone={prefill.phone}
                    onRegistered={handleRegistered}
                    onCancel={() => setTab("existing")}
                />
            )}
        </div>
    );
}