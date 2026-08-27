// components/clinic/patient-page-client.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, User } from "@/lib/user";
import PatientComponent from "@/components/clinic/patient-component";
import { ClinicPatientRecord } from "@/lib/clinic-patient";
import { Loader2 } from "lucide-react";

export default function PatientPageClient() {
    const router = useRouter();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await getUser();
                setProfile(data);
            } catch (err) {
                setError("Failed to load clinic profile");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleProceedToVisit = (patient: ClinicPatientRecord) => {
        router.push(`/dashboard/clinical/records/create-visit/${patient._id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-acc-clr" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center text-red-600 p-4">
                {error || "Failed to load clinic profile"}
            </div>
        );
    }

    return (
        <PatientComponent
            registrationFee={profile.registration?.fee ?? 0}
            registrationEnabled={profile.registration?.enabled ?? false}
            onProceedToVisit={handleProceedToVisit}
        />
    );
}