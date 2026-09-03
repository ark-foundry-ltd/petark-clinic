"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar,
    Clock,
    User,
    Mail,
    Stethoscope,
    PawPrint,
    AlertCircle,
    ArrowLeft,
    Phone,
    CheckCircle,
    ArrowRight,
    MessageCircle,
    XCircle,
    AlarmClockOff,
    CheckCheck,
    CalendarX,
    CheckCircle2,
} from "lucide-react";
import { getAppointmentById, type Appointment } from "@/lib/appointment";
import { getVisit, type Visit } from "@/lib/visit";
import CompleteVisitBtn from "@/components/clinic/complete-visit-btn";
import LabResultsSection from "@/components/clinic/lab-results-section";
import MarkVisitPaidBtn from "@/components/clinic/mark-visit-paid-btn";
import Link from "next/link";
import RescheduleAppointmentModal from "@/components/clinic/reschedule-appt-modal";

const STATUS_STYLES: Record<Appointment["status"], string> = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    confirmed: "bg-green-50 text-green-700 border border-green-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
    completed: "bg-blue-50 text-blue-700 border border-blue-200",
    missed: "bg-gray-50 text-gray-700 border border-gray-200",
    expired: "bg-orange-50 text-orange-700 border border-orange-200",
};

const STATUS_ICONS: Record<Appointment["status"], React.ReactNode> = {
    pending: <Clock size={14} />,
    confirmed: <CheckCircle2 size={14} />,
    cancelled: <XCircle size={14} />,
    completed: <CheckCheck size={14} />,
    missed: <CalendarX size={14} />,
    expired: <AlarmClockOff size={14} />,
};

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
    const router = useRouter();

    useEffect(() => {
        if (!appointmentId) return;

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const [apptData, visitsData] = await Promise.all([
                    getAppointmentById(appointmentId),
                    getVisit(),
                ]);
                setAppointment(apptData);

                const existingVisit = visitsData.find(v => v.appointmentId === appointmentId);
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

    if (loading) {
        return (
            <section className="min-h-screen bg-linear-to-br from-gray-50 to-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !appointment) {
        return (
            <section className="min-h-screen bg-linear-to-br from-gray-50 to-white flex items-center justify-center sec-ff">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Appointment</h3>
                    <p className="text-gray-500 mb-6">{error || "Appointment not found"}</p>
                    <Link
                        href={basePath}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Appointments
                    </Link>
                </div>
            </section>
        );
    }

    const refId = generateRefId(appointment._id);
    const createdDate = formatShortDate(appointment.createdAt);
    const appointmentDate = formatDate(appointment.date || appointment.appointmentDate || appointment.createdAt);
    const appointmentTime = formatTime(appointment.date || appointment.appointmentTime || appointment.createdAt);

    const hasActiveVisit = visit && visit.status === "in-progress";
    const hasCompletedVisit = visit && visit.status === "completed";
    const isConfirmed = appointment.status === "confirmed";

    return (
        <section className="min-h-screen bg-linear-to-br from-gray-50 to-white pry-ff">
            <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={basePath}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Appointments
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Appointment Details</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-sm text-gray-500 font-mono">Ref: {refId}</p>
                                <span className="text-gray-300">•</span>
                                <p className="text-sm text-gray-500">Created on {createdDate}</p>
                            </div>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border w-fit ${STATUS_STYLES[appointment.status]}`}>
                            {STATUS_ICONS[appointment.status]}
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Card */}
                        <div className="bg-pry-clr rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="bg-linear-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                                <div className="flex items-center gap-2">
                                    <PawPrint size={20} className="text-green-600" />
                                    <h2 className="font-semibold text-gray-900">Patient Information</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                {appointment.pet ? (
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {appointment.pet.photo ? (
                                            <img
                                                src={appointment.pet.photo}
                                                alt={appointment.pet.name}
                                                className="w-28 h-28 rounded-2xl object-cover border border-gray-200 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center border border-green-200">
                                                <PawPrint size={40} className="text-green-600" />
                                            </div>
                                        )}
                                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Patient Name</p>
                                                <p className="text-gray-900 font-semibold text-lg capitalize mt-1">{appointment.pet.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Breed</p>
                                                <p className="text-gray-700 capitalize mt-1">{appointment.pet.breed || "Mixed"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Species</p>
                                                <p className="text-gray-700 capitalize mt-1">{appointment.pet.species}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Age</p>
                                                <p className="text-gray-700 mt-1">{appointment.pet.age} years</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Gender</p>
                                                <p className="text-gray-700 capitalize mt-1">{appointment.pet.gender || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">Patient information not available</p>
                                )}
                            </div>
                        </div>

                        {/* Appointment Details Card */}
                        <div className="bg-pry-clr rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                                <div className="flex items-center gap-2">
                                    <Calendar size={20} className="text-blue-600" />
                                    <h2 className="font-semibold text-gray-900">Appointment Details</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <Calendar size={18} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                                            <p className="text-gray-900 font-medium mt-1">{appointmentDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock size={18} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide">Time</p>
                                            <p className="text-gray-900 font-medium mt-1">{appointmentTime}</p>
                                        </div>
                                    </div>
                                </div>

                                {appointment.notes && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <MessageCircle size={18} className="text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Reason for Visit</p>
                                                <p className="text-gray-700 mt-1 leading-relaxed">{appointment.notes}</p>
                                                
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Start Clinical — confirmed, no visit yet */}
                        {isConfirmed && !visit && (
                            <div className="bg-pry-clr rounded-2xl border border-gray-100 shadow-sm p-6">
                                <button
                                    onClick={() => router.push(`${basePath}/${appointmentId}/create-visit`)}
                                    className="w-full bg-acc-clr text-pry-clr py-3 px-4 rounded-xl font-medium hover:bg-acc-clr/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    Start Clinical
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* Visit in progress */}
                        {hasActiveVisit && visit && (
                            <>
                                <div className="bg-green-50/30 rounded-2xl border border-green-200 shadow-sm p-6 flex items-start gap-3">
    <Stethoscope size={18} className="text-gray-400 mt-0.5 shrink-0" />
    <div>
        <span className="text-xs text-gray-400 uppercase tracking-wide">Clinical Review</span>
        <p className="text-gray-700 mt-1 leading-relaxed">{visit?.soap.subjective}</p>
    </div>
</div>
                                <div className="bg-green-50/30 rounded-2xl border border-green-200 shadow-sm p-6">
                                    <div className="flex items-center gap-3 text-green-700 mb-2">
                                        <CheckCircle size={20} />
                                        <span className="font-medium">Visit is currently in progress</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        A clinical visit has already been started for this appointment.
                                    </p>
                                    <CompleteVisitBtn
                                        visit={visit}
                                        onComplete={(updated) => setVisit(updated)}
                                    />
                                </div>

                                {visit.petId && (
                                    <LabResultsSection visitId={visit._id} petId={visit.petId} />
                                )}
                            </>
                        )}

                        {/* Visit completed */}
                        {hasCompletedVisit && visit && (
                            <div className="bg-blue-50/30 rounded-2xl border border-blue-200 shadow-sm p-6 space-y-4">
                                <div>
                                    <div className="flex items-center gap-3 text-blue-700">
                                        <CheckCircle size={20} />
                                        <span className="font-medium">Visit completed</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        This visit was completed on{" "}
                                        {visit.completedAt ? formatShortDate(visit.completedAt) : "—"}.
                                    </p>
                                </div>

                                {visit.paymentStatus === "unpaid" && (
                                    <div className="pt-3 border-t border-blue-100">
                                        <MarkVisitPaidBtn
                                            visit={visit}
                                            onPaid={(updated) => setVisit(updated)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Side Info */}
                    <div className="space-y-6">
                        {/* Veterinarian Card */}
                        <div className="bg-pry-clr rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-linear-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
                                <div className="flex items-center gap-2">
                                    <Stethoscope size={20} className="text-purple-600" />
                                    <h2 className="font-semibold text-gray-900">Assigned Veterinarian</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                {appointment.vet ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                <User size={24} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-semibold">{appointment.vet.fullname}</p>
                                                <p className="text-xs text-gray-500">Veterinarian</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail size={14} className="text-gray-400" />
                                            <span>{appointment.vet.email}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">No veterinarian assigned yet</p>
                                )}
                            </div>
                        </div>

                        {/* Pet Owner Card */}
                        <div className="bg-pry-clr rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
                                <div className="flex items-center gap-2">
                                    <User size={20} className="text-amber-600" />
                                    <h2 className="font-semibold text-gray-900">Pet Owner Information</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                {appointment.user ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-900 font-semibold text-lg">{appointment.user.fullname}</p>
                                            <p className="text-xs text-gray-500 mt-1">Owner</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="text-gray-600">{appointment.user.email}</span>
                                            </div>
                                            {appointment.user.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone size={14} className="text-gray-400" />
                                                    <span className="text-gray-600">{appointment.user.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">Owner information not available</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {(appointment.status === "expired" || appointment.status === "missed") && (
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
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}