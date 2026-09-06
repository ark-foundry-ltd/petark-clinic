// lib/hooks/useClinicLocations.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { listLocations, type Location } from "@/lib/location";
import { useAuthStore } from "@/store/useStore";

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
    const [activeLocationId, setActiveLocationIdState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const storedActiveLocationId = useAuthStore((s) => s.activeLocationId);
    const setStoredActiveLocationId = useAuthStore((s) => s.setActiveLocationId);

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
                setActiveLocationIdState((current) => {
                    // Prefer whichever id is already resolved, so a mid-session
                    // refetch (refetch()) doesn't jump the user to a different
                    // location than the one they're actively viewing.
                    if (current && active.some((l) => l._id === current)) return current;

                    // Otherwise, prefer the location picked at login/select-location
                    // (persisted in the auth store) — this is what makes a staff
                    // member's branch choice actually stick across pages.
                    if (storedActiveLocationId && active.some((l) => l._id === storedActiveLocationId)) {
                        return storedActiveLocationId;
                    }

                    const primary = active.find((l) => l.isPrimary);
                    const resolved = primary?._id ?? active[0]?._id ?? null;
                    if (resolved) setStoredActiveLocationId(resolved);
                    return resolved;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadToken]);

    // Switching branches via LocationBar updates both local state (immediate
    // re-render) and the persisted store (so it's still the choice on the
    // next page navigation or reload, not just this component instance).
    const setActiveLocationId = useCallback(
        (id: string) => {
            setActiveLocationIdState(id);
            setStoredActiveLocationId(id);
        },
        [setStoredActiveLocationId]
    );

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