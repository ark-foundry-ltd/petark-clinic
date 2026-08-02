// app/dashboard/subscription/failed/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payment Failed | PetArk",
    description: "We couldn't confirm your subscription payment.",
};

export default function SubscriptionFailedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}