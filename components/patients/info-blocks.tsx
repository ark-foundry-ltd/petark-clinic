"use client";

import type { ReactNode } from "react";
import { Droplet } from "lucide-react";
import type { HealthProfile } from "@/lib/clinic-patient";

export function InfoRow({ label, value }: Readonly<{ label: string; value?: ReactNode }>) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-800 break-words">{value || "-"}</dd>
        </div>
    );
}

export function Section({
    title,
    action,
    children,
}: Readonly<{ title: string; action?: ReactNode; children: ReactNode }>) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">{title}</h3>
                {action}
            </div>
            {children}
        </section>
    );
}

export function Chips({ items, tone }: Readonly<{ items: string[]; tone: "amber" | "red" | "gray" }>) {
    if (items.length === 0) return <span className="text-sm text-gray-400">None recorded</span>;
    const toneClass = {
        amber: "bg-amber-50 text-amber-700 border-amber-100",
        red: "bg-red-50 text-red-700 border-red-100",
        gray: "bg-gray-100 text-gray-700 border-gray-200",
    }[tone];
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span key={item} className={`px-3 py-1 rounded-full text-xs font-medium border ${toneClass}`}>
                    {item}
                </span>
            ))}
        </div>
    );
}

export function HealthView({ hp }: Readonly<{ hp?: HealthProfile }>) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Blood type</p>
                    {hp?.bloodType ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-semibold">
                            <Droplet size={13} /> {hp.bloodType}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">Not recorded</span>
                    )}
                </div>
                <InfoRow
                    label="Neutered / spayed"
                    value={hp?.neutered === true ? "Yes" : hp?.neutered === false ? "No" : "Not recorded"}
                />
                <InfoRow label="Microchip no." value={hp?.microchipNo} />
            </div>

            <div>
                <p className="text-xs text-gray-400 mb-1.5">Allergies</p>
                <Chips items={hp?.allergies ?? []} tone="amber" />
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1.5">Known drug reactions</p>
                <Chips items={hp?.knownDrugReactions ?? []} tone="red" />
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1.5">Chronic conditions</p>
                <Chips items={hp?.chronicConditions ?? []} tone="gray" />
            </div>
            {hp?.notes && (
                <div>
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.notes}</p>
                </div>
            )}
        </div>
    );
}