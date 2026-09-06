// app/staff-dashboard/select-location/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { listLocations, type Location } from "@/lib/location";
import { useAuthStore } from "@/store/useStore";

export default function SelectLocationPage() {
  const router = useRouter();
  const setActiveLocationId = useAuthStore((s) => s.setActiveLocationId);

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLocations()
      .then((data) => {
        if (cancelled) return;
        const active = data.filter((l) => l.isActive);
        setLocations(active);

        // If they somehow landed here with fewer than 2 locations
        // (race with role-gate, or a location got deactivated since),
        // don't strand them — resolve automatically and move on.
        if (active.length <= 1) {
          setActiveLocationId(active[0]?._id ?? null);
          router.replace("/staff-dashboard");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your assigned locations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router, setActiveLocationId]);

  function handleSelect(locationId: string) {
    setSelecting(locationId);
    setActiveLocationId(locationId);
    router.replace("/staff-dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
          <p className="text-sm text-gray-500 sec-ff">Loading your locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 pry-ff">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Select a location</h1>
          <p className="text-sm text-gray-500 mt-1">
            You&apos;ve been assigned to more than one branch. Choose which one you&apos;re working at.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {locations.map((loc) => (
            <button
              key={loc._id}
              type="button"
              onClick={() => handleSelect(loc._id)}
              disabled={selecting !== null}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-left hover:border-acc-clr hover:bg-acc-clr/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-acc-clr/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-acc-clr" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{loc.name}</div>
                  <div className="text-xs text-gray-400">{loc.address}</div>
                </div>
              </div>
              {selecting === loc._id ? (
                <Loader2 className="w-4 h-4 animate-spin text-acc-clr shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-gray-200 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}