// lib/hooks/useClinicLocations.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { listLocations, type Location } from "@/lib/location";

interface UseClinicLocationsResult {
    locations: Location[];
    activeLocations: Location[]; // isActive only — the only ones usable for stock/sale ops
    activeLocationId: string | null;
    setActiveLocationId: (id: string) => void;
    loading: boolean;
    error: string | null;
    hasAnyLocation: boolean;
    refetch: () => void;
}

export function useClinicLocations(scoped: boolean): UseClinicLocationsResult {
    const [locations, setLocations] = useState<Location[]>([]);
    const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);
        listLocations()
            .then((data) => {
                if (cancelled) return;
                setLocations(data);
                const active = data.filter((l) => l.isActive);
                setActiveLocationId((current) => {
                    if (current && active.some((l) => l._id === current)) return current;
                    const primary = active.find((l) => l.isPrimary);
                    return primary?._id ?? active[0]?._id ?? null;
                });
            })
            .catch(() => {
                if (cancelled) return;
                setError("Couldn't load your locations.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [reloadToken]);

    const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

    const activeLocations = locations.filter((l) => l.isActive);

    return {
        locations,
        activeLocations,
        activeLocationId,
        setActiveLocationId,
        loading,
        error,
        hasAnyLocation: activeLocations.length > 0,
        refetch,
    };
}