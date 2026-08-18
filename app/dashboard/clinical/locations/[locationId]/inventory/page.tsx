// dashboard/clinical/locations/[locationId]/inventory/page.tsx

import { Metadata } from "next";
import InventoryDashboard  from "@/components/inventory/inventory-dashboard";
import { useParams } from "next/navigation";

export const metadata: Metadata = {
    title: "Inventory",
    description: "Manage and track inventory levels.",
};

export default function LocationInventoryPage() {
    const params = useParams<{ locationId: string }>();
    return <InventoryDashboard locationId={params.locationId} />;
}