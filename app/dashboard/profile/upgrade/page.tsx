// app/dashboard/upgrade/page.tsx

import SubscriptionPlans from "@/components/clinic/subscription-plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Upgrade Plan | PetArk",
    description: "Choose the plan that fits your clinic.",
};

export default function UpgradePage() {
    return <SubscriptionPlans />;
}