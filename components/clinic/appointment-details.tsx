"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar,
    Clock,
    Mail,
    Stethoscope,
    PawPrint,
    AlertCircle,
    ArrowLeft,
    Phone,
    ArrowRight,
    MessageCircle,
    XCircle,
    AlarmClockOff,
    CheckCheck,
    CalendarX,
    CheckCircle2,
    UserRound,
    ClipboardList,
} from "lucide-react";
import { getAppointmentById, type Appointment } from "@/lib/appointment";
import { getMe, getPlanInfo } from "@/lib/user";
import { getVisit, type Visit } from "@/lib/visit";
import CompleteVisitBtn from "@/components/clinic/complete-visit-btn";
import LabResultsSection from "@/components/clinic/lab-results-section";
import MarkVisitPaidBtn from "@/components/clinic/mark-visit-paid-btn";
import Link from "next/link";
import RescheduleAppointmentModal from "@/components/clinic/reschedule-appt-modal";
import ReminderList from "@/components/reminders/reminder-list";
import VaccinationTab from "@/components/clinic/vaccination-tab";

/* ------------------------------------------------------------------ */
/* Status config                                                       */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<Appointment["status"], string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    cancelled: "bg-red-50 text-red-800 ring-red-200",
    completed: "bg-sky-50 text-sky-800 ring-sky-200",
    missed: "bg-gray-100 text-gray-700 ring-gray-200",
    expired: "bg-orange-50 text-orange-800 ring-orange-200",
};

