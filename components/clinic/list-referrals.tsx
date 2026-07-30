// components/clinic/list-referrals.tsx
"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { listReferrals, ReferralRecord, ReferralStatus } from "@/lib/referral";
import AcceptReferralButton from "./accept-referral";
import DeclineReferralButton from "./decline-referral";

type Direction = "inbound" | "outbound";
type StatusFilter = "all" | ReferralStatus;

const STATUS_STYLES: Record<ReferralStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-300",
  declined: "bg-red-100 text-red-800 border-red-300",
};

export default function ListReferrals() {
  const [direction, setDirection] = useState<Direction>("inbound");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchReferrals = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const params =
          statusFilter === "all"
            ? { direction }
            : { direction, status: statusFilter };
        const data = await listReferrals(params);
        setReferrals(data);
      } catch (err) {
        setError("Couldn't load referrals. Please try again.");
      }
    });
  }, [direction, statusFilter]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleAccepted = (updated: ReferralRecord) => {
    setReferrals((prev) =>
      prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
    );
  };

  const handleDeclined = (id: string) => {
    setReferrals((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: "declined" } : r))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Referrals</h1>

      {/* Direction tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {(["inbound", "outbound"] as Direction[]).map((d) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              direction === d
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {d === "inbound" ? "Incoming" : "Sent"}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "accepted", "declined"] as StatusFilter[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          )
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {isPending ? (
        <div className="text-gray-500 text-sm py-8 text-center">
          Loading referrals...
        </div>
      ) : referrals.length === 0 ? (
        <div className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-300 rounded-md">
          No {statusFilter !== "all" ? statusFilter : ""} {direction} referrals
          found.
        </div>
      ) : (
        <ul className="space-y-3">
          {referrals.map((r) => (
            <li
              key={r._id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">
                  {r.pet?.name ?? "Unknown pet"}
                  {r.pet?.species && (
                    <span className="text-gray-400 font-normal">
                      {" "}
                      · {r.pet.species}
                    </span>
                  )}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status]}`}
                >
                  {r.status}
                </span>
              </div>

              <p className="text-sm text-gray-800">{r.reason}</p>

              {r.clinicalSummary && (
                <p className="text-sm text-gray-500">{r.clinicalSummary}</p>
              )}

              <div className="text-xs text-gray-400">
                {direction === "inbound" ? (
                  <>From: {r.fromClinic?.clinicName ?? "Unknown clinic"}</>
                ) : (
                  <>To: {r.toClinic?.clinicName ?? "Unknown clinic"}</>
                )}{" "}
                · {new Date(r.createdAt).toLocaleDateString()}
              </div>

              {direction === "inbound" && r.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <AcceptReferralButton
                    referralId={r._id}
                    onAccepted={handleAccepted}
                  />
                  <DeclineReferralButton
                    referralId={r._id}
                    onDeclined={() => handleDeclined(r._id)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}