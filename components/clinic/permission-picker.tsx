// components/clinic/permission-picker.tsx
"use client";

interface PermissionGroup {
  label: string;
  permissions: { value: string; label: string }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Clinic-level",
    permissions: [
      { value: "view_reports", label: "View reports" },
      { value: "manage_services", label: "Manage services" },
      { value: "manage_notifications", label: "Manage notifications" },
      { value: "view_all_patients", label: "View all patients" },
      { value: "view_all_visits", label: "View all visits" },
      { value: "view_own_clinic_data", label: "View own clinic data" },
    ],
  },
  {
    label: "Appointments & check-in",
    permissions: [
      { value: "manage_appointments", label: "Manage appointments" },
      { value: "checkin_patients", label: "Check in patients" },
    ],
  },
  {
    label: "Visit lifecycle",
    permissions: [
      { value: "create_visit", label: "Create visits" },
      { value: "edit_visit", label: "Edit visits" },
      { value: "delete_visit", label: "Delete visits" },
      { value: "manage_visits", label: "Manage visits" },
    ],
  },
  {
    label: "Clinical actions",
    permissions: [
      { value: "record_vitals", label: "Record vitals" },
      { value: "add_diagnosis", label: "Add diagnosis" },
      { value: "prescribe_medication", label: "Prescribe medication" },
      { value: "create_treatment_plan", label: "Create treatment plans" },
      { value: "create_followup", label: "Create follow-ups" },
    ],
  },
  {
    label: "Patient info",
    permissions: [
      { value: "view_patients", label: "View patients" },
      { value: "view_pet_history", label: "View pet history" },
      { value: "view_basic_pet_info", label: "View basic pet info" },
      { value: "record_basic_info", label: "Record basic info" },
    ],
  },
  {
    label: "Billing & sales",
    permissions: [
      { value: "generate_invoice", label: "Generate invoice" },
      { value: "confirm_payment", label: "Confirm payment" },
      { value: "access_pos", label: "Access POS / checkout" },
      { value: "view_sales_history", label: "View sales history" },
    ],
  },
  {
    label: "Referrals",
    permissions: [
      { value: "create_referral", label: "Create referrals" },
      { value: "search_clinics", label: "Search clinics" },
      { value: "respond_referral", label: "Respond to referrals" },
      { value: "view_referrals", label: "View referrals" },
    ],
  },
  {
    label: "Inventory",
    permissions: [
      { value: "manage_inventory", label: "Manage inventory" },
      { value: "view_inventory", label: "View inventory" },
      { value: "view_inventory_cost", label: "View inventory cost" },
    ],
  },
];

interface PermissionPickerProps {
  selected: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export default function PermissionPicker({
  selected,
  onChange,
  disabled = false,
}: Readonly<PermissionPickerProps>) {
  function toggle(value: string) {
    if (disabled) return;
    onChange(
      selected.includes(value)
        ? selected.filter((p) => p !== value)
        : [...selected, value]
    );
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sec-ff">
            {group.label}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {group.permissions.map((p) => {
              const checked = selected.includes(p.value);
              return (
                <div
                  key={p.value}
                  className="flex items-center justify-between gap-2 text-sm text-gray-700 sec-ff px-2 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <span>{p.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={p.label}
                    onClick={() => toggle(p.value)}
                    disabled={disabled}
                    className={`relative inline-flex h-5 w-9 shrink-0 appearance-none items-center rounded-full border-0 p-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      checked ? "bg-acc-clr" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 shrink-0 translate-x-0.5 rounded-full bg-white shadow transition-transform ${
                        checked ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}