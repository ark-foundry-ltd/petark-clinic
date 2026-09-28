// components/clinic/update-health-profile.tsx
"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    updateHealthProfile,
    type HealthProfile,
    type HealthProfileInput,
} from "@/lib/clinic-patient";
import HealthProfileFields from "./health-profile-fields";

interface UpdateHealthProfileProps {
    clinicPatientId: string;
    // undefined for patients registered before the health profile existed
    initial?: HealthProfile;
    onSaved: (profile: HealthProfile) => void;
    onCancel: () => void;
}

export default function UpdateHealthProfile({
    clinicPatientId,
    initial,
    onSaved,
    onCancel,
}: Readonly<UpdateHealthProfileProps>) {
    const [values, setValues] = useState<HealthProfileInput>({
        bloodType: initial?.bloodType ?? null,
        allergies: initial?.allergies ?? [],
        chronicConditions: initial?.chronicConditions ?? [],
        knownDrugReactions: initial?.knownDrugReactions ?? [],
        neutered: initial?.neutered ?? null,
        microchipNo: initial?.microchipNo ?? null,
        notes: initial?.notes ?? null,
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await updateHealthProfile(clinicPatientId, values);
            toast.success("Health profile updated");
            onSaved(updated);
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? err.response?.data?.error ?? "Failed to update health profile."
                    : "Failed to update health profile.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5">
            <HealthProfileFields value={values} onChange={setValues} />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        "Save health profile"
                    )}
                </button>
            </div>
        </div>
    );
}