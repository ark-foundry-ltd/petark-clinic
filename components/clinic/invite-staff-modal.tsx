// components/clinic/invite-staff-modal.tsx

"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inviteStaff, getStaffRoleMeta, type StaffRole } from "@/lib/staff";
import { listLocations, type Location } from "@/lib/location";

const ROLES: { value: StaffRole; label: string }[] = [
  { value: "vet", label: "Vet Assistant" },
  { value: "receptionist", label: "Receptionist" },
  { value: "sales", label: "Sales" }
];

interface InviteStaffModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteStaffModal({
  onClose,
  onSuccess,
}: Readonly<InviteStaffModalProps>) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("vet");
  const [loading, setLoading] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);

  // role → needsLocation, fetched live from the backend so custom roles
  // and future permission changes are reflected automatically — never
  // hardcode which roles need this.
  const [roleLocationMeta, setRoleLocationMeta] = useState<Record<string, boolean>>({});
  const [metaLoaded, setMetaLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getStaffRoleMeta()
      .then((meta) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        meta.forEach((m) => { map[m.role] = m.needsLocation; });
        setRoleLocationMeta(map);
      })
      .catch(() => {
        // If this fails, fail safe: treat every role as needing a location
        // rather than risk silently letting through an invite the backend
        // will reject anyway.
      })
      .finally(() => {
        if (!cancelled) setMetaLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const needsLocation = metaLoaded ? (roleLocationMeta[role] ?? true) : false;

  useEffect(() => {
    let cancelled = false;
    listLocations()
      .then((data) => {
        if (!cancelled) setLocations(data.filter((l) => l.isActive));
      })
      .catch(() => {
        if (!cancelled) setLocations([]);
      })
      .finally(() => {
        if (!cancelled) setLocationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleLocation(locationId: string) {
    setSelectedLocationIds((current) =>
      current.includes(locationId)
        ? current.filter((id) => id !== locationId)
        : [...current, locationId]
    );
  }

  async function handleSubmit() {
    if (!fullname.trim() || !email.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (needsLocation && selectedLocationIds.length === 0) {
      toast.error("Select at least one location for this role.");
      return;
    }

    setLoading(true);
    try {
      await inviteStaff({
        fullname,
        email,
        role,
        ...(needsLocation ? { locationIds: selectedLocationIds } : {}),
      });
      toast.success("Staff member invited successfully.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to invite staff."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-5 shadow-xl">
        {/* Modal header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 pry-ff">
              Invite Staff
            </h2>
            <p className="text-xs text-gray-500 sec-ff mt-0.5">
              An invitation will be sent to their email.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 sec-ff mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="e.g. Neilson Ogor"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 focus:border-acc-clr transition-colors sec-ff"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 sec-ff mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. staff@clinic.com"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 focus:border-acc-clr transition-colors sec-ff"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 sec-ff mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as StaffRole);
                setSelectedLocationIds([]); // reset — a location choice for the old role shouldn't silently carry over
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 focus:border-acc-clr transition-colors sec-ff bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {needsLocation && (
            <div>
              <label className="block text-xs font-medium text-gray-600 sec-ff mb-1">
                Assign to location(s)
              </label>
              {locationsLoading ? (
                <div className="flex items-center gap-2 text-xs text-acc-clr py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading locations...
                </div>
              ) : locations.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">
                  No active locations found. Add a location first.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-2">
                  {locations.map((loc) => (
                    <label
                      key={loc._id}
                      className="flex items-center gap-2 text-sm text-gray-700 sec-ff cursor-pointer px-1.5 py-1 rounded hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocationIds.includes(loc._id)}
                        onChange={() => toggleLocation(loc._id)}
                        className="rounded border-gray-300 text-acc-clr focus:ring-acc-clr"
                      />
                      {loc.name}
                      {loc.isPrimary && (
                        <span className="text-[10px] text-gray-400">(primary)</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors pry-ff"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-acc-clr text-pry-clr rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed pry-ff flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invite"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}