// src/components/register-step1-clinic-info.tsx

import { Building2, Mail, Lock, Phone, User, Eye, EyeOff } from "lucide-react";
import { FieldIcon } from "./register-field-icon";

type Step1Props = {
    clinicName: string;
    setClinicName: (v: string) => void;
    ownerName: string;
    setOwnerName: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    phoneNumber: string;
    setPhoneNumber: (v: string) => void;
};

export default function RegisterStepClinicInfo({
    clinicName,
    setClinicName,
    ownerName,
    setOwnerName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    phoneNumber,
    setPhoneNumber,
}: Readonly<Step1Props>) {
    return (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <label className="block text-sm font-medium text-sec-clr mb-1.5">
                    Clinic Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FieldIcon icon={Building2} />
                    <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                        placeholder="Savannah Veterinary Care"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-sec-clr mb-1.5">
                    Owner Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FieldIcon icon={User} />
                    <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                        placeholder="Dr. Babatunde Adeyomi"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-sec-clr mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FieldIcon icon={Mail} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                        placeholder="dr.tundo@savannahvet.ng"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-sec-clr mb-1.5">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FieldIcon icon={Lock} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-sec-clr mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FieldIcon icon={Phone} />
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                            placeholder="+234 803 942 5510"
                        />
                    </div>
                </div>
            </div>
            <p className="text-xs text-sec-clr/50 -mt-2">Password must be at least 6 characters</p>
        </div>
    );
}