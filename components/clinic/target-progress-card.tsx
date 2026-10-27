// components/clinic/target-progress-card.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Pencil, Plus, Target, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useStore";
import {
    getTargets,
    removeTarget,
    setTarget,
    type AvailableMetric,
    type TargetPace,
    type TargetProgress,
} from "@/lib/target";

const CARD = "bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

// Supportive wording only: being behind pace is amber and neutral, never red or shaming.
const PACE: Record<TargetPace, { label: string; pill: string; bar: string }> = {
    done: { label: "Target reached", pill: "bg-emerald-50 text-emerald-700 ring-emerald-100", bar: "bg-emerald-500" },
    ahead: { label: "Ahead of pace", pill: "bg-emerald-50 text-emerald-700 ring-emerald-100", bar: "bg-emerald-500" },
    on_track: { label: "On track", pill: "bg-sky-50 text-sky-700 ring-sky-100", bar: "bg-acc-clr" },
    behind: { label: "A little behind pace", pill: "bg-amber-50 text-amber-700 ring-amber-100", bar: "bg-amber-500" },
};

export default function TargetProgressCard() {
    const { role } = useAuthStore();
    const canEdit = role === "clinic"; // only the clinic owner sets goals

    const [targets, setTargets] = useState<TargetProgress[]>([]);
    const [available, setAvailable] = useState<AvailableMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setFailed(false);
        try {
            const res = await getTargets();
            setTargets(res.targets);
            setAvailable(res.available);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    function startEdit(metric: string, current?: number) {
        setConfirmRemove(null);
        setEditing(metric);
        setDraft(current ? String(current) : "");
    }

    async function save(m: AvailableMetric) {
        const goal = Number(draft);
        if (!Number.isFinite(goal) || goal <= 0) {
            toast.error("Enter a goal greater than 0.");
            return;
        }
        if (m.unit === "count" && !Number.isInteger(goal)) {
            toast.error(`${m.label} goals must be a whole number.`);
            return;
        }
        setSaving(true);
        try {
            const saved = await setTarget(m.metric, goal);
            setTargets((prev) => [...prev.filter((t) => t.metric !== m.metric), saved]);
            setEditing(null);
            toast.success("Target saved.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't save target.");
        } finally {
            setSaving(false);
        }
    }

    async function remove(metric: string) {
        setSaving(true);
        try {
            await removeTarget(metric);
            setTargets((prev) => prev.filter((t) => t.metric !== metric));
            setConfirmRemove(null);
            toast.success("Target removed.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't remove target.");
        } finally {
            setSaving(false);
        }
    }

    /* ----------------------------- Loading ---------------------------- */
    if (loading) {
        return (
            <section className={`${CARD} p-5 pry-ff animate-pulse space-y-4`} aria-busy="true">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded-lg" />
                <div className="h-16 bg-gray-200 rounded-lg" />
            </section>
        );
    }

    /* ------------------------------ Error ----------------------------- */
    if (failed) {
        return (
            <section className={`${CARD} p-6 pry-ff text-center`}>
                <AlertCircle size={20} className="text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Couldn&apos;t load your targets</p>
                <button
                    onClick={load}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    Try again
                </button>
            </section>
        );
    }

    const hasAnyTarget = targets.length > 0;

    return (
        <section className={`${CARD} pry-ff`}>
            <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-acc-clr/10 ring-1 ring-acc-clr/20 flex items-center justify-center">
                    <Target size={18} className="text-acc-clr" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900">Targets</h2>
                    <p className="text-sm text-gray-500">How your clinic is doing against its goals</p>
                </div>
            </header>

            <div className="p-5 space-y-4">
                {!hasAnyTarget && !canEdit && (
                    <p className="text-sm text-gray-500 py-4 text-center">
                        Your clinic hasn&apos;t set any targets yet.
                    </p>
                )}

                {available.map((m) => {
                    const target = targets.find((t) => t.metric === m.metric);
                    const isEditing = editing === m.metric;

                    // Staff only see targets that exist; owners also see unset ones so they can add a goal
                    if (!target && !canEdit) return null;

                    return (
                        <div key={m.metric} className="rounded-lg border border-gray-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{m.label}</p>
                                    <p className="text-xs text-gray-500 capitalize">{m.period} target</p>
                                </div>
                                {target && !isEditing && (
                                    <span
                                        className={`shrink-0 text-xs font-medium rounded-full px-2.5 py-0.5 ring-1 ${PACE[target.pace].pill}`}
                                    >
                                        {PACE[target.pace].label}
                                    </span>
                                )}
                            </div>

                            {/* Progress */}
                            {target && !isEditing && (
                                <div className="mt-3">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="text-2xl font-semibold tracking-tight text-sec-clr tabular-nums">
                                            {target.percent}%
                                        </span>
                                        <span className="text-xs text-gray-500 tabular-nums text-right">
                                            {target.display.current} of {target.display.goal} {target.periodLabel}
                                        </span>
                                    </div>
                                    <div
                                        role="progressbar"
                                        aria-label={`${target.label} progress`}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={target.percent}
                                        className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden"
                                    >
                                        <div
                                            className={`h-full rounded-full transition-[width] duration-500 ${PACE[target.pace].bar}`}
                                            style={{ width: `${target.percent}%` }}
                                        />
                                    </div>
                                    {target.remaining > 0 && (
                                        <p className="mt-2 text-xs text-gray-500">{target.display.remaining} to go</p>
                                    )}
                                </div>
                            )}

                            {/* Editor */}
                            {isEditing && (
                                <div className="mt-3">
                                    <label htmlFor={`goal-${m.metric}`} className="block text-xs font-medium text-gray-700 mb-1.5">
                                        {m.period === "monthly" ? "Monthly goal" : "Weekly goal"}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            {m.unit === "naira" && (
                                                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-gray-400">
                                                    ₦
                                                </span>
                                            )}
                                            <input
                                                id={`goal-${m.metric}`}
                                                type="number"
                                                inputMode="numeric"
                                                min={1}
                                                step={1}
                                                autoFocus
                                                value={draft}
                                                onChange={(e) => setDraft(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") save(m);
                                                    if (e.key === "Escape") setEditing(null);
                                                }}
                                                placeholder={m.unit === "naira" ? "500000" : "10"}
                                                className={`w-full h-11 ${m.unit === "naira" ? "pl-8" : "pl-3.5"} pr-3.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 tabular-nums placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-acc-clr/40 focus:border-acc-clr transition`}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => save(m)}
                                            disabled={saving}
                                            aria-label="Save goal"
                                            className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-lg bg-acc-clr text-pry-clr hover:bg-acc-clr/90 disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
                                        >
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(null)}
                                            disabled={saving}
                                            aria-label="Cancel"
                                            className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Owner actions */}
                            {canEdit && !isEditing && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
                                    {target ? (
                                        confirmRemove === m.metric ? (
                                            <>
                                                <span className="text-xs text-gray-600">Remove this target?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(m.metric)}
                                                    disabled={saving}
                                                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
                                                >
                                                    Yes, remove
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmRemove(null)}
                                                    className="text-xs font-medium text-gray-600 hover:underline"
                                                >
                                                    Keep
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(m.metric, target.goal)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:underline"
                                                >
                                                    <Pencil size={13} /> Edit goal
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmRemove(m.metric)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800"
                                                >
                                                    <Trash2 size={13} /> Remove
                                                </button>
                                            </>
                                        )
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => startEdit(m.metric)}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-acc-clr hover:underline"
                                        >
                                            <Plus size={14} /> Set a goal
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}