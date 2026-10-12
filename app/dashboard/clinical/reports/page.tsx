// app/dashboard/clinical/reports/page.tsx
import type { Metadata } from "next";
import LocationReports from "@/components/reports/location-reports";

export const metadata: Metadata = {
    title: "Reports",
    description: "Clinic operations report.",
};

export default function ClinicReportsPage() {
    return (
        <div className="w-full pry-ff p-4">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-sec-clr">Reports</h1>
                <p className="text-sm text-gray-500">Download your clinic operations report.</p>
            </div>
            <LocationReports clinicOnly />
        </div>
    );
}