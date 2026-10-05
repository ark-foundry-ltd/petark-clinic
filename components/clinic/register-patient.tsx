// components/clinic/register-patient.tsx

"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import {
    registerPatient,
    ClinicPatientRecord,
    RegisterPatientPayload,
} from "@/lib/clinic-patient";
import { Loader2, ChevronDown } from "lucide-react";
import { toast } from 'sonner';
import type { HealthProfileInput } from "@/lib/clinic-patient";
import HealthProfileFields from "./health-profile-fields";

const SPECIES_OPTIONS = [
    "Dog", "Cat", "Rabbit", "Bird", "Hamster", "Horse",
    "Snake", "Sheep", "Goat", "Cow", "Chicken", "Ferret",
    "Pig", "Turtle", "Lizard", "Fish", "Monkey", "Guinea Pig", "Chipmunk", "Other"
];

interface RegisterPatientProps {
    registrationFee: number;
    registrationEnabled: boolean;
    // Present → registering a NEW pet for a known/resolved owner. Owner fields are hidden.
    ownerId?: string;
    ownerDisplayName?: string;
    prefillOwnerFullname?: string;
    prefillOwnerPhone?: string;
    onRegistered: (patient: ClinicPatientRecord) => void;
    onCancel?: () => void;
}

export default function RegisterPatient({
    registrationFee,
    registrationEnabled,
    ownerId,
    ownerDisplayName,
    prefillOwnerFullname = "",
    prefillOwnerPhone = "",
    onRegistered,
    onCancel,
}: Readonly<RegisterPatientProps>) {
    const [registrationNo, setRegistrationNo] = useState("");
    const [petName, setPetName] = useState("");
    const [species, setSpecies] = useState("");
    const [breed, setBreed] = useState("");
    const [age, setAge] = useState("");
    const [ageUnit, setAgeUnit] = useState<"years" | "months">("years");
    const [color, setColor] = useState("");
    const [weight, setWeight] = useState("");
    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [ownerFullname, setOwnerFullname] = useState(prefillOwnerFullname);
    const [ownerPhone, setOwnerPhone] = useState(prefillOwnerPhone);
    const [ownerEmail, setOwnerEmail] = useState("");
    const [feeWaived, setFeeWaived] = useState(false);
    const [waiverReason, setWaiverReason] = useState("");

    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showHealth, setShowHealth] = useState(false);
    const [health, setHealth] = useState<HealthProfileInput>({});

    const isKnownOwner = Boolean(ownerId);

    const requiredFieldsFilled = isKnownOwner
        ? Boolean(registrationNo.trim() && petName.trim() && species.trim())
        : Boolean(
              registrationNo.trim() &&
              petName.trim() &&
              species.trim() &&
              ownerFullname.trim() &&
              ownerPhone.trim()
          );

    const resetForm = () => {
        setRegistrationNo("");
        setPetName("");
        setSpecies("");
        setBreed("");
        setAge("");
        setAgeUnit("years");
        setColor("");
        setWeight("");
        setWeightUnit("kg");
        setGender("male");
        setOwnerFullname("");
        setOwnerPhone("");
        setOwnerEmail("");
        setFeeWaived(false);
        setWaiverReason("");
    };

    const handleRegister = async () => {
        setError(null);

        if (!requiredFieldsFilled) {
            setError(
                isKnownOwner
                    ? "Registration number, pet name, and species are required."
                    : "Registration number, pet name, species, owner name, and phone number are required."
            );
            return;
        }
        if (feeWaived && !waiverReason.trim()) {
            setError("Please provide a reason for waiving the registration fee.");
            return;
        }

        setRegistering(true);
        try {
            const payload: RegisterPatientPayload = {
                registrationNo: registrationNo.trim(),
                ...health,
                petName: petName.trim(),
                species,
                breed: breed.trim() || undefined,
                age: age || undefined,
                ageUnit,
                color: color.trim() || undefined,
                weight: weight ? Number(weight) : undefined,
                weightUnit,
                gender,
                feeWaived,
                waiverReason: feeWaived ? waiverReason.trim() : undefined,
                ...(isKnownOwner
                    ? { ownerId }
                    : {
                          fullname: ownerFullname.trim(),
                          phoneNumber: ownerPhone.trim(),
                          email: ownerEmail.trim() || undefined,
                })
            };

            const patient = await registerPatient(payload);
            resetForm();
            onRegistered(patient);
            toast.success("Patient registered successfully!");
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? err.response?.data?.error ?? "Failed to register patient. Please try again."
                    : "Failed to register patient. Please try again.";
            setError(message);
            console.error(err);
            toast.error(message);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 pry-ff">
            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    {error}
                </div>
            )}

            {isKnownOwner && (
                <div className="mb-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    Registering a new pet for <span className="font-semibold text-sec-clr">{ownerDisplayName ?? "this owner"}</span>
                </div>
            )}

            {/* Registration Number */}
            <div className="mb-6">
                <h3 className="font-semibold text-sec-clr mb-3">Registration Number</h3>
                <input
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    placeholder="e.g. 001/27"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full md:w-1/2"
                />
                <p className="text-xs text-gray-400 mt-1">Must be unique for this clinic.</p>
            </div>

            {/* Pet Details */}
            <div className="mb-6">
                <h3 className="font-semibold text-sec-clr mb-3">Pet Details</h3>
                <div className="grid gap-3 md:grid-cols-2">
                    <input
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Pet name"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                        value={species}
                        onChange={(e) => setSpecies(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
                    >
                        <option value="">Select species</option>
                        {SPECIES_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as "male" | "female")}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    <input
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        placeholder="Breed"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min={0}
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Age"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                        />
                        <select
                            value={ageUnit}
                            onChange={(e) => setAgeUnit(e.target.value as "years" | "months")}
                            className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-600"
                        >
                            <option value="years">yrs</option>
                            <option value="months">mos</option>
                        </select>
                    </div>

                    <input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="Color (optional)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min={0}
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Weight"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                        />
                        <select
                            value={weightUnit}
                            onChange={(e) => setWeightUnit(e.target.value as "kg" | "lbs")}
                            className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-600"
                        >
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Owner Details — hidden entirely when the owner is already known */}
            {!isKnownOwner && (
                <div className="mb-6">
                    <h3 className="font-semibold text-sec-clr mb-3">Owner Details</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        <input
                            value={ownerFullname}
                            onChange={(e) => setOwnerFullname(e.target.value)}
                            placeholder="Owner name"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                            value={ownerPhone}
                            onChange={(e) => setOwnerPhone(e.target.value)}
                            placeholder="Phone number"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                            value={ownerEmail}
                            onChange={(e) => setOwnerEmail(e.target.value)}
                            placeholder="Email (optional — sends an account setup link)"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
                        />
                    </div>
                </div>
            )}

            <div className="mb-6">
    <button
        type="button"
        onClick={() => setShowHealth((s) => !s)}
        className="flex items-center gap-2 text-sm font-semibold text-sec-clr"
    >
        <ChevronDown size={16} className={`transition-transform ${showHealth ? "rotate-180" : ""}`} />
        Health details <span className="text-gray-400 font-normal">(optional)</span>
    </button>
    {showHealth && (
        <div className="mt-3">
            <HealthProfileFields value={health} onChange={setHealth} />
        </div>
    )}
</div>

            {/* Registration Fee */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sec-clr mb-3">Registration Fee</h3>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">
                        {registrationEnabled
                            ? `₦${registrationFee.toLocaleString()}`
                            : "No registration fee configured"}
                    </span>
                    {registrationEnabled && (
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={feeWaived}
                                onChange={(e) => setFeeWaived(e.target.checked)}
                            />
                            Waive fee
                        </label>
                    )}
                </div>
                {feeWaived && (
                    <input
                        value={waiverReason}
                        onChange={(e) => setWaiverReason(e.target.value)}
                        placeholder="Reason for waiver"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        disabled={registering}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleRegister}
                    disabled={registering || !requiredFieldsFilled}
                    className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    {registering ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                        </>
                    ) : (
                        "Register Patient"
                    )}
                </button>
            </div>
        </div>
    );
}