"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Share2, Search, X, Loader2, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
    createReferral,
    searchClinics,
    type ClinicSearchResult,
} from "@/lib/referral";
import { getVisit, type Visit } from "@/lib/visit";

interface ReferralBtnProps {
    petId: string;
    // Optional — lets the caller refresh a referral list / patient view
    // after a successful referral without this component knowing about it.
    onReferred?: () => void;
}

export default function ReferralBtn({ petId, onReferred }: Readonly<ReferralBtnProps>) {
    const [open, setOpen] = useState(false);

    // Clinic search state
    const [query, setQuery] = useState("");
    const [clinics, setClinics] = useState<ClinicSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedClinic, setSelectedClinic] =
        useState<ClinicSearchResult | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Form state
    const [reason, setReason] = useState("");
    const [clinicalSummary, setClinicalSummary] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Past visits for this pet, to pick which ones to share with the
    // receiving clinic. getVisit() returns every visit for the clinic, so
    // this filters down to just this pet's — same pattern record-details.tsx
    // uses to find a single visit by _id.
    const [pastVisits, setPastVisits] = useState<Visit[]>([]);
    const [loadingVisits, startVisitsTransition] = useTransition();
    const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

    useEffect(() => {
        if (!open) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const result = await searchClinics(query || undefined);
                setClinics(result.data);
            } catch {
                // searchClinics already logs the error — keep the modal usable
                setClinics([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, open]);

    useEffect(() => {
        if (!open) return;

        startVisitsTransition(async () => {
            try {
                const visits = await getVisit();
                setPastVisits(visits.filter((v) => v.petId === petId));
            } catch {
                // getVisit already surfaces its own error message upstream —
                // keep the modal usable with no records to pick from.
                setPastVisits([]);
            }
        });
    }, [open, petId]);

    function resetForm() {
        setQuery("");
        setClinics([]);
        setSelectedClinic(null);
        setReason("");
        setClinicalSummary("");
        setPastVisits([]);
        setSelectedRecordIds([]);
    }

    function handleClose() {
        if (submitting) return;
        setOpen(false);
        resetForm();
    }

    function toggleRecord(visitId: string) {
        setSelectedRecordIds((prev) =>
            prev.includes(visitId)
                ? prev.filter((id) => id !== visitId)
                : [...prev, visitId]
        );
    }

    async function handleSubmit() {
        if (!selectedClinic) {
            toast.error("Pick a clinic to refer this patient to");
            return;
        }
        if (!reason.trim()) {
            toast.error("Add a reason for the referral");
            return;
        }

        setSubmitting(true);
        try {
            await createReferral({
                petId,
                toClinicId: selectedClinic._id,
                reason: reason.trim(),
                clinicalSummary: clinicalSummary.trim() || undefined,
                sharedRecords: selectedRecordIds.length > 0 ? selectedRecordIds : undefined,
            });
            toast.success(`Referral sent to ${selectedClinic.clinicName}`);
            setOpen(false);
            resetForm();
            onReferred?.();
        } catch {
            toast.error("Couldn't send the referral — try again");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-acc-clr px-4 py-2 text-sm font-medium text-white font-sec-ff transition hover:opacity-90"
            >
                <Share2 className="h-4 w-4" />
                Refer
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={handleClose}
                >
                    <div
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-bg-clr p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-pry-ff text-lg font-semibold text-sec-clr">
                                Refer patient
                            </h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={submitting}
                                className="text-sec-clr/60 hover:text-sec-clr"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Clinic picker */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-sec-clr">
                                Refer to
                            </label>

                            {selectedClinic ? (
                                <div className="flex items-center justify-between rounded-lg border border-acc-clr/40 bg-acc-clr/10 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-acc-clr" />
                                        <span className="text-sm font-medium text-sec-clr">
                                            {selectedClinic.clinicName}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClinic(null)}
                                        className="text-xs text-sec-clr/60 underline hover:text-sec-clr"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sec-clr/40" />
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search clinics by name or service..."
                                            className="w-full rounded-lg border border-sec-clr/20 py-2 pl-9 pr-3 text-sm text-sec-clr outline-none focus:border-acc-clr"
                                        />
                                    </div>

                                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-sec-clr/10">
                                        {searching ? (
                                            <div className="flex items-center justify-center gap-2 py-4 text-sm text-sec-clr/50">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Searching...
                                            </div>
                                        ) : clinics.length === 0 ? (
                                            <p className="py-4 text-center text-sm text-sec-clr/50">
                                                {query
                                                    ? "No clinics match that search"
                                                    : "Start typing to find a clinic"}
                                            </p>
                                        ) : (
                                            clinics.map((clinic) => (
                                                <button
                                                    key={clinic._id}
                                                    type="button"
                                                    onClick={() => setSelectedClinic(clinic)}
                                                    className="block w-full border-b border-sec-clr/5 px-3 py-2 text-left text-sm last:border-none hover:bg-acc-clr/5"
                                                >
                                                    <span className="font-medium text-sec-clr">
                                                        {clinic.clinicName}
                                                    </span>
                                                    {clinic.address && (
                                                        <span className="block text-xs text-sec-clr/50">
                                                            {clinic.address.street}, {clinic.address.city}
                                                        </span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-sec-clr">
                                Reason for referral
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Needs orthopedic surgery"
                                className="w-full rounded-lg border border-sec-clr/20 px-3 py-2 text-sm text-sec-clr outline-none focus:border-pry-clr"
                            />
                        </div>

                        {/* Clinical summary */}
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-sec-clr">
                                Clinical summary{" "}
                                <span className="text-sec-clr/40">(optional)</span>
                            </label>
                            <textarea
                                value={clinicalSummary}
                                onChange={(e) => setClinicalSummary(e.target.value)}
                                rows={3}
                                placeholder="Relevant history, findings, or notes for the receiving clinic"
                                className="w-full resize-none rounded-lg border border-sec-clr/20 px-3 py-2 text-sm text-sec-clr outline-none focus:border-pry-clr"
                            />
                        </div>

                        {/* Shared past visit records */}
                        <div className="mb-6">
                            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-sec-clr">
                                <FileText className="h-3.5 w-3.5" />
                                Share past visit records{" "}
                                <span className="text-sec-clr/40 font-normal">(optional)</span>
                            </label>

                            {loadingVisits ? (
                                <div className="flex items-center justify-center gap-2 py-4 text-sm text-sec-clr/50">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading visits...
                                </div>
                            ) : pastVisits.length === 0 ? (
                                <p className="py-3 text-center text-sm text-sec-clr/50 rounded-lg border border-dashed border-sec-clr/15">
                                    No past visits recorded for this pet yet
                                </p>
                            ) : (
                                <div className="max-h-40 overflow-y-auto rounded-lg border border-sec-clr/10 divide-y divide-sec-clr/5">
                                    {pastVisits.map((visit) => {
                                        const checked = selectedRecordIds.includes(visit._id);
                                        const snippet =
                                            visit.soap?.assessment ||
                                            visit.soap?.subjective ||
                                            "No notes recorded";
                                        return (
                                            <label
                                                key={visit._id}
                                                className="flex items-start gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-acc-clr/5"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleRecord(visit._id)}
                                                    className="mt-0.5 rounded border-sec-clr/30"
                                                />
                                                <span className="min-w-0">
                                                    <span className="flex items-center gap-2">
                                                        <span className="font-medium text-sec-clr">
                                                            {new Date(visit.createdAt).toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                        <span
                                                            className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                                                                visit.status === "completed"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                        >
                                                            {visit.status}
                                                        </span>
                                                    </span>
                                                    <span className="block text-xs text-sec-clr/50 truncate">
                                                        {snippet}
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={submitting}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-sec-clr/70 hover:text-sec-clr"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-acc-clr px-4 py-2 text-sm font-medium text-pry-clr transition hover:opacity-90 disabled:opacity-60"
                            >
                                {submitting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Send referral
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}