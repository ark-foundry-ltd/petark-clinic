"use client";

import { useEffect, useState } from "react";
import { getVisit, getAdministeredByDisplay, getCustomVitalFields } from "@/lib/visit";
import type { Visit, CustomVitalField } from "@/lib/visit";
import { getUser, getMe, getPlanInfo, type ClinicService } from "@/lib/user";
import UpdateVitals from "@/components/clinic/update-vitals";
import CompleteVisitBtn from "@/components/clinic/complete-visit-btn";
import ReferralBtn from "@/components/clinic/referral-btn";
import LabResultsSection from "@/components/clinic/lab-results-section";
import PetTrendsChart from "@/components/clinic/pet-trends-chart";
import TreatmentTimeline from "@/components/clinic/treatment-timeline";
import MarkVisitPaidBtn from "@/components/clinic/mark-visit-paid-btn";
import VaccinationTab from "@/components/clinic/vaccination-tab";
import ReminderList from "@/components/reminders/reminder-list";
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
    ListChecks,
} from "lucide-react";

const CARD = "bg-pry-clr rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

type TabKey = "clinical" | "labs" | "treatments" | "vaccinations" | "trends" | "reminders";

const TABS: { key: TabKey; label: string; needsPet?: boolean }[] = [
    { key: "clinical", label: "Clinical" },
    { key: "labs", label: "Lab results", needsPet: true },
    { key: "treatments", label: "Treatments", needsPet: true },
    { key: "vaccinations", label: "Vaccinations", needsPet: true },
    { key: "trends", label: "Trends", needsPet: true },
    { key: "reminders", label: "Reminders" },
];

// Same friendly names as the complete-visit page; the data is still SOAP.
const NOTE_SECTIONS = [
    { key: "subjective", letter: "S", label: "History" },
    { key: "objective", letter: "O", label: "Examination" },
    { key: "assessment", letter: "A", label: "Diagnosis" },
    { key: "plan", letter: "P", label: "Treatment plan" },
] as const;

