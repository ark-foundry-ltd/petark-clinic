// components/clinic/shared-records-panel.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { getSharedRecords, SharedRecordVisit } from "@/lib/referral";
import { Loader2, FileText } from "lucide-react";

interface SharedRecordsPanelProps {
  referralId: string;
}

export default function SharedRecordsPanel({ referralId }: Readonly<SharedRecordsPanelProps>) {
  const [visits, setVisits] = useState<SharedRecordVisit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setError(null);
      try {
        const data = await getSharedRecords(referralId);
        setVisits(data);
      } catch {
        setError("Couldn't load shared records.");
      }
    });
  }, [referralId]);

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading shared records...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600 py-2">{error}</p>;
  }

  if (visits.length === 0) {
    return <p className="text-sm text-gray-400 py-2">No shared records available.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {visits.map((visit) => (
        <div key={visit._id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800">
              {new Date(visit.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                visit.status === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {visit.status}
            </span>
          </div>

          {(visit.vitals.weight || visit.vitals.temp || visit.vitals.pulse || visit.vitals.respiration) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 text-xs text-gray-600">
              {visit.vitals.weight != null && <span>Weight: {visit.vitals.weight}kg</span>}
              {visit.vitals.temp != null && <span>Temp: {visit.vitals.temp}°C</span>}
              {visit.vitals.pulse != null && <span>Pulse: {visit.vitals.pulse}bpm</span>}
              {visit.vitals.respiration != null && <span>Resp: {visit.vitals.respiration}/min</span>}
            </div>
          )}

          {(visit.soap.subjective || visit.soap.objective || visit.soap.assessment || visit.soap.plan) && (
            <div className="flex flex-col gap-1.5 text-xs text-gray-600">
              {visit.soap.subjective && (
                <p><span className="font-medium text-gray-500">S:</span> {visit.soap.subjective}</p>
              )}
              {visit.soap.objective && (
                <p><span className="font-medium text-gray-500">O:</span> {visit.soap.objective}</p>
              )}
              {visit.soap.assessment && (
                <p><span className="font-medium text-gray-500">A:</span> {visit.soap.assessment}</p>
              )}
              {visit.soap.plan && (
                <p><span className="font-medium text-gray-500">P:</span> {visit.soap.plan}</p>
              )}
            </div>
          )}

          {!visit.soap.subjective && !visit.soap.objective && !visit.soap.assessment && !visit.soap.plan && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              No clinical notes recorded
            </p>
          )}
        </div>
      ))}
    </div>
  );
}