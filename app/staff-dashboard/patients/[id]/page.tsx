// app/staff-dashboard/patients/[id]/page.tsx
import { Suspense } from "react";
import StaffPatientDetailsPage from "@/components/patients/staff-patient-details-page";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <StaffPatientDetailsPage />
        </Suspense>
    );
}