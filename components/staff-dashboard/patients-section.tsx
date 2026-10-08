// components/staff-dashboard/patients-section.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import SearchPatient from "@/components/clinic/search-patient";
import PatientRegistrationFlow from "@/components/clinic/patient-registration-flow";
import type { ClinicPatientRecord } from "@/lib/clinic-patient";
import { useAuthStore } from "@/store/useStore";
import { useHasPermission } from "@/hooks/use-has-permission";

type Mode = "search" | "register";

export default function PatientsSection() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const [mode, setMode] = useState<Mode>("search");
    const [prefill, setPrefill] = useState<{ name?: string; phone?: string }>({});
    const canRegister = useHasPermission("register_patient");

    const staffProfile = profile as {
        clinicRegistrationFee?: number;
        clinicRegistrationEnabled?: boolean;
    } | null;

    const registrationFee = staffProfile?.clinicRegistrationFee ?? 0;
    const registrationEnabled = staffProfile?.clinicRegistrationEnabled ?? false;

    function handleProceedToVisit(patient: ClinicPatientRecord) {
        router.push(`/staff-dashboard/clinical/records/create-visit?patientId=${patient._id}`);
    }

    function getPatientHref(patient: ClinicPatientRecord) {
        return `/staff-dashboard/patients/${patient._id}`;
    }

    function handleRegisterAsNew(prefillData: { name?: string; phone?: string }) {
        setPrefill(prefillData);
        setMode("register");
    }

    function handleRegistered(patient: ClinicPatientRecord) {
        setMode("search");
        handleProceedToVisit(patient);
    }

    if (mode === "register" && canRegister) {
        return (
            <div className="space-y-3">
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
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 pry-ff">Patients</h2>
                {canRegister && (
                    <button
                        type="button"
                        onClick={() => handleRegisterAsNew({})}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-acc-clr text-pry-clr rounded-lg text-xs font-medium hover:opacity-90 transition sec-ff"
                    >
                        <UserPlus size={14} /> Register patient
                    </button>
                )}
            </div>
            <SearchPatient
                onProceedToVisit={handleProceedToVisit}
                getPatientHref={getPatientHref}
                onRegisterAsNew={canRegister ? handleRegisterAsNew : undefined}
            />
        </div>
    );
}