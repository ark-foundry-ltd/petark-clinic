// components/staff-dashboard/records-section.tsx
import RecordDetails from "../clinic/record-details";


interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RecordsSection({ params }: Readonly<PageProps>) {
    const { id } = await params;
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Medical Records</h2>
            <p className="text-sm text-gray-600">
                Comprehensive list of all visits and medical activity
            </p>
            <div>
                <RecordDetails visitId={id} />
            </div>
        </div>
    );
}