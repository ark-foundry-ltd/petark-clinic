"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { getPetLabResults, type LabFinding, type LabResult } from "@/lib/lab-results";
import { isRestrictedError } from "@/lib/patient-history";
import LockedFeature from "@/components/clinic/locked-feature";
import TabPlaceholder from "./tab-placeholder";

const STATUS_STYLES: Record<LabResult["status"], string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completed: "bg-green-50 text-green-700 border-green-200",
};

const FLAG_STYLES: Record<NonNullable<LabFinding["flag"]>, string> = {
    normal: "text-gray-500",
    high: "text-amber-600",
    low: "text-amber-600",
    critical: "text-red-600",
};

function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleDateString() : "-";
}

function FindingsTable({ findings }: Readonly<{ findings: LabFinding[] }>) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                        <th className="py-1.5 pr-3 font-medium">Parameter</th>
                        <th className="py-1.5 pr-3 font-medium">Result</th>
                        <th className="py-1.5 pr-3 font-medium">Reference range</th>
                        <th className="py-1.5 font-medium">Flag</th>
                    </tr>
                </thead>
                <tbody>
                    {findings.map((f, i) => (
                        <tr key={i} className="border-b border-gray-50">
                            <td className="py-1.5 pr-3 text-gray-700">{f.parameter}</td>
                            <td className="py-1.5 pr-3 font-medium text-gray-800">
                                {f.value}
                                {f.unit ? ` ${f.unit}` : ""}
                            </td>
                            <td className="py-1.5 pr-3 text-gray-500">{f.referenceRange || "-"}</td>
                            <td className={`py-1.5 font-semibold uppercase ${FLAG_STYLES[f.flag ?? "normal"]}`}>
                                {f.flag && f.flag !== "normal" ? f.flag : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
            </div>
        );
    }

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
        return <p className="text-center text-sm text-red-600 py-10">{error}</p>;
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
        <ul className="space-y-3">
            {labs.map((lab) => (
                <li key={lab._id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-sec-clr">{lab.testName}</p>
                            <p className="text-xs text-gray-500 capitalize">
                                {lab.testType} &middot;{" "}
                                {lab.status === "completed"
                                    ? `Resulted ${formatDate(lab.resultedAt)}`
                                    : `Ordered ${formatDate(lab.orderedAt)}`}
                            </p>
                        </div>
                        <span
                            className={`shrink-0 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[lab.status]}`}
                        >
                            {lab.status === "pending" ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                            {lab.status}
                        </span>
                    </div>

                    {lab.results?.summary && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{lab.results.summary}</p>
                    )}

                    {lab.results?.findings?.length > 0 && <FindingsTable findings={lab.results.findings} />}

                    {lab.notes && (
                        <p className="text-xs text-gray-500 italic whitespace-pre-wrap">{lab.notes}</p>
                    )}

                    {lab.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {lab.attachments.map((a, i) => (
                                <a
                                    key={i}
                                    href={a.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-acc-clr hover:underline"
                                >
                                    <Paperclip size={12} /> {a.filename}
                                </a>
                            ))}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}