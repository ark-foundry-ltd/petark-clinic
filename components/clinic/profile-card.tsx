// components/clinic/profile-card.tsx

"use client";

import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/user";
import {
    Loader2, MapPin, Phone, Mail, Building2, Clock, PawPrint, UserIcon,
    Sparkles, Rocket, Layers, Zap, Crown, Stethoscope, HeartPulse,
    AlertCircle, CheckCircle2, ClipboardList, LucideIcon
} from "lucide-react";
import type { Plan } from "@/lib/plan";
import UpdateServices from "@/components/clinic/update-services";
import { getProfileCompletion, SECTION_LABELS } from "@/lib/profile-completion";

type PlanKey = Plan;

const PLAN_STYLES: Record<PlanKey, { label: string; icon: LucideIcon; className: string }> = {
    free: {
        label: "Free",
        icon: Zap,
        className: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
    },
    starter: {
        label: "Starter",
        icon: Layers,
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    },
    cms_starter: {
        label: "CMS Starter",
        icon: Stethoscope,
        className: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
    },
    standard: {
        label: "Standard",
        icon: Rocket,
        className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    },
    cms_standard: {
        label: "CMS Standard",
        icon: HeartPulse,
        className: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200",
    },
    pro: {
        label: "Pro",
        icon: Sparkles,
        className: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm shadow-violet-200",
    },
    enterprise: {
        label: "Enterprise",
        icon: Crown,
        className: "bg-gradient-to-r from-slate-900 to-slate-700 text-amber-300 shadow-sm ring-1 ring-amber-400/40",
    },
};

