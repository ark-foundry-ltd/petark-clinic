// src/components/register-comp.tsx

"use client";
import { registerClinic } from "@/lib/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    Loader2, 
    Eye, 
    EyeOff, 
    Check, 
    Building2, 
    Mail, 
    Lock, 
    MapPin, 
    Phone, 
    FileText, 
    Upload,
    ChevronLeft,
    ChevronRight,
    Award,
    FileCheck,
    User
} from "lucide-react";

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

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'certificate') => {
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

    return (
        <main className="min-h-screen flex items-center justify-center bg-bg-clr relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
            {/* Subtle background rings */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-acc-clr/5 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-acc-clr/5 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-acc-clr/3 blur-3xl"></div>
            </div>

            <div className="w-full max-w-2xl bg-pry-clr/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl relative z-10">
                {/* Progress Steps */}
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                                        ${step > stepNumber ? 'bg-acc-clr text-pry-clr' : ''}
                                        ${step === stepNumber ? 'bg-acc-clr text-pry-clr ring-4 ring-acc-clr/20' : ''}
                                        ${step < stepNumber ? 'bg-gray-200 text-gray-500' : ''}
                                    `}>
                                        {step > stepNumber ? <Check className="h-5 w-5" /> : stepNumber}
                                    </div>
                                    <div className="hidden sm:block text-xs mt-2 font-medium text-sec-clr/70 pry-ff">
                                        {stepNumber === 1 && "Clinic Info"}
                                        {stepNumber === 2 && "Address"}
                                        {stepNumber === 3 && "Documents"}
                                    </div>
                                </div>
                                {stepNumber < 3 && (
                                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                                        step > stepNumber ? 'bg-acc-clr' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-6 sec-ff">
                    {/* Step 1: Clinic Information */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <Building2 className="inline h-4 w-4 mr-1" />
                                    Clinic Name
                                </label>
                                <input
                                    type="text"
                                    value={clinicName}
                                    onChange={(e) => setClinicName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                    placeholder="PetArk Veterinary Clinic"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <User className="inline h-4 w-4 mr-1" />
                                    Owner Name
                                </label>
                                <input
                                    type="text"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <Mail className="inline h-4 w-4 mr-1" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                    placeholder="clinic@petark.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <Lock className="inline h-4 w-4 mr-1" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-sec-clr/60 mt-1">Password must be at least 6 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <Phone className="inline h-4 w-4 mr-1" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Address */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <MapPin className="inline h-4 w-4 mr-1" />
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => setAddress({...address, street: e.target.value})}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-sec-clr mb-1">City</label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => setAddress({...address, city: e.target.value})}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                        placeholder="Port Harcourt"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-sec-clr mb-1">State</label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => setAddress({...address, state: e.target.value})}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                        placeholder="Rivers"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-sec-clr mb-1">ZIP Code (Optional) </label>
                                    <input
                                        type="text"
                                        value={address.zipCode}
                                        onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                        placeholder="10001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-sec-clr mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={address.country}
                                        onChange={(e) => setAddress({...address, country: e.target.value})}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                        placeholder="Nigeria"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: License & Documents */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <Award className="inline h-4 w-4 mr-1" />
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                                    placeholder="LIC-12345-67890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <FileText className="inline h-4 w-4 mr-1" />
                                    License Document
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-acc-clr transition-colors duration-200">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-pry-clr rounded-md font-medium text-acc-clr hover:text-acc-clr/80 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange(e, 'license')}
                                                    required
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                                {licenseDocument && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        {licenseDocument.name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    <FileCheck className="inline h-4 w-4 mr-1" />
                                    Owner ID Card
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-acc-clr transition-colors duration-200">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-pry-clr rounded-md font-medium text-acc-clr hover:text-acc-clr/80 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange(e, 'certificate')}
                                                    required
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                                {ownerIDCard && (
                                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        {ownerIDCard.name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sec-clr mb-1">
                                    Owner Passport Photograph (Optional)
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-acc-clr transition-colors duration-200">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-pry-clr rounded-md font-medium text-acc-clr hover:text-acc-clr/80 focus-within:outline-none">
                                                <span>Upload files</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    multiple
                                                    onChange={handleAdditionalDocuments}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB each</p>
                                    </div>
                                </div>
                                {additionalDocuments.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                        {additionalDocuments.map((doc, index) => (
                                            <div key={index} className="text-sm text-green-600 flex items-center justify-between gap-2 bg-green-50 p-2 rounded">
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4" />
                                                    {doc.name}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-4">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-sec-clr bg-pry-clr hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr transition-all duration-200"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-pry-clr bg-acc-clr hover:bg-acc-clr/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr transition-all duration-200"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-pry-clr bg-acc-clr hover:bg-acc-clr/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Register
                                        <Check className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="text-center text-sm">
                        <Link href="/login" className="text-sec-clr/70 hover:text-acc-clr transition-colors duration-200">
                            Already have an account? <span className="font-semibold">Sign in</span>
                        </Link>
                    </div>
                </form>
            </div>

            <style jsx>{`
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