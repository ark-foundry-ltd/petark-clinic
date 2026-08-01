// dashboard/clinical/inventory/page.tsx

import { Metadata } from "next";
import InventoryDashboard  from "@/components/inventory/inventory-dashboard";

export const metadata: Metadata = {
    title: "Inventory",
    description: "Manage and track inventory levels.",
};

export default function InventoryPage() {
    return (
        <main>
            <InventoryDashboard />
        </main>
    )
}