// components/staff-dashboard/patients-section.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SearchPatient from "@/components/clinic/search-patient";
import PatientRegistrationFlow from "@/components/clinic/patient-registration-flow";
import type { ClinicPatientRecord } from "@/lib/clinic-patient";
import { useAuthStore } from "@/store/useStore";

type Mode = "search" | "register";

export default function PatientsSection() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const [mode, setMode] = useState<Mode>("search");
    const [prefill, setPrefill] = useState<{ name?: string; phone?: string }>({});

    const staffProfile = profile as {
        clinicRegistrationFee?: number;
        clinicRegistrationEnabled?: boolean;
    } | null;

    const registrationFee = staffProfile?.clinicRegistrationFee ?? 0;
    const registrationEnabled = staffProfile?.clinicRegistrationEnabled ?? false;

    function handleProceedToVisit(patient: ClinicPatientRecord) {
        router.push(`/staff-dashboard/clinical/records/create-visit?patientId=${patient._id}`);
    }

    function handleRegisterAsNew(prefillData: { name?: string; phone?: string }) {
        setPrefill(prefillData);
        setMode("register");
    }

    function handleRegistered(patient: ClinicPatientRecord) {
        setMode("search");
        handleProceedToVisit(patient);
    }

    if (mode === "register") {
        return (
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => setMode("search")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sec-clr transition-colors"
                >
                    <ArrowLeft size={15} /> Back to search
                </button>
                <PatientRegistrationFlow
                    registrationFee={registrationFee}
                    registrationEnabled={registrationEnabled}
                    prefillOwnerFullname={prefill.name}
                    prefillOwnerPhone={prefill.phone}
                    onRegistered={handleRegistered}
                    onCancel={() => setMode("search")}
                />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 pry-ff">Patients</h2>
            <SearchPatient
                onProceedToVisit={handleProceedToVisit}
                onRegisterAsNew={handleRegisterAsNew}
            />
        </div>
    );
}