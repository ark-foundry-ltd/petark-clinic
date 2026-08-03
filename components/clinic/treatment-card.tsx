// individual treatment display

// components/clinic/treatment-card.tsx

"use client";

import { useState } from "react";
import { updateTreatment, deleteTreatment, type Treatment } from "@/lib/treatment";
import { getTypeConfig, STATUS_CONFIG, formatDate, getDaysUntil } from "./treatment-type-config";
import { Loader2, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TreatmentCardProps {
    treatment: Treatment;
    onUpdate: (t: Treatment) => void;
    onDelete: (id: string) => void;
}

export default function TreatmentCard({ treatment, onUpdate, onDelete }: Readonly<TreatmentCardProps>) {
    const [deleting, setDeleting] = useState(false);
    const [marking, setMarking] = useState(false);
    const config = getTypeConfig(treatment.type);
    const statusConfig = STATUS_CONFIG[treatment.status] || STATUS_CONFIG.active;

    const handleMarkComplete = async () => {
        try {
            setMarking(true);
            const updated = await updateTreatment(treatment._id, { status: "completed" });
            onUpdate(updated);
            toast.success("Marked as completed");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setMarking(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this treatment record?")) return;
        try {
            setDeleting(true);
            await deleteTreatment(treatment._id);
            onDelete(treatment._id);
            toast.success("Treatment deleted");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeleting(false);
        }
    };

    const doseDisplay = treatment.minDoseMg != null && treatment.maxDoseMg != null
        ? `${treatment.minDoseMg}${treatment.unit || "mg"} – ${treatment.maxDoseMg}${treatment.unit || "mg"}`
        : treatment.dosage;

    return (
        <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className={config.color}>{config.icon}</span>
                    <div>
                        <p className={`text-sm font-semibold ${config.color}`}>{treatment.name}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {config.label}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wide">Administered</p>
                    <p className="font-medium mt-0.5">{formatDate(treatment.administeredAt)}</p>
                </div>
                {treatment.nextDueAt && (
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Next Due</p>
                        <p className={`font-medium mt-0.5 ${treatment.status === "overdue" ? "text-red-600" : ""}`}>
                            {formatDate(treatment.nextDueAt)}
                            <span className="text-[10px] text-gray-400 ml-1">
                                ({getDaysUntil(treatment.nextDueAt)})
                            </span>
                        </p>
                    </div>
                )}
                {doseDisplay && (
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Dosage</p>
                        <p className="font-medium mt-0.5">{doseDisplay}</p>
                    </div>
                )}
                {treatment.frequency && (
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Frequency</p>
                        <p className="font-medium mt-0.5">{treatment.frequency}</p>
                    </div>
                )}
            </div>

            {treatment.notes && (
                <p className="mt-2 text-xs text-gray-500 italic">{treatment.notes}</p>
            )}

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/50">
                {treatment.status !== "completed" && (
                    <button
                        onClick={handleMarkComplete}
                        disabled={marking}
                        className="flex items-center gap-1 text-[11px] font-medium text-green-700 hover:text-green-800 transition-colors"
                    >
                        {marking ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                        Mark Complete
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors ml-auto"
                >
                    {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    Delete
                </button>
            </div>
        </div>
    );
}