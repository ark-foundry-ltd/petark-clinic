// hooks/useResourceUsage.ts
"use client";

import { useEffect, useState } from "react";
import { getClinicUsage, type ResourceUsage, type UsageSummary } from "@/lib/usage";

// Fetches plan usage for one resource. Bump `refreshKey` to refetch (e.g. after
// the clinic creates an item).
export function useResourceUsage(
    resource: keyof UsageSummary,
    refreshKey = 0
): ResourceUsage | null {
    const [usage, setUsage] = useState<ResourceUsage | null>(null);

    useEffect(() => {
        let cancelled = false;

        getClinicUsage()
            .then((data) => {
                if (!cancelled) setUsage(data[resource]);
            })
            .catch(() => {
                // /usage is clinic-owner only, so staff accounts get a 403 here.
                // The pill simply stays hidden for them.
            });

        return () => {
            cancelled = true;
        };
    }, [resource, refreshKey]);

    return usage;
}