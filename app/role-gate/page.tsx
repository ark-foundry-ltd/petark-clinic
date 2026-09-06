// app/role-gate/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useStore";
import { listLocations } from "@/lib/location";

// Mirrors the backend's LOCATION_RELEVANT_PERMISSIONS in staffController.js —
// any permission whose data is filtered by locationId. Keep in sync if the
// backend list changes.
const LOCATION_RELEVANT_PERMISSIONS = [
  "access_pos",
  "view_inventory",
  "manage_inventory",
  "view_inventory_cost",
  "view_sales_history",
];

export default function RoleGatePage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const clinicToken = useAuthStore((s) => s.clinic_token);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const setActiveLocationId = useAuthStore((s) => s.setActiveLocationId);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!clinicToken) {
        router.replace("/login");
        return;
      }

      let currentRole = role;

      if (!currentRole) {
        try {
          await fetchProfile();
          currentRole = useAuthStore.getState().role;
        } catch {
          if (!cancelled) router.replace("/login");
          return;
        }
      }

      if (cancelled) return;

      if (currentRole === "clinic") {
        router.replace("/dashboard");
        return;
      }

      if (!currentRole) {
        router.replace("/login");
        return;
      }

      // Staff role — check if they hold any location-scoped permission,
      // and if so, how many locations they can actually access.
      const permissions = useAuthStore.getState().permissions;
      const hasAll = permissions.includes("all_permissions");
      const isLocationRelevant =
        hasAll || LOCATION_RELEVANT_PERMISSIONS.some((p) => permissions.includes(p));

      if (!isLocationRelevant) {
        router.replace("/staff-dashboard");
        return;
      }

      try {
        const locations = await listLocations();
        if (cancelled) return;

        if (locations.length >= 2) {
          router.replace("/staff-dashboard/select-location");
        } else if (locations.length === 1) {
          setActiveLocationId(locations[0]._id);
          router.replace("/staff-dashboard");
        } else {
          // No assigned/active locations at all — let staff-dashboard
          // itself show the "no location set up" empty state.
          router.replace("/staff-dashboard");
        }
      } catch {
        if (!cancelled) router.replace("/staff-dashboard");
      }
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [role, clinicToken, fetchProfile, router, setActiveLocationId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
        <p className="text-sm text-gray-500 sec-ff">Taking you to your dashboard...</p>
      </div>
    </div>
  );
}