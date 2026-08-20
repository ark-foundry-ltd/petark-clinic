// components/clinic/staffs-client.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Staff, getStaff } from "@/lib/staff";
import StaffList from "@/components/clinic/staff-list";
import InviteStaffModal from "@/components/clinic/invite-staff-modal";

export default function StaffsClient() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  async function refetchStaff() {
    try {
      const data = await getStaff();
      setStaffList(data.data);
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

      <div className="min-h-screen bg-white">
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

          {/* Body */}
          {loading ? (
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
          )}
        </div>
      </div>
    </>
  );
}