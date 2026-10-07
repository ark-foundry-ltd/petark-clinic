// app/staff-dashboard/payments/page.tsx
import PaymentsSection from "@/components/staff-dashboard/payments-section";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payments",
    description: "Manage your payments",
};

export default function StaffPaymentsPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <PaymentsSection />
    </div>
  );
}