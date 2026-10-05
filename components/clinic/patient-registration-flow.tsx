// components/clinic/patient-registration-flow.tsx

"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import {
    registerPatient,
    ClinicPatientRecord,
    resolveOwnerByEmail,
    ResolvedOwner,
    ResolvedOwnerPet,
} from "@/lib/clinic-patient";
import { Loader2, Search, UserCheck, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import RegisterPatient from "./register-patient";

type Mode = "search" | "resolved" | "new-pet-for-owner" | "new-owner";

interface PatientRegistrationFlowProps {
    registrationFee: number;
    registrationEnabled: boolean;
    prefillOwnerFullname?: string;
    prefillOwnerPhone?: string;
    onRegistered: (patient: ClinicPatientRecord) => void;
    onCancel?: () => void;
}

export default function PatientRegistrationFlow({
    registrationFee,
    registrationEnabled,
    prefillOwnerFullname,
    prefillOwnerPhone,
    onRegistered,
    onCancel,
}: Readonly<PatientRegistrationFlowProps>) {
    const [mode, setMode] = useState<Mode>("search");
    const [email, setEmail] = useState("");
    const [resolving, setResolving] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);

    const [resolvedOwner, setResolvedOwner] = useState<ResolvedOwner | null>(null);
    const [resolvedPets, setResolvedPets] = useState<ResolvedOwnerPet[]>([]);
    const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set());
    const [regNoByPet, setRegNoByPet] = useState<Record<string, string>>({});
    const [registeringSelected, setRegisteringSelected] = useState(false);

    const handleResolve = async () => {
        if (!email.trim()) return;
        setResolving(true);
        setResolveError(null);
        try {
            const result = await resolveOwnerByEmail(email.trim());
            setResolvedOwner(result.owner);
            setResolvedPets(result.pets);
            setSelectedPetIds(new Set());
            setRegNoByPet({});
            setMode("resolved");
        } catch (err) {
            if (err instanceof AxiosError && err.response?.status === 404) {
                setResolveError("No account found with this email.");
            } else {
                setResolveError("Something went wrong looking that up. Please try again.");
            }
        } finally {
            setResolving(false);
        }
    };

    const togglePet = (petId: string) => {
        setSelectedPetIds((prev) => {
            const next = new Set(prev);
            if (next.has(petId)) {
                next.delete(petId);
                setRegNoByPet((regs) => {
                    const { [petId]: _removed, ...rest } = regs;
                    return rest;
                });
            } else {
                next.add(petId);
            }
            return next;
        });
    };

    const setRegNoFor = (petId: string, value: string) => {
        setRegNoByPet((prev) => ({ ...prev, [petId]: value }));
    };

    const selectedPetIdsList = Array.from(selectedPetIds);
    const allSelectedHaveRegNo =
        selectedPetIdsList.length > 0 &&
        selectedPetIdsList.every((id) => regNoByPet[id]?.trim());

    const handleRegisterSelected = async () => {
        if (!allSelectedHaveRegNo) return;
        setRegisteringSelected(true);

        const results = await Promise.allSettled(
            selectedPetIdsList.map((petId) =>
                registerPatient({ petId, registrationNo: regNoByPet[petId].trim() })
            )
        );

        let successCount = 0;
        const stillFailed: string[] = [];
        results.forEach((result, i) => {
            const petId = selectedPetIdsList[i];
            if (result.status === "fulfilled") {
                successCount += 1;
                onRegistered(result.value);
            } else {
                stillFailed.push(petId);
                const petName = resolvedPets.find((p) => p._id === petId)?.name ?? "a pet";
                const message =
                    result.reason instanceof AxiosError
                        ? result.reason.response?.data?.error ?? `Failed to register ${petName}.`
                        : `Failed to register ${petName}.`;
                toast.error(message);
            }
        });

        if (successCount > 0) {
            toast.success(
                successCount === 1
                    ? "Patient registered successfully!"
                    : `${successCount} patients registered successfully!`
            );
        }

        setSelectedPetIds(new Set(stillFailed));
        setRegisteringSelected(false);
    };

    const resetToSearch = () => {
        setMode("search");
        setEmail("");
        setResolveError(null);
        setResolvedOwner(null);
        setResolvedPets([]);
        setSelectedPetIds(new Set());
        setRegNoByPet({});
    };

    // ─── New pet for a resolved owner ──────────────────────────────────────
    if (mode === "new-pet-for-owner" && resolvedOwner) {
        return (
            <RegisterPatient
                registrationFee={registrationFee}
                registrationEnabled={registrationEnabled}
                ownerId={resolvedOwner._id}
                ownerDisplayName={resolvedOwner.fullname}
                onRegistered={(patient) => {
                    onRegistered(patient);
                    setMode("resolved");
                }}
                onCancel={() => setMode("resolved")}
            />
        );
    }

    // ─── Brand-new owner, no account found or explicitly skipped ──────────
    if (mode === "new-owner") {
        return (
            <div className="space-y-3">
                <button
                    onClick={resetToSearch}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sec-clr transition-colors sec-ff"
                >
                    <ArrowLeft size={15} /> Back to search
                </button>
                <RegisterPatient
                    registrationFee={registrationFee}
                    registrationEnabled={registrationEnabled}
                    prefillOwnerFullname={prefillOwnerFullname}
                    prefillOwnerPhone={prefillOwnerPhone}
                    onRegistered={onRegistered}
                    onCancel={onCancel}
                />
            </div>
        );
    }

    // ─── Resolved owner — pick existing pet(s) or add a new one ───────────
    if (mode === "resolved" && resolvedOwner) {
        return (
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 pry-ff space-y-5">
                <button
                    onClick={resetToSearch}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sec-clr transition-colors sec-ff"
                >
                    <ArrowLeft size={15} /> Back to search
                </button>

                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <div className="p-2 rounded-lg bg-acc-clr/10">
                        <UserCheck size={18} className="text-acc-clr" />
                    </div>
                    <div>
                        <p className="font-semibold text-sec-clr">{resolvedOwner.fullname}</p>
                        <p className="text-sm text-gray-500">{resolvedOwner.phoneNumber} &middot; {resolvedOwner.email}</p>
                    </div>
                </div>

                {resolvedPets.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-sec-clr">
                            Which pet{resolvedPets.length > 1 ? "s are" : " is"} coming in today?
                        </h3>
                        <div className="space-y-2">
                            {resolvedPets.map((pet) => {
                                const isSelected = selectedPetIds.has(pet._id);
                                return (
                                    <div
                                        key={pet._id}
                                        className={`border rounded-lg px-3 py-2.5 transition-colors ${
                                            isSelected ? "border-acc-clr" : "border-gray-200"
                                        }`}
                                    >
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => togglePet(pet._id)}
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-800">{pet.name}</span>
                                                <span className="text-sm text-gray-400"> &middot; {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</span>
                                            </div>
                                        </label>
                                        {isSelected && (
                                            <input
                                                value={regNoByPet[pet._id] ?? ""}
                                                onChange={(e) => setRegNoFor(pet._id, e.target.value)}
                                                placeholder="Registration number (e.g. 001/27)"
                                                className="mt-2 ml-7 border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-[calc(100%-1.75rem)]"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                        onClick={() => setMode("new-pet-for-owner")}
                        className="flex items-center gap-1.5 text-sm font-medium text-acc-clr hover:opacity-80 transition"
                    >
                        <Plus size={15} /> Add a new pet for this owner
                    </button>
                    <button
                        onClick={handleRegisterSelected}
                        disabled={!allSelectedHaveRegNo || registeringSelected}
                        className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {registeringSelected ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                            </>
                        ) : (
                            `Register Selected${selectedPetIdsList.length > 0 ? ` (${selectedPetIdsList.length})` : ""}`
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ─── Default: search by email ──────────────────────────────────────────
    return (
        <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 pry-ff space-y-4">
            <h3 className="font-semibold text-sec-clr">Find owner by email</h3>
            <p className="text-sm text-gray-500">
                Check if this owner already has a PetArk account before registering a new one.
            </p>

            {resolveError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                    {resolveError}
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleResolve()}
                    placeholder="owner@example.com"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                    onClick={handleResolve}
                    disabled={resolving || !email.trim()}
                    className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search size={15} />}
                    Find
                </button>
            </div>

            <div className="flex items-center justify-between pt-2">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-sec-clr transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={() => setMode("new-owner")}
                    className="text-sm font-medium text-acc-clr hover:opacity-80 transition ml-auto"
                >
                    This is a new owner →
                </button>
            </div>
        </div>
    );
}