const STATUS_ICONS: Record<Appointment["status"], React.ReactNode> = {
    pending: <Clock size={14} />,
    confirmed: <CheckCircle2 size={14} />,
    cancelled: <XCircle size={14} />,
    completed: <CheckCheck size={14} />,
    missed: <CalendarX size={14} />,
    expired: <AlarmClockOff size={14} />,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatShortDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(dateString: string) {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function generateRefId(id: string) {
    const shortId = id.slice(-8).toUpperCase();
    return `APT-${shortId}`;
}

function initials(name?: string) {
    if (!name) return "?";
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join("");
}

/* ------------------------------------------------------------------ */
/* Small UI building blocks                                            */
/* ------------------------------------------------------------------ */

function Panel({
    title,
    icon,
    children,
}: Readonly<{ title: string; icon: React.ReactNode; children: React.ReactNode }>) {
    return (
        <section className="bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <header className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
                <span className="text-gray-400">{icon}</span>
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

function Field({
    label,
    children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
    return (
        <div className="min-w-0">
            <dt className="text-xs font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900 capitalize wrap-break-word">
                {children}
            </dd>
        </div>
    );
}

function ContactRow({
    icon,
    href,
    children,
}: Readonly<{ icon: React.ReactNode; href: string; children: React.ReactNode }>) {
    return (
        <a
            href={href}
            className="group flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors min-w-0"
        >
            <span className="text-gray-400 group-hover:text-gray-600 shrink-0">{icon}</span>
            <span className="truncate">{children}</span>
        </a>
    );
}

function PersonCard({
    title,
    icon,
    name,
    role,
    email,
    phone,
    emptyText,
}: Readonly<{
    title: string;
    icon: React.ReactNode;
    name?: string;
    role: string;
    email?: string;
    phone?: string;
    emptyText: string;
}>) {
    return (
        <Panel title={title} icon={icon}>
            {name ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div
                            aria-hidden
                            className="w-11 h-11 shrink-0 rounded-full bg-gray-900 text-white text-sm font-semibold flex items-center justify-center"
                        >
                            {initials(name)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                            <p className="text-xs text-gray-500">{role}</p>
                        </div>
                    </div>
                    {(email || phone) && (
                        <div className="space-y-2.5 pt-4 border-t border-gray-100">
                            {email && (
                                <ContactRow icon={<Mail size={15} />} href={`mailto:${email}`}>
                                    {email}
                                </ContactRow>
                            )}
                            {phone && (
                                <ContactRow icon={<Phone size={15} />} href={`tel:${phone}`}>
                                    {phone}
                                </ContactRow>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-sm text-gray-500">{emptyText}</p>
            )}
        </Panel>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface AppointmentDetailsProps {
    basePath?: string;
}

export default function AppointmentDetails({
    basePath = "/dashboard/appointments",
}: Readonly<AppointmentDetailsProps>) {
    const params = useParams();
    const appointmentId = params?.id as string;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [visit, setVisit] = useState<Visit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rescheduleLocked, setRescheduleLocked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!appointmentId) return;

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const [apptData, visitsData, me] = await Promise.all([
                    getAppointmentById(appointmentId),
                    getVisit(),
                    getMe().catch(() => null), // don't break if page fails
                ]);
                setAppointment(apptData);

                if (me) {
                    const { plan, status } = getPlanInfo(me);
                    setRescheduleLocked(plan === "free" || status !== "active");
                }

                const existingVisit = visitsData.find((v) => v.appointmentId === appointmentId);
                setVisit(existingVisit || null);
            } catch (err) {
                setError("Failed to load appointment details");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [appointmentId]);

    /* ---------------------------- Loading --------------------------- */
    if (loading) {
        return (
            <section className="min-h-screen bg-gray-50/60 pry-ff">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-4 w-36 bg-gray-200 rounded" />
                        <div className="space-y-2">
                            <div className="h-7 w-64 bg-gray-200 rounded" />
                            <div className="h-4 w-48 bg-gray-200 rounded" />
                        </div>
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-56 bg-gray-200 rounded-xl" />
                                <div className="h-40 bg-gray-200 rounded-xl" />
                            </div>
                            <div className="space-y-6">
                                <div className="h-40 bg-gray-200 rounded-xl" />
                                <div className="h-40 bg-gray-200 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    /* ----------------------------- Error ---------------------------- */
    if (error || !appointment) {
        return (
            <section className="min-h-screen bg-gray-50/60 flex items-center justify-center sec-ff px-4">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 bg-red-50 ring-1 ring-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <AlertCircle size={26} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Couldn&apos;t load this appointment</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        {error || "This appointment doesn't exist or was removed."} Go back and try again.
                    </p>
                    <Link
                        href={basePath}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                        <ArrowLeft size={16} />
                        Back to appointments
                    </Link>
                </div>
            </section>
        );
    }

    /* ---------------------------- Derived --------------------------- */
    const refId = generateRefId(appointment._id);
    const createdDate = formatShortDate(appointment.createdAt);
    const appointmentDate = formatDate(appointment.date || appointment.appointmentDate || appointment.createdAt);
    const appointmentTime = formatTime(appointment.date || appointment.appointmentTime || appointment.createdAt);

    function getServicesTotal(v: Visit | null): number {
        if (!v) return 0;

        // Prefer the total calculated by the backend
        if (typeof v.billing?.total === "number" && v.billing.total > 0) {
            return v.billing.total;
        }

        // Fallback: sum the populated services
        const services: unknown[] = v.selectedServices ?? v.servicesProvided ?? [];
        return services.reduce<number>((sum, s) => {
            if (typeof s === "string") return sum;
            return sum + ((s as { price?: number }).price ?? 0);
        }, 0);
    }

    const servicesTotal = getServicesTotal(visit);

    const hasActiveVisit = visit && visit.status === "in-progress";
    const hasCompletedVisit = visit && visit.status === "completed";
    const isConfirmed = appointment.status === "confirmed";
    const canReschedule = appointment.status === "expired" || appointment.status === "missed";

    const statusLabel = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);

    return (
        <section className="min-h-screen bg-gray-50/60 pry-ff">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
                {/* ------------------------- Header ------------------------- */}
                <div className="mb-8">
                    <Link
                        href={basePath}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                        <ArrowLeft size={15} />
                        Appointments
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl lg:text-[28px] leading-tight font-semibold tracking-tight text-gray-900">
                                {appointment.pet?.name
                                    ? `${appointment.pet.name}'s appointment`
                                    : "Appointment details"}
                            </h1>
                            <p className="mt-1.5 text-sm text-gray-500">
                                <span className="font-mono text-gray-600">{refId}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                Created {createdDate}
                            </p>
                        </div>

                        <span
                            className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[appointment.status]}`}
                        >
                            {STATUS_ICONS[appointment.status]}
                            {statusLabel}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 items-start">
                    {/* ======================= Main column ======================= */}
                    <div className="lg:col-span-2 space-y-6 min-w-0">
                        {/* Patient */}
                        <Panel title="Patient" icon={<PawPrint size={17} />}>
                            {appointment.pet ? (
                                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
                                    {appointment.pet.photo ? (
                                        <img
                                            src={appointment.pet.photo}
                                            alt={appointment.pet.name}
                                            className="w-full h-48 sm:w-32 sm:h-32 shrink-0 rounded-xl object-cover ring-1 ring-gray-200"
                                        />
                                    ) : (
                                        <div className="w-full h-32 sm:w-32 shrink-0 rounded-xl bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
                                            <PawPrint size={36} className="text-gray-400" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xl font-semibold text-gray-900 capitalize truncate">
                                            {appointment.pet.name}
                                        </p>
                                        <p className="text-sm text-gray-500 capitalize mt-0.5">
                                            {appointment.pet.species}
                                            {appointment.pet.breed ? `, ${appointment.pet.breed}` : ", Mixed breed"}
                                        </p>

                                        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 pt-5 border-t border-gray-100">
                                            <Field label="Age">{appointment.pet.age} years</Field>
                                            <Field label="Gender">{appointment.pet.gender || "Not specified"}</Field>
                                        </dl>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Patient information isn&apos;t available.</p>
                            )}
                        </Panel>

                        {/* Schedule */}
                        <Panel title="Schedule" icon={<Calendar size={17} />}>
                            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <Calendar size={17} />
                                    </span>
                                    <div className="min-w-0">
                                        <dt className="text-xs font-medium text-gray-500">Date</dt>
                                        <dd className="mt-0.5 text-sm font-semibold text-gray-900">{appointmentDate}</dd>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <Clock size={17} />
                                    </span>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Time</dt>
                                        <dd className="mt-0.5 text-sm font-semibold text-gray-900">{appointmentTime}</dd>
                                    </div>
                                </div>
                            </dl>

                            {appointment.notes && (
                                <div className="mt-5 pt-5 border-t border-gray-100 flex items-start gap-3">
                                    <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <MessageCircle size={17} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-500">Reason for visit</p>
                                        <p className="mt-0.5 text-sm text-gray-700 leading-relaxed wrap-break-word">
                                            {appointment.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Panel>

                        {/* Start clinical: confirmed, no visit yet */}
                        {isConfirmed && !visit && (
                            <section className="bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">Ready for the clinical visit</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Start the visit to record notes, labs and services.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push(`${basePath}/${appointmentId}/create-visit`)}
                                    className="inline-flex items-center justify-center gap-2 bg-acc-clr text-pry-clr py-2.5 px-5 rounded-lg text-sm font-medium hover:bg-acc-clr/90 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr w-full sm:w-auto"
                                >
                                    Start clinical visit
                                    <ArrowRight size={16} />
                                </button>
                            </section>
                        )}

                        {/* Visit in progress */}
                        {hasActiveVisit && visit && (
                            <>
                                <section className="bg-pry-clr rounded-xl border border-gray-200/80 border-l-4 border-l-emerald-500 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                        </span>
                                        <h2 className="text-sm font-semibold">Visit in progress</h2>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1.5">
                                        A clinical visit has already been started for this appointment.
                                    </p>

                                    {visit.soap?.subjective && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-3">
                                            <Stethoscope size={17} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-500">Clinical review</p>
                                                <p className="mt-0.5 text-sm text-gray-700 leading-relaxed wrap-break-word">
                                                    {visit.soap.subjective}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-5">
                                        <CompleteVisitBtn
                                            visit={visit}
                                            onComplete={(updated) => setVisit(updated)}
                                        />
                                    </div>
                                </section>

                                {visit.petId && <LabResultsSection visitId={visit._id} petId={visit.petId} />}
                            </>
                        )}

                        {/* Visit completed */}
                        {hasCompletedVisit && visit && (
                            <section className="bg-pry-clr rounded-xl border border-gray-200/80 border-l-4 border-l-sky-500 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
                                <div className="flex items-center gap-2 text-sky-700">
                                    <ClipboardList size={17} />
                                    <h2 className="text-sm font-semibold">Visit completed</h2>
                                </div>
                                <p className="text-sm text-gray-500 mt-1.5">
                                    Completed on {visit.completedAt ? formatShortDate(visit.completedAt) : "an unknown date"}.
                                </p>

                                {visit.paymentStatus === "unpaid" && (
                                    <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 ring-1 ring-gray-200/70 px-4 py-3">
                                            <span className="text-sm text-gray-600">Amount due</span>
                                            <span className="text-lg font-semibold text-sec-clr tabular-nums">
                                                ₦{servicesTotal.toLocaleString()}
                                            </span>
                                        </div>
                                        <MarkVisitPaidBtn visit={visit} onPaid={(updated) => setVisit(updated)} />
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Reminders */}
                        <ReminderList
                            key={`${appointment._id}-${appointment.date ?? ""}-${appointment.status}`}
                            sourceType="appointment"
                            sourceId={appointment._id}
                            referenceDate={appointment.date || appointment.appointmentDate}
                            canAdd={appointment.status === "pending" || appointment.status === "confirmed"}
                            locked={rescheduleLocked}
                        />

                        {/* Vaccinations */}
                        {appointment.petId && (
                            <div className="bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
                                <VaccinationTab
                                    petId={appointment.petId}
                                    canRemind={!rescheduleLocked} // same Free-plan / inactive-subscription check you already use
                                />
                            </div>
                        )}
                    </div>

                    {/* ======================== Sidebar ========================== */}
                    <aside className="space-y-6 lg:sticky lg:top-6">
                        <PersonCard
                            title="Pet owner"
                            icon={<UserRound size={17} />}
                            name={appointment.user?.fullname}
                            role="Owner"
                            email={appointment.user?.email}
                            phone={appointment.user?.phone}
                            emptyText="Owner information isn't available."
                        />

                        <PersonCard
                            title="Veterinarian"
                            icon={<Stethoscope size={17} />}
                            name={appointment.vet?.fullname}
                            role="Assigned veterinarian"
                            email={appointment.vet?.email}
                            emptyText="No veterinarian assigned yet."
                        />

                        {canReschedule && (
                            <RescheduleAppointmentModal
                                appointmentId={appointment._id}
                                clinicId={appointment.clinicId}
                                currentDate={appointment.date || appointment.appointmentDate}
                                pet={{
                                    name: appointment.pet?.name ?? "Pet",
                                    breed: appointment.pet?.breed,
                                    species: appointment.pet?.species,
                                    photo: appointment.pet?.photo,
                                }}
                                ownerName={appointment.user?.fullname}
                                onRescheduled={({ date, status }) => {
                                    setAppointment((prev) =>
                                        prev ? { ...prev, date, status: status as Appointment["status"] } : prev
                                    );
                                    setVisit(null);
                                }}
                                locked={rescheduleLocked}
                            />
                        )}
                    </aside>
                </div>
            </div>
        </section>
    );
}