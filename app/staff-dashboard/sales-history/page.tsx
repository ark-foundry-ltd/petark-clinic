// app/staff-dashboard/sales-history/page.tsx
import { Metadata } from "next";
import SalesHistorySection from "@/components/staff-dashboard/sales-history-section";

export const metadata: Metadata = {
    title: "Sales History",
    description: "View and manage sales history, inventory, and customer records.",
};

export default function SalesHistoryPage() {
    return < SalesHistorySection />;
}