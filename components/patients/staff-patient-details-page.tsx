// components/staff-dashboard/staff-patient-details-page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import PatientDetailsView from "@/components/patients/patient-details-view";
import { useHasPermission } from "@/hooks/use-has-permission";

export default function StaffPatientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const canStartVisit = useHasPermission("create_visit"); // same one the create-visit route enforces
    return (
        <PatientDetailsView
            clinicPatientId={id}
            backHref="/staff-dashboard/patients"
            canStartVisit={canStartVisit}
            onStartVisit={(p) => router.push(`/staff-dashboard/clinical/records/create-visit?patientId=${p._id}`)}
        />
    );
}