// dashboard/clinical/activity/page.tsx

import { Metadata } from "next";
import ActivityHistory from "@/components/clinic/activity-history";

export const metadata: Metadata = {
    title: "Activities",
    description: "Manage and track clinical activities.",
};

export default function ActivityPage() {
    return (
        <main>
            <ActivityHistory />
        </main>
    )
}