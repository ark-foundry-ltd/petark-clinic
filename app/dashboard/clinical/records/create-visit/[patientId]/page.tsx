import { Metadata } from "next";
import CreateVisitWalkInCard from "@/components/clinic/create-visit-walkin-card";

export const metadata: Metadata = {
    title: "Create Visit",
    description: "Start a new visit for this patient",
};

interface PageProps {
    params: Promise<{ patientId: string }>;
}

export default async function CreateVisitPageComp({ params }: Readonly<PageProps>) {
    const { patientId } = await params;

    return (
        <main className="py-6">
            <CreateVisitWalkInCard patientId={patientId} />
        </main>
    );
}