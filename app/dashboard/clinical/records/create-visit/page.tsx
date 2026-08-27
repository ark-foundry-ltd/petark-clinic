"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CreateVisitWalkInCard from "@/components/clinic/create-visit-walkin-card";

function CreateVisitFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 size={24} className="animate-spin text-acc-clr" />
        </div>
    );
}

function StaffCreateVisitInner() {
    const searchParams = useSearchParams();
    const patientId = searchParams.get("patientId") ?? "";

    return (
        <CreateVisitWalkInCard patientId={patientId} redirectBasePath="/staff-dashboard/clinical/records" />
    );
}

export default function StaffCreateVisitWalkInPage() {
    return (
        <main className="py-6">
            <Suspense fallback={<CreateVisitFallback />}>
                <StaffCreateVisitInner />
            </Suspense>
        </main>
    );
}