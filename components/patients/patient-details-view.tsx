"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, PawPrint, Stethoscope } from "lucide-react";
import { getClinicPatientById, type ClinicPatientRecord } from "@/lib/clinic-patient";
import OverviewTab from "./overview-tab";
import VisitsTab from "./visits-tab";
import TreatmentsTab from "./treatments-tab";
import LabsTab from "./labs-tab";

const TABS = [
    { key: "overview", label: "Overview" },
    { key: "visits", label: "Visits" },
    { key: "treatments", label: "Treatments" },
    { key: "labs", label: "Lab results" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

interface Props {
    clinicPatientId: string;
    backHref: string;
    canStartVisit: boolean;
    onStartVisit: (patient: ClinicPatientRecord) => void;
}

export default function PatientDetailsView({ clinicPatientId, backHref, canStartVisit, onStartVisit }: Readonly<Props>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const requested = searchParams.get("tab");
    const tab: TabKey = TABS.some((t) => t.key === requested) ? (requested as TabKey) : "overview";

    const [patient, setPatient] = useState<ClinicPatientRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getClinicPatientById(clinicPatientId);
                if (!cancelled) setPatient(data);
            } catch {
                if (!cancelled) setError("Failed to load patient details.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [clinicPatientId]);

    const setTab = (key: TabKey) => router.replace(`?tab=${key}`, { scroll: false });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
            </div>
        );
    }
    if (error || !patient) {
        return <p className="text-center text-sm text-red-600 py-10">{error ?? "Patient not found."}</p>;
    }

    const { pet, owner } = patient;

    return (
        <div className="pry-ff space-y-6 p-4">
            <Link href={backHref} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sec-clr transition-colors sec-ff">
                <ArrowLeft size={15} /> Back to patients
            </Link>

            {/* Header */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-acc-clr/10 shrink-0">
                        <PawPrint size={20} className="text-acc-clr" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold text-sec-clr capitalize truncate">{pet.name}</h1>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-sec-clr">
                                {patient.registrationNo}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-xs font-medium text-green-700 capitalize">
                                {patient.registrationStatus}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 capitalize">
                            {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}{pet.gender ? ` · ${pet.gender}` : ""}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {owner?.fullname || "-"}{owner?.phoneNumber ? ` · ${owner.phoneNumber}` : ""}
                        </p>
                    </div>
                </div>

                {canStartVisit && (
                    <button
                        type="button"
                        onClick={() => onStartVisit(patient)}
                        className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2 shrink-0"
                    >
                        <Stethoscope size={15} /> Start Visit
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-100">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ${
                            tab === t.key ? "border-acc-clr text-sec-clr" : "border-transparent text-gray-500 hover:text-sec-clr"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 sm:p-6">
                {tab === "overview" && <OverviewTab patient={patient} onChange={setPatient} />}
                {tab === "visits" && <VisitsTab petId={pet._id} />}
                {tab === "treatments" && (
                    <TreatmentsTab
                        petId={pet._id}
                        emptyTitle="No treatments yet"
                        emptyNote="Treatments recorded for this patient at this clinic will appear here."
                    />
                )}
                {tab === "labs" && <LabsTab petId={pet._id} />}
            </div>
        </div>
    );
}