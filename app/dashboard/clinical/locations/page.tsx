// app/dashboard/clinical/inventory/locations/page.tsx

import { Metadata } from "next";
import LocationsManager from "@/components/inventory/locations-manager";

export const metadata: Metadata = {
    title: "Locations",
    description: "Manage the branches your clinic operates from.",
};

export default function InventoryLocationsPage() {
    return (
        <main className="p-4 sm:p-6">
            <LocationsManager />
        </main>
    );
}