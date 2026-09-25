// src/components/register-step-indicator.tsx

import { Check } from "lucide-react";

export const STEP_META = [
    { n: 1, label: "Clinic Info" },
    { n: 2, label: "Address" },
    { n: 3, label: "Documents" },
];

type StepIndicatorProps = {
    step: number;
};

export default function StepIndicator({ step }: StepIndicatorProps) {
    return (
        <div className="px-6 sm:px-8 pt-6 pb-4">
            <div className="flex items-center">
                {STEP_META.map((s, idx) => (
                    <div
                        key={s.n}
                        className={`flex items-center ${idx < STEP_META.length - 1 ? "flex-1" : ""}`}
                    >
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                                    step > s.n
                                        ? "bg-acc-clr text-pry-clr"
                                        : step === s.n
                                        ? "bg-acc-clr text-pry-clr ring-4 ring-acc-clr/20"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {step > s.n ? <Check className="h-3.5 w-3.5" /> : s.n}
                            </div>
                            <span
                                className={`sec-ff text-sm font-medium whitespace-nowrap ${
                                    step >= s.n ? "text-acc-clr" : "text-sec-clr/40"
                                }`}
                            >
                                {s.label}
                            </span>
                        </div>
                        {idx < STEP_META.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-300 ${
                                    step > s.n ? "bg-acc-clr" : "bg-gray-200"
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}