// components/clinic/staff-list.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, MoreVertical, ShieldOff, ShieldCheck, UserCog } from "lucide-react";
import {
  type Staff,
  type StaffRole,
  updateStaffRole,
  revokeStaffAccess,
  restoreStaffAccess,
} from "@/lib/staff";
import InviteStaffBtn from "@/components/clinic/invite-staff-btn";

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "vet", label: "Vet" },
  { value: "receptionist", label: "Receptionist" },
];

const STATUS_STYLES: Record<Staff["status"], string> = {
  invited: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-acc-clr",
  revoked: "bg-red-100 text-red-600",
};

interface StaffListProps {
  staffList: Staff[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onInvite: () => void;
  onUpdate: () => void;
}

export default function StaffList({
  staffList,
  searchQuery,
  onSearchChange,
  onInvite,
  onUpdate,
}: Readonly<StaffListProps>) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = staffList.filter(
    (s) =>
      s.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleRoleChange(staffId: string, role: StaffRole) {
    setBusyId(staffId);
    try {
      await updateStaffRole(staffId, { role });
      toast.success("Role updated");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setBusyId(null);
      setOpenMenuId(null);
    }
  }

  async function handleRevoke(staffId: string) {
    setBusyId(staffId);
    try {
      await revokeStaffAccess(staffId);
      toast.success("Access revoked");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke access");
    } finally {
      setBusyId(null);
      setOpenMenuId(null);
    }
  }

  async function handleRestore(staffId: string) {
    setBusyId(staffId);
    try {
      await restoreStaffAccess(staffId);
      toast.success("Access restored");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore access");
    } finally {
      setBusyId(null);
      setOpenMenuId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + Invite */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search staff by name or email"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 focus:border-acc-clr transition-colors sec-ff"
          />
        </div>
        <InviteStaffBtn onClick={onInvite} />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 border border-gray-100 rounded-2xl">
          <p className="text-gray-400 text-sm">
            {searchQuery ? "No staff match your search" : "No staff members yet"}
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.map((staff) => (
          <div
            key={staff._id}
            className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 pry-ff truncate">
                  {staff.fullname}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize shrink-0 ${STATUS_STYLES[staff.status]}`}
                >
                  {staff.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 sec-ff truncate">{staff.email}</p>
              <p className="text-xs text-gray-400 sec-ff capitalize mt-0.5">{staff.role}</p>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === staff._id ? null : staff._id)
                }
                disabled={busyId === staff._id}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {openMenuId === staff._id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-10">
                  {staff.status !== "revoked" && (
                    <>
                      <p className="px-3 pt-1.5 pb-1 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                        Change role
                      </p>
                      {ROLE_OPTIONS.filter((r) => r.value !== staff.role).map((r) => (
                        <button
                          key={r.value}
                          onClick={() => handleRoleChange(staff._id, r.value)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <UserCog className="w-3.5 h-3.5 text-gray-400" />
                          Set as {r.label}
                        </button>
                      ))}
                      <div className="my-1 border-t border-gray-100" />
                      <button
                        onClick={() => handleRevoke(staff._id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ShieldOff className="w-3.5 h-3.5" />
                        {staff.status === "invited" ? "Revoke invite" : "Revoke access"}
                      </button>
                    </>
                  )}

                  {staff.status === "revoked" && (
                    <button
                      onClick={() => handleRestore(staff._id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-acc-clr hover:bg-green-50 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Restore access
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}