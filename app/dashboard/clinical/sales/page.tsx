// dashboard/clinical/sales/page.tsx

import { Metadata } from "next";
import PosCheckout from "@/components/sales/pos-checkout";

export const metadata: Metadata = {
    title: "POS Checkout",
    description: "Process sales transactions.",
};

export default function SalesPage({ params }: { params: { locationId: string } }) {
    return (
        <main>
            <PosCheckout locationId={params.locationId} />
        </main>
    ) 
}
