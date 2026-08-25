// components/clinic/create-visit-card.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Stethoscope, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { type ClinicService } from "@/lib/user";
import { getAppointmentById, type Appointment } from "@/lib/appointment";
import { createVisit, type CreateVisitPayload } from "@/lib/visit";
import { useAuthStore } from "@/store/useStore";

interface Vitals {
    weight: number | null;
    temp: number | null;
    pulse: number | null;
    respiration: number | null;
    appetite: "normal" | "reduced" | "increased" | "absent" | null;
    activity: "active" | "lethargic" | "hyperactive" | "normal" | null;
}

interface FollowUpEntry {
    serviceId: string | null;
    serviceName: string;
    date: string;
    time: string;
    notes: string;
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
    const [chiefComplaint, setChiefComplaint] = useState("");
    const [servicesProvided, setServicesProvided] = useState<string[]>([]);
    const [followUps, setFollowUps] = useState<FollowUpEntry[]>([]);
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

    function handleVitalBlur(field: NumericVitalField) {
        const val = vitals[field];
        if (val !== null && val < 0) {
            setVitalErrors((prev) => ({
                ...prev,
                [field]: "Value must be a positive number.",
            }));
        }
    }

    function addFollowUp(service: ClinicService) {
        setFollowUps((prev) => [
            ...prev,
            { serviceId: service._id, serviceName: service.name, date: "", time: "", notes: "" },
        ]);
    }

    function removeFollowUp(index: number) {
        setFollowUps((prev) => prev.filter((_, i) => i !== index));
    }

    function updateFollowUp(index: number, field: keyof FollowUpEntry, value: string) {
        setFollowUps((prev) =>
            prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
        );
    }

    const selectedServices = clinicServices.filter((s) => servicesProvided.includes(s._id));

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
            vitals,
            ...(chiefComplaint.trim() ? { chiefComplaint: chiefComplaint.trim() } : {}),
            ...(followUps.length > 0 ? { followUps } : {}),
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

    if (loadingAppt) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={24} className="animate-spin text-acc-clr" />
            </div>
        );
    }

    if (!appointment) return null;

    const pet = appointment.pet;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pry-ff bg-pry-clr rounded-lg shadow">

            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sec-clr transition-colors"
            >
                <ArrowLeft size={15} />
                Back
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-acc-clr/10">
                    <Stethoscope size={20} className="text-acc-clr" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-sec-clr">Create Visit</h1>
                    {pet && (
                        <p className="text-sm text-gray-500 mt-0.5 capitalize">
                            {pet.name} &middot; {pet.species} &middot; {pet.breed}
                        </p>
                    )}
                    {role === "vet" && profile && "fullname" in profile && (
                        <p className="text-xs text-acc-clr mt-1">
                            Assigned to you — {profile.fullname}
                        </p>
                    )}
                </div>
            </div>

            {/* Services */}
            {clinicServices.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">
                        Services
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {clinicServices.map((service) => {
                            const selected = servicesProvided.includes(service._id);
                            return (
                                <button
                                    key={service._id}
                                    type="button"
                                    onClick={() => toggleService(service._id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        selected
                                            ? "bg-acc-clr text-pry-clr border-acc-clr"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-acc-clr"
                                    }`}
                                >
                                    {service.name}
                                    {service.price != null && (
                                        <span className="ml-1.5 opacity-70">
                                            ₦{service.price.toLocaleString()}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {servicesProvided.length > 0 && (
                        <p className="text-xs text-gray-400">
                            {servicesProvided.length} service{servicesProvided.length > 1 ? "s" : ""} selected
                        </p>
                    )}
                </section>
            )}

            {/* Follow-ups */}
            {selectedServices.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">
                                Follow-ups
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Optional — schedule follow-up dates per service
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => {
                            const alreadyAdded = followUps.some((f) => f.serviceId === service._id);
                            return (
                                <button
                                    key={service._id}
                                    type="button"
                                    disabled={alreadyAdded}
                                    onClick={() => addFollowUp(service)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-acc-clr hover:text-acc-clr disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus size={11} />
                                    {service.name}
                                </button>
                            );
                        })}
                    </div>

                    {followUps.length > 0 && (
                        <div className="space-y-3">
                            {followUps.map((f, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-lg border border-gray-200 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-acc-clr uppercase tracking-wide">
                                            {f.serviceName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFollowUp(i)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field
                                            label="Date"
                                            type="date"
                                            value={f.date}
                                            onChange={(v) => updateFollowUp(i, "date", v)}
                                        />
                                        <Field
                                            label="Time"
                                            type="time"
                                            value={f.time}
                                            onChange={(v) => updateFollowUp(i, "time", v)}
                                        />
                                    </div>
                                    <Field
                                        label="Notes"
                                        value={f.notes}
                                        onChange={(v) => updateFollowUp(i, "notes", v)}
                                        placeholder="e.g. bring previous test results"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Vitals */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">Vitals</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Weight (kg)"
                        type="number"
                        value={vitals.weight ?? ""}
                        onChange={(v) => handleVitalChange("weight", v)}
                        onBlur={() => handleVitalBlur("weight")}
                        error={vitalErrors.weight}
                        min={0}
                    />
                    <Field
                        label="Temperature (°C)"
                        type="number"
                        value={vitals.temp ?? ""}
                        onChange={(v) => handleVitalChange("temp", v)}
                        onBlur={() => handleVitalBlur("temp")}
                        error={vitalErrors.temp}
                        min={0}
                    />
                    <Field
                        label="Pulse (bpm)"
                        type="number"
                        value={vitals.pulse ?? ""}
                        onChange={(v) => handleVitalChange("pulse", v)}
                        onBlur={() => handleVitalBlur("pulse")}
                        error={vitalErrors.pulse}
                        min={0}
                    />
                    <Field
                        label="Respiration (breaths/min)"
                        type="number"
                        value={vitals.respiration ?? ""}
                        onChange={(v) => handleVitalChange("respiration", v)}
                        onBlur={() => handleVitalBlur("respiration")}
                        error={vitalErrors.respiration}
                        min={0}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">Appetite</label>
                    <div className="flex flex-wrap gap-2">
                        {APPETITE_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                    setVitals((prev) => ({
                                        ...prev,
                                        appetite: prev.appetite === opt ? null : opt,
                                    }))
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                                    vitals.appetite === opt
                                        ? "bg-acc-clr text-pry-clr border-acc-clr"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-acc-clr"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">Activity</label>
                    <div className="flex flex-wrap gap-2">
                        {ACTIVITY_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                    setVitals((prev) => ({
                                        ...prev,
                                        activity: prev.activity === opt ? null : opt,
                                    }))
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                                    vitals.activity === opt
                                        ? "bg-acc-clr text-pry-clr border-acc-clr"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-acc-clr"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chief Complaint */}
            <section className="space-y-2">
                <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">
                    Chief Complaint
                    <span className="text-gray-400 normal-case font-normal ml-1">(Subjective)</span>
                </h2>
                <textarea
                    rows={3}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Describe the pet's presenting complaint or reason for visit."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-acc-clr transition resize-none"
                />
            </section>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    onClick={() => router.back()}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-gray-400 disabled:opacity-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-acc-clr text-pry-clr text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-acc-clr/90 transition-colors"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create Visit"
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Reusable field ───────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    onBlur?: () => void;
    type?: "text" | "number" | "date" | "time";
    placeholder?: string;
    min?: number;
    error?: string;
}

function Field({ label, value, onChange, onBlur, type = "text", placeholder, min, error }: Readonly<FieldProps>) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                min={min}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-acc-clr transition ${
                    error ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}