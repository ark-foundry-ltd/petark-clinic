// components/clinic/create-visit-card.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Loader2, ArrowLeft, Stethoscope, PawPrint, Check, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { type ClinicService } from "@/lib/user";
import { getAppointmentById, type Appointment } from "@/lib/appointment";
import { createVisit, type CreateVisitPayload, type CustomVitalValue } from "@/lib/visit";
import { useAuthStore } from "@/store/useStore";
import CustomVitalsFields from "@/components/clinic/custom-vitals-fields";

interface Vitals {
    weight: number | null;
    temp: number | null;
    pulse: number | null;
    respiration: number | null;
    appetite: "normal" | "reduced" | "increased" | "absent" | null;
    activity: "active" | "lethargic" | "hyperactive" | "normal" | null;
}

type VitalErrors = Partial<Record<keyof Vitals, string>>;

const NUMERIC_VITAL_FIELDS = ["weight", "temp", "pulse", "respiration"] as const;
type NumericVitalField = (typeof NUMERIC_VITAL_FIELDS)[number];

const APPETITE_OPTIONS = ["normal", "reduced", "increased", "absent"] as const;
const ACTIVITY_OPTIONS = ["active", "lethargic", "hyperactive", "normal"] as const;

const EMPTY_VITALS: Vitals = {
    weight: null,
    temp: null,
    pulse: null,
    respiration: null,
    appetite: null,
    activity: null,
};

const CARD = "bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

interface CreateVisitCardProps {
    /** Where "Create Visit" and Back redirect to, e.g. "/dashboard/appointments" or "/staff-dashboard/appointments" */
    basePath?: string;
}

