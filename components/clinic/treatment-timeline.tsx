// main component, imports and renders all three

// components/clinic/treatment-timeline.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useStore";
import {
    getPetTreatmentTimeline,
    type Treatment,
    type PlanUsage,
} from "@/lib/treatment";
import AddTreatmentForm from "./add-treatment-form";
import TreatmentCard from "./treatment-card";
import {
    Syringe, Plus, Lock, Sparkles,
    Loader2, AlertTriangle, Clock,
    ChevronLeft, ChevronRight,
} from "lucide-react";
import { getPlanInfo } from "@/lib/plan";

interface TreatmentTimelineProps {
    petId: string;
    visitId?: string;
    petWeightKg?: number;
    petSpecies?: string;
}

export default function TreatmentTimeline({ petId, visitId, petWeightKg, petSpecies }: Readonly<TreatmentTimelineProps>) {
    const { profile } = useAuthStore();
    
    const { plan, status } = getPlanInfo(profile);
    const hasAccess = !!plan && plan !== "free" && status === "active"; // standard, pro, enterprise

    const [timeline, setTimeline] = useState<Treatment[]>([]);
    const [summary, setSummary] = useState<{ upcoming: number; overdue: number } | null>(null);
    const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>("all");

    const fetchTimeline = async (targetPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPetTreatmentTimeline(petId, { page: targetPage, limit: 4 });
            setTimeline(res.data.timeline);
            setSummary({
                upcoming: res.data.summary.upcoming,
                overdue: res.data.summary.overdue,
            });
            setPlanUsage(res.data.planUsage);
            setTotalPages(res.pagination.totalPages || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load treatments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasAccess || !petId) return;
        const timer = window.setTimeout(() => {
            void fetchTimeline(page);
        }, 0);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [petId, hasAccess, page]);

    const handleAdded = (t: Treatment) => {
        setShowAdd(false);
        // Refetch to keep pagination/summary/planUsage accurate rather than
        // manually patching local state
        fetchTimeline(page);
    };

    const handleUpdate = (updated: Treatment) => {
        setTimeline(prev => prev.map(t => t._id === updated._id ? updated : t));
    };

    const handleDelete = (id: string) => {
        setTimeline(prev => prev.filter(t => t._id !== id));
        fetchTimeline(page);
    };

    const availableTypes = Array.from(new Set(timeline.map(t => t.type)));
    const filtered = activeFilter === "all"
        ? timeline
        : timeline.filter(t => t.type === activeFilter);

    // ── No access (free plan) ────────────────────────────────────
    if (!hasAccess) {
        return (
            <div className="bg-pry-clr rounded-xl border border-violet-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Syringe className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold text-sec-clr">Vaccination & Medication Timeline</h3>
                    <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto">Standard+</span>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5 text-violet-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Track Vaccinations & Medications</p>
                    <p className="text-xs text-gray-400 max-w-xs mb-4">
                        Log treatments, set due dates, and get automatic reminders when vaccinations or medications are due.
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-violet-600 font-medium">
                        <Sparkles size={13} />
                        Available on Standard and Pro plans
                    </div>
                </div>
            </div>
        );
    }

    // ── Loading (initial) ────────────────────────────────────────
    if (loading && timeline.length === 0) {
        return (
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Syringe className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-sec-clr">Vaccination & Medication Timeline</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold text-sec-clr">Vaccination & Medication Timeline</h3>
                <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto capitalize">
                    {plan} ✦
                </span>
                <button
                    onClick={() => setShowAdd(true)}
                    disabled={planUsage ? !planUsage.unlimited && planUsage.remaining === 0 : false}
                    className="flex items-center gap-1 text-xs font-medium text-acc-clr hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                    <Plus size={13} />
                    Add
                </button>
            </div>

            {/* Plan usage (only shown when capped, i.e. standard) */}
            {planUsage && !planUsage.unlimited && (
                <div className="flex items-center justify-between text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <span className="text-gray-500">
                        Treatments this month:{" "}
                        <span className="font-semibold text-gray-700">
                            {planUsage.used}/{planUsage.limit}
                        </span>
                    </span>
                    {planUsage.remaining === 0 && (
                        <span className="text-amber-600 font-medium">Limit reached — upgrade to Pro for unlimited</span>
                    )}
                </div>
            )}

            {/* Summary pills */}
            {summary && (summary.overdue > 0 || summary.upcoming > 0) && (
                <div className="flex items-center gap-2 flex-wrap">
                    {summary.overdue > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                            <AlertTriangle size={11} />
                            {summary.overdue} overdue
                        </span>
                    )}
                    {summary.upcoming > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            <Clock size={11} />
                            {summary.upcoming} upcoming
                        </span>
                    )}
                </div>
            )}

            {/* Add form */}
            {showAdd && (
                <AddTreatmentForm
                    petId={petId}
                    visitId={visitId}
                    petWeightKg={petWeightKg}
                    petSpecies={petSpecies}
                    onAdded={handleAdded}
                    onCancel={() => setShowAdd(false)}
                />
            )}

            {/* Filter tabs — built from types actually present in this page's data */}
            {timeline.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        onClick={() => setActiveFilter("all")}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
                            activeFilter === "all"
                                ? "bg-sec-clr text-white border-sec-clr"
                                : "border-gray-200 text-gray-500 hover:border-gray-400"
                        }`}
                    >
                        all
                    </button>
                    {availableTypes.map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveFilter(t)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
                                activeFilter === t
                                    ? "bg-sec-clr text-white border-sec-clr"
                                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Empty state */}
            {!error && filtered.length === 0 && !showAdd && (
                <div className="text-center py-8">
                    <Syringe size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No treatments recorded yet</p>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="mt-3 text-xs text-acc-clr font-medium hover:opacity-80"
                    >
                        Add the first treatment
                    </button>
                </div>
            )}

            {/* Treatment cards */}
            <div className="space-y-3">
                {filtered.map(treatment => (
                    <TreatmentCard
                        key={treatment._id}
                        treatment={treatment}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1 || loading}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={13} />
                        Prev
                    </button>
                    <span className="text-xs text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages || loading}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight size={13} />
                    </button>
                </div>
            )}
        </div>
    );
}