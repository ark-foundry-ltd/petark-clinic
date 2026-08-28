// components/clinic/search-patient.tsx

/* This component shows all registered patients by default,
* and lets staff search/filter by registration number, name, or phone number.
*/

"use client";

import { useEffect, useState } from "react";
import { searchClinicPatients, getAllPatients, ClinicPatientRecord } from "@/lib/clinic-patient";
import { Search, Loader2, PawPrint, UserPlus } from "lucide-react";

interface SearchPatientProps {
    onProceedToVisit: (patient: ClinicPatientRecord) => void;
    onRegisterAsNew: (prefill: { name?: string; phone?: string }) => void;
}

export default function SearchPatient({
    onProceedToVisit,
    onRegisterAsNew,
}: Readonly<SearchPatientProps>) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [results, setResults] = useState<ClinicPatientRecord[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const loadAllPatients = async () => {
        setLoading(true);
        setError(null);
        setIsSearchMode(false);
        try {
            const { data } = await getAllPatients();
            setResults(data);
        } catch (err) {
            setError("Something went wrong while loading patients. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load all patients on mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAllPatients();
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) {
            // Cleared search — go back to showing all patients
            loadAllPatients();
            return;
        }
        setLoading(true);
        setError(null);
        setSelectedId(null);
        setIsSearchMode(true);
        try {
            const { data } = await searchClinicPatients(query.trim());
            setResults(data);
        } catch (err) {
            setError("Something went wrong while searching. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setQuery("");
        loadAllPatients();
    };

    const handleRegisterAsNewClick = () => {
        const isPhoneLike = /^\+?\d[\d\s-]{5,}$/.test(query.trim());
        onRegisterAsNew(
            isPhoneLike ? { phone: query.trim() } : { name: query.trim() }
        );
    };

    const handleProceedToVisit = (row: ClinicPatientRecord) => {
        onProceedToVisit(row);
    };

    return (
        <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 pry-ff">
            {/* Search bar */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search by registration no, name, or phone number"
                        className="border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm w-full"
                    />
                </div>
                {isSearchMode && (
                    <button
                        onClick={handleClearSearch}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        Clear
                    </button>
                )}
                <button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </button>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
                </div>
            )}

            {/* Empty state — only meaningful distinction is search vs no patients at all */}
            {!loading && results.length === 0 && !error && (
                <div className="flex flex-col items-center text-center py-12 px-4">
                    <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <Search className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="font-semibold text-sec-clr mb-1">
                        {isSearchMode ? "No patient found" : "No patients registered yet"}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-4">
                        {isSearchMode
                            ? "We couldn't find a match for that registration number, name, or phone. Try a different search, or register them as a new patient."
                            : "Once you register a patient, they'll show up here."}
                    </p>
                    <button
                        type="button"
                        onClick={handleRegisterAsNewClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-sec-clr text-sm font-medium hover:bg-gray-200 transition"
                    >
                        <UserPlus className="w-4 h-4" />
                        Register as New Patient
                    </button>
                </div>
            )}

            {/* Results table */}
            {!loading && results.length > 0 && (
                <>
                    <p className="text-sm text-gray-500 mb-3">
                        {isSearchMode
                            ? `${results.length} patient${results.length !== 1 ? "s" : ""} found`
                            : `${results.length} patient${results.length !== 1 ? "s" : ""} registered`}
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-100">
                                    <th className="py-2 pr-4 font-medium">Reg. No</th>
                                    <th className="py-2 pr-4 font-medium">Pet Name</th>
                                    <th className="py-2 pr-4 font-medium">Species</th>
                                    <th className="py-2 pr-4 font-medium">Breed</th>
                                    <th className="py-2 pr-4 font-medium">Age</th>
                                    <th className="py-2 pr-4 font-medium">Color</th>
                                    <th className="py-2 pr-4 font-medium">Owner</th>
                                    <th className="py-2 pr-4 font-medium">Phone</th>
                                    <th className="py-2 pr-4 font-medium">Email</th>
                                    <th className="py-2 pr-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr
                                        key={r._id}
                                        onClick={() => setSelectedId(r._id)}
                                        className={`border-b border-gray-50 cursor-pointer transition ${
                                            selectedId === r._id ? "bg-green-50" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <td className="py-2 pr-4">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-sec-clr">
                                                {r.registrationNo}
                                            </span>
                                        </td>
                                        <td className="py-2 pr-4 font-medium text-sec-clr flex items-center gap-2">
                                            <PawPrint className="w-4 h-4 text-acc-clr" />
                                            {r.pet?.name}
                                        </td>
                                        <td className="py-2 pr-4 text-gray-600">{r.pet?.species}</td>
                                        <td className="py-2 pr-4 text-gray-600">{r.pet?.breed || "-"}</td>
                                        <td className="py-2 pr-4 text-gray-600">
                                            {r.pet?.age ? `${r.pet.age} ${r.pet.ageUnit ?? "yrs"}` : "-"}
                                        </td>
                                        <td className="py-2 pr-4 text-gray-600">{r.pet?.color || "-"}</td>
                                        <td className="py-2 pr-4 text-gray-600">{r.owner?.fullname || "-"}</td>
                                        <td className="py-2 pr-4 text-gray-600">{r.owner?.phoneNumber || "-"}</td>
                                        <td className="py-2 pr-4 text-gray-600">{r.owner?.email || "-"}</td>
                                        <td className="py-2 pr-4 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProceedToVisit(r);
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-acc-clr text-pry-clr text-xs font-medium hover:opacity-90 transition ml-auto whitespace-nowrap"
                                            >
                                                Start Visit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}