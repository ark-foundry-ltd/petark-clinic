// components/clinic/update-vitals.tsx

"use client";

import { useState } from "react";
import { updateVisitVitals } from "@/lib/visit";
import type { Visit, CustomVitalValue } from "@/lib/visit";
import { AlertCircle, Loader2, X, Check } from "lucide-react";
import CustomVitalsFields from "@/components/clinic/custom-vitals-fields";

interface UpdateVitalsProps {
    visit: Visit;
    onSaved: (updated: Visit) => void;
    onCancel: () => void;
}

interface FormState {
    weight: string;
    temp: string;
    pulse: string;
    respiration: string;
    appetite: "normal" | "reduced" | "increased" | "absent" | "";
    activity: "active" | "lethargic" | "hyperactive" | "normal" | "";
}

const APPETITE_OPTIONS = ["normal", "reduced", "increased", "absent"] as const;
const ACTIVITY_OPTIONS = ["active", "lethargic", "hyperactive", "normal"] as const;

function initForm(visit: Visit): FormState {
    return {
        weight: String(visit.vitals?.weight ?? ""),
        temp: String(visit.vitals?.temp ?? ""),
        pulse: String(visit.vitals?.pulse ?? ""),
        respiration: String(visit.vitals?.respiration ?? ""),
        appetite: visit.vitals?.appetite ?? "",
        activity: visit.vitals?.activity ?? "",
    };
}

const inputCls =
    "w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent";

export default function UpdateVitals({ visit, onSaved, onCancel }: Readonly<UpdateVitalsProps>) {
    const [form, setForm] = useState<FormState>(() => initForm(visit));
    // Older visits have no `custom`, so fall back to an empty object.
    // Values for archived fields stay in here too, so saving never wipes them.
    const [customVitals, setCustomVitals] = useState<Record<string, CustomVitalValue>>(
        () => ({ ...(visit.vitals?.custom ?? {}) })
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(field: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleCustomVitalChange(fieldId: string, value: CustomVitalValue) {
        setCustomVitals((prev) => ({ ...prev, [fieldId]: value }));
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const updated = await updateVisitVitals(visit._id, {
                vitals: {
                    weight: form.weight ? parseFloat(form.weight) : null,
                    temp: form.temp ? parseFloat(form.temp) : null,
                    pulse: form.pulse ? parseFloat(form.pulse) : null,
                    respiration: form.respiration ? parseFloat(form.respiration) : null,
                    appetite: form.appetite || null,
                    activity: form.activity || null,
                    // The backend replaces the whole `custom` object, so cleared values drop out here
                    custom: Object.fromEntries(
                        Object.entries(customVitals).filter(([, v]) => v !== null && v !== "")
                    ),
                },
            });
            onSaved({ ...visit, ...updated });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save changes");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                <p className="text-sm font-medium text-sec-clr">Editing visit record</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={13} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-xs text-white bg-acc-clr hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Vitals */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-sec-clr mb-4">Vitals</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min={0}
                            value={form.weight}
                            onChange={(e) => handleChange("weight", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Temperature (°C)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min={0}
                            value={form.temp}
                            onChange={(e) => handleChange("temp", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Heart Rate (bpm)
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={form.pulse}
                            onChange={(e) => handleChange("pulse", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Respiration (/min)
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={form.respiration}
                            onChange={(e) => handleChange("respiration", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* Clinic-defined custom vitals */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <CustomVitalsFields values={customVitals} onChange={handleCustomVitalChange} />
                </div>
            </div>

            {/* Clinical Assessment */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-sec-clr mb-4">Clinical Assessment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase tracking-wide block">
                            Appetite
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {APPETITE_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                        handleChange("appetite", form.appetite === opt ? "" : opt)
                                    }
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
                                        form.appetite === opt
                                            ? "bg-acc-clr text-pry-clr border-acc-clr"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-acc-clr"
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase tracking-wide block">
                            Activity Level
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ACTIVITY_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                        handleChange("activity", form.activity === opt ? "" : opt)
                                    }
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
                                        form.activity === opt
                                            ? "bg-acc-clr text-pry-clr border-acc-clr"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-acc-clr"
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}