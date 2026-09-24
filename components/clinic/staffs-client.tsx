// components/clinic/staffs-client.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { Staff, getStaff } from "@/lib/staff";
import { type CustomRole, listCustomRoles } from "@/lib/custom-roles";
import { useAuthStore } from "@/store/useStore";
import type { User } from "@/lib/user";
import StaffList from "@/components/clinic/staff-list";
import InviteStaffModal from "@/components/clinic/invite-staff-modal";
import CustomRolesList from "@/components/clinic/custom-roles-list";
import UsagePill from "@/components/clinic/usage-pill";
import { getClinicUsage, type UsageSummary } from "@/lib/usage";

type Tab = "staff" | "roles";

export default function StaffsClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("staff");

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [usage, setUsage] = useState<UsageSummary | null>(null);

  const profile = useAuthStore((s) => s.profile) as User | null;
  const plan = profile?.subscription?.plan;
  // Matches the backend's requirePlanForAny('starter') gate on custom roles —
  // every paid tier (Starter, Standard, Pro, Enterprise) has access, only Free doesn't.
  const hasCustomRolesAccess =
    plan === "starter" || plan === "standard" || plan === "pro" || plan === "enterprise";

  useEffect(() => {
    let cancelled = false;
    getClinicUsage()
      .then((data) => {
        if (!cancelled) setUsage(data);
      })
      .catch(() => {
        if (!cancelled) setUsage(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchStaff() {
      try {
        const data = await getStaff();
        if (!cancelled) setStaffList(data.data);
      } catch (error) {
        if (!cancelled)
          toast.error(
            error instanceof Error ? error.message : "Could not load staff members."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStaff();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasCustomRolesAccess) {
      setRolesLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchRoles() {
      try {
        const data = await listCustomRoles();
        if (!cancelled) setCustomRoles(data.data);
      } catch (error) {
        if (!cancelled)
          toast.error(
            error instanceof Error ? error.message : "Could not load custom roles."
          );
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    }

    fetchRoles();

    return () => {
      cancelled = true;
    };
  }, [hasCustomRolesAccess]);

  async function refetchStaff() {
    try {
      const data = await getStaff();
      setStaffList(data.data);
    } catch {
      // silently fail on refetch
    }
  }

  async function refetchRoles() {
    try {
      const data = await listCustomRoles();
      setCustomRoles(data.data);
    } catch {
      // silently fail on refetch
    }
  }

  return (
    <>
      {showModal && (
        <InviteStaffModal
          onClose={() => setShowModal(false)}
          onSuccess={refetchStaff}
        />
      )}

      <div className="min-h-screen bg-pry-clr">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Page header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 pry-ff">Staff</h1>
                <p className="text-sm text-gray-500 sec-ff">
                  Manage the staffs for this clinic
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/profile/role")}
              className="text-sm font-medium border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors pry-ff"
            >
              View Roles
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => setTab("staff")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors pry-ff ${
                tab === "staff" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setTab("roles")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors pry-ff flex items-center gap-1.5 ${
                tab === "roles" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Custom Roles
              {!hasCustomRolesAccess && <Lock className="w-3 h-3 text-gray-400" />}
            </button>
          </div>

          {usage && (
            <div className="flex items-center gap-4">
              <UsagePill label="Staff" count={usage.staff.count} limit={usage.staff.limit} unlimited={usage.staff.unlimited} />
              <UsagePill label="Custom Roles" count={usage.customRoles.count} limit={usage.customRoles.limit} unlimited={usage.customRoles.unlimited} />
            </div>
          )}

          {/* Body */}
          {tab === "staff" &&
            (loading ? (
              <div className="space-y-3 pt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <StaffList
                staffList={staffList}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onInvite={() => setShowModal(true)}
                onUpdate={refetchStaff}
              />
            ))}

          {tab === "roles" &&
            (!hasCustomRolesAccess ? (
              <div className="text-center py-16 border border-gray-100 rounded-2xl space-y-3">
                <Lock className="w-6 h-6 text-gray-300 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-700 pry-ff">
                    Custom Roles requires a paid plan
                  </p>
                  <p className="text-sm text-gray-400 sec-ff mt-1">
                    Upgrade to Starter or above to build named roles with custom permission sets.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/profile/subscription")}
                  className="text-sm font-medium bg-acc-clr text-pry-clr px-4 py-2 rounded-lg pry-ff"
                >
                  Upgrade Plan
                </button>
              </div>
            ) : rolesLoading ? (
              <div className="space-y-3 pt-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <CustomRolesList roles={customRoles} onUpdate={refetchRoles} />
            ))}
        </div>
      </div>
    </>
  );
}