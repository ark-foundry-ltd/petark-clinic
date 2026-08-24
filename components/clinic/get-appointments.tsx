"use client";

// components/clinic/get-appointments.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAppointments, type Appointment, type DateRange, type AppointmentsPage } from "@/lib/appointment";
import { getVisit } from "@/lib/visit";
import { useAppointmentsContext } from "@/context/appointments-context";
import VisitBtn from "@/components/clinic/visit-btn";
import { CalendarDays, Clock, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, XCircle, CheckCheck, CalendarX, AlarmClockOff } from "lucide-react";

interface GetAppointmentsProps {
    basePath?: string;
}

const STATUS_STYLES = {
  pending:   { className: "bg-yellow-50 text-yellow-700 border border-yellow-200", icon: Clock },
  confirmed: { className: "bg-green-50 text-green-700 border border-green-200", icon: CheckCircle2 },
  cancelled: { className: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
  completed: { className: "bg-blue-50 text-blue-700 border border-blue-200", icon: CheckCheck },
  missed:    { className: "bg-gray-50 text-gray-700 border border-gray-200", icon: CalendarX },
  expired:   { className: "bg-orange-50 text-orange-700 border border-orange-200", icon: AlarmClockOff },
};

const DATE_RANGES: { label: string; value: DateRange }[] = [
    { label: "All",          value: "all"        },
    { label: "Today",        value: "today"      },
    { label: "Last 7 days",  value: "7days"      },
    { label: "Last month",   value: "1month"     },
    { label: "Month before", value: "last_month" },
];

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit",
    });
}

function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                </td>
            ))}
        </tr>
    );
}

const EMPTY_PAGE: AppointmentsPage = { appointments: [], total: 0, page: 1, totalPages: 1, count: 0 };

export default function GetAppointments({ basePath = "/dashboard/appointments" }: Readonly<GetAppointmentsProps>) {
    const router = useRouter();
    const [data, setData] = useState<AppointmentsPage>(EMPTY_PAGE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [range, setRange] = useState<DateRange>("all");
    const [visitStatusMap, setVisitStatusMap] = useState<Map<string, "in-progress" | "completed">>(new Map());

    const { setAppointments: setCtxAppointments } = useAppointmentsContext();

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [result, visits] = await Promise.all([
                    getAppointments({ page, range }),
                    getVisit(),
                ]);

                if (!cancelled) {
                    setData(result);
                    setCtxAppointments(result.appointments);

                    const map = new Map<string, "in-progress" | "completed">();
                    visits.forEach((v) => {
                        if (v.status === "in-progress" || v.status === "completed") {
                            map.set(v.appointmentId, v.status);
                        }
                    });
                    setVisitStatusMap(map);
                }
            } catch {
                if (!cancelled) setError("Failed to load appointments. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [page, range, setCtxAppointments]);

    function handleRangeChange(next: DateRange) {
        setPage(1);
        setRange(next);
    }

    // changed it, to accommodate vets to view the appointment details page instead of the visit page, since vets can view the appointment details without having to start a visit
    function handleRowClick(appointmentId: string) {
        router.push(`${basePath}/${appointmentId}`);
    }

    const { appointments, total, totalPages } = data;
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    return (
        <section className="space-y-4 w-full pry-ff">
            {/* Header with filter */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-sec-clr pry-ff">Appointments</h2>
                    {!loading && !error && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            {total} appointment{total !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>

                <div className="relative w-fit">
                    <select
                        value={range}
                        onChange={(e) => handleRangeChange(e.target.value as DateRange)}
                        className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-acc-clr focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-acc-clr transition-all cursor-pointer"
                    >
                        {DATE_RANGES.map(({ label, value }) => (
                            <option
                                key={value}
                                value={value}
                                className="text-gray-700"
                                style={value === range ? { color: "var(--acc-clr, #2563eb)", fontWeight: "500" } : {}}
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-acc-clr" />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-gray-200 overflow-x-auto">
                <table className="min-w-[800px] w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">Pet</th>
                            <th className="px-4 py-3">Notes</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                    <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No appointments found</p>
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appt) => {
                                const statusStyle = STATUS_STYLES[appt.status];
                                const StatusIcon = statusStyle?.icon;

                                return (
                                <tr
                                    key={appt._id}
                                    onClick={() => handleRowClick(appt._id)}
                                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                        <span className="flex items-center gap-1.5">
                                            <CalendarDays size={13} className="text-gray-400 shrink-0" />
                                            {formatDate(appt.date || appt.appointmentDate || appt.createdAt)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={13} className="text-gray-400 shrink-0" />
                                            {formatTime(appt.date || appt.appointmentTime || appt.createdAt)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {appt.user ? (
                                            <div>
                                                <p className="text-gray-800 font-medium capitalize">{appt.user.fullname}</p>
                                                <p className="text-gray-400 text-xs">{appt.user.email}</p>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 italic text-xs">Unknown</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {appt.pet ? (
                                            <div className="flex items-center gap-2">
                                                {appt.pet.photo ? (
                                                    <img
                                                        src={appt.pet.photo}
                                                        alt={appt.pet.name}
                                                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 text-xs font-medium">
                                                        {appt.pet.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-gray-800 font-medium capitalize">{appt.pet.name}</p>
                                                    <p className="text-gray-400 text-xs capitalize">{appt.pet.breed} · {appt.pet.species}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 italic text-xs">Unknown</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-60 truncate">
                                        {appt.notes || <span className="text-gray-300 italic">No notes</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle?.className ?? ""}`}>
                                            {StatusIcon && <StatusIcon size={12} />}
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {
                                                (appt.status === "expired") 
                                                    ? <button className="bg-acc-clr text-pry-clr pry-ff px-4 py-2 rounded-lg"> Reschedule </button>
                                                    : <VisitBtn
                                                appointmentId={appt._id}
                                                status={appt.status}
                                                visitStatus={visitStatusMap.get(appt._id)}
                                                onConfirmed={() => setData((prev) => ({
                                                    ...prev,
                                                    appointments: prev.appointments.map((a) =>
                                                        a._id === appt._id ? { ...a, status: "confirmed" } : a
                                                    ),
                                                }))}
                                            />
                                            }
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => p - 1)}
                            disabled={!hasPrev}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={13} />
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasNext}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight size={13} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}