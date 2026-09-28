// components/clinic/health-profile-fields.tsx
"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { HealthProfileInput } from "@/lib/clinic-patient";

const BLOOD_SUGGESTIONS = ["DEA 1.1 positive", "DEA 1.1 negative", "A", "B", "AB"];

interface TagInputProps {
    label: string;
    values: string[];
    onChange: (v: string[]) => void;
    placeholder: string;
}

function TagInput({ label, values, onChange, placeholder }: Readonly<TagInputProps>) {
    const [draft, setDraft] = useState("");

    const add = () => {
        const v = draft.trim();
        if (v && !values.includes(v)) onChange([...values, v]);
        setDraft("");
    };

    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
        }
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">{label}</label>
            {values.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {values.map((v) => (
                        <span
                            key={v}
                            className="flex items-center gap-1 rounded-full bg-acc-clr/10 px-3 py-1 text-xs text-sec-clr"
                        >
                            {v}
                            <button
                                type="button"
                                onClick={() => onChange(values.filter((x) => x !== v))}
                                aria-label={`Remove ${v}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                onBlur={add}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
        </div>
    );
}

interface HealthProfileFieldsProps {
    value: HealthProfileInput;
    onChange: (v: HealthProfileInput) => void;
}

export default function HealthProfileFields({ value, onChange }: Readonly<HealthProfileFieldsProps>) {
    const set = <K extends keyof HealthProfileInput>(key: K, val: HealthProfileInput[K]) =>
        onChange({ ...value, [key]: val });

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-600">Blood type</label>
                <input
                    value={value.bloodType ?? ""}
                    onChange={(e) => set("bloodType", e.target.value)}
                    maxLength={50}
                    placeholder="Type any value, or pick a suggestion"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                    {BLOOD_SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => set("bloodType", s)}
                            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-acc-clr transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <TagInput
                label="Allergies"
                values={value.allergies ?? []}
                onChange={(v) => set("allergies", v)}
                placeholder="Type and press Enter"
            />
            <TagInput
                label="Known drug reactions"
                values={value.knownDrugReactions ?? []}
                onChange={(v) => set("knownDrugReactions", v)}
                placeholder="Type and press Enter"
            />
            <TagInput
                label="Chronic conditions"
                values={value.chronicConditions ?? []}
                onChange={(v) => set("chronicConditions", v)}
                placeholder="Type and press Enter"
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">Neutered / spayed</label>
                    <select
                        value={value.neutered === null || value.neutered === undefined ? "" : String(value.neutered)}
                        onChange={(e) =>
                            set("neutered", e.target.value === "" ? null : e.target.value === "true")
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
                    >
                        <option value="">Not recorded</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">Microchip no.</label>
                    <input
                        value={value.microchipNo ?? ""}
                        onChange={(e) => set("microchipNo", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-600">Notes</label>
                <textarea
                    rows={3}
                    value={value.notes ?? ""}
                    onChange={(e) => set("notes", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                />
            </div>
        </div>
    );
}