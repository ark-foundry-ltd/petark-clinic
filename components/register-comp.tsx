// src/components/register-comp.tsx

"use client";
import { registerClinic } from "@/lib/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import StepIndicator from "./register-step-indicator";
import RegisterStepClinicInfo from "./register-step1-clinic-info";
import RegisterStepAddress from "./register-step2-address";
import RegisterStepDocuments from "./register-step3-documents";

interface RegisterError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}

function isRegisterError(error: unknown): error is RegisterError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        'message' in error
    );
}

export default function RegisterComp() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Clinic Info
    const [clinicName, setClinicName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Step 2: Address
    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
    });

    // Step 3: License & Documents
    const [licenseNumber, setLicenseNumber] = useState("");
    const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
    const [ownerIDCard, setOwnerIDCard] = useState<File | null>(null);
    const [ownerPassport, setOwnerPassport] = useState<File | null>(null);
    const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);

    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleNext = () => {
        setError("");

        // Validate Step 1
        if (step === 1) {
            if (!clinicName.trim()) {
                setError("Clinic name is required");
                return;
            }
            if (!ownerName.trim()) {
                setError("Owner name is required");
                return;
            }
            if (!email.trim()) {
                setError("Email is required");
                return;
            }
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                setError("Please enter a valid email address");
                return;
            }
            if (!password) {
                setError("Password is required");
                return;
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters");
                return;
            }
            if (!phoneNumber.trim()) {
                setError("Phone number is required");
                return;
            }
        }

        // Validate Step 2
        if (step === 2) {
            if (!address.street.trim()) {
                setError("Street address is required");
                return;
            }
            if (!address.city.trim()) {
                setError("City is required");
                return;
            }
            if (!address.state.trim()) {
                setError("State is required");
                return;
            }
            if (!address.country.trim()) {
                setError("Country is required");
                return;
            }
        }

        // Validate Step 3
        if (step === 3) {
            if (!licenseNumber.trim()) {
                setError("License number is required");
                return;
            }
            if (!licenseDocument) {
                setError("License document is required");
                return;
            }
            if (!ownerIDCard) {
                setError("Owner ID card is required");
                return;
            }
        }

        if (step < 3) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setError("");
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = {
                clinicName,
                ownerName,
                email,
                password,
                address: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zipCode: address.zipCode,
                    country: address.country,
                },
                phoneNumber,
                licenseNumber,
                licenseDocument: licenseDocument!,
                ownerIDCard: ownerIDCard!,
                ownerPassport: ownerPassport ?? undefined,
            };

            await registerClinic(formData);
            router.push("/login");
        } catch (error) {
            console.error("Registration error:", error);

            if (isRegisterError(error)) {
                if (error.status === 409) {
                    setError("Email or license number already exists");
                } else if (error.status === 400) {
                    setError(error.message || "Invalid registration data");
                } else if (error.status === 0) {
                    setError("Unable to connect to server. Please check your connection.");
                } else {
                    setError(error.message || "Registration failed. Please try again.");
                }
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'license' | 'certificate' | 'passport'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a PDF, JPEG, or PNG file");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("File size must be less than 10MB");
            return;
        }

        if (type === 'license') {
            setLicenseDocument(file);
        } else if (type === 'certificate') {
            setOwnerIDCard(file);
        } else if (type === 'passport') {
            setOwnerPassport(file);
        }
    };

    const handleAdditionalDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
        });

        if (validFiles.length !== files.length) {
            setError("Some files were skipped. Please ensure files are PDF, JPEG, or PNG and under 10MB");
        }

        setAdditionalDocuments([...additionalDocuments, ...validFiles]);
    };

    const removeDocument = (index: number) => {
        setAdditionalDocuments(additionalDocuments.filter((_, i) => i !== index));
    };

    const viewFile = (file: File) => {
        window.open(URL.createObjectURL(file), "_blank");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-bg-clr relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
            {/* Subtle background rings */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-acc-clr/5 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-acc-clr/5 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-acc-clr/3 blur-3xl"></div>
            </div>

            <div className="w-full max-w-xl bg-pry-clr/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl relative z-10">
                {/* Header */}
                <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-2 text-center">
                    <h1 className="pry-ff text-2xl sm:text-[26px] font-semibold text-sec-clr">
                        Set up your clinic
                    </h1>
                    <p className="sec-ff text-sm text-acc-clr mt-1">
                        Let&apos;s get your PetArk workspace ready.
                    </p>
                </div>

                <StepIndicator step={step} />

                <form onSubmit={handleRegister} className="px-6 sm:px-8 pb-8 sm:pb-10 space-y-5 pry-ff">
                    {step === 1 && (
                        <RegisterStepClinicInfo
                            clinicName={clinicName}
                            setClinicName={setClinicName}
                            ownerName={ownerName}
                            setOwnerName={setOwnerName}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber}
                        />
                    )}

                    {step === 2 && (
                        <RegisterStepAddress address={address} setAddress={setAddress} />
                    )}

                    {step === 3 && (
                        <RegisterStepDocuments
                            licenseNumber={licenseNumber}
                            setLicenseNumber={setLicenseNumber}
                            licenseDocument={licenseDocument}
                            setLicenseDocument={setLicenseDocument}
                            ownerIDCard={ownerIDCard}
                            setOwnerIDCard={setOwnerIDCard}
                            ownerPassport={ownerPassport}
                            setOwnerPassport={setOwnerPassport}
                            additionalDocuments={additionalDocuments}
                            onFileChange={handleFileChange}
                            onAdditionalDocuments={handleAdditionalDocuments}
                            onRemoveAdditionalDocument={removeDocument}
                            onViewFile={viewFile}
                        />
                    )}

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-2">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center justify-center gap-1.5 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-sec-clr bg-pry-clr hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr transition-all duration-200"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-pry-clr bg-acc-clr hover:bg-acc-clr/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr transition-all duration-200"
                            >
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-pry-clr bg-acc-clr hover:bg-acc-clr/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Create my clinic
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="flex items-center gap-1.5 text-sec-clr/50">
                            <ShieldCheck className="h-3.5 w-3.5 text-acc-clr" />
                            Bank-grade 256-bit encryption &amp; HIPAA-aligned
                        </span>
                        <Link href="/login" className="text-sec-clr/70 hover:text-acc-clr transition-colors duration-200">
                            Already have an account? <span className="font-semibold">Sign in</span>
                        </Link>
                    </div>
                </form>
            </div>

            {/* global: the step components render className="animate-fadeIn" from their
                own files, so these keyframes must be global rather than scoped to this file */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </main>
    );
}