export default function CreateVisitCard({
    basePath = "/dashboard/appointments",
}: Readonly<CreateVisitCardProps>) {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { profile, role } = useAuthStore();

    // Clinic owner: services live on profile.servicesProvided.
    // Staff: services live on profile.clinicServicesProvided.
    const clinicServices: ClinicService[] = profile
        ? "servicesProvided" in profile
            ? profile.servicesProvided ?? []
            : profile.clinicServicesProvided ?? []
        : [];

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loadingAppt, setLoadingAppt] = useState(true);

    const [vitals, setVitals] = useState<Vitals>(EMPTY_VITALS);
    const [customVitals, setCustomVitals] = useState<Record<string, CustomVitalValue>>({});
    const [chiefComplaint, setChiefComplaint] = useState("");
    const [servicesProvided, setServicesProvided] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [vitalErrors, setVitalErrors] = useState<VitalErrors>({});

    useEffect(() => {
        async function load() {
            try {
                const appt = await getAppointmentById(id);
                setAppointment(appt);
            } catch {
                toast.error("Failed to load appointment.");
            } finally {
                setLoadingAppt(false);
            }
        }
        load();
    }, [id]);

    function toggleService(serviceId: string) {
        setServicesProvided((prev) =>
            prev.includes(serviceId)
                ? prev.filter((s) => s !== serviceId)
                : [...prev, serviceId]
        );
    }

    function handleVitalChange(field: keyof Vitals, value: string) {
        if (vitalErrors[field]) {
            setVitalErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        if ((NUMERIC_VITAL_FIELDS as readonly string[]).includes(field)) {
            const parsed = parseFloat(value);
            setVitals((prev) => ({ ...prev, [field]: isNaN(parsed) ? null : parsed }));
        } else {
            setVitals((prev) => ({ ...prev, [field]: value || null }));
        }
    }

    function handleCustomVitalChange(fieldId: string, value: CustomVitalValue) {
        setCustomVitals((prev) => ({ ...prev, [fieldId]: value }));
    }

    function handleVitalBlur(field: NumericVitalField) {
        const val = vitals[field];
        if (val !== null && val < 0) {
            setVitalErrors((prev) => ({
                ...prev,
                [field]: "Value must be a positive number.",
            }));
        }
    }

    const selectedServices = clinicServices.filter((s) => servicesProvided.includes(s._id));
    const totalAmount = selectedServices.reduce((sum, s) => sum + (s.price ?? 0), 0);

    async function handleSubmit() {
        if (!appointment) return;

        const newErrors: VitalErrors = {};
        for (const field of NUMERIC_VITAL_FIELDS) {
            const val = vitals[field];
            if (val !== null && val < 0) {
                newErrors[field] = "Value must be a positive number.";
            }
        }
        if (Object.keys(newErrors).length > 0) {
            setVitalErrors(newErrors);
            return;
        }

        const payload: CreateVisitPayload = {
            appointmentId: appointment._id,
            ...(servicesProvided.length > 0 ? { servicesProvided } : {}),
            vitals: {
                ...vitals,
                custom: Object.fromEntries(
                    Object.entries(customVitals).filter(([, v]) => v !== null && v !== "")
                ),
            },
            ...(chiefComplaint.trim() ? { chiefComplaint: chiefComplaint.trim() } : {}),
        };

        setSubmitting(true);
        try {
            await createVisit(payload);
            toast.success("Visit created successfully.");
            router.push(`${basePath}/${id}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create visit.");
        } finally {
            setSubmitting(false);
        }
    }

    /* ---------------------------- Loading --------------------------- */
    if (loadingAppt) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6 pry-ff" aria-busy="true">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-16 w-2/3 bg-gray-200 rounded-xl" />
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-48 bg-gray-200 rounded-xl" />
                        <div className="h-64 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="h-56 bg-gray-200 rounded-xl" />
                </div>
            </div>
        );
    }

    /* ----------------------------- Error ---------------------------- */
    if (!appointment) {
        return (
            <div className="max-w-sm mx-auto text-center py-20 px-4 pry-ff">
                <div className="w-12 h-12 rounded-full bg-red-50 ring-1 ring-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={22} className="text-red-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Couldn&apos;t load this appointment</h2>
                <p className="text-sm text-gray-500 mt-1.5 mb-5">Go back and try opening it again.</p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={15} /> Go back
                </button>
            </div>
        );
    }

    const pet = appointment.pet;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10 pry-ff">
            {/* Back */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
                <ArrowLeft size={15} />
                Back
            </button>

            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-acc-clr/10 ring-1 ring-acc-clr/20 flex items-center justify-center">
                    <Stethoscope size={22} className="text-acc-clr" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-sec-clr">New clinical visit</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                        {pet && (
                            <span className="inline-flex items-center gap-1.5 capitalize">
                                <PawPrint size={14} className="text-gray-400" />
                                {[pet.name, pet.species, pet.breed].filter(Boolean).join(", ")}
                            </span>
                        )}
                        {role === "vet" && profile && "fullname" in profile && (
                            <span className="text-xs font-medium text-acc-clr bg-acc-clr/10 rounded-full px-2.5 py-0.5">
                                Assigned to you: {profile.fullname}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* ===================== Form ===================== */}
                <div className="lg:col-span-2 space-y-6 min-w-0">
                    {/* Chief complaint */}
                    <Panel
                        title="Chief complaint"
                        description="The reason the owner brought the pet in, in their words."
                        badge="Subjective"
                    >
                        <div className="flex items-start gap-2.5 rounded-lg bg-sky-50/70 ring-1 ring-sky-100 px-3.5 py-3 mb-4">
                            <Info size={16} className="text-sky-600 mt-0.5 shrink-0" />
                            <div className="text-sm text-sky-900 leading-relaxed">
                                <p>
                                    <span className="font-semibold">Subjective</span>{" "} is the &ldquo;S&rdquo; in the SOAP
                                    note. It&apos;s what the owner reports about the pet, not what you measure or
                                    observe yourself.
                                </p>
                                <p className="mt-1.5 text-sky-800">
                                    Useful details: when it started, changes in eating, drinking or toileting,
                                    behaviour changes, and any medication already given.
                                </p>
                            </div>
                        </div>

                        <label htmlFor="chief-complaint" className="block text-xs font-medium text-gray-700 mb-1.5">
                            Owner&apos;s report
                            <span className="font-normal text-gray-400"> (optional)</span>
                        </label>
                        <textarea
                            id="chief-complaint"
                            rows={4}
                            value={chiefComplaint}
                            onChange={(e) => setChiefComplaint(e.target.value)}
                            placeholder="e.g. Owner reports vomiting since yesterday morning, has not eaten for 24 hours, and is drinking less than usual."
                            className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 leading-relaxed placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-acc-clr/40 focus:border-acc-clr transition resize-y min-h-28"
                        />
                    </Panel>

                    {/* Vitals */}
                    <Panel title="Vitals" description="Record what you measured at intake. Leave blank anything you didn't take.">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                            <Field
                                label="Weight"
                                unit="kg"
                                value={vitals.weight ?? ""}
                                onChange={(v) => handleVitalChange("weight", v)}
                                onBlur={() => handleVitalBlur("weight")}
                                error={vitalErrors.weight}
                            />
                            <Field
                                label="Temperature"
                                unit="°C"
                                value={vitals.temp ?? ""}
                                onChange={(v) => handleVitalChange("temp", v)}
                                onBlur={() => handleVitalBlur("temp")}
                                error={vitalErrors.temp}
                            />
                            <Field
                                label="Pulse"
                                unit="bpm"
                                value={vitals.pulse ?? ""}
                                onChange={(v) => handleVitalChange("pulse", v)}
                                onBlur={() => handleVitalBlur("pulse")}
                                error={vitalErrors.pulse}
                            />
                            <Field
                                label="Respiration"
                                unit="breaths/min"
                                value={vitals.respiration ?? ""}
                                onChange={(v) => handleVitalChange("respiration", v)}
                                onBlur={() => handleVitalBlur("respiration")}
                                error={vitalErrors.respiration}
                            />
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-5">
                            <OptionGroup
                                label="Appetite"
                                options={APPETITE_OPTIONS}
                                value={vitals.appetite}
                                onChange={(appetite) => setVitals((prev) => ({ ...prev, appetite }))}
                            />
                            <OptionGroup
                                label="Activity"
                                options={ACTIVITY_OPTIONS}
                                value={vitals.activity}
                                onChange={(activity) => setVitals((prev) => ({ ...prev, activity }))}
                            />
                        </div>

                        {/* Clinic-defined custom vitals */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <CustomVitalsFields values={customVitals} onChange={handleCustomVitalChange} />
                        </div>
                    </Panel>

                    {/* Services */}
                    {clinicServices.length > 0 && (
                        <Panel
                            title="Services"
                            description="Select everything provided during this visit. You can add more later."
                        >
                            <div className="grid sm:grid-cols-2 gap-2.5">
                                {clinicServices.map((service) => {
                                    const selected = servicesProvided.includes(service._id);
                                    return (
                                        <button
                                            key={service._id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => toggleService(service._id)}
                                            className={`flex items-center gap-3 text-left rounded-lg border px-3.5 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr ${
                                                selected
                                                    ? "border-acc-clr bg-acc-clr/5 ring-1 ring-acc-clr"
                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                        >
                                            <span
                                                aria-hidden
                                                className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center border transition-colors ${
                                                    selected
                                                        ? "bg-acc-clr border-acc-clr text-pry-clr"
                                                        : "border-gray-300 bg-white text-transparent"
                                                }`}
                                            >
                                                <Check size={13} strokeWidth={3} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-medium text-gray-900 truncate">
                                                    {service.name}
                                                </span>
                                                <span className="block text-xs text-gray-500 tabular-nums">
                                                    {service.price != null ? `₦${service.price.toLocaleString()}` : "No price set"}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Panel>
                    )}
                </div>

                {/* ==================== Summary ==================== */}
                <aside className="space-y-4 lg:sticky lg:top-6">
                    <section className={`${CARD} p-5`}>
                        <h2 className="text-sm font-semibold text-gray-900">Visit summary</h2>

                        {selectedServices.length > 0 ? (
                            <div className="mt-4">
                                <ul className="space-y-2.5 text-sm">
                                    {selectedServices.map((service) => (
                                        <li key={service._id} className="flex items-start justify-between gap-3">
                                            <span className="text-gray-700 min-w-0 wrap-break-word">{service.name}</span>
                                            <span className="text-gray-600 tabular-nums shrink-0">
                                                {service.price != null ? `₦${service.price.toLocaleString()}` : "-"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Total ({selectedServices.length} service{selectedServices.length > 1 ? "s" : ""})
                                    </span>
                                    <span className="text-lg font-semibold text-sec-clr tabular-nums">
                                        ₦{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">
                                {clinicServices.length > 0
                                    ? "No services selected yet. The total will appear here."
                                    : "Services and charges can be added once the visit is created."}
                            </p>
                        )}

                        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row lg:flex-col-reverse gap-2.5">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-acc-clr text-pry-clr text-sm font-medium shadow-sm hover:bg-acc-clr/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create visit"
                                )}
                            </button>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function Panel({
    title,
    description,
    badge,
    children,
}: Readonly<{ title: string; description?: string; badge?: string; children: React.ReactNode }>) {
    return (
        <section className={CARD}>
            <header className="px-5 py-4 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                    {badge && (
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-md px-2 py-0.5">
                            {badge}
                        </span>
                    )}
                </div>
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

function OptionGroup<T extends string>({
    label,
    options,
    value,
    onChange,
}: Readonly<{
    label: string;
    options: readonly T[];
    value: T | null;
    onChange: (v: T | null) => void;
}>) {
    return (
        <fieldset>
            <legend className="text-xs font-medium text-gray-700 mb-2">{label}</legend>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const selected = value === opt;
                    return (
                        <button
                            key={opt}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange(selected ? null : opt)}
                            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr ${
                                selected
                                    ? "bg-acc-clr text-pry-clr border-acc-clr"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                            }`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

// ─── Reusable field ───────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    onBlur?: () => void;
    unit?: string;
    placeholder?: string;
    error?: string;
}

function Field({ label, value, onChange, onBlur, unit, placeholder, error }: Readonly<FieldProps>) {
    const inputId = useId();
    const errorId = `${inputId}-error`;
    return (
        <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-gray-700 mb-1.5">
                {label}
            </label>
            <div className="relative">
                <input
                    id={inputId}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={0}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    className={`w-full h-11 pl-3.5 ${unit ? "pr-20" : "pr-3.5"} rounded-lg border bg-white text-sm text-gray-900 tabular-nums placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${
                        error
                            ? "border-red-300 bg-red-50/50 focus:ring-red-200 focus:border-red-400"
                            : "border-gray-200 focus:ring-acc-clr/40 focus:border-acc-clr"
                    }`}
                />
                {unit && (
                    <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs text-gray-400">
                        {unit}
                    </span>
                )}
            </div>
            {error && (
                <p id={errorId} className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}