// app/dashboard/addons/page.tsx
import AddonsCenter from "@/components/clinic/addons-center";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add-ons | PetArk",
    description: "Buy extra treatments or reminders for this month.",
};

export default function AddonsPage() {
    return <AddonsCenter />;
}