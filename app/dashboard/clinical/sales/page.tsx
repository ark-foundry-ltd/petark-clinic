// dashboard/clinical/sales/page.tsx

import { Metadata } from "next";
import POSCheckout from "@/components/sales/pos-checkout";

export const metadata: Metadata = {
    title: "POS Checkout",
    description: "Process sales transactions.",
};

export default function SalesPage() {
    return (
        <main>
            <POSCheckout />
        </main>
    ) 
}
