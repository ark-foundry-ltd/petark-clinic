// app/staff-dashboard/patients/page.tsx
import PatientsSection from "@/components/staff-dashboard/patients-section";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Patients",
    description: "Manage your patients",
};

export default function StaffPatientsPage() {
  return <PatientsSection />;
}