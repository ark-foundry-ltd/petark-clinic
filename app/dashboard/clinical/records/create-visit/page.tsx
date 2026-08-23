// app/staff-dashboard/clinical/records/create-visit/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CreateVisitWalkInCard from "@/components/clinic/create-visit-walkin-card";

export const metadata: Metadata = {
    title: "Create Visit",
    description: "Start a new visit for this patient",
};

function CreateVisitFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 size={24} className="animate-spin text-acc-clr" />
        </div>
    );
}

export default function StaffCreateVisitWalkInPage() {
    return (
        <main className="py-6">
            <Suspense fallback={<CreateVisitFallback />}>
                <CreateVisitWalkInCard redirectBasePath="/staff-dashboard/clinical/records" />
            </Suspense>
        </main>
    );
}