// components/inventory/location-bar.tsx
"use client";

import { MapPin, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Location } from "@/lib/location";

interface LocationBarProps {
    locations: Location[]; // active locations only
    activeLocationId: string | null;
    onChange: (id: string) => void;
    loading: boolean;
    hasAnyLocation: boolean;
}

export default function LocationBar({
    locations,
    activeLocationId,
    onChange,
    loading,
    hasAnyLocation,
}: Readonly<LocationBarProps>) {
    if (loading) {
        return (
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading locations...
            </div>
        );
    }

    if (!hasAnyLocation) {
        return (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Add a location before managing inventory.</span>
                </div>
                <Link
                    href="/dashboard/clinical/inventory/locations"
                    className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                    Add Location
                </Link>
            </div>
        );
    }

    if (locations.length === 1) {
        return null;
    }

    return (
        <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <select
                value={activeLocationId ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-pry-clr px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-acc-clr"
            >
                {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                        {loc.name}{loc.isPrimary ? " (Primary)" : ""}
                    </option>
                ))}
            </select>
            <Link
                href="/dashboard/clinical/inventory/locations"
                className="text-xs font-medium text-acc-clr hover:underline"
            >
                Manage
            </Link>
        </div>
    );
}