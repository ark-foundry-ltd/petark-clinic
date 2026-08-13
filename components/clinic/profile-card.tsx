// components/clinic/profile-card.tsx

"use client";

import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/user";
import { Loader2, MapPin, Phone, Mail, Building2, Clock, PawPrint } from "lucide-react";
import UpdateServices from "@/components/clinic/update-services";

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

    return (
        <div className="w-full p-4 sm:p-10">

            {/* Clinic Info Card */}
            <div className="bg-pry-clr rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="h-16 w-16 shrink-0 rounded-full bg-acc-clr flex items-center justify-center text-pry-clr font-bold text-xl pry-ff">
                                {profile.clinicName.charAt(0)}
                            </div>
                            <div className="pry-ff min-w-0">
<div className="flex items-center gap-2 flex-wrap">
    <h2 className="text-xl font-bold text-sec-clr truncate">{profile.clinicName}</h2>
    {profile.subscription?.plan === 'enterprise' ? (
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-slate-800 text-white px-2 py-0.5 rounded-full shrink-0">
            Enterprise
        </span>
    ) : profile.subscription?.plan === 'pro' ? (
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-acc-clr text-white px-2 py-0.5 rounded-full shrink-0">
            ✦ Pro
        </span>
    ) : profile.subscription?.plan === 'standard' ? (
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full shrink-0">
            Standard
        </span>
    ) : (
        <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
            Free
        </span>
    )}
</div>
<p className="text-gray-500 truncate">{profile.email}</p>
{profile.subscription?.plan !== 'free' && profile.subscription?.expiresAt && (
    <p className="text-xs text-gray-400 mt-0.5">
        Renews {new Date(profile.subscription.expiresAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
        })}
    </p>
)}
                                {/* <p className="text-gray-500 truncate">{profile.email}</p> */}
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

                <div className="p-4 sm:p-6 space-y-4 pry-ff">
                    {/* Contact Information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-acc-clr shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm text-gray-500 pry-ff">Email</p>
                                <p className="font-medium text-sec-clr truncate">{profile.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-acc-clr shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm text-gray-500 pry-ff">Phone</p>
                                <p className="font-medium text-sec-clr truncate">{profile.phoneNumber || "-"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-acc-clr shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium text-sec-clr break-words">
                                    {profile.address.street}, {profile.address.city}, {profile.address.state}, {profile.address.country}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-acc-clr shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium text-sec-clr capitalize">{profile.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-sec-clr mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-acc-clr shrink-0" />
                            Business Hours
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Opening Time</p>
                                <p className="font-medium text-sec-clr">{profile.startingTime || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Closing Time</p>
                                <p className="font-medium text-sec-clr">{profile.closingTime || "-"}</p>
                            </div>
                            {/* Days Open */}
                            <div className="sm:col-span-2">
                                <p className="text-sm text-gray-500">Days Open</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {profile.daysOpen && profile.daysOpen.length > 0 ? (
                                        profile.daysOpen.map((day) => (
                                            <span key={day} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                                                {day}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services & Animals */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-sec-clr mb-3 flex items-center gap-2">
                            <PawPrint className="w-5 h-5 text-acc-clr shrink-0" />
                            Services & Animals
                        </h3>
                        <div className="space-y-4">
                            {/* Animals Handled */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Animals Handled</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.animalsHandled && profile.animalsHandled.length > 0 ? (
                                        profile.animalsHandled.map((animal) => (
                                            <span key={animal} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md capitalize">
                                                {animal}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Fee */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-sec-clr mb-3 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-acc-clr shrink-0" />
                            New Patient Registration
                        </h3>
                        {profile.registration?.enabled ? (
                            <p className="font-medium text-sec-clr">
                                <b>Registration fee:</b> ₦{profile.registration.fee.toLocaleString()}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400">No registration fee charged</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}