// components/clinic/list-referrals.tsx
"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { listReferrals, AcceptReferralResult, ReferralRecord, ReferralStatus } from "@/lib/referral";
import AcceptReferralButton from "./accept-referral";
import DeclineReferralButton from "./decline-referral";
import SharedRecordsPanel from "./shared-records-panel";
import { Loader2, PawPrint, Send, Inbox, Clock, ChevronLeft, ChevronRight, FileText, ChevronDown, ChevronUp } from "lucide-react";

type Direction = "inbound" | "outbound";
type StatusFilter = "all" | ReferralStatus;

const STATUS_STYLES: Record<ReferralStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-300",
  declined: "bg-red-100 text-red-800 border-red-300",
};

const PAGE_SIZE = 10;

export default function ListReferrals() {
  const router = useRouter();
  const [direction, setDirection] = useState<Direction>("inbound");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [incomingAll, setIncomingAll] = useState<ReferralRecord[]>([]);
  const [outgoingAll, setOutgoingAll] = useState<ReferralRecord[]>([]);
  const [, startCountsTransition] = useTransition();

  const fetchCounts = useCallback(() => {
    startCountsTransition(async () => {
      try {
        const [inbound, outbound] = await Promise.all([
          listReferrals({ direction: "inbound" }),
          listReferrals({ direction: "outbound" }),
        ]);
        setIncomingAll(inbound);
        setOutgoingAll(outbound);
      } catch {
        // Non-fatal — stat cards just won't populate this cycle.
      }
    });
  }, []);

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
        setPage(1);
      } catch {
        setError("Couldn't load referrals. Please try again.");
      }
    });
  }, [direction, statusFilter]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleAccepted = (result: AcceptReferralResult) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r._id === result.referral._id
          ? { ...r, ...result.referral, clinicPatientId: result.clinicPatient._id }
          : r
      )
    );
    fetchCounts();
  };

  const handleDeclined = (id: string) => {
    setReferrals((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: "declined" } : r))
    );
    fetchCounts();
  };

  const proceedToVisit = (patientId: string) => {
    router.push(`/dashboard/clinical/records/create-visit?patientId=${patientId}`);
  };

  const toggleExpanded = (referralId: string) => {
    setExpandedId((prev) => (prev === referralId ? null : referralId));
  };

  const sorted = [...referrals].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortAsc ? diff : -diff;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, sorted.length);

  const incomingPending = incomingAll.filter((r) => r.status === "pending").length;
  const outgoingPending = outgoingAll.filter((r) => r.status === "pending").length;

  const clinicLabel = (r: ReferralRecord) =>
    direction === "inbound"
      ? r.fromClinic?.clinicName ?? "Unknown clinic"
      : r.toClinic?.clinicName ?? "Unknown clinic";

  const hasSharedRecords = (r: ReferralRecord) =>
    Array.isArray(r.sharedRecords) && r.sharedRecords.length > 0;

  const renderPatientActions = (r: ReferralRecord, layout: "row" | "stack") => {
    const wrapperClass =
      layout === "row" ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2 pt-1 border-t border-gray-100";

    if (direction === "inbound" && r.status === "pending") {
      return (
        <div className={wrapperClass}>
          <AcceptReferralButton referralId={r._id} onAccepted={handleAccepted} />
          <DeclineReferralButton referralId={r._id} onDeclined={() => handleDeclined(r._id)} />
        </div>
      );
    }

    if (direction === "inbound" && r.status === "accepted" && r.clinicPatientId) {
      return (
        <button
          onClick={() => proceedToVisit(r.clinicPatientId!)}
          className={`bg-acc-clr text-pry-clr px-3 py-1.5 rounded-md text-sm hover:bg-emerald-600 transition-colors cursor-pointer ${
            layout === "stack" ? "w-full" : ""
          }`}
        >
          Proceed to visit
        </button>
      );
    }

    return layout === "row" ? <span className="text-gray-300">—</span> : null;
  };

  const renderSharedRecordsToggle = (r: ReferralRecord, layout: "row" | "stack") => {
    if (!hasSharedRecords(r)) return null;
    const expanded = expandedId === r._id;

    return (
      <button
        onClick={() => toggleExpanded(r._id)}
        className={`flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer ${
          layout === "stack" ? "w-full justify-center pt-1 border-t border-gray-100" : ""
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
        {r.sharedRecords.length} shared record{r.sharedRecords.length > 1 ? "s" : ""}
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pry-ff">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Referrals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage clinical transfers with other clinics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 bg-pry-clr border border-gray-200 rounded-lg p-4">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{outgoingPending}</div>
            <div className="text-xs text-gray-500">Active outgoing</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-pry-clr border border-gray-200 rounded-lg p-4">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Inbox className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{incomingPending}</div>
            <div className="text-xs text-gray-500">New incoming</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-pry-clr border border-gray-200 rounded-lg p-4">
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {incomingPending + outgoingPending}
            </div>
            <div className="text-xs text-gray-500">Pending response</div>
          </div>
        </div>
      </div>

      <div className="flex w-full sm:inline-flex sm:w-auto items-center gap-1 p-1 bg-gray-100 rounded-lg mb-4">
        {([
          { key: "inbound" as Direction, label: "Incoming", count: incomingAll.length },
          { key: "outbound" as Direction, label: "Outgoing", count: outgoingAll.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setDirection(tab.key)}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              direction === tab.key
                ? "bg-pry-clr text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="hidden sm:inline">{tab.label} Referrals</span>
            <span className="sm:hidden">{tab.label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                direction === tab.key
                  ? "bg-gray-100 text-gray-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-full sm:w-auto text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-pry-clr text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>

        <button
          onClick={() => setSortAsc((prev) => !prev)}
          className="w-full sm:w-auto text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-pry-clr text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sort: Date Received ({sortAsc ? "Oldest" : "Newest"})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {isPending ? (
        <div className="text-gray-400 text-sm py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-500 text-sm py-12 text-center border border-dashed border-gray-300 rounded-md">
          No {statusFilter !== "all" ? statusFilter : ""} {direction} referrals found.
        </div>
      ) : (
        <>
          <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Patient</th>
                  <th className="text-left px-4 py-3 font-medium">
                    {direction === "inbound" ? "Sending Clinic" : "Receiving Clinic"}
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Date Received</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((r) => (
                  <>
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <PawPrint className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {r.pet?.name ?? "Unknown pet"}
                            </div>
                            {r.pet?.species && (
                              <div className="text-xs text-gray-400">
                                {r.pet.breed ? `${r.pet.breed} · ` : ""}
                                {r.pet.species}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{clinicLabel(r)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2 items-start">
                          {renderPatientActions(r, "row")}
                          {renderSharedRecordsToggle(r, "row")}
                        </div>
                      </td>
                    </tr>
                    {expandedId === r._id && hasSharedRecords(r) && (
                      <tr key={`${r._id}-expanded`} className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-4">
                          <SharedRecordsPanel referralId={r._id} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>
                Showing {rangeStart}-{rangeEnd} of {sorted.length} referrals
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                        p === page
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {pageItems.map((r) => (
              <div key={r._id} className="border border-gray-200 rounded-lg p-4 bg-pry-clr flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <PawPrint className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {r.pet?.name ?? "Unknown pet"}
                      </div>
                      {r.pet?.species && (
                        <div className="text-xs text-gray-400 truncate">
                          {r.pet.breed ? `${r.pet.breed} · ` : ""}
                          {r.pet.species}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                  <span>
                    {direction === "inbound" ? "From" : "To"}: {clinicLabel(r)}
                  </span>
                  <span>
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {renderPatientActions(r, "stack")}
                {renderSharedRecordsToggle(r, "stack")}

                {expandedId === r._id && hasSharedRecords(r) && (
                  <div className="pt-2 border-t border-gray-100">
                    <SharedRecordsPanel referralId={r._id} />
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2 items-center pt-2 text-sm text-gray-500">
              <span>
                Showing {rangeStart}-{rangeEnd} of {sorted.length} referrals
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}