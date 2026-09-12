// components/clinic/view-custom-role-modal.tsx
"use client";

import { useState } from "react";
import { X, Pencil, Check } from "lucide-react";
import { type CustomRole } from "@/lib/custom-roles";
import { PERMISSION_GROUPS } from "@/components/clinic/permission-picker";

interface ViewCustomRoleModalProps {
  role: CustomRole;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewCustomRoleModal({
  role,
  onClose,
  onEdit,
}: Readonly<ViewCustomRoleModalProps>) {
  const [showAll, setShowAll] = useState(false);

  const grantedByGroup = PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: group.permissions.filter((p) =>
      showAll ? true : role.permissions.includes(p.value)
    ),
  })).filter((group) => group.permissions.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 pry-ff">{role.name}</h2>
            <p className="text-xs text-gray-500 sec-ff mt-0.5">
              {role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"} · {role.staffCount} staff assigned
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500 sec-ff">
            {showAll ? "Showing all permissions" : "Showing granted permissions only"}
          </p>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-medium text-acc-clr hover:underline pry-ff"
          >
            {showAll ? "Show granted only" : "Show all"}
          </button>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {grantedByGroup.length === 0 && (
            <p className="text-sm text-gray-400 sec-ff text-center py-6">
              No permissions granted.
            </p>
          )}
          {grantedByGroup.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sec-ff">
                {group.label}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {group.permissions.map((p) => {
                  const granted = role.permissions.includes(p.value);
                  return (
                    <div
                      key={p.value}
                      className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg sec-ff ${
                        granted ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          granted ? "bg-acc-clr" : "bg-gray-100"
                        }`}
                      >
                        {granted && <Check className="w-2.5 h-2.5 text-white" />}
                      </span>
                      {p.label}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors pry-ff"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-acc-clr text-pry-clr rounded-lg cursor-pointer transition-colors pry-ff flex items-center justify-center gap-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Role
          </button>
        </div>
      </div>
    </div>
  );
}