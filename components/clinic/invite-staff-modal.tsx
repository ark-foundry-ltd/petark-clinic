"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inviteStaff, type StaffRole } from "@/lib/staff";

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

  async function handleSubmit() {
    if (!fullname.trim() || !email.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await inviteStaff({ fullname, email, role });
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
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 focus:border-acc-clr transition-colors sec-ff bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
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