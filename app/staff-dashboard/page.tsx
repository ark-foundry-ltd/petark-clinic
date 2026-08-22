// app/staff-dashboard/page.tsx
"use client";

import PermissionGate from "@/components/shared/permission-gate";
import AppointmentsSection from "@/components/staff-dashboard/appointments-section";
import PatientsSection from "@/components/staff-dashboard/patients-section";
import VisitsSection from "@/components/staff-dashboard/visits-section";
import InventorySection from "@/components/staff-dashboard/inventory-section";
import ReferralsSection from "@/components/staff-dashboard/referrals-section";
import ReportsSection from "@/components/staff-dashboard/reports-section";

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <PermissionGate need="manage_appointments" label="Appointments">
        <AppointmentsSection />
      </PermissionGate>

      <PermissionGate need={["view_patients", "view_basic_pet_info"]} label="Patients">
        <PatientsSection />
      </PermissionGate>

      <PermissionGate need="create_visit" label="Visits">
        <VisitsSection />
      </PermissionGate>

      <PermissionGate need="view_inventory" label="Inventory">
        <InventorySection />
      </PermissionGate>

      <PermissionGate need="view_referrals" label="Referrals">
        <ReferralsSection />
      </PermissionGate>

      <PermissionGate need="view_reports" label="Reports">
        <ReportsSection />
      </PermissionGate>
    </div>
  );
}