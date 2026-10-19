"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, PawPrint, Phone, Stethoscope } from "lucide-react";
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

const CARD = "bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

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
            <div className="pry-ff max-w-6xl mx-auto p-4 sm:p-6 animate-pulse space-y-6">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-28 bg-gray-200 rounded-xl" />
                <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="pry-ff max-w-md mx-auto text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-red-50 ring-1 ring-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={22} className="text-red-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">{error ?? "Patient not found."}</h2>
                <p className="text-sm text-gray-500 mt-1.5 mb-5">Go back to the patient list and try again.</p>
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={15} /> Back to patients
                </Link>
            </div>
        );
    }

    const { pet, owner } = patient;

    return (
        <div className="pry-ff max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
            <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors sec-ff rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
                <ArrowLeft size={15} /> Patients
            </Link>

            {/* Header */}
            <header className={`${CARD} p-5 sm:p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between`}>
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-acc-clr/10 ring-1 ring-acc-clr/20 flex items-center justify-center">
                        <PawPrint size={26} className="text-acc-clr" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-sec-clr capitalize truncate">
                                {pet.name}
                            </h1>
                            <span className="font-mono text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-0.5">
                                {patient.registrationNo}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 ring-1 ring-inset ring-emerald-200 rounded-full px-2.5 py-0.5 capitalize">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {patient.registrationStatus}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 capitalize mt-1">
                            {[pet.species, pet.breed, pet.gender].filter(Boolean).join(", ")}
                        </p>
                        <p className="text-sm text-gray-600 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>Owner: {owner?.fullname || "-"}</span>
                            {owner?.phoneNumber && (
                                <a
                                    href={`tel:${owner.phoneNumber}`}
                                    className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                                >
                                    <Phone size={13} className="text-gray-400" />
                                    {owner.phoneNumber}
                                </a>
                            )}
                        </p>
                    </div>
                </div>

                {canStartVisit && (
                    <button
                        type="button"
                        onClick={() => onStartVisit(patient)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium shadow-sm hover:bg-acc-clr/90 transition-colors shrink-0 w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                    >
                        <Stethoscope size={16} /> Start visit
                    </button>
                )}
            </header>

            {/* Tabs + content in one card */}
            <div className={CARD}>
                <div role="tablist" aria-label="Patient records" className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 sm:px-4">
                    {TABS.map((t) => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                id={`tab-${t.key}`}
                                role="tab"
                                type="button"
                                aria-selected={active}
                                aria-controls={`panel-${t.key}`}
                                onClick={() => setTab(t.key)}
                                className={`px-3.5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acc-clr ${
                                    active
                                        ? "border-acc-clr text-sec-clr"
                                        : "border-transparent text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-4 sm:p-6">
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
        </div>
    );
}