interface RecordDetailsProps {
    visitId: string;
    /** Route base of this records page, used by the "Complete visit" link. Adjust to your records route. */
    basePath?: string;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Panel({
    title,
    icon,
    aside,
    children,
}: Readonly<{ title: string; icon: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode }>) {
    return (
        <section className={CARD}>
            <header className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
                <span className="text-gray-400">{icon}</span>
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                {aside && <span className="ml-auto text-xs text-gray-500">{aside}</span>}
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

function VitalTile({
    label,
    icon,
    value,
    unit,
    hint,
}: Readonly<{ label: string; icon: React.ReactNode; value?: string | number | null; unit?: string; hint?: string }>) {
    const hasValue = value !== undefined && value !== null && value !== "";
    return (
        <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200/70 p-3.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 truncate">{label}</span>
                <span className="text-gray-400 shrink-0">{icon}</span>
            </div>
            <p className="mt-2 text-xl font-semibold text-gray-900 tabular-nums">
                {hasValue ? value : "-"}
                {hasValue && unit && <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>}
            </p>
            {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
        </div>
    );
}

function InfoRow({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 text-right min-w-0">{children}</dd>
        </div>
    );
}

function RecordDetailsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse" aria-busy="true">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-12 bg-gray-200 rounded-xl" />
                    <div className="h-64 bg-gray-200 rounded-xl" />
                    <div className="h-56 bg-gray-200 rounded-xl" />
                </div>
                <div className="space-y-6">
                    <div className="h-48 bg-gray-200 rounded-xl" />
                    <div className="h-40 bg-gray-200 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function RecordDetails({ visitId, basePath = "/dashboard/records" }: Readonly<RecordDetailsProps>) {
    const [visit, setVisit] = useState<Visit | null>(null);
    const [clinicServices, setClinicServices] = useState<ClinicService[]>([]);
    const [customFields, setCustomFields] = useState<CustomVitalField[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [remindersLocked, setRemindersLocked] = useState(false);
    const [tab, setTab] = useState<TabKey>("clinical");

    useEffect(() => {
        async function fetchData() {
            if (!visitId) return;
            setLoading(true);
            setError(null);
            try {
                const [visits, clinic, fields, me] = await Promise.all([
                    getVisit(),
                    getUser(),
                    // Includes archived fields on purpose, so old visits keep their labels.
                    // Don't let a failure here break the whole page.
                    getCustomVitalFields().catch(() => [] as CustomVitalField[]),
                    getMe().catch(() => null), // don't break the page if this fails
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

                setCustomFields(fields);

                // Same Free-plan / inactive-subscription check the appointment page uses
                if (me) {
                    const { plan, status } = getPlanInfo(me);
                    setRemindersLocked(plan === "free" || status !== "active");
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
            <div className={`${CARD} text-center py-16`}>
                <Stethoscope size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No visit record found</p>
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
    const isCompleted = visit.status === "completed";

    // Custom vitals that actually have a value on this visit, matched to their labels.
    // Older visits have no `custom`, so this is simply empty for them.
    const customEntries = customFields
        .map((field) => ({ field, value: vitals?.custom?.[field._id] }))
        .filter(({ value }) => value !== undefined && value !== null && value !== "");

    const soap = visit.soap;
    const hasNotes = !!soap && NOTE_SECTIONS.some((s) => !!soap[s.key]);
    const hasObservations = !!vitals && !!(vitals.activity || vitals.appetite);

    const visibleTabs = TABS.filter((t) => !t.needsPet || visit.petId);
    const activeTab: TabKey = visibleTabs.some((t) => t.key === tab) ? tab : "clinical";

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <div className="space-y-6 pry-ff">
            {/* ========================= Header ========================= */}
            {visit.pet && (
                <header className={`${CARD} p-5 sm:p-6`}>
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                            {visit.pet.photo ? (
                                <img
                                    src={visit.pet.photo}
                                    alt={visit.pet.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl object-cover ring-1 ring-gray-200"
                                />
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-acc-clr/10 ring-1 ring-acc-clr/20 flex items-center justify-center">
                                    <PawPrint className="w-8 h-8 text-acc-clr" />
                                </div>
                            )}

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-sec-clr capitalize truncate">
                                        {visit.pet.name}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
                                            isCompleted
                                                ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                                                : "bg-amber-50 text-amber-800 ring-amber-200"
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-amber-500"}`}
                                        />
                                        {isCompleted ? "Completed" : "In progress"}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-gray-500 capitalize">
                                    {[
                                        visit.pet.breed,
                                        visit.pet.gender,
                                        visit.pet.age != null ? `${visit.pet.age} years` : null,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>

                                <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={13} className="text-gray-400" />
                                        Patient since {new Date(visit.createdAt).getFullYear()}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <User size={13} className="text-gray-400" />
                                        {getAdministeredByDisplay(visit)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                            >
                                <Pencil size={14} />
                                Edit vitals
                            </button>
                            {visit.petId && <ReferralBtn petId={visit.petId} />}
                            <CompleteVisitBtn visit={visit} basePath={basePath} routeId={visit._id} />
                        </div>
                    </div>
                </header>
            )}

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* ======================= Main column ====================== */}
                <div className="lg:col-span-2 space-y-6 min-w-0">
                    {/* Tabs */}
                    <div
                        role="tablist"
                        aria-label="Visit record sections"
                        className={`${CARD} p-1.5 flex gap-1 overflow-x-auto`}
                    >
                        {visibleTabs.map((t) => {
                            const active = activeTab === t.key;
                            return (
                                <button
                                    key={t.key}
                                    id={`record-tab-${t.key}`}
                                    role="tab"
                                    type="button"
                                    aria-selected={active}
                                    aria-controls={`record-panel-${t.key}`}
                                    onClick={() => setTab(t.key)}
                                    className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acc-clr ${
                                        active
                                            ? "bg-acc-clr/10 text-sec-clr ring-1 ring-acc-clr/30"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <div
                        role="tabpanel"
                        id={`record-panel-${activeTab}`}
                        aria-labelledby={`record-tab-${activeTab}`}
                        className="space-y-6"
                    >
                        {/* ------------------- Clinical ------------------- */}
                        {activeTab === "clinical" && (
                            <>
                                <Panel title="Vitals" icon={<Activity size={17} />}>
                                    {vitals ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                <VitalTile
                                                    label="Weight"
                                                    icon={<Scale size={15} />}
                                                    value={vitals.weight}
                                                    unit="kg"
                                                />
                                                <VitalTile
                                                    label="Heart rate"
                                                    icon={<Heart size={15} />}
                                                    value={vitals.pulse}
                                                    unit="bpm"
                                                />
                                                <VitalTile
                                                    label="Temperature"
                                                    icon={<Thermometer size={15} />}
                                                    value={vitals.temp}
                                                    unit="°C"
                                                    hint="Normal: 38–39°C"
                                                />
                                                <VitalTile
                                                    label="Respiration"
                                                    icon={<Activity size={15} />}
                                                    value={vitals.respiration}
                                                    unit="/min"
                                                />
                                            </div>

                                            {hasObservations && (
                                                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 pt-5 border-t border-gray-100">
                                                    {vitals.activity && (
                                                        <div>
                                                            <dt className="text-xs font-medium text-gray-500">Activity level</dt>
                                                            <dd className="mt-1 text-sm font-medium text-gray-900 capitalize">
                                                                {vitals.activity}
                                                            </dd>
                                                        </div>
                                                    )}
                                                    {vitals.appetite && (
                                                        <div>
                                                            <dt className="text-xs font-medium text-gray-500">Appetite</dt>
                                                            <dd className="mt-1 text-sm font-medium text-gray-900 capitalize">
                                                                {vitals.appetite}
                                                            </dd>
                                                        </div>
                                                    )}
                                                </dl>
                                            )}

                                            {/* Clinic-defined custom vitals */}
                                            {customEntries.length > 0 && (
                                                <div className="pt-5 border-t border-gray-100">
                                                    <h3 className="text-xs font-semibold text-gray-700 mb-3">
                                                        Additional vitals
                                                    </h3>
                                                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {customEntries.map(({ field, value }) => (
                                                            <div
                                                                key={field._id}
                                                                className="rounded-lg bg-gray-50 ring-1 ring-gray-200/70 px-3.5 py-3 min-w-0"
                                                            >
                                                                <dt className="text-xs text-gray-500 truncate">{field.label}</dt>
                                                                <dd className="mt-1 text-sm font-semibold text-gray-900 wrap-break-word">
                                                                    {value}
                                                                    {field.unit && (
                                                                        <span className="ml-1 text-xs font-normal text-gray-400">
                                                                            {field.unit}
                                                                        </span>
                                                                    )}
                                                                </dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No vitals were recorded for this visit.</p>
                                    )}
                                </Panel>

                                <Panel title="Clinical notes" icon={<FileText size={17} />} aside="SOAP">
                                    {hasNotes && soap ? (
                                        <dl className="divide-y divide-gray-100">
                                            {NOTE_SECTIONS.filter((s) => !!soap[s.key]).map((s) => (
                                                <div key={s.key} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                                    <span
                                                        aria-hidden
                                                        className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold flex items-center justify-center"
                                                    >
                                                        {s.letter}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <dt className="text-xs font-medium text-gray-500">{s.label}</dt>
                                                        <dd className="mt-1 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                                            {soap[s.key]}
                                                        </dd>
                                                    </div>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            {isCompleted
                                                ? "No clinical notes were recorded for this visit."
                                                : "No clinical notes yet. They are added when you complete the visit."}
                                        </p>
                                    )}
                                </Panel>
                            </>
                        )}

                        {/* Each of these brings its own card */}
                        {activeTab === "labs" && visit.petId && (
                            <LabResultsSection visitId={visit._id} petId={visit.petId} />
                        )}

                        {activeTab === "treatments" && visit.petId && (
                            <TreatmentTimeline petId={visit.petId} visitId={visit._id} />
                        )}

                        {activeTab === "vaccinations" && visit.petId && (
                            <div className={`${CARD} p-5`}>
                                <VaccinationTab
                                    petId={visit.petId}
                                    visitId={visit._id}
                                    canRemind={!remindersLocked}
                                />
                            </div>
                        )}

                        {activeTab === "trends" && visit.petId && <PetTrendsChart petId={visit.petId} />}

                        {/* Follow-up reminders: a walk-in visit has no date to count back from, so exact times only */}
                        {activeTab === "reminders" && (
                            <ReminderList
                                key={visit._id}
                                sourceType="visit"
                                sourceId={visit._id}
                                referenceLabel="visit"
                                presets={false}
                                locked={remindersLocked}
                            />
                        )}
                    </div>
                </div>

                {/* ========================= Sidebar ======================== */}
                <aside className="space-y-6 lg:sticky lg:top-6">
                    <Panel title="Visit information" icon={<FileText size={17} />}>
                        <dl className="divide-y divide-gray-100">
                            <InfoRow label="Visit ID">
                                <span className="font-mono text-gray-700">{visit._id.slice(-8).toUpperCase()}</span>
                            </InfoRow>
                            <InfoRow label="Date">{formatDate(visit.createdAt)}</InfoRow>
                            <InfoRow label="Time">
                                {new Date(visit.createdAt).toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </InfoRow>
                            {visit.completedAt && (
                                <InfoRow label="Completed">
                                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle size={13} />
                                        {formatDate(visit.completedAt)}
                                    </span>
                                </InfoRow>
                            )}
                        </dl>
                    </Panel>

                    {serviceCount > 0 && (
                        <Panel
                            title="Services provided"
                            icon={<ListChecks size={17} />}
                            aside={`${serviceCount} ${serviceCount === 1 ? "service" : "services"}`}
                        >
                            <ul className="divide-y divide-gray-100">
                                {visitServices.map((service, index) => (
                                    <li
                                        key={`${service._id ?? service.name}-${index}`}
                                        className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-sm"
                                    >
                                        <span className="text-gray-800 min-w-0 wrap-break-word">{service.name}</span>
                                        {service.price != null && (
                                            <span className="text-gray-600 tabular-nums shrink-0">
                                                ₦{service.price.toLocaleString()}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                    )}

                    {visit.billing && (
                        <Panel title="Payment" icon={<CreditCard size={17} />}>
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="text-sm text-gray-500">Total</span>
                                <span className="text-xl font-semibold text-sec-clr tabular-nums">
                                    {new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                    }).format(visit.billing.total)}
                                </span>
                            </div>

                            <div
                                className={`mt-4 flex items-center justify-between rounded-lg px-3.5 py-2.5 ring-1 ring-inset ${
                                    visit.paymentStatus === "paid"
                                        ? "bg-emerald-50 ring-emerald-200"
                                        : "bg-red-50 ring-red-200"
                                }`}
                            >
                                <span className="text-sm font-medium text-gray-800">Status</span>
                                <span
                                    className={`inline-flex items-center gap-1.5 text-sm font-medium capitalize ${
                                        visit.paymentStatus === "paid" ? "text-emerald-800" : "text-red-700"
                                    }`}
                                >
                                    {visit.paymentStatus === "paid" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {visit.paymentStatus}
                                </span>
                            </div>

                            {visit.paymentStatus === "paid" && visit.paymentMethod && (
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                    Paid via {visit.paymentMethod.replace("_", " ")}
                                    {visit.paidAt && ` on ${new Date(visit.paidAt).toLocaleDateString("en-GB")}`}
                                </p>
                            )}

                            {visit.paymentStatus === "unpaid" && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <MarkVisitPaidBtn visit={visit} onPaid={handleSaved} />
                                </div>
                            )}
                        </Panel>
                    )}
                </aside>
            </div>
        </div>
    );
}