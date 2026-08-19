// app/dashboard/clinical/locations/[locationId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import LocationDetails from "@/components/inventory/location-details";

export default function LocationDetailsPage() {
    const params = useParams<{ locationId: string }>();
    return <LocationDetails locationId={params.locationId} />;
}