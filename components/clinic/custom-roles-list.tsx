// components/clinic/custom-roles-list.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { type CustomRole, deleteCustomRole } from "@/lib/custom-roles";
import CustomRoleModal from "@/components/clinic/custom-role-modal";
import ViewCustomRoleModal from "@/components/clinic/view-custom-role-modal";

interface CustomRolesListProps {
  roles: CustomRole[];
  onUpdate: () => void;
}

export default function CustomRolesList({
  roles,
  onUpdate,
}: Readonly<CustomRolesListProps>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [viewingRole, setViewingRole] = useState<CustomRole | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditingRole(null);
    setModalOpen(true);
  }

  function openEdit(role: CustomRole) {
    setViewingRole(null);
    setEditingRole(role);
    setModalOpen(true);
  }

  function openView(role: CustomRole) {
    setViewingRole(role);
  }

  async function handleDelete(role: CustomRole) {
    if (role.staffCount > 0) {
      toast.error(
        `${role.staffCount} staff member(s) are still assigned to this role. Reassign them first.`
      );
      return;
    }
    if (!confirm(`Delete "${role.name}"? This can't be undone.`)) return;

    setDeletingId(role._id);
    try {
      await deleteCustomRole(role._id);
      toast.success("Custom role deleted.");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete role.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {modalOpen && (
        <CustomRoleModal
          role={editingRole}
          onClose={() => setModalOpen(false)}
          onSuccess={onUpdate}
        />
      )}

      {viewingRole && (
        <ViewCustomRoleModal
          role={viewingRole}
          onClose={() => setViewingRole(null)}
          onEdit={() => openEdit(viewingRole)}
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 sec-ff">
          Build named roles from a custom mix of permissions.
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium cursor-pointer transition-colors pry-ff"
        >
          <Plus className="w-4 h-4" />
          New Role
        </button>
      </div>

      {roles.length === 0 && (
        <div className="text-center py-16 border border-gray-100 rounded-2xl">
          <p className="text-gray-400 text-sm sec-ff">No custom roles yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {roles.map((role) => (
          <div
            key={role._id}
            onClick={() => openView(role)}
            className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 pry-ff">{role.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 sec-ff">
                  {role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 sec-ff">
                  <Users className="w-3 h-3" />
                  {role.staffCount} staff
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => openEdit(role)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit role"
              >
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => handleDelete(role)}
                disabled={deletingId === role._id}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete role"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}