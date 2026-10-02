// app/dashboard/profile/refer-and-earn/page.tsx

import ReferralCenter from "@/components/clinic/referral-center";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refer & Earn | PetArk",
    description: "Refer clinics to PetArk and earn subscription credit.",
};

export default function ReferAndEarnPage() {
    return <ReferralCenter />;
}