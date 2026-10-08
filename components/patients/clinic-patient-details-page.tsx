// components/clinic/clinic-patient-details-page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import PatientDetailsView from "@/components/patients/patient-details-view";

export default function ClinicPatientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    return (
        <PatientDetailsView
            clinicPatientId={id}
            backHref="/dashboard/clinical/patients"
            canStartVisit
            onStartVisit={(p) => router.push(`/dashboard/clinical/records/create-visit?patientId=${p._id}`)}
        />
    );
}