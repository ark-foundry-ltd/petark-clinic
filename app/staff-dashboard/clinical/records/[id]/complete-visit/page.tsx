import { Metadata } from "next";
import CompleteVisitWorkspace from "@/components/clinic/complete-visit-workspace";

export const metadata: Metadata = {
    title: "Complete Visit",
    description: "Add clinical notes and complete this visit",
};

export default function StaffCompleteVisitPage() {
    return <CompleteVisitWorkspace idType="visit" backLabel="Back to record" />;
}