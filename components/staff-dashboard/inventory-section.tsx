// components/staff-dashboard/inventory-section.tsx
"use client";

import InventoryDashboard from "@/components/inventory/inventory-dashboard";
import { useAuthStore } from "@/store/useStore";

export default function InventorySection() {
    const permissions = useAuthStore((s) => s.permissions);
    const hasAll = permissions.includes("all_permissions");
    const canManage = hasAll || permissions.includes("manage_inventory");

    return <InventoryDashboard canManage={canManage} />;
}