// src/components/register-step2-address.tsx

import { MapPin, Building2, Landmark, Hash, Globe, ChevronDown } from "lucide-react";
import { FieldIcon } from "./register-field-icon";

type Address = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
};

type Step2Props = {
    address: Address;
    setAddress: (address: Address) => void;
};

export default function RegisterStepAddress({ address, setAddress }: Step2Props) {
    return (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <label className="block text-sm font-medium text-sec-clr mb-1.5">
                    Street Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FieldIcon icon={MapPin} />
                    <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                        placeholder="Plot 14 Admiralty Way, Lekki Phase 1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-sec-clr mb-1.5">City</label>
                    <div className="relative">
                        <FieldIcon icon={Building2} />
                        <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                            placeholder="Lekki"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-sec-clr mb-1.5">State</label>
                    <div className="relative">
                        <FieldIcon icon={Landmark} />
                        <input
                            type="text"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                            placeholder="Lagos State"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-sec-clr">ZIP / Postal Code</label>
                        <span className="text-xs text-amber-600">Optional</span>
                    </div>
                    <div className="relative">
                        <FieldIcon icon={Hash} />
                        <input
                            type="text"
                            value={address.zipCode}
                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200"
                            placeholder="105102"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-sec-clr mb-1.5">
                        Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FieldIcon icon={Globe} />
                        <select
                            value={address.country}
                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            required
                            className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent transition-all duration-200 appearance-none"
                        >
                            <option value="" disabled>Select country</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Kenya">Kenya</option>
                            <option value="South Africa">South Africa</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}