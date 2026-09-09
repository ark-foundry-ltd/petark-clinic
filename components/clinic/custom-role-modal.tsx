// components/clinic/custom-role-modal.tsx
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCustomRole, updateCustomRole, type CustomRole } from "@/lib/custom-roles";
import PermissionPicker from "@/components/clinic/permission-picker";

interface CustomRoleModalProps {
  role?: CustomRole | null; // present = editing, absent = creating
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomRoleModal({
  role,
  onClose,
  onSuccess,
}: Readonly<CustomRoleModalProps>) {
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);
  const [loading, setLoading] = useState(false);

  const isEditing = !!role;

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Please enter a role name.");
      return;
    }
    if (permissions.length === 0) {
      toast.error("Select at least one permission.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateCustomRole(role._id, { name, permissions });
        toast.success("Custom role updated.");
      } else {
        await createCustomRole({ name, permissions });
        toast.success("Custom role created.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save custom role."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 pry-ff">
              {isEditing ? "Edit Custom Role" : "New Custom Role"}
            </h2>
            <p className="text-xs text-gray-500 sec-ff mt-0.5">
              {isEditing
                ? "Changes apply immediately to every staff member with this role."
                : "Pick a name and the permissions this role should have."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 sec-ff mb-1">
            Role Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Warehouse Assistant"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 focus:border-acc-clr transition-colors sec-ff"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 sec-ff mb-2">
            Permissions
          </label>
          <PermissionPicker
            selected={permissions}
            onChange={setPermissions}
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors pry-ff disabled:opacity-50"
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
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Role"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}