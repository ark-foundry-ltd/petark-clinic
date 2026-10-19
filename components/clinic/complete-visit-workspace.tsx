// components/clinic/complete-visit-workspace.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    ClipboardCheck,
    Loader2,
    Pencil,
    RotateCcw,
    Stethoscope,
    UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { completeVisit, getVisit, type Visit } from "@/lib/visit";
import { useAuthStore } from "@/store/useStore";

/* ------------------------------------------------------------------ */
/* Types and step config                                               */
/* ------------------------------------------------------------------ */

// The payload shape is still SOAP. Only the labels shown to the vet are friendlier.
interface SOAPFormData {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}
type FieldKey = keyof SOAPFormData;

const EMPTY_FORM: SOAPFormData = { subjective: "", objective: "", assessment: "", plan: "" };

interface NoteStep {
    key: FieldKey;
    letter: "S" | "O" | "A" | "P";
    label: string;
    required: boolean;
    description: string;
    placeholder: string;
    hints: string[];
}

const NOTE_STEPS: NoteStep[] = [
    {
        key: "subjective",
        letter: "S",
        label: "History",
        required: false,
        description:
            "What the owner reports about the pet: the complaint, how long it has been going on, and anything they have noticed at home.",
        placeholder: "e.g. Owner reports vomiting since yesterday morning, not eating, drinking less than usual.",
        hints: ["Onset and duration", "Eating, drinking, toileting", "Behaviour changes", "Medication already given"],
    },
    {
        key: "objective",
        letter: "O",
        label: "Examination",
        required: true,
        description:
            "What you found yourself: physical examination findings and any test or imaging results. Vitals taken at intake are shown for reference.",
        placeholder: "e.g. Mucous membranes pale pink, CRT 2s, mild dehydration, abdomen tense on palpation.",
        hints: ["Physical exam findings", "Hydration and body condition", "Heart, lungs, abdomen", "Test or imaging results"],
    },
    {
        key: "assessment",
        letter: "A",
        label: "Diagnosis",
        required: true,
        description: "Your clinical conclusion: the working diagnosis and the other conditions you considered.",
        placeholder: "e.g. Acute gastroenteritis. Differentials: foreign body, pancreatitis.",
        hints: ["Primary diagnosis", "Differential diagnoses", "Clinical impression", "Severity or prognosis"],
    },
    {
        key: "plan",
        letter: "P",
        label: "Treatment plan",
        required: true,
        description: "What happens next: treatment given, medications, home care and follow-up.",
        placeholder: "e.g. IV fluids, anti-emetic for 3 days, bland diet, recheck in 48 hours.",
        hints: ["Treatment and medications", "Dosage and duration", "Home-care instructions", "Follow-up date"],
    },
];

type StepKey = FieldKey | "review";
const REVIEW_KEY: StepKey = "review";
const ALL_STEP_KEYS: StepKey[] = [...NOTE_STEPS.map((s) => s.key), REVIEW_KEY];

const CARD = "bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

interface DraftRecord {
    data: SOAPFormData;
    savedAt: string;
}

const draftKey = (visitId: string) => `petark:visit-notes:${visitId}`;

