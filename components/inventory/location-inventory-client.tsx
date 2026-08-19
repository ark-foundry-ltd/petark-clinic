// components/inventory/location-inventory-client.tsx
"use client";

import { useParams } from "next/navigation";
import InventoryDashboard from "@/components/inventory/inventory-dashboard";

export default function LocationInventoryClient() {
    const params = useParams<{ locationId: string }>();
    return <InventoryDashboard locationId={params.locationId} />;
}