function SubscriptionBadge({ plan }: Readonly<{ plan?: string }>) {
    const key = (plan && plan in PLAN_STYLES ? plan : "free") as PlanKey;
    const { label, icon: Icon, className } = PLAN_STYLES[key];

    return (
        <span
            className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${className}`}
        >
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

function StatusChip({ done }: Readonly<{ done: boolean }>) {
    return done ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Done
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            <AlertCircle className="h-3 w-3" />
            Required
        </span>
    );
}

function SectionCard({
    icon: Icon,
    title,
    done,
    children,
}: Readonly<{
    icon: LucideIcon;
    title: string;
    done: boolean;
    children: React.ReactNode;
}>) {
    return (
        <section
            className={`rounded-xl border p-4 sm:p-5 bg-pry-clr ${
                done ? "border-gray-100" : "border-amber-200 ring-1 ring-amber-100"
            }`}
        >
            <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="flex items-center gap-2 font-semibold text-sec-clr pry-ff">
                    <Icon className="w-5 h-5 text-acc-clr shrink-0" />
                    {title}
                </h3>
                <StatusChip done={done} />
            </div>
            {children}
        </section>
    );
}

function InfoRow({
    icon: Icon,
    label,
    children,
}: Readonly<{ icon: LucideIcon; label: string; children: React.ReactNode }>) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-acc-clr/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-acc-clr" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <div className="text-sm font-medium text-sec-clr break-words">{children}</div>
            </div>
        </div>
    );
}

export default function ProfileCard() {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await getUser();
                setProfile(data);
            } catch (err) {
                setError("Failed to load profile");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-acc-clr" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center text-red-600 p-4">
                {error || "Failed to load profile"}
            </div>
        );
    }

    const completion = getProfileCompletion(profile);
    const percent = Math.round((completion.done / completion.total) * 100);
    const address = profile.address;
    const addressText = address
        ? [address.street, address.city, address.state, address.country].filter(Boolean).join(", ")
        : "";

    return (
        <div className="w-full p-4 sm:p-10 space-y-4">

            {/* Complete your profile */}
            {!completion.isComplete && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 pry-ff">
                    <div className="flex items-start gap-3">
                        <ClipboardList className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-amber-800">
                                Complete your profile
                            </p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                Click the edit button at the top of this card to fill in the
                                sections marked <b>Required</b>. Once they&apos;re done, you can
                                continue using PetArk.
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                                <div className="h-2 flex-1 rounded-full bg-amber-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-amber-800 shrink-0">
                                    {completion.done} of {completion.total} done
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {completion.missing.map((key) => (
                                    <span
                                        key={key}
                                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200"
                                    >
                                        {SECTION_LABELS[key]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clinic header */}
            <div className="bg-pry-clr rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="h-16 w-16 shrink-0 rounded-full bg-acc-clr flex items-center justify-center text-pry-clr font-bold text-xl pry-ff">
                                {profile.clinicName.charAt(0)}
                            </div>
                            <div className="pry-ff min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-xl font-bold text-sec-clr truncate">{profile.clinicName}</h2>
                                    <SubscriptionBadge plan={profile.subscription?.plan} />
                                </div>
                                <p className="text-gray-500 truncate">{profile.email}</p>
                                {profile.subscription?.plan !== "free" && profile.subscription?.expiresAt && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Renews {new Date(profile.subscription.expiresAt).toLocaleDateString(undefined, {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 self-start sm:self-auto">
                            <UpdateServices
                                profile={profile}
                                onSuccess={(updatedFields) => {
                                    setProfile((prev) => {
                                        if (!prev) return prev;
                                        return {
                                            ...prev,
                                            ...updatedFields
                                        } as User; // Force TypeScript to recognize the fully merged object as a complete User
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact details */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t border-gray-100 pry-ff">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoRow icon={Mail} label="Email">
                            <span className="truncate block">{profile.email}</span>
                        </InfoRow>
                        <InfoRow icon={Phone} label="Phone">
                            {profile.phoneNumber || "-"}
                        </InfoRow>
                        <InfoRow icon={MapPin} label="Address">
                            {addressText || "-"}
                        </InfoRow>
                        <InfoRow icon={UserIcon} label="Owner">
                            <span className="capitalize">{profile.ownerName}</span>
                        </InfoRow>
                        <InfoRow icon={Building2} label="Status">
                            <span className="capitalize">{profile.status}</span>
                        </InfoRow>
                        <InfoRow icon={Clock} label="Trial period">
                            {profile.trial?.startedAt ? new Date(profile.trial.startedAt).toLocaleDateString() : "-"}
                            {" - "}
                            {profile.trial?.endsAt ? new Date(profile.trial.endsAt).toLocaleDateString() : "-"}
                        </InfoRow>
                    </div>
                </div>
            </div>

            {/* Setup sections */}
            <div className="grid gap-4 lg:grid-cols-2 pry-ff">
                {/* Business hours */}
                <SectionCard
                    icon={Clock}
                    title="Business hours"
                    done={completion.sections.businessHours}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500">Opening time</p>
                            <p className="text-sm font-medium text-sec-clr">{profile.startingTime || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Closing time</p>
                            <p className="text-sm font-medium text-sec-clr">{profile.closingTime || "-"}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500">Days open</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {profile.daysOpen && profile.daysOpen.length > 0 ? (
                                    profile.daysOpen.map((day) => (
                                        <span key={day} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                                            {day}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-400">Not set yet</span>
                                )}
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Patient registration */}
                <SectionCard
                    icon={Building2}
                    title="Patient registration"
                    done={completion.sections.registration}
                >
                    {profile.registration ? (
                        profile.registration.enabled ? (
                            <p className="text-sm font-medium text-sec-clr">
                                <b>Registration fee:</b> ₦{profile.registration.fee.toLocaleString()}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">No registration fee charged</p>
                        )
                    ) : (
                        <p className="text-sm text-gray-400">
                            Not set yet. Choose whether new patients pay a registration fee.
                        </p>
                    )}
                </SectionCard>

                {/* Services provided */}
                <SectionCard
                    icon={Stethoscope}
                    title="Services provided"
                    done={completion.sections.services}
                >
                    <div className="flex flex-wrap gap-2">
                        {profile.servicesProvided && profile.servicesProvided.length > 0 ? (
                            profile.servicesProvided.map((service) => (
                                <span
                                    key={service._id}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                                >
                                    {service.name}
                                    <span className="font-semibold">₦{service.price.toLocaleString()}</span>
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">Not set yet. Add at least one service.</span>
                        )}
                    </div>
                </SectionCard>

                {/* Animals handled */}
                <SectionCard
                    icon={PawPrint}
                    title="Animals handled"
                    done={completion.sections.animals}
                >
                    <div className="flex flex-wrap gap-2">
                        {profile.animalsHandled && profile.animalsHandled.length > 0 ? (
                            profile.animalsHandled.map((animal) => (
                                <span key={animal} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md capitalize">
                                    {animal}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400">Not set yet. Add the animals you treat.</span>
                        )}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}