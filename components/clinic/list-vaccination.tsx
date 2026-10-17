"use client";

import { Bell, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate, getDueStatus, latestDoseIds, type DueStatus, type Vaccination } from "@/lib/vaccination";
import VaccinationReminders from "./vaccination-reminders";

const BADGES: Record<Exclude<DueStatus, "none">, { label: string; className: string }> = {
    overdue: { label: "Overdue", className: "bg-red-50 text-red-700" },
    "due-soon": { label: "Due soon", className: "bg-amber-50 text-amber-700" },
    upcoming: { label: "Up to date", className: "bg-green-50 text-green-700" },
};

interface Props {
    vaccinations: Vaccination[];
    canManage: boolean;
    canRemind: boolean;
    onEdit: (v: Vaccination) => void;
    onDelete: (v: Vaccination) => void;
}

export default function ListVaccination({ vaccinations, canManage, canRemind, onEdit, onDelete }: Props) {
    const [openReminders, setOpenReminders] = useState<string | null>(null);
    const latestIds = useMemo(() => latestDoseIds(vaccinations), [vaccinations]);

    if (vaccinations.length === 0) {
        return <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No vaccinations recorded yet.</p>;
    }

    return (
        <ul className="space-y-3">
            {vaccinations.map((v) => {
                const status = latestIds.has(v._id) ? getDueStatus(v.nextDueDate) : "none";
                const badge = status === "none" ? null : BADGES[status];
                const remindersOpen = openReminders === v._id;

                return (
                    <li key={v._id} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-medium text-gray-900">{v.vaccineName}</h3>
                                    {badge && (
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                    Given {formatDate(v.administeredAt)}
                                    {v.nextDueDate && ` · Next due ${formatDate(v.nextDueDate)}`}
                                    {v.batchNumber && ` · Batch ${v.batchNumber}`}
                                </p>
                                {v.notes && <p className="mt-1 text-sm text-gray-500">{v.notes}</p>}
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                                {canRemind && v.nextDueDate && (
                                    <button
                                        type="button"
                                        onClick={() => setOpenReminders(remindersOpen ? null : v._id)}
                                        aria-label="Show reminders"
                                        aria-expanded={remindersOpen}
                                        className={`rounded p-2 hover:bg-gray-100 ${remindersOpen ? "text-green-700" : "text-gray-500"}`}
                                    >
                                        <Bell className="h-4 w-4" />
                                    </button>
                                )}
                                {canManage && (
                                    <>
                                        <button type="button" onClick={() => onEdit(v)} aria-label="Edit vaccination" className="rounded p-2 text-gray-500 hover:bg-gray-100">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => onDelete(v)} aria-label="Delete vaccination" className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {remindersOpen && (
                            <div className="mt-3 border-t border-gray-100 pt-3">
                                <VaccinationReminders vaccinationId={v._id} readOnly={!canManage} />
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}