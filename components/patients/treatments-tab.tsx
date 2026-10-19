"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
    getPatientTreatments,
    getAdministeredByDisplay,
    isRestrictedError,
    type PatientTreatment,
    type TreatmentSummary,
} from "@/lib/patient-history";
import TabPlaceholder from "./tab-placeholder";

interface TreatmentsTabProps {
    petId: string;
    // Backend filters by treatment type (lowercased server-side), e.g. "vaccination"
    type?: string;
    emptyTitle: string;
    emptyNote: string;
}

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
    overdue: { pill: "bg-red-50 text-red-800 ring-red-200", dot: "bg-red-500" },
    upcoming: { pill: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
    completed: { pill: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
    active: { pill: "bg-gray-100 text-gray-700 ring-gray-200", dot: "bg-gray-400" },
};
const FALLBACK_STATUS = STATUS_STYLES.active;

function formatDate(value?: string | null) {
    return value
        ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : undefined;
}

function doseLabel(t: PatientTreatment) {
    if (t.dosage) return t.dosage;
    if (t.minDoseMg != null && t.maxDoseMg != null) {
        const unit = t.unit ?? "mg";
        return t.minDoseMg === t.maxDoseMg
            ? `${t.minDoseMg} ${unit}`
            : `${t.minDoseMg}–${t.maxDoseMg} ${unit}`;
    }
    return undefined;
}

function Badge({ status }: Readonly<{ status: string }>) {
    const s = STATUS_STYLES[status] ?? FALLBACK_STATUS;
    return (
        <span
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${s.pill}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {status}
        </span>
    );
}

function Fact({ label, value }: Readonly<{ label: string; value?: string | null }>) {
    if (!value) return null;
    return (
        <div className="min-w-0">
            <dt className="text-xs font-medium text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-900 wrap-break-word">{value}</dd>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading treatments">
            {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-gray-100" />
            ))}
        </div>
    );
}

export default function TreatmentsTab({ petId, type, emptyTitle, emptyNote }: Readonly<TreatmentsTabProps>) {
    const [items, setItems] = useState<PatientTreatment[]>([]);
    const [summary, setSummary] = useState<TreatmentSummary | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [restricted, setRestricted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        async (nextPage: number) => {
            if (nextPage === 1) setLoading(true);
            else setLoadingMore(true);
            setError(null);
            try {
                const result = await getPatientTreatments(petId, { type, page: nextPage });
                setItems((prev) => (nextPage === 1 ? result.timeline : [...prev, ...result.timeline]));
                setSummary(result.summary);
                setPage(result.pagination.page);
                setHasNextPage(result.pagination.hasNextPage);
            } catch (err) {
                if (isRestrictedError(err)) setRestricted(true);
                else setError("Failed to load records.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [petId, type]
    );

    useEffect(() => {
        load(1);
    }, [load]);

    if (loading) return <ListSkeleton />;

    if (restricted) {
        return (
            <TabPlaceholder
                title="Not available"
                note="This section isn't available for your role or current plan."
            />
        );
    }

    if (error) {
        return (
            <p className="text-center text-sm text-red-700 bg-red-50 ring-1 ring-red-100 rounded-lg py-6">{error}</p>
        );
    }

    if (items.length === 0) {
        return <TabPlaceholder title={emptyTitle} note={emptyNote} />;
    }

    return (
        <div className="space-y-5">
            {summary && (summary.overdue > 0 || summary.upcoming > 0) && (
                <div className="flex flex-wrap gap-2">
                    {summary.overdue > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 ring-1 ring-inset ring-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {summary.overdue} overdue
                        </span>
                    )}
                    {summary.upcoming > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            {summary.upcoming} upcoming
                        </span>
                    )}
                </div>
            )}

            <ul className="space-y-3">
                {items.map((t) => (
                    <li key={t._id} className="rounded-xl border border-gray-200/80 bg-pry-clr p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-sec-clr wrap-break-word">{t.name}</p>
                                <p className="text-xs text-gray-500 capitalize mt-0.5">{t.type}</p>
                            </div>
                            <Badge status={t.status} />
                        </div>

                        <dl className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                            <Fact label="Dosage" value={doseLabel(t)} />
                            <Fact label="Frequency" value={t.frequency} />
                            <Fact label="Given" value={formatDate(t.administeredAt)} />
                            <Fact label="Next due" value={formatDate(t.nextDueAt)} />
                            <Fact label="Vet" value={getAdministeredByDisplay(t)} />
                            <Fact label="Linked to visit" value={t.visitId ? "Yes" : undefined} />
                        </dl>

                        {t.notes && (
                            <div className="mt-4 rounded-lg bg-gray-50 ring-1 ring-gray-200/70 px-3.5 py-3">
                                <p className="text-xs font-medium text-gray-500">Notes</p>
                                <p className="mt-0.5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                    {t.notes}
                                </p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {hasNextPage && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => load(page + 1)}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-sec-clr bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                    >
                        {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}