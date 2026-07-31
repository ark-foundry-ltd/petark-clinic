// app/dashboard/clinical/referrals/page.tsx

import { Metadata } from "next";
import ListReferrals from "@/components/clinic/list-referrals";

export const metadata: Metadata = {
    title: "Referrals",
    description: "Manage and track patient referrals.",
};

export default function ReferralsPage() {
    return (
        <main>
            <ListReferrals />
        </main>
    )
}