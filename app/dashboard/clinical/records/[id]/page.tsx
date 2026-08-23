// app/dashboard/clinical/records/[id]/page.tsx

import { Metadata } from "next";
import RecordDetails from "@/components/clinic/record-details";

export const metadata: Metadata = {
    title: "Records Page",
    description: "Manage your records",
};

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function VisitRecordDetailPage({ params }: PageProps) {
    const { id } = await params;
    
    return (
        <main className="px-8 py-8 space-y-10 pry-ff">
            <div>
                <h1 className="text-2xl font-semibold text-sec-clr">Visit Record Details</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Full details of this visit including vitals, notes, and appointment info.
                </p>
            </div>
            <RecordDetails visitId={id} />
        </main>
    );
}