function readDraft(visitId: string): DraftRecord | null {
    try {
        const raw = localStorage.getItem(draftKey(visitId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as DraftRecord;
        return parsed?.data ? parsed : null;
    } catch {
        return null;
    }
}

function writeDraft(visitId: string, record: DraftRecord) {
    try {
        localStorage.setItem(draftKey(visitId), JSON.stringify(record));
    } catch {
        /* storage unavailable, draft just won't persist */
    }
}

function clearDraft(visitId: string) {
    try {
        localStorage.removeItem(draftKey(visitId));
    } catch {
        /* ignore */
    }
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

type VisitVitals = {
    weight?: number | null;
    temp?: number | null;
    pulse?: number | null;
    respiration?: number | null;
    appetite?: string | null;
    activity?: string | null;
};

function getVitalItems(visit: Visit): [string, string][] {
    const v = (visit as unknown as { vitals?: VisitVitals }).vitals;
    if (!v) return [];
    const items: [string, string | null][] = [
        ["Weight", v.weight != null ? `${v.weight} kg` : null],
        ["Temperature", v.temp != null ? `${v.temp} °C` : null],
        ["Pulse", v.pulse != null ? `${v.pulse} bpm` : null],
        ["Respiration", v.respiration != null ? `${v.respiration} /min` : null],
        ["Appetite", v.appetite ?? null],
        ["Activity", v.activity ?? null],
    ];
    return items.filter((i): i is [string, string] => !!i[1]);
}

function getServiceLines(visit: Visit): { name: string; price?: number }[] {
    const raw: unknown[] = visit.selectedServices ?? visit.servicesProvided ?? [];
    return raw.flatMap((s) => {
        if (typeof s === "string") return [];
        const o = s as { name?: string; price?: number };
        return o.name ? [{ name: o.name, price: o.price }] : [];
    });
}

function getServicesTotal(v: Visit): number {
    if (typeof v.billing?.total === "number" && v.billing.total > 0) return v.billing.total;
    const raw: unknown[] = v.selectedServices ?? v.servicesProvided ?? [];
    return raw.reduce<number>((sum, s) => {
        if (typeof s === "string") return sum;
        return sum + ((s as { price?: number }).price ?? 0);
    }, 0);
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface CompleteVisitWorkspaceProps {
    /** e.g. "/dashboard/appointments" or "/staff-dashboard/appointments" */
    basePath?: string;
}

export default function CompleteVisitWorkspace({
    basePath = "/dashboard/appointments",
}: Readonly<CompleteVisitWorkspaceProps>) {
    const { id: appointmentId } = useParams<{ id: string }>();
    const router = useRouter();
    const { profile, role } = useAuthStore();

    const [visit, setVisit] = useState<Visit | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [form, setForm] = useState<SOAPFormData>(EMPTY_FORM);
    const [step, setStep] = useState<StepKey>("subjective");
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingSubjective, setEditingSubjective] = useState(false);

    const [dirty, setDirty] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

    // What is already saved on the server for this visit
    const savedForm: SOAPFormData = useMemo(
        () => ({
            subjective: visit?.soap?.subjective ?? "",
            objective: visit?.soap?.objective ?? "",
            assessment: visit?.soap?.assessment ?? "",
            plan: visit?.soap?.plan ?? "",
        }),
        [visit]
    );

    /* ----------------------------- Load ----------------------------- */
    useEffect(() => {
        if (!appointmentId) return;
        let cancelled = false;
        (async () => {
            try {
                const all = await getVisit();
                if (cancelled) return;
                const found = all.find((v) => v.appointmentId === appointmentId) ?? null;
                setVisit(found);
                if (found) {
                    const draft = readDraft(found._id);
                    if (draft) {
                        setForm(draft.data);
                        setDraftSavedAt(draft.savedAt);
                    } else {
                        setForm({
                            subjective: found.soap?.subjective ?? "",
                            objective: found.soap?.objective ?? "",
                            assessment: found.soap?.assessment ?? "",
                            plan: found.soap?.plan ?? "",
                        });
                    }
                }
            } catch {
                if (!cancelled) setLoadError("Failed to load this visit.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [appointmentId]);

    /* --------------------------- Autosave --------------------------- */
    useEffect(() => {
        if (!dirty || !visit) return;
        const t = setTimeout(() => {
            const savedAt = new Date().toISOString();
            writeDraft(visit._id, { data: form, savedAt });
            setDraftSavedAt(savedAt);
        }, 600);
        return () => clearTimeout(t);
    }, [form, dirty, visit]);

    /* ---------------------------- Derived --------------------------- */
    const filled = (k: FieldKey) => form[k].trim().length > 0;
    const missing = NOTE_STEPS.filter((s) => s.required && !filled(s.key));
    const stepIndex = ALL_STEP_KEYS.indexOf(step);

    function updateField(field: FieldKey, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setDirty(true);
    }

    function discardDraft() {
        if (!visit) return;
        if (!window.confirm("Discard your unsaved changes and go back to what was last saved?")) return;
        clearDraft(visit._id);
        setForm(savedForm);
        setDirty(false);
        setDraftSavedAt(null);
        setEditingSubjective(false);
        setAttempted(false);
    }

    async function handleComplete() {
        if (!visit) return;
        if (missing.length > 0) {
            setAttempted(true);
            toast.error("Please fill in all required sections");
            return;
        }
        try {
            setSubmitting(true);
            await completeVisit(visit._id, {
                soap: {
                    subjective: form.subjective.trim() || undefined,
                    objective: form.objective.trim(),
                    assessment: form.assessment.trim(),
                    plan: form.plan.trim(),
                },
            });
            clearDraft(visit._id);
            toast.success("Visit marked as completed");
            router.push(`${basePath}/${appointmentId}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to complete visit");
        } finally {
            setSubmitting(false);
        }
    }

    /* ------------------------ Loading / errors ---------------------- */
    if (loading) {
        return (
            <div className="pry-ff max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6" aria-busy="true">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-40 bg-gray-200 rounded-2xl" />
                <div className="h-20 bg-gray-200 rounded-xl" />
                <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
        );
    }

    const backHref = `${basePath}/${appointmentId}`;

    if (loadError || !visit || visit.status !== "in-progress") {
        const message =
            loadError ??
            (!visit
                ? "No visit has been started for this appointment."
                : `This visit is already ${visit.status.replace("-", " ")}.`);
        return (
            <div className="pry-ff max-w-sm mx-auto text-center py-20 px-4">
                <div className="w-12 h-12 rounded-full bg-red-50 ring-1 ring-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={22} className="text-red-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">{message}</h2>
                <Link
                    href={backHref}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={15} /> Back to appointment
                </Link>
            </div>
        );
    }

    const pet = visit.pet;
    const attendingVet = role === "vet" && profile && "fullname" in profile ? profile.fullname : null;
    const serviceLines = getServiceLines(visit);
    const servicesTotal = getServicesTotal(visit);
    const hasSavedSubjective = savedForm.subjective.trim().length > 0;
    const showSubjectiveReadOnly =
        hasSavedSubjective && !editingSubjective && form.subjective === savedForm.subjective;

    const goPrev = () => setStep(ALL_STEP_KEYS[Math.max(0, stepIndex - 1)]);
    const goNext = () => setStep(ALL_STEP_KEYS[Math.min(ALL_STEP_KEYS.length - 1, stepIndex + 1)]);

    const currentNote = NOTE_STEPS.find((s) => s.key === step);

    return (
        <div className="pry-ff max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
            <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
                <ArrowLeft size={15} /> Back to appointment
            </Link>

            {/* ------------------------ Banner ------------------------ */}
            <header className="rounded-2xl bg-linear-to-br from-acc-clr to-acc-clr/80 text-pry-clr p-5 sm:p-7 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-pry-clr/15 ring-1 ring-pry-clr/25 flex items-center justify-center">
                            <Stethoscope size={22} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium opacity-80">Clinical record</p>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-0.5">
                                Complete visit
                            </h1>
                            <p className="mt-1 text-lg font-medium capitalize truncate">{pet?.name || "Unknown pet"}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(
                                    [
                                        ["Species", pet?.species],
                                        ["Breed", pet?.breed],
                                        ["Age", pet?.age ? `${pet.age} yrs` : undefined],
                                    ] as const
                                )
                                    .filter(([, value]) => !!value)
                                    .map(([label, value]) => (
                                        <span
                                            key={label}
                                            className="inline-flex items-center gap-2 rounded-lg bg-pry-clr/15 ring-1 ring-pry-clr/20 px-2.5 py-1 text-xs"
                                        >
                                            <span className="opacity-70">{label}</span>
                                            <span className="font-semibold capitalize">{value}</span>
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {attendingVet && (
                        <div className="flex items-center gap-3 rounded-xl bg-pry-clr/15 ring-1 ring-pry-clr/20 px-4 py-3 self-start md:self-auto">
                            <UserRound size={18} className="opacity-80" />
                            <div>
                                <p className="text-xs opacity-70">Attending veterinarian</p>
                                <p className="text-sm font-semibold">{attendingVet}</p>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* ------------------------ Stepper ----------------------- */}
            <nav
                role="tablist"
                aria-label="Clinical record sections"
                className={`${CARD} p-2 flex gap-1 overflow-x-auto`}
            >
                {ALL_STEP_KEYS.map((key, i) => {
                    const note = NOTE_STEPS.find((s) => s.key === key);
                    const active = step === key;
                    const done = note ? filled(note.key) : missing.length === 0;
                    const needsAttention = attempted && !!note?.required && !filled(note.key);
                    return (
                        <button
                            key={key}
                            role="tab"
                            type="button"
                            aria-selected={active}
                            onClick={() => setStep(key)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left min-w-44 lg:min-w-0 lg:flex-1 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acc-clr ${
                                active ? "bg-acc-clr/10 ring-1 ring-acc-clr/30" : "hover:bg-gray-50"
                            }`}
                        >
                            <span
                                className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-semibold ring-1 ring-inset ${
                                    active
                                        ? "bg-acc-clr text-pry-clr ring-acc-clr"
                                        : needsAttention
                                          ? "bg-red-50 text-red-600 ring-red-200"
                                          : done
                                            ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                                            : "bg-gray-100 text-gray-500 ring-gray-200"
                                }`}
                            >
                                {note ? (
                                    done && !active ? <Check size={16} strokeWidth={3} /> : note.letter
                                ) : (
                                    <ClipboardCheck size={16} />
                                )}
                            </span>
                            <span className="min-w-0">
                                <span className="block text-xs text-gray-500">Step {i + 1}</span>
                                <span className="block text-sm font-semibold text-gray-900 truncate">
                                    {note ? note.label : "Review"}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* ---------------------- Draft status -------------------- */}
            <div className="flex items-center justify-between gap-3 px-1 text-xs min-h-5">
                <p className={draftSavedAt ? "text-emerald-700" : "text-gray-400"} aria-live="polite">
                    {draftSavedAt ? `Draft saved at ${formatTime(draftSavedAt)}` : "Changes are saved automatically as a draft"}
                </p>
                {(draftSavedAt || dirty) && (
                    <button
                        type="button"
                        onClick={discardDraft}
                        className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                        <RotateCcw size={13} /> Discard draft
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* ==================== Main panel ==================== */}
                <section role="tabpanel" className={`${CARD} lg:col-span-2 min-w-0 overflow-hidden`}>
                    <header className="px-5 sm:px-6 py-5 bg-gray-50/70 border-b border-gray-100 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-acc-clr">
                                Step {stepIndex + 1} of {ALL_STEP_KEYS.length}
                            </p>
                            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-sec-clr mt-0.5">
                                {currentNote ? currentNote.label : "Review and complete"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1.5 max-w-prose">
                                {currentNote
                                    ? currentNote.description
                                    : "Check everything below. Completing the visit saves these notes to the patient's record."}
                            </p>
                        </div>
                        {currentNote && (
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-md px-2 py-0.5">
                                    SOAP: {currentNote.letter}
                                </span>
                                <span
                                    className={`text-xs font-medium ${
                                        currentNote.required ? "text-red-600" : "text-gray-400"
                                    }`}
                                >
                                    {currentNote.required ? "Required" : "Optional"}
                                </span>
                            </div>
                        )}
                    </header>

                    <div className="p-5 sm:p-6 space-y-5">
                        {/* ------------- Note step body ------------- */}
                        {currentNote && (
                            <>
                                {currentNote.key === "objective" && <VitalsReference items={getVitalItems(visit)} />}

                                {currentNote.key === "subjective" && showSubjectiveReadOnly ? (
                                    <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200/80 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-500">
                                                    Recorded when the visit was created
                                                </p>
                                                <p className="mt-1.5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                                    {form.subjective}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditingSubjective(true)}
                                                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-sec-clr bg-pry-clr ring-1 ring-gray-200 hover:bg-gray-100 rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                                            >
                                                <Pencil size={12} /> Edit
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <NoteField
                                        step={currentNote}
                                        value={form[currentNote.key]}
                                        onChange={(v) => updateField(currentNote.key, v)}
                                        showError={attempted && currentNote.required && !filled(currentNote.key)}
                                    />
                                )}

                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">Consider including</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentNote.hints.map((h) => (
                                            <span
                                                key={h}
                                                className="text-xs text-gray-600 bg-gray-100 rounded-full px-3 py-1"
                                            >
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --------------- Review step --------------- */}
                        {step === "review" && (
                            <>
                                {attempted && missing.length > 0 && (
                                    <div
                                        role="alert"
                                        className="rounded-lg bg-red-50 ring-1 ring-red-100 border-l-4 border-l-red-500 px-4 py-3"
                                    >
                                        <p className="text-sm font-semibold text-red-800">
                                            {missing.length} required section{missing.length > 1 ? "s" : ""} still empty
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {missing.map((m) => (
                                                <button
                                                    key={m.key}
                                                    type="button"
                                                    onClick={() => setStep(m.key)}
                                                    className="text-xs font-medium text-red-800 bg-pry-clr ring-1 ring-red-200 hover:bg-red-50 rounded-full px-3 py-1 transition-colors"
                                                >
                                                    Go to {m.label.toLowerCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {NOTE_STEPS.map((s) => (
                                        <div key={s.key} className="rounded-lg ring-1 ring-gray-200/80 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {s.label}
                                                    <span className="ml-2 text-xs font-normal text-gray-400">
                                                        {s.required ? "Required" : "Optional"}
                                                    </span>
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (s.key === "subjective") setEditingSubjective(true);
                                                        setStep(s.key);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-sec-clr hover:text-gray-900 transition-colors"
                                                >
                                                    <Pencil size={12} /> Edit
                                                </button>
                                            </div>
                                            {filled(s.key) ? (
                                                <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                                    {form[s.key]}
                                                </p>
                                            ) : (
                                                <p
                                                    className={`mt-2 text-sm ${
                                                        s.required ? "text-red-600" : "text-gray-400"
                                                    }`}
                                                >
                                                    {s.required ? "Not filled in yet." : "Nothing recorded."}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* --------------------- Footer nav -------------------- */}
                    <footer className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={stepIndex === 0 || submitting}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-pry-clr text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                        >
                            <ArrowLeft size={15} /> Back
                        </button>

                        {step === "review" ? (
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-acc-clr text-pry-clr text-sm font-medium shadow-sm hover:bg-acc-clr/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" /> Completing...
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCheck size={16} /> Complete visit
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={goNext}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-acc-clr text-pry-clr text-sm font-medium shadow-sm hover:bg-acc-clr/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                            >
                                Next <ArrowRight size={15} />
                            </button>
                        )}
                    </footer>
                </section>

                {/* ===================== Sidebar ====================== */}
                <aside className="space-y-4 lg:sticky lg:top-6">
                    <section className={`${CARD} p-5`}>
                        <h2 className="text-sm font-semibold text-gray-900">Progress</h2>
                        <ul className="mt-4 space-y-1">
                            {NOTE_STEPS.map((s) => {
                                const done = filled(s.key);
                                return (
                                    <li key={s.key}>
                                        <button
                                            type="button"
                                            onClick={() => setStep(s.key)}
                                            className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <span
                                                className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${
                                                    done
                                                        ? "bg-emerald-500 text-white"
                                                        : "ring-1 ring-inset ring-gray-300 text-transparent"
                                                }`}
                                            >
                                                <Check size={12} strokeWidth={3} />
                                            </span>
                                            <span className="text-sm text-gray-800 flex-1">{s.label}</span>
                                            <span className="text-xs text-gray-400">
                                                {done ? "Done" : s.required ? "Required" : "Optional"}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {serviceLines.length > 0 && (
                        <section className={`${CARD} p-5`}>
                            <h2 className="text-sm font-semibold text-gray-900">Services provided</h2>
                            <ul className="mt-3 space-y-2 text-sm">
                                {serviceLines.map((s, i) => (
                                    <li key={`${s.name}-${i}`} className="flex items-start justify-between gap-3">
                                        <span className="text-gray-700 min-w-0 wrap-break-word">{s.name}</span>
                                        {s.price != null && (
                                            <span className="text-gray-600 tabular-nums shrink-0">
                                                ₦{s.price.toLocaleString()}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {servicesTotal > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total</span>
                                    <span className="text-base font-semibold text-sec-clr tabular-nums">
                                        ₦{servicesTotal.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function NoteField({
    step,
    value,
    onChange,
    showError,
}: Readonly<{ step: NoteStep; value: string; onChange: (v: string) => void; showError: boolean }>) {
    const id = `note-${step.key}`;
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1.5">
                {step.label}
                {step.required ? (
                    <span className="text-red-500"> *</span>
                ) : (
                    <span className="font-normal text-gray-400"> (optional)</span>
                )}
            </label>
            <textarea
                id={id}
                rows={9}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={step.placeholder}
                aria-invalid={showError}
                aria-describedby={showError ? `${id}-error` : undefined}
                className={`w-full px-3.5 py-3 rounded-lg border text-sm text-gray-900 leading-relaxed placeholder:text-gray-400 focus:outline-none focus:ring-2 transition resize-y min-h-40 ${
                    showError
                        ? "border-red-300 bg-red-50/50 focus:ring-red-200 focus:border-red-400"
                        : "border-gray-200 bg-white focus:ring-acc-clr/40 focus:border-acc-clr"
                }`}
            />
            {showError && (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
                    {step.label} is required to complete the visit.
                </p>
            )}
        </div>
    );
}

function VitalsReference({ items }: Readonly<{ items: [string, string][] }>) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2.5">Vitals recorded at intake</h3>
            {items.length > 0 ? (
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {items.map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-gray-50 ring-1 ring-gray-200/70 px-3 py-2.5 min-w-0">
                            <dt className="text-xs text-gray-500">{label}</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-gray-900 tabular-nums capitalize wrap-break-word">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="text-sm text-gray-500">No vitals were recorded when this visit was created.</p>
            )}
        </div>
    );
}