import { Metadata } from "next";
import CompleteVisitWorkspace from "@/components/clinic/complete-visit-workspace";

export const metadata: Metadata = {
    title: "Complete Visit",
    description: "Complete the details of your visit",
};

export default function CompleteVisitPage() {
    return <CompleteVisitWorkspace basePath="/dashboard/appointments" />;
}