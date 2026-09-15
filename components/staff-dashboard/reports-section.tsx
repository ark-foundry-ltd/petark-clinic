// components/staff-dashboard/reports-section.tsx
"use client";

import { useClinicLocations } from "@/hooks/useClinicLocations";
import LocationBar from "@/components/inventory/location-bar";
import LocationReports from "@/components/reports/location-reports";
import { Loader2 } from "lucide-react";

export default function ReportsSection() {
    const {
        activeLocations,
        activeLocationId,
        setActiveLocationId,
        loading,
        hasAnyLocation,
    } = useClinicLocations(false);

    if (loading) {
      return <div className="p-14 text-center text-sm text-acc-clr pry-ff min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
        Loading...
      </div>;
    }

    if (!hasAnyLocation || !activeLocationId) {
        return (
            <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 pry-ff mb-1">Reports</h2>
                <p className="text-xs text-sec-clr sec-ff">No active location is set up yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <LocationBar
                locations={activeLocations}
                activeLocationId={activeLocationId}
                onChange={setActiveLocationId}
                loading={loading}
                hasAnyLocation={hasAnyLocation}
            />
            <LocationReports locationId={activeLocationId} />
        </div>
    );
}