// the add form (uses the calculator)
// components/clinic/add-treatment-form.tsx

"use client";

import { useState } from "react";
import { addTreatment, type Treatment, type AddTreatmentPayload } from "@/lib/treatment";
import type { DosageResult } from "@/lib/drug-calculator";
import { KNOWN_TYPE_CONFIG } from "./treatment-type-config";
import DoseCalculatorPanel from "./dose-calculator-panel";
import { Plus, Loader2, X, Calculator } from "lucide-react";
import { toast } from "sonner";

interface AddTreatmentFormProps {
    petId: string;
    visitId?: string;
    petWeightKg?: number;
    petSpecies?: string;
    onAdded: (t: Treatment) => void;
    onCancel: () => void;
}

export default function AddTreatmentForm({
    petId,
    visitId,
    petWeightKg,
    petSpecies,
    onAdded,
    onCancel,
}: Readonly<AddTreatmentFormProps>) {
    const [loading, setLoading] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [form, setForm] = useState<AddTreatmentPayload>({
        petId,
        visitId,
        type: "vaccination",
        name: "",
        dosage: "",
        minDoseMg: undefined,
        maxDoseMg: undefined,
        unit: undefined,
        frequency: "",
        administeredAt: new Date().toISOString().split("T")[0],
        nextDueAt: "",
        notes: "",
    });

    const handleApplyDose = (result: DosageResult) => {
        setForm(f => ({
            ...f,
            type: "medication",
            name: f.name || result.drug,
            dosage: result.doseRange || (result.minDose ? `${result.minDose} – ${result.maxDose}` : f.dosage),
            minDoseMg: result.minDoseMg,
            maxDoseMg: result.maxDoseMg,
            unit: result.minDoseMg != null ? "mg" : f.unit,
            frequency: result.frequency || f.frequency,
            notes: result.warnings?.length ? result.warnings.join(" · ") : f.notes,
        }));
        setShowCalculator(false);
        toast.success("Dose applied to form");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Treatment name is required");
            return;
        }
        if (!form.type.trim()) {
            toast.error("Treatment type is required");
            return;
        }

        try {
            setLoading(true);
            const payload: AddTreatmentPayload = {
                petId: form.petId,
                type: form.type,
                name: form.name,
                ...(visitId && { visitId }),
                ...(form.dosage && { dosage: form.dosage }),
                ...(form.minDoseMg != null && { minDoseMg: form.minDoseMg }),
                ...(form.maxDoseMg != null && { maxDoseMg: form.maxDoseMg }),
                ...(form.unit && { unit: form.unit }),
                ...(form.frequency && { frequency: form.frequency }),
                ...(form.administeredAt && { administeredAt: form.administeredAt }),
                ...(form.nextDueAt && { nextDueAt: form.nextDueAt }),
                ...(form.notes && { notes: form.notes }),
            };
            const added = await addTreatment(payload);
            onAdded(added);
            toast.success("Treatment added successfully");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add treatment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Add Treatment</p>
                <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-lg">
                    <X size={14} className="text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Type — free text now, with quick-pick suggestions */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type <span className="text-red-500">*</span></label>
                    <input
                        list="treatment-type-suggestions"
                        type="text"
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        placeholder="e.g. vaccination, medication..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr bg-white"
                    />
                    <datalist id="treatment-type-suggestions">
                        {Object.keys(KNOWN_TYPE_CONFIG).map(t => (
                            <option key={t} value={t} />
                        ))}
                    </datalist>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Rabies Vaccine"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                {/* Dosage */}
                <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-500">Dosage</label>
                        <button
                            type="button"
                            onClick={() => setShowCalculator(s => !s)}
                            className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800"
                        >
                            <Calculator size={11} />
                            {showCalculator ? "Hide calculator" : "Calculate dose"}
                        </button>
                    </div>
                    <input
                        type="text"
                        value={form.dosage}
                        onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                        placeholder="e.g. 1ml or 2.5mg – 5mg"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                    {form.minDoseMg != null && form.maxDoseMg != null && (
                        <p className="text-[10px] text-violet-600 mt-1">
                            Calculated: {form.minDoseMg}{form.unit} – {form.maxDoseMg}{form.unit}
                        </p>
                    )}
                </div>

                {showCalculator && (
                    <div className="col-span-2">
                        <DoseCalculatorPanel
                            defaultWeight={petWeightKg}
                            defaultSpecies={petSpecies}
                            onApply={handleApplyDose}
                            onClose={() => setShowCalculator(false)}
                        />
                    </div>
                )}

                {/* Frequency */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                    <input
                        type="text"
                        value={form.frequency}
                        onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                        placeholder="e.g. Annually"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                {/* Administered At */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Administered</label>
                    <input
                        type="date"
                        value={form.administeredAt}
                        onChange={e => setForm(f => ({ ...f, administeredAt: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                {/* Next Due */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Next Due</label>
                    <input
                        type="date"
                        value={form.nextDueAt}
                        onChange={e => setForm(f => ({ ...f, nextDueAt: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr resize-none"
                />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-acc-clr hover:opacity-90 disabled:opacity-60 rounded-lg transition-colors"
                >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    Add Treatment
                </button>
            </div>
        </form>
    );
}