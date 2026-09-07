// components/staff-dashboard/pos-section.tsx
"use client";

import { useClinicLocations } from "@/hooks/useClinicLocations";
import LocationBar from "@/components/inventory/location-bar";
import PosCheckout from "@/components/sales/pos-checkout";

export default function PosSection() {
    const {
        activeLocations,
        activeLocationId,
        setActiveLocationId,
        loading,
        hasAnyLocation,
    } = useClinicLocations(false);

    if (loading) {
        return <div className="p-6 text-center text-sm text-slate-400">Loading...</div>;
    }

    if (!hasAnyLocation || !activeLocationId) {
        return (
            <div className="border border-gray-100 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 pry-ff mb-1">Point of Sale</h2>
                <p className="text-xs text-gray-500 sec-ff">
                    No active location is set up yet. Ask your clinic admin to add one before you can process sales.
                </p>
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
            <PosCheckout locationId={activeLocationId} />
        </div>
    );
}