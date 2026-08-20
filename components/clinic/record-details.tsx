"use client";

import { useEffect, useState } from "react";
import { getVisit, getAdministeredByDisplay } from "@/lib/visit";
import type { Visit } from "@/lib/visit";
import { getUser, type ClinicService } from "@/lib/user";
import UpdateVitals from "@/components/clinic/update-vitals";
import CompleteVisitBtn from "@/components/clinic/complete-visit-btn";
import ReferralBtn from "@/components/clinic/referral-btn";
import PetTrendsChart from "@/components/clinic/pet-trends-chart";
import TreatmentTimeline from "@/components/clinic/treatment-timeline";
import MarkVisitPaidBtn from "@/components/clinic/mark-visit-paid-btn";
import {
    AlertCircle,
    Stethoscope,
    Heart,
    Thermometer,
    Activity,
    Scale,
    Calendar,
    User,
    PawPrint,
    FileText,
    CreditCard,
    CheckCircle,
    XCircle,
    Pencil,
    // TrendingUp,
    Plus,
} from "lucide-react";
// import { useRouter } from "next/navigation";

interface RecordDetailsProps {
    visitId: string;
}

function RecordDetailsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start gap-5">
                    <div className="w-20 h-20 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-3">
                        <div className="h-7 bg-gray-200 rounded-lg w-48" />
                        <div className="h-4 bg-gray-200 rounded w-64" />
                        <div className="flex gap-4 mt-2">
                            <div className="h-6 bg-gray-200 rounded-full w-24" />
                            <div className="h-6 bg-gray-200 rounded-full w-28" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-20" />
                            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                        </div>
                        <div className="mt-3 h-8 bg-gray-200 rounded w-24" />
                        <div className="mt-2 h-3 bg-gray-200 rounded w-16" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex justify-between">
                                    <div className="h-4 bg-gray-200 rounded w-24" />
                                    <div className="h-4 bg-gray-200 rounded w-32" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function RecordDetails({ visitId }: Readonly<RecordDetailsProps>) {
    const [visit, setVisit] = useState<Visit | null>(null);
    const [clinicServices, setClinicServices] = useState<ClinicService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    // const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            if (!visitId) return;
            setLoading(true);
            setError(null);
            try {
                const [visits, clinic] = await Promise.all([
                    getVisit(),
                    getUser(),
                ]);

                const foundVisit = visits.find((v) => v._id === visitId);
                if (foundVisit) {
                    setVisit(foundVisit);
                } else {
                    setError("Visit record not found");
                }

                if (clinic?.servicesProvided) {
                    setClinicServices(clinic.servicesProvided);
                }
            } catch (err) {
                setError("Failed to load visit record details");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [visitId]);

    function handleSaved(updated: Visit) {
        setVisit(updated);
        setIsEditing(false);
    }

    // const handleTimeline = () => {
    //     if (!visit) return;
        
    //     const petId = visit.petId;
    //     const userId = visit.userId;
        
    //     if (!petId) {
    //         console.error('petId is missing from visit:', visit);
    //         alert('Pet ID is missing. Cannot view timeline.');
    //         return;
    //     }
        
    //     if (!userId) {
    //         console.error('userId is missing from visit:', visit);
    //         alert('User ID is missing. Cannot view timeline.');
    //         return;
    //     }
        
    //     router.push(`/dashboard/records/pet/${petId}/timeline?userId=${userId}`);
    // };

    const getServiceDetails = (serviceId: string): ClinicService | undefined => {
        return clinicServices.find((s) => s._id === serviceId);
    };

    const getVisitServices = (): ClinicService[] => {
        if (!visit?.servicesProvided || !Array.isArray(visit.servicesProvided)) return [];

        if (
            visit.servicesProvided.length > 0 &&
            typeof visit.servicesProvided[0] === "object" &&
            "name" in visit.servicesProvided[0]
        ) {
            return visit.servicesProvided as ClinicService[];
        }

        if (
            visit.servicesProvided.length > 0 &&
            typeof visit.servicesProvided[0] === "string"
        ) {
            return (visit.servicesProvided as string[])
                .map((id) => getServiceDetails(id))
                .filter((s): s is ClinicService => s !== undefined);
        }

        return [];
    };

    const visitServices = getVisitServices();
    const serviceCount = visitServices.length;

    if (loading) return <RecordDetailsSkeleton />;

    if (error) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        );
    }

    if (!visit) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Stethoscope size={56} className="mx-auto mb-3 opacity-20" />
                <p className="text-gray-400">No visit record found</p>
            </div>
        );
    }

    if (isEditing) {
        return (
            <UpdateVitals
                visit={visit}
                onSaved={handleSaved}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    const vitals = visit.vitals;

    return (
        <div className="space-y-6">
            {/* Pet Profile Header */}
            {visit.pet && (
                <div className="bg-pry-clr rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                        {visit.pet.photo ? (
                            <img
                                src={visit.pet.photo}
                                alt={visit.pet.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                                <PawPrint className="w-8 h-8 text-pry-clr" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold text-sec-clr capitalize">
                                    {visit.pet.name}
                                </h2>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                        visit.status === "completed"
                                            ? "bg-green-100 text-acc-clr"
                                            : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                    {visit.status === "completed" ? "Completed" : "In Progress"}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-3">
                                {visit.pet.breed} •{" "}
                                {visit.pet.gender === "male" ? "Male" : "Female"} •{" "}
                                {visit.pet.age} years
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                    <Calendar size={12} />
                                    <span>
                                        Patient since {new Date(visit.createdAt).getFullYear()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                    <User size={12} />
                                    <span>{getAdministeredByDisplay(visit)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                            >
                                <Pencil size={13} />
                                Edit Vitals
                            </button>
                            {visit.petId && <ReferralBtn petId={visit.petId} />}
                            <CompleteVisitBtn visit={visit} onComplete={handleSaved} />
                        </div>
                    </div>
                </div>
            )}

            {/* Services Provided */}
            {serviceCount > 0 && (
                <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-sec-clr">Services Provided</h3>
                        <span className="ml-auto text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                            {serviceCount} {serviceCount === 1 ? "service" : "services"}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {visitServices.map((service, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {service.name}
                                {service.price && (
                                    <span className="text-gray-400 text-xs">
                                        (₦{service.price.toLocaleString()})
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Vitals Cards */}
            {vitals && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Weight
                            </span>
                            <Scale className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {vitals.weight}{" "}
                            <span className="text-sm font-normal text-gray-400">kg</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Current measurement</p>
                    </div>

                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Heart Rate
                            </span>
                            <Heart className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-bold text-sec-clr">
                            {vitals.pulse}{" "}
                            <span className="text-sm font-normal text-gray-400">bpm</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Resting rate</p>
                    </div>

                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Temperature
                            </span>
                            <Thermometer className="w-4 h-4 text-orange-400" />
                        </div>
                        <p className="text-2xl font-bold text-sec-clr">
                            {vitals.temp}{" "}
                            <span className="text-sm font-normal text-gray-400">°C</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Normal: 38–39°C</p>
                    </div>

                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Respiration
                            </span>
                            <Activity className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-sec-clr">
                            {vitals.respiration}{" "}
                            <span className="text-sm font-normal text-gray-400">/min</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Breaths per minute</p>
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visit Information */}
                <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-sec-clr">Visit Information</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Visit ID</span>
                            <span className="text-sm font-mono text-gray-700">
                                {visit._id.slice(-8)}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Date</span>
                            <span className="text-sm text-sec-clr">
                                {new Date(visit.createdAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Time</span>
                            <span className="text-sm text-sec-clr">
                                {new Date(visit.createdAt).toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        {serviceCount > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Services</span>
                                <span className="text-sm text-sec-clr text-right max-w-[60%]">
                                    {visitServices.map((s) => s.name).join(", ")}
                                </span>
                            </div>
                        )}
                        {visit.completedAt && (
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-500">Completed</span>
                                <span className="text-sm text-acc-clr flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    {new Date(visit.completedAt).toLocaleDateString("en-GB")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Information */}
                {/* Payment Information */}
                {visit.billing && (
                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-sec-clr">Payment Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 pt-2">
                                <span className="text-sm font-semibold text-sec-clr">Total</span>
                                <span className="text-lg font-bold text-sec-clr">
                                    {new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                    }).format(visit.billing.total)}
                                </span>
                            </div>
                            <div className="mt-3 pt-2">
                                <div
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                        visit.paymentStatus === "paid"
                                            ? "bg-green-50"
                                            : "bg-red-50"
                                    }`}
                                >
                                    <span className="text-sm font-medium text-sec-clr">
                                        Payment Status
                                    </span>
                                    <span
                                        className={`flex items-center gap-1.5 text-sm font-medium capitalize ${
                                            visit.paymentStatus === "paid"
                                                ? "text-green-700"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {visit.paymentStatus === "paid" ? (
                                            <CheckCircle size={14} />
                                        ) : (
                                            <XCircle size={14} />
                                        )}
                                        {visit.paymentStatus}
                                    </span>
                                </div>
                                {visit.paymentStatus === "paid" && visit.paymentMethod && (
                                    <p className="text-xs text-gray-400 mt-2 text-center">
                                        Paid via {visit.paymentMethod.replace("_", " ")}
                                        {visit.paidAt &&
                                            ` on ${new Date(visit.paidAt).toLocaleDateString("en-GB")}`}
                                    </p>
                                )}
                            </div>
                            {visit.paymentStatus === "unpaid" && (
                                <div className="pt-3 border-t border-gray-50">
                                    <MarkVisitPaidBtn visit={visit} onPaid={handleSaved} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Clinical Assessment */}
            {vitals && (vitals.activity || vitals.appetite) && (
                <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-sec-clr">Clinical Assessment</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {vitals.activity && (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                    Activity Level
                                </p>
                                <p className="text-sm font-medium text-gray-700 capitalize">
                                    {vitals.activity}
                                </p>
                            </div>
                        )}
                        {vitals.appetite && (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                    Appetite
                                </p>
                                <p className="text-sm font-medium text-gray-700 capitalize">
                                    {vitals.appetite}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SOAP Notes */}
            {visit.soap && (visit.soap.subjective || visit.soap.objective || visit.soap.assessment || visit.soap.plan) && (
                <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-sec-clr">Clinical Notes (SOAP)</h3>
                    </div>
                    <div className="space-y-4">
                        {visit.soap.subjective && (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">S — Subjective</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{visit.soap.subjective}</p>
                            </div>
                        )}
                        {visit.soap.objective && (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">O — Objective</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{visit.soap.objective}</p>
                            </div>
                        )}
                        {visit.soap.assessment && (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">A — Assessment</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{visit.soap.assessment}</p>
                            </div>
                        )}
                        {visit.soap.plan && (
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">P — Plan</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{visit.soap.plan}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TPR & Weight Trends — Pro */}
            {visit.petId && (
                <PetTrendsChart petId={visit.petId} />
            )}

            {visit.petId && (
                <TreatmentTimeline petId={visit.petId} visitId={visit._id} />
            )}

            {/* <button
                onClick={handleTimeline}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-acc-clr text-acc-clr text-sm font-semibold py-3 hover:bg-acc-clr hover:text-pry-clr cursor-pointer transition-colors"
            >
                <TrendingUp size={15} />
                View Health Timeline
            </button> */}
        </div>
    );
}