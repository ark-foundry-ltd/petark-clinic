// app/staff-dashboard/pos/page.tsx
import { Metadata } from "next";
import PosSection from "@/components/staff-dashboard/pos-section";

export const metadata: Metadata = {
    title: "Sales Dashboard",
    description: "Manage sales, inventory, and customer records.",
};

export default function StaffPosPage() {
  return <PosSection />;
}