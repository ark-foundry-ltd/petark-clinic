import { Metadata } from "next";
import CompleteVisitWorkspace from "@/components/clinic/complete-visit-workspace";

export const metadata: Metadata = {
    title: "Complete Visit",
    description: "Complete the details of your visit",
};

export default function StaffCompleteVisitPage() {
    return <CompleteVisitWorkspace basePath="/staff-dashboard/appointments" />;
}