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
import { InfoRow } from "./info-blocks";
import TabPlaceholder from "./tab-placeholder";

interface TreatmentsTabProps {
    petId: string;
    // Backend filters by treatment type (lowercased server-side), e.g. "vaccination"
    type?: string;
    emptyTitle: string;
    emptyNote: string;
}

const STATUS_STYLES: Record<string, string> = {
    overdue: "bg-red-50 text-red-700",
    upcoming: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700",
    active: "bg-gray-100 text-gray-700",
};

function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleDateString() : undefined;
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
                title="Not available"
                note="This section isn't available for your role or current plan."
            />
        );
    }

    if (error) {
        return <p className="text-center text-sm text-red-600 py-10">{error}</p>;
    }

    if (items.length === 0) {
        return <TabPlaceholder title={emptyTitle} note={emptyNote} />;
    }

    return (
        <div className="space-y-4">
            {summary && (summary.overdue > 0 || summary.upcoming > 0) && (
                <div className="flex flex-wrap gap-2">
                    {summary.overdue > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                            {summary.overdue} overdue
                        </span>
                    )}
                    {summary.upcoming > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {summary.upcoming} upcoming
                        </span>
                    )}
                </div>
            )}

            <ul className="space-y-3">
                {items.map((t) => (
                    <li key={t._id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-sec-clr">{t.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{t.type}</p>
                            </div>
                            <span
                                className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                    STATUS_STYLES[t.status] ?? "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {t.status}
                            </span>
                        </div>

                        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <InfoRow label="Dosage" value={doseLabel(t)} />
                            <InfoRow label="Frequency" value={t.frequency} />
                            <InfoRow label="Given" value={formatDate(t.administeredAt)} />
                            <InfoRow label="Next due" value={formatDate(t.nextDueAt)} />
                            <InfoRow label="Vet" value={getAdministeredByDisplay(t)} />
                            <InfoRow label="Linked to visit" value={t.visitId ? "Yes" : undefined} />
                        </dl>

                        {t.notes && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                <span className="text-gray-400">Notes: </span>
                                {t.notes}
                            </p>
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