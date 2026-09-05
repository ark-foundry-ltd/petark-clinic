// components/staff-dashboard/sales-history-section.tsx
"use client";

import { useClinicLocations } from "@/hooks/useClinicLocations";
import LocationBar from "@/components/inventory/location-bar";
import SalesHistory from "@/components/sales/sales-history";
import { useAuthStore } from "@/store/useStore";

export default function SalesHistorySection() {
    const {
        activeLocations,
        activeLocationId,
        setActiveLocationId,
        loading,
        hasAnyLocation,
    } = useClinicLocations(false);

    const permissions = useAuthStore((s) => s.permissions);
    const hasAll = permissions.includes("all_permissions");
    const canVoid = hasAll || permissions.includes("manage_finances");

    if (loading) {
        return <div className="p-6 text-center text-sm text-slate-400">Loading...</div>;
    }

    if (!hasAnyLocation || !activeLocationId) {
        return (
            <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 pry-ff mb-1">Sales History</h2>
                <p className="text-xs text-gray-500 sec-ff">No active location is set up yet.</p>
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
            <SalesHistory locationId={activeLocationId} canVoid={canVoid} />
        </div>
    );
}