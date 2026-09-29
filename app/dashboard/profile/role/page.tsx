// dashboard/profile/role/page.tsx

import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RoleCard from "@/components/clinic/role-card";

export const metadata: Metadata = {
  title: "Roles | PetArk",
  description: "View roles and permissions for your clinic",
};

const ROLE_PERMISSIONS: Record<string, { label: string; permissions: string[] }> = {
  clinic: {
    label: "Clinic",
    permissions: [
      "all_permissions",
      // Clinic management
      "manage_clinic",
      "manage_staff",
      "assign_roles",
      "view_reports",
      "manage_finances",
      "manage_services",
      "manage_notifications",
      "view_all_patients",
      "view_all_visits",
      "view_own_clinic_data",
      "manage_visits",
      // Clinical
      "view_patients",
      "view_pet_history",
      "record_vitals",
      "add_diagnosis",
      "prescribe_medication",
      "create_treatment_plan",
      "create_followup",
      // Referrals
      "create_referral",
      "search_clinics",
      "respond_referral",
      "view_referrals",
      // Front desk
      "view_basic_pet_info",
      "record_basic_info",
      "manage_appointments",
      "checkin_patients",
      "create_visit",
      "edit_visit",
      "delete_visit",
      // Billing
      "generate_invoice",
      "confirm_payment",
      "access_pos",
      // Inventory
      "manage_inventory",
      "view_inventory",
      "view_inventory_cost",
    ],
  },
  vet: {
    label: "Vet",
    permissions: [
      "view_patients",
      "view_pet_history",
      "view_all_visits",
      "view_own_clinic_data",
      "create_visit",
      "manage_visits",
      "record_vitals",
      "add_diagnosis",
      "prescribe_medication",
      "create_treatment_plan",
      "create_followup",
      "manage_appointments",
      "checkin_patients",
      "generate_invoice",
      "confirm_payment",
      "create_referral",
      "respond_referral",
      "view_referrals",
      "search_clinics",
    ],
  },
  receptionist: {
    label: "Receptionist",
    permissions: [
      "manage_appointments",
      "checkin_patients",
      "create_visit",
      "view_patients",
      "record_basic_info",
      "view_basic_pet_info",
      "generate_invoice",
      "confirm_payment",
      "view_referrals",
    ],
  },
  sales: {
    label: "Sales",
    permissions: [
      "generate_invoice",
      "confirm_payment",
      "access_pos",
      "view_inventory",
      "view_sales_history",
    ],
  },
};

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile/staffs"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 pry-ff">
              Roles & Permissions
            </h1>
            <p className="text-sm text-gray-500 sec-ff">
              What each role can do in your clinic
            </p>
          </div>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(ROLE_PERMISSIONS).map(([roleKey, role]) => (
            <RoleCard
              key={roleKey}
              roleKey={roleKey}
              label={role.label}
              permissions={role.permissions}
            />
          ))}
        </div>
      </div>
    </div>
  );
}