// components/clinic/lab-results-section.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    FlaskConical, Plus, X, Loader2, Clock, CheckCircle2, Paperclip,
} from "lucide-react";
import {
    addLabResult, updateLabResult, getVisitLabResults,
    type LabResult, type LabTestType, type LabFinding,
} from "@/lib/lab-results";
import DeleteLabResultBtn from "@/components/clinic/delete-lab-result-btn";

interface LabResultsSectionProps {
    visitId: string;
    petId: string;
}

const TEST_TYPE_OPTIONS: { value: LabTestType; label: string }[] = [
    { value: "hematology", label: "Hematology (CBC)" },
    { value: "biochemistry", label: "Biochemistry (Serum Chemistry)" },
    { value: "imaging", label: "Imaging (X-Ray / Ultrasound / Endoscopy)" },
    { value: "urinalysis", label: "Urinalysis" },
    { value: "parasitology", label: "Parasitology (Fecal Exam)" },
    { value: "microbiology", label: "Microbiology" },
    { value: "other", label: "Other (Skin Scraping / Cytology / etc.)" },
];

const STATUS_STYLES: Record<LabResult["status"], string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completed: "bg-green-50 text-green-700 border-green-200",
};

export default function LabResultsSection({ visitId, petId }: Readonly<LabResultsSectionProps>) {
    const [labs, setLabs] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [fillingInId, setFillingInId] = useState<string | null>(null);

    async function refresh() {
        try {
            const data = await getVisitLabResults(visitId);
            setLabs(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load lab results");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visitId]);

    return (
        <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-sec-clr">Lab Results</h3>
                <span className="text-xs text-gray-400 font-normal ml-1">(optional)</span>
                <button
                    onClick={() => setShowOrderForm(true)}
                    className="ml-auto flex items-center gap-1 text-xs font-medium text-acc-clr hover:opacity-80"
                >
                    <Plus size={13} /> Order test
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
            ) : labs.length === 0 && !showOrderForm ? (
                <p className="text-sm text-gray-400 text-center py-4">No lab tests ordered for this visit yet.</p>
            ) : (
                <div className="space-y-2">
                    {labs.map((lab) => (
                        <LabResultCard
                            key={lab._id}
                            lab={lab}
                            isFillingIn={fillingInId === lab._id}
                            onStartFillIn={() => setFillingInId(lab._id)}
                            onCancelFillIn={() => setFillingInId(null)}
                            onSaved={() => {
                                setFillingInId(null);
                                refresh();
                            }}
                            onDeleted={refresh}
                        />
                    ))}
                </div>
            )}

            {showOrderForm && (
                <OrderLabForm
                    visitId={visitId}
                    petId={petId}
                    onCancel={() => setShowOrderForm(false)}
                    onOrdered={() => {
                        setShowOrderForm(false);
                        refresh();
                    }}
                />
            )}
        </div>
    );
}

// ─── One lab result row (pending or completed) ────────────────────────────

interface LabResultCardProps {
    lab: LabResult;
    isFillingIn: boolean;
    onStartFillIn: () => void;
    onCancelFillIn: () => void;
    onSaved: () => void;
    onDeleted: () => void;
}

function LabResultCard({ lab, isFillingIn, onStartFillIn, onCancelFillIn, onSaved, onDeleted }: Readonly<LabResultCardProps>) {
    if (isFillingIn) {
        return <FillInResultForm lab={lab} onCancel={onCancelFillIn} onSaved={onSaved} />;
    }

    return (
        <div className="border border-gray-100 rounded-lg p-3.5">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lab.testName}</p>
                    <p className="text-xs text-gray-400 capitalize">{lab.testType.replace("_", " ")}</p>
                </div>
                <span className={`shrink-0 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[lab.status]}`}>
                    {lab.status === "pending" ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                    {lab.status}
                </span>
            </div>

            {lab.notes && (
                <p className="text-xs text-gray-500 mt-2 italic">{lab.notes}</p>
            )}

            {lab.status === "completed" && lab.results.summary && (
                <p className="text-xs text-gray-600 mt-2">{lab.results.summary}</p>
            )}

            {lab.status === "completed" && lab.results.findings.length > 0 && (
                <div className="mt-2 space-y-1">
                    {lab.results.findings.map((f, i) => (
                        <p key={i} className="text-xs text-gray-500">
                            {f.parameter}: <span className="font-medium text-gray-700">{f.value}{f.unit ? ` ${f.unit}` : ""}</span>
                            {f.flag && f.flag !== "normal" && (
                                <span className={`ml-1.5 text-[10px] font-semibold ${f.flag === "critical" ? "text-red-600" : "text-amber-600"}`}>
                                    {f.flag.toUpperCase()}
                                </span>
                            )}
                        </p>
                    ))}
                </div>
            )}

            {lab.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {lab.attachments.map((a, i) => (
                        <a
                            key={i}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-acc-clr hover:underline"
                        >
                            <Paperclip size={11} /> {a.filename}
                        </a>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mt-3">
                {lab.status === "pending" ? (
                    <button
                        type="button"
                        onClick={onStartFillIn}
                        className="text-xs font-medium text-acc-clr cursor-pointer hover:opacity-80"
                    >
                        Enter result
                    </button>
                ) : (
                    <span />
                )}
                <DeleteLabResultBtn
                    labResultId={lab._id}
                    testName={lab.testName}
                    onDeleted={onDeleted}
                />
            </div>
        </div>
    );
}

// ─── Order a new (pending) lab test ────────────────────────────────────────

interface OrderLabFormProps {
    visitId: string;
    petId: string;
    onCancel: () => void;
    onOrdered: () => void;
}

function OrderLabForm({ visitId, petId, onCancel, onOrdered }: Readonly<OrderLabFormProps>) {
    const [testName, setTestName] = useState("");
    const [testType, setTestType] = useState<LabTestType>("hematology");
    const [notes, setNotes] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        if (!testName.trim()) {
            toast.error("Test name is required");
            return;
        }
        setSubmitting(true);
        try {
            await addLabResult({
                visitId,
                petId,
                testName: testName.trim(),
                testType,
                notes: notes.trim() || undefined,
                files: files.length > 0 ? files : undefined,
            });
            toast.success("Lab test ordered");
            onOrdered();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to order lab test");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="border border-dashed border-gray-200 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Test</span>
                <button onClick={onCancel} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                </button>
            </div>
            <input
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. Complete Blood Count"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30"
            />
            <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as LabTestType)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700"
            >
                {TEST_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional) — e.g. reason for ordering, clinical context"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 resize-none"
            />
            <div>
                <label className="text-xs text-gray-500 block mb-1">Attachments (optional)</label>
                <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    className="text-xs text-gray-500"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-acc-clr rounded-lg disabled:opacity-50"
                >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : "Order Test"}
                </button>
            </div>
        </div>
    );
}

// ─── Fill in result for a pending test ─────────────────────────────────────

interface FillInResultFormProps {
    lab: LabResult;
    onCancel: () => void;
    onSaved: () => void;
}

function FillInResultForm({ lab, onCancel, onSaved }: Readonly<FillInResultFormProps>) {
    const [summary, setSummary] = useState("");
    const [notes, setNotes] = useState(lab.notes ?? "");
    const [findings, setFindings] = useState<LabFinding[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    function addFinding() {
        setFindings((prev) => [...prev, { parameter: "", value: "", unit: "", referenceRange: "", flag: "normal" }]);
    }

    function updateFinding(index: number, field: keyof LabFinding, value: string) {
        setFindings((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
    }

    function removeFinding(index: number) {
        setFindings((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        if (!summary.trim()) {
            toast.error("A summary is required to mark this result complete");
            return;
        }
        setSubmitting(true);
        try {
            await updateLabResult(lab._id, {
                summary: summary.trim(),
                findings: findings.filter((f) => f.parameter.trim() && f.value.trim()),
                notes: notes.trim() || undefined,
                files: files.length > 0 ? files : undefined,
            });
            toast.success("Lab result saved");
            onSaved();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save lab result");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="border border-acc-clr/30 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-acc-clr uppercase tracking-wide">{lab.testName}</span>
                <button onClick={onCancel} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                </button>
            </div>

            <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Result summary / interpretation"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 resize-none"
            />

            <div className="space-y-2">
                {findings.map((f, i) => (
                    <div key={i} className="grid grid-cols-5 gap-1.5">
                        <input value={f.parameter} onChange={(e) => updateFinding(i, "parameter", e.target.value)} placeholder="Parameter" className="col-span-2 px-2 py-1.5 text-xs border border-gray-200 rounded" />
                        <input value={f.value} onChange={(e) => updateFinding(i, "value", e.target.value)} placeholder="Value" className="px-2 py-1.5 text-xs border border-gray-200 rounded" />
                        <input value={f.unit ?? ""} onChange={(e) => updateFinding(i, "unit", e.target.value)} placeholder="Unit" className="px-2 py-1.5 text-xs border border-gray-200 rounded" />
                        <div className="flex gap-1">
                            <select value={f.flag} onChange={(e) => updateFinding(i, "flag", e.target.value)} className="flex-1 px-1 py-1.5 text-xs border border-gray-200 rounded">
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="low">Low</option>
                                <option value="critical">Critical</option>
                            </select>
                            <button onClick={() => removeFinding(i)} className="text-gray-400 hover:text-red-500">
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                <button onClick={addFinding} className="text-xs text-acc-clr font-medium hover:opacity-80">
                    + Add parameter
                </button>
            </div>

            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 resize-none"
            />

            <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="text-xs text-gray-500"
            />

            <div className="flex justify-end gap-2 pt-1">
                <button onClick={onCancel} disabled={submitting} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-acc-clr rounded-lg disabled:opacity-50"
                >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : "Save Result"}
                </button>
            </div>
        </div>
    );
}