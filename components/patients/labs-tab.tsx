"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, Paperclip } from "lucide-react";
import { getPetLabResults, type LabFinding, type LabResult } from "@/lib/lab-results";
import { isRestrictedError } from "@/lib/patient-history";
import LockedFeature from "@/components/clinic/locked-feature";
import TabPlaceholder from "./tab-placeholder";

const STATUS_STYLES: Record<LabResult["status"], string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

const FLAG_STYLES: Record<NonNullable<LabFinding["flag"]>, string> = {
    normal: "text-gray-500",
    high: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    low: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    critical: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200",
};

function formatDate(value?: string | null) {
    return value
        ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "-";
}

function FindingsTable({ findings }: Readonly<{ findings: LabFinding[] }>) {
    return (
        <div className="overflow-x-auto rounded-lg ring-1 ring-gray-200/80">
            <table className="w-full min-w-120 text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                        <th scope="col" className="py-2.5 px-3.5 font-medium">Parameter</th>
                        <th scope="col" className="py-2.5 px-3.5 font-medium">Result</th>
                        <th scope="col" className="py-2.5 px-3.5 font-medium">Reference range</th>
                        <th scope="col" className="py-2.5 px-3.5 font-medium">Flag</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {findings.map((f, i) => {
                        const flag = f.flag ?? "normal";
                        return (
                            <tr key={i} className={flag === "critical" ? "bg-red-50/40" : undefined}>
                                <td className="py-2.5 px-3.5 text-gray-700">{f.parameter}</td>
                                <td className="py-2.5 px-3.5 font-semibold text-gray-900 tabular-nums">
                                    {f.value}
                                    {f.unit ? ` ${f.unit}` : ""}
                                </td>
                                <td className="py-2.5 px-3.5 text-gray-500 tabular-nums">{f.referenceRange || "-"}</td>
                                <td className="py-2.5 px-3.5">
                                    <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${FLAG_STYLES[flag]}`}
                                    >
                                        {flag}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading lab results">
            {[0, 1].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-gray-100" />
            ))}
        </div>
    );
}

export default function LabsTab({ petId }: Readonly<{ petId: string }>) {
    const [labs, setLabs] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [locked, setLocked] = useState(false);
    const [restricted, setRestricted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const outcome = await getPetLabResults(petId);
                if (cancelled) return;
                if (outcome.locked) setLocked(true);
                else setLabs(outcome.data);
            } catch (err) {
                if (cancelled) return;
                if (isRestrictedError(err)) setRestricted(true);
                else setError("Failed to load lab results.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [petId]);

    if (loading) return <ListSkeleton />;

    if (locked) {
        return (
            <LockedFeature
                title="Lab Results"
                description="Order tests and record results alongside each visit."
                requiredPlan="Standard"
                preview="list"
            />
        );
    }

    if (restricted) {
        return (
            <TabPlaceholder
                title="Lab results unavailable"
                note="Your role doesn't have access to lab results."
            />
        );
    }

    if (error) {
        return (
            <p className="text-center text-sm text-red-700 bg-red-50 ring-1 ring-red-100 rounded-lg py-6">{error}</p>
        );
    }

    if (labs.length === 0) {
        return (
            <TabPlaceholder
                title="No lab results yet"
                note="Tests ordered for this patient at this clinic will appear here."
            />
        );
    }

    return (
        <ul className="space-y-4">
            {labs.map((lab) => (
                <li key={lab._id} className="rounded-xl border border-gray-200/80 bg-pry-clr p-4 sm:p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-sec-clr wrap-break-word">{lab.testName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                <span className="capitalize">{lab.testType}</span>
                                <span className="mx-1.5 text-gray-300">|</span>
                                {lab.status === "completed"
                                    ? `Resulted ${formatDate(lab.resultedAt)}`
                                    : `Ordered ${formatDate(lab.orderedAt)}`}
                            </p>
                        </div>
                        <span
                            className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ring-1 ring-inset capitalize ${STATUS_STYLES[lab.status]}`}
                        >
                            {lab.status === "pending" ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                            {lab.status}
                        </span>
                    </div>

                    {lab.results?.summary && (
                        <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200/70 px-3.5 py-3">
                            <p className="text-xs font-medium text-gray-500">Summary</p>
                            <p className="mt-0.5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                {lab.results.summary}
                            </p>
                        </div>
                    )}

                    {lab.results?.findings?.length > 0 && <FindingsTable findings={lab.results.findings} />}

                    {lab.notes && (
                        <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap wrap-break-word">
                            <span className="font-medium text-gray-600">Notes: </span>
                            {lab.notes}
                        </p>
                    )}

                    {lab.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {lab.attachments.map((a, i) => (
                                <a
                                    key={i}
                                    href={a.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 max-w-full rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-xs font-medium text-sec-clr transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                                >
                                    <Paperclip size={12} className="shrink-0" />
                                    <span className="truncate">{a.filename}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}