// components/clinic/custom-vitals-fields.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
    getCustomVitalFields,
    addCustomVitalField,
    type CustomVitalField,
    type CustomVitalValue,
} from "@/lib/visit";

interface CustomVitalsFieldsProps {
    values: Record<string, CustomVitalValue>;
    onChange: (fieldId: string, value: CustomVitalValue) => void;
}

export default function CustomVitalsFields({ values, onChange }: Readonly<CustomVitalsFieldsProps>) {
    const [fields, setFields] = useState<CustomVitalField[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [label, setLabel] = useState("");
    const [unit, setUnit] = useState("");
    const [type, setType] = useState<"number" | "text">("number");

    useEffect(() => {
        let cancelled = false;
        getCustomVitalFields()
            .then((data) => {
                if (!cancelled) setFields(data.filter((f) => !f.archived));
            })
            .catch(() => {
                if (!cancelled) toast.error("Couldn't load custom vital fields.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    function handleInput(field: CustomVitalField, raw: string) {
        if (field.type === "number") {
            const parsed = parseFloat(raw);
            onChange(field._id, Number.isNaN(parsed) ? null : parsed);
        } else {
            onChange(field._id, raw || null);
        }
    }

    async function handleAdd() {
        if (!label.trim()) {
            toast.error("Give the field a name.");
            return;
        }
        setSaving(true);
        try {
            const created = await addCustomVitalField({ label: label.trim(), unit: unit.trim(), type });
            setFields((prev) => [...prev, created]);
            setLabel("");
            setUnit("");
            setType("number");
            setAdding(false);
            toast.success(`"${created.label}" saved for your clinic.`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add field.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <Loader2 size={16} className="animate-spin text-acc-clr" />;
    }

    return (
        <div className="space-y-3">
            {fields.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    {fields.map((field) => (
                        <div key={field._id} className="space-y-1.5">
                            <label className="block text-xs font-medium text-gray-600">
                                {field.label}
                                {field.unit ? ` (${field.unit})` : ""}
                            </label>
                            <input
                                type={field.type === "number" ? "number" : "text"}
                                value={values[field._id] ?? ""}
                                onChange={(e) => handleInput(field, e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-acc-clr transition"
                            />
                        </div>
                    ))}
                </div>
            )}

            {adding ? (
                <div className="rounded-lg border border-gray-200 p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Field name, e.g. Pain score"
                            maxLength={40}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-acc-clr"
                        />
                        <input
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="Unit (optional)"
                            maxLength={20}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-acc-clr"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {(["number", "text"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                                    type === t
                                        ? "bg-acc-clr text-pry-clr border-acc-clr"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-acc-clr"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={() => setAdding(false)}
                            disabled={saving}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-gray-400 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc-clr text-pry-clr text-xs font-medium disabled:opacity-50"
                        >
                            {saving && <Loader2 size={12} className="animate-spin" />}
                            Save field
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:underline"
                >
                    <Plus size={14} />
                    Add custom field
                </button>
            )}
        </div>
    );
}