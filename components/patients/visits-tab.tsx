"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
    getAdministeredByDisplay,
    getPatientVisits,
    isRestrictedError,
    type PatientVisit,
} from "@/lib/patient-history";
import { Chips } from "./info-blocks";
import TabPlaceholder from "./tab-placeholder";

function formatDate(value?: string) {
    return value
        ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "-";
}

function serviceName(item: unknown): string {
    if (typeof item === "string") return item;
    if (item && typeof item === "object" && "name" in item) {
        return String((item as { name: unknown }).name);
    }
    return "";
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
    const styles =
        status === "completed"
            ? { pill: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" }
            : status === "in-progress"
              ? { pill: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" }
              : { pill: "bg-gray-100 text-gray-700 ring-gray-200", dot: "bg-gray-400" };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${styles.pill}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            {status.replace("-", " ")}
        </span>
    );
}

function SummaryItem({ label, value }: Readonly<{ label: string; value?: string }>) {
    if (!value) return null;
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="text-sm text-gray-800 line-clamp-2 mt-0.5">{value}</p>
        </div>
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
    const shownSoap = soap.filter(([, v]) => !!v);

    const services = (visit.selectedServices ?? visit.servicesProvided ?? [])
        .map(serviceName)
        .filter(Boolean);

    const empty = shownVitals.length === 0 && shownSoap.length === 0 && services.length === 0 && !visit.notes;

    return (
        <div className="border-t border-gray-100 bg-gray-50/60 p-4 sm:p-5 space-y-6 rounded-b-xl">
            {empty && <p className="text-sm text-gray-500">No clinical details were recorded for this visit.</p>}

            {shownVitals.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2.5">Vitals</h3>
                    <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {shownVitals.map(([label, value]) => (
                            <div key={label} className="rounded-lg bg-pry-clr ring-1 ring-gray-200/80 px-3 py-2.5 min-w-0">
                                <dt className="text-xs text-gray-500">{label}</dt>
                                <dd className="mt-0.5 text-sm font-semibold text-gray-900 tabular-nums wrap-break-word capitalize">
                                    {String(value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}

            {shownSoap.length > 0 && (
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
                    {shownSoap.map(([label, value]) => (
                        <div key={label} className="min-w-0">
                            <h3 className="text-xs font-semibold text-gray-700 mb-1">{label}</h3>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {services.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Services</h3>
                    <Chips items={services} tone="gray" />
                </div>
            )}

            {visit.notes && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-1">Notes</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {visit.notes}
                    </p>
                </div>
            )}
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading visits">
            {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-100" />
            ))}
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

    if (loading) return <ListSkeleton />;

    if (restricted) {
        return (
            <TabPlaceholder
                title="Visit history unavailable"
                note="Your role doesn't have access to visit records."
            />
        );
    }

    if (error) {
        return (
            <p className="text-center text-sm text-red-700 bg-red-50 ring-1 ring-red-100 rounded-lg py-6">{error}</p>
        );
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
        <div className="space-y-4">
            <ul className="space-y-3">
                {visits.map((v) => {
                    const open = openId === v._id;
                    const hasSummary = v.soap?.subjective || v.soap?.assessment || v.soap?.plan;
                    return (
                        <li
                            key={v._id}
                            className={`rounded-xl border bg-pry-clr transition-colors ${
                                open ? "border-gray-300" : "border-gray-200/80 hover:border-gray-300"
                            }`}
                        >
                            <button
                                type="button"
                                aria-expanded={open}
                                onClick={() => setOpenId(open ? null : v._id)}
                                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 rounded-xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acc-clr"
                            >
                                <div className="min-w-0 flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                        <span className="text-sm font-semibold text-sec-clr">
                                            {formatDate(v.completedAt ?? v.createdAt)}
                                        </span>
                                        <StatusBadge status={v.status} />
                                        <span className="text-xs text-gray-500">Vet: {getAdministeredByDisplay(v)}</span>
                                    </div>

                                    {hasSummary && (
                                        <div className="grid sm:grid-cols-3 gap-x-6 gap-y-3">
                                            <SummaryItem label="Complaint" value={v.soap?.subjective} />
                                            <SummaryItem label="Diagnosis" value={v.soap?.assessment} />
                                            <SummaryItem label="Treatment" value={v.soap?.plan} />
                                        </div>
                                    )}
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={`shrink-0 mt-0.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                                />
                            </button>
                            {open && <VisitDetail visit={v} />}
                        </li>
                    );
                })}
            </ul>

            {page < totalPages && (
                <div className="flex justify-center pt-1">
                    <button
                        type="button"
                        onClick={() => load(page + 1)}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-sec-clr bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                    >
                        {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                        Load more visits
                    </button>
                </div>
            )}
        </div>
    );
}