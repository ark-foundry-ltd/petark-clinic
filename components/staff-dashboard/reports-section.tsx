// components/staff-dashboard/reports-section.tsx
"use client";

import { useClinicLocations } from "@/hooks/useClinicLocations";
import LocationBar from "@/components/inventory/location-bar";
import LocationReports from "@/components/reports/location-reports";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useStore";
import { getPlanInfo } from "@/lib/plan";

export default function ReportsSection() {
    const profile = useAuthStore((s) => s.profile);
    const { plan } = getPlanInfo(profile as Parameters<typeof getPlanInfo>[0]);

    // CMS-only plans have no locations and no sales/inventory data. They get the
    // clinic operations report only, and must not call /locations (it returns 402).
    if (plan?.startsWith("cms_")) {
        return <LocationReports clinicOnly />;
    }

    return <ImsReports />;
}

function ImsReports() {
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