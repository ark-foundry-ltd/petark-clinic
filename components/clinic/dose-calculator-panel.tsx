// components/clinic/dose-calculator-panel.tsx
// the calculator widget

"use client";

import { useEffect, useState } from "react";
import {
    listDrugs,
    calculateDosage,
    type Drug,
    type DosageResult,
} from "@/lib/drug-calculator";
import { Calculator, Loader2, X, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface DoseCalculatorPanelProps {
    defaultWeight?: number;
    defaultSpecies?: string;
    onApply: (result: DosageResult) => void;
    onClose: () => void;
}

export default function DoseCalculatorPanel({
    defaultWeight,
    defaultSpecies,
    onApply,
    onClose,
}: Readonly<DoseCalculatorPanelProps>) {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loadingDrugs, setLoadingDrugs] = useState(true);
    const [selectedDrugKey, setSelectedDrugKey] = useState("");
    const [weight, setWeight] = useState(defaultWeight ? String(defaultWeight) : "");
    const [species, setSpecies] = useState(defaultSpecies || "");
    const [concentration, setConcentration] = useState("");
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<DosageResult | null>(null);
    const [calcError, setCalcError] = useState<string | null>(null);

    useEffect(() => {
        listDrugs()
            .then(setDrugs)
            .catch(() => setDrugs([]))
            .finally(() => setLoadingDrugs(false));
    }, []);

    const selectedDrug = drugs.find(d => d.key === selectedDrugKey);

    const handleCalculate = async () => {
        if (!selectedDrugKey || !weight || !species) {
            toast.error("Select a drug, and enter weight and species");
            return;
        }
        try {
            setCalculating(true);
            setCalcError(null);
            const res = await calculateDosage({
                drug: selectedDrugKey,
                weight: parseFloat(weight),
                species,
                ...(concentration && { concentration }),
            });
            setResult(res.data);
        } catch (err) {
            setCalcError(err instanceof Error ? err.message : "Failed to calculate dosage");
            setResult(null);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="bg-violet-50/50 rounded-xl border border-violet-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-violet-800 flex items-center gap-1.5">
                    <Calculator size={14} />
                    Dose Calculator
                </p>
                <button type="button" onClick={onClose} className="p-1 hover:bg-violet-100 rounded-lg">
                    <X size={14} className="text-violet-400" />
                </button>
            </div>

            {loadingDrugs ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 size={16} className="animate-spin text-violet-400" />
                </div>
            ) : drugs.length === 0 ? (
                <p className="text-xs text-gray-500">
                    No drugs in your formulary yet. Add drugs to your formulary first to use the calculator.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Drug</label>
                            <select
                                value={selectedDrugKey}
                                onChange={e => { setSelectedDrugKey(e.target.value); setResult(null); }}
                                className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            >
                                <option value="">Select a drug</option>
                                {drugs.map(d => (
                                    <option key={d.key} value={d.key}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Species</label>
                            <select
                                value={species}
                                onChange={e => { setSpecies(e.target.value); setResult(null); }}
                                className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            >
                                <option value="">Select species</option>
                                {(selectedDrug?.species || ["dog", "cat"]).map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={e => { setWeight(e.target.value); setResult(null); }}
                                placeholder="e.g. 15"
                                className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Concentration (optional)</label>
                            <input
                                type="text"
                                value={concentration}
                                onChange={e => setConcentration(e.target.value)}
                                placeholder="e.g. 50mg/ml"
                                className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCalculate}
                        disabled={calculating}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-lg transition-colors"
                    >
                        {calculating ? <Loader2 size={12} className="animate-spin" /> : <Calculator size={12} />}
                        Calculate Dose
                    </button>

                    {calcError && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {calcError}
                        </p>
                    )}

                    {result && (
                        <div className="bg-white rounded-lg border border-violet-100 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-800">{result.drug}</p>
                                {result.doseRange && (
                                    <p className="text-sm font-bold text-violet-700">{result.doseRange}</p>
                                )}
                                {!result.doseRange && result.minDose && (
                                    <p className="text-sm font-bold text-violet-700">
                                        {result.minDose} – {result.maxDose}
                                    </p>
                                )}
                            </div>
                            {result.frequency && (
                                <p className="text-xs text-gray-500">Frequency: {result.frequency}</p>
                            )}
                            {result.duration && (
                                <p className="text-xs text-gray-500">Duration: {result.duration}</p>
                            )}
                            {result.volumeInfo && (
                                <p className="text-xs text-gray-500">
                                    Volume: {result.volumeInfo.minVolumeML}ml – {result.volumeInfo.maxVolumeML}ml
                                </p>
                            )}
                            {result.warnings?.length > 0 && (
                                <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1.5">
                                    <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                    <span>{result.warnings.join(" · ")}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => onApply(result)}
                                className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-acc-clr hover:opacity-90 rounded-lg transition-colors"
                            >
                                <CheckCircle size={12} />
                                Use This Dose
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}