// components/clinic/referral-clinic-picker.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, MapPin, Check, PawPrint, Stethoscope } from "lucide-react";
import { searchClinics, parseList, type ClinicSearchResult } from "@/lib/referral";

export interface ReferralTargetSelection {
  clinic: ClinicSearchResult | null;
  service: string;
}

interface ReferralClinicPickerProps {
  onChange: (selection: ReferralTargetSelection) => void;
}

function Chips({ items, tone }: Readonly<{ items: string[]; tone: "blue" | "emerald" }>) {
  const cls =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-100";
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ReferralClinicPicker({ onChange }: Readonly<ReferralClinicPickerProps>) {
  const [query, setQuery] = useState("");
  const [clinics, setClinics] = useState<ClinicSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ClinicSearchResult | null>(null);
  const [service, setService] = useState("");

  // Debounced search. Empty query lists every eligible clinic (backend caps at 25).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      searchClinics(query.trim() || undefined)
        .then((res) => !cancelled && setClinics(res.data))
        .catch(() => !cancelled && setError("Couldn't load clinics. Please try again."))
        .finally(() => !cancelled && setLoading(false));
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const select = (clinic: ClinicSearchResult) => {
    setSelected(clinic);
    setService("");
    onChange({ clinic, service: "" });
  };

  const changeService = (value: string) => {
    setService(value);
    onChange({ clinic: selected, service: value });
  };

  const selectedServices = parseList(selected?.serviceProvided);

  return (
    <div className="space-y-4 pry-ff">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by clinic, service or animal"
          className="w-full text-sm border border-gray-300 rounded-md pl-9 pr-3 py-2 bg-pry-clr focus:outline-none focus:ring-2 focus:ring-acc-clr/40"
        />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : clinics.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-md">
          No clinics found{query ? ` for "${query}"` : ""}.
        </div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {clinics.map((c) => {
            const isSelected = selected?._id === c._id;
            const services = parseList(c.serviceProvided);
            const animals = parseList(c.animalsHandled);
            const location = [c.address?.city, c.address?.state].filter(Boolean).join(", ");

            return (
              <li key={c._id}>
                <button
                  type="button"
                  onClick={() => select(c)}
                  className={`w-full text-left rounded-lg border p-3 space-y-2 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-acc-clr bg-emerald-50/40"
                      : "border-gray-200 bg-pry-clr hover:border-acc-clr/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{c.clinicName}</div>
                      {location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {location}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-acc-clr shrink-0" />}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                      {services.length > 0 ? (
                        <Chips items={services} tone="blue" />
                      ) : (
                        <span className="text-xs text-gray-400">Services not listed</span>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5">
                      <PawPrint className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                      {animals.length > 0 ? (
                        <Chips items={animals} tone="emerald" />
                      ) : (
                        <span className="text-xs text-gray-400">Animals not listed</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <div className="space-y-1.5">
          <label htmlFor="referral-service" className="text-sm font-medium text-gray-700">
            Service needed at {selected.clinicName}
          </label>
          {selectedServices.length > 0 ? (
            <select
              id="referral-service"
              value={service}
              onChange={(e) => changeService(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-pry-clr text-gray-700 focus:outline-none focus:ring-2 focus:ring-acc-clr/40"
            >
              <option value="">Select a service</option>
              {selectedServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="referral-service"
              type="text"
              value={service}
              onChange={(e) => changeService(e.target.value)}
              placeholder="This clinic hasn't listed services — describe what you need"
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-pry-clr focus:outline-none focus:ring-2 focus:ring-acc-clr/40"
            />
          )}
        </div>
      )}
    </div>
  );
}