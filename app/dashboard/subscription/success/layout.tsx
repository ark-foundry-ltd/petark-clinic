// app/dashboard/subscription/success/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Subscription Upgraded | PetArk",
    description: "Your PetArk subscription has been successfully upgraded.",
};

export default function SubscriptionSuccessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}