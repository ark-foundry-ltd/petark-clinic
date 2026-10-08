// app/dashboard/clinical/patients/[id]/page.tsx
import { Suspense } from "react";
import ClinicPatientDetailsPage from "@/components/patients/clinic-patient-details-page";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <ClinicPatientDetailsPage />
        </Suspense>
    );
}