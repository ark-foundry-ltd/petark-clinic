"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
    getAdministeredByDisplay,
    getPatientVisits,
    isRestrictedError,
    type PatientVisit,
} from "@/lib/patient-history";
import { Chips, InfoRow } from "./info-blocks";
import TabPlaceholder from "./tab-placeholder";

function formatDate(value?: string) {
    return value ? new Date(value).toLocaleDateString() : "-";
}

function serviceName(item: unknown): string {
    if (typeof item === "string") return item;
    if (item && typeof item === "object" && "name" in item) {
        return String((item as { name: unknown }).name);
    }
    return "";
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
    const style =
        status === "completed"
            ? "bg-green-50 text-green-700"
            : status === "in-progress"
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-100 text-gray-700";
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
            {status.replace("-", " ")}
        </span>
    );
}

function SummaryLine({ label, value }: Readonly<{ label: string; value?: string }>) {
    if (!value) return null;
    return (
        <p className="text-sm text-gray-700 line-clamp-2">
            <span className="text-gray-400">{label}: </span>
            {value}
        </p>
    );
}

function VisitDetail({ visit }: Readonly<{ visit: PatientVisit }>) {
    const vitals: [string, string | number | undefined][] = [
        ["Weight", visit.vitals?.weight],
        ["Temp", visit.vitals?.temp],
        ["Pulse", visit.vitals?.pulse],
        ["Respiration", visit.vitals?.respiration],
        ["Appetite", visit.vitals?.appetite],
        ["Activity", visit.vitals?.activity],
    ];
    const shownVitals = vitals.filter(([, v]) => v !== undefined && v !== null && v !== "");

    const soap: [string, string | undefined][] = [
        ["Subjective", visit.soap?.subjective],
        ["Objective", visit.soap?.objective],
        ["Assessment", visit.soap?.assessment],
        ["Plan", visit.soap?.plan],
    ];

    const services = (visit.selectedServices ?? visit.servicesProvided ?? [])
        .map(serviceName)
        .filter(Boolean);

    return (
        <div className="border-t border-gray-100 p-4 space-y-4">
            {shownVitals.length > 0 && (
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {shownVitals.map(([label, value]) => (
                        <InfoRow key={label} label={label} value={String(value)} />
                    ))}
                </dl>
            )}

            {soap.map(
                ([label, value]) =>
                    value && (
                        <div key={label}>
                            <p className="text-xs text-gray-400 mb-1">{label}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
                        </div>
                    )
            )}

            {services.length > 0 && (
                <div>
                    <p className="text-xs text-gray-400 mb-1.5">Services</p>
                    <Chips items={services} tone="gray" />
                </div>
            )}

            {visit.notes && (
                <div>
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
                </div>
            )}
        </div>
    );
}

export default function VisitsTab({ petId }: Readonly<{ petId: string }>) {
    const [visits, setVisits] = useState<PatientVisit[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [restricted, setRestricted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);

    const load = useCallback(
        async (nextPage: number) => {
            if (nextPage === 1) setLoading(true);
            else setLoadingMore(true);
            setError(null);
            try {
                const result = await getPatientVisits(petId, nextPage);
                setVisits((prev) => (nextPage === 1 ? result.data : [...prev, ...result.data]));
                setPage(result.page);
                setTotalPages(result.totalPages);
            } catch (err) {
                if (isRestrictedError(err)) setRestricted(true);
                else setError("Failed to load visit history.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [petId]
    );

    useEffect(() => {
        load(1);
    }, [load]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
            </div>
        );
    }

    if (restricted) {
        return (
            <TabPlaceholder
                title="Visit history unavailable"
                note="Your role doesn't have access to visit records."
            />
        );
    }

    if (error) {
        return <p className="text-center text-sm text-red-600 py-10">{error}</p>;
    }

    if (visits.length === 0) {
        return (
            <TabPlaceholder
                title="No visits yet"
                note="Visits recorded for this patient at this clinic will appear here."
            />
        );
    }

    return (
        <div className="space-y-3">
            <ul className="space-y-3">
                {visits.map((v) => {
                    const open = openId === v._id;
                    return (
                        <li key={v._id} className="border border-gray-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setOpenId(open ? null : v._id)}
                                className="w-full text-left p-4 flex items-start justify-between gap-3"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-sec-clr">
                                            {formatDate(v.completedAt ?? v.createdAt)}
                                        </span>
                                        <StatusBadge status={v.status} />
                                    </div>
                                    <p className="text-xs text-gray-500">Vet: {getAdministeredByDisplay(v)}</p>
                                    <SummaryLine label="Complaint" value={v.soap?.subjective} />
                                    <SummaryLine label="Diagnosis" value={v.soap?.assessment} />
                                    <SummaryLine label="Treatment" value={v.soap?.plan} />
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                                />
                            </button>
                            {open && <VisitDetail visit={v} />}
                        </li>
                    );
                })}
            </ul>

            {page < totalPages && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => load(page + 1)}
                        disabled={loadingMore}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-sec-clr bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}