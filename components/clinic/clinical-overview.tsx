// components/clinic/clinical-overview.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, ClipboardList, Package, ArrowLeftRight, Lock, MapPin, Plus, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useStore";
import ActivityFeed from "@/components/clinic/activity-feed";
import { User } from "@/lib/user";
import { getFeatures, planAtLeast } from "@/lib/plan";

export default function ClinicalOverview() {
    const router = useRouter();
    const { profile } = useAuthStore();

    const clinicProfile = profile as User | null;

    const plan = clinicProfile?.subscription?.plan;
    const status = clinicProfile?.subscription?.status;
    const isActive = status === "active";
    const isStandardAbove = planAtLeast(plan, "standard") && isActive;

    // Inventory & POS (and the Locations pages that hold it) depend on the plan's
    // `ims` feature, not on rank: CMS-only plans rank like Starter/Standard but have no IMS.
    const hasIms = getFeatures(plan).ims && isActive;
    const isCmsOnly = !!plan?.startsWith("cms_") && isActive;

    const handleLockedClick = (feature: string, requiredPlan: string) => {
        toast.error(`${feature} is a ${requiredPlan} feature`, {
            description: `Upgrade your plan to access ${feature.toLowerCase()}.`,
            action: {
                label: "Upgrade",
                onClick: () => router.push("/dashboard/profile/upgrade"),
            },
        });
    };

    return (
        <div className="w-full pry-ff">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-sec-clr">Clinical</h1>
                <p className="text-sm text-gray-500">
                    {isCmsOnly
                        ? "Manage patients and visit records."
                        : "Manage patients, visit records, and inventory."}
                </p>
            </div>

            {/* Cards */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                <Link
                    href="/dashboard/clinical/patients"
                    className="bg-pry-clr border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition"
                >
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <PawPrint className="w-5 h-5 text-acc-clr" />
                    </div>
                    <h3 className="font-semibold text-sec-clr mb-1">Patients</h3>
                    <p className="text-sm text-gray-500 mb-3">
                        Register new patients or search existing records
                    </p>
                    <p className="text-xs text-gray-400">Manage your patient records</p>
                </Link>

                <Link
                    href="/dashboard/clinical/records"
                    className="bg-pry-clr border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition"
                >
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <ClipboardList className="w-5 h-5 text-acc-clr" />
                    </div>
                    <h3 className="font-semibold text-sec-clr mb-1">Records</h3>
                    <p className="text-sm text-gray-500 mb-3">
                        View visit history and medical activity
                    </p>
                    <p className="text-xs text-gray-400">Browse past visits</p>
                </Link>

                {hasIms ? (
                    <Link
                        href="/dashboard/clinical/locations"
                        className="bg-pry-clr border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                            <MapPin className="w-5 h-5 text-acc-clr" />
                        </div>
                        <h3 className="font-semibold text-sec-clr mb-1">Location</h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Track inventory and stock levels across multiple locations
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            Manage Inventory and Stock Alerts
                        </p>
                    </Link>
                ) : isCmsOnly ? (
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/profile/upgrade")}
                        className="relative text-left bg-pry-clr border border-dashed border-acc-clr/40 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition pry-ff"
                    >
                        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold bg-acc-clr text-white px-2 py-0.5 rounded-full">
                            <Plus className="w-2.5 h-2.5" />
                            Upgrade
                        </span>
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                            <Package className="w-5 h-5 text-acc-clr" />
                        </div>
                        <h3 className="font-semibold text-sec-clr mb-1">Inventory &amp; POS</h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Track drugs, supplies and stock levels, and sell at the counter
                        </p>
                        <p className="text-xs text-acc-clr font-medium flex items-center gap-1">
                            Not in your plan. Upgrade to add inventory
                        </p>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => handleLockedClick("Inventory", "Starter")}
                        className="relative text-left bg-gray-50 border border-gray-100 rounded-xl p-5 cursor-not-allowed opacity-75 pry-ff"
                    >
                        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold bg-blue-700 text-white px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            Starter
                        </span>
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-400 mb-1">Inventory</h3>
                        <p className="text-sm text-gray-400 mb-3">
                            Track drugs, supplies, and stock levels
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            Upgrade to Starter to unlock
                        </p>
                    </button>
                )}

                {isCmsOnly && (
                    <Link
                        href="/dashboard/clinical/reports"
                        className="bg-pry-clr border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                            <BarChart3 className="w-5 h-5 text-acc-clr" />
                        </div>
                        <h3 className="font-semibold text-sec-clr mb-1">Reports</h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Appointments, visits and new patients for any date range
                        </p>
                        <p className="text-xs text-gray-400">Download your clinic report</p>
                    </Link>
                )}
                
                {isStandardAbove ? (
                    <Link
                        href="/dashboard/clinical/referrals"
                        className="bg-pry-clr border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                            <ArrowLeftRight className="w-5 h-5 text-acc-clr" />
                        </div>
                        <h3 className="font-semibold text-sec-clr mb-1">Referrals</h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Manage and track patient referrals
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            Track patient referrals
                        </p>
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => handleLockedClick("Referrals", "Standard")}
                        className="relative text-left bg-gray-50 border border-gray-100 rounded-xl p-5 cursor-not-allowed opacity-75 pry-ff"
                    >
                        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold bg-blue-800 text-white px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            Standard
                        </span>
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <ArrowLeftRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-400 mb-1">Referrals</h3>
                        <p className="text-sm text-gray-400 mb-3">
                            Manage and track patient referrals
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            Upgrade to Pro to unlock
                        </p>
                    </button>
                )}
            </div>

            {/* Recent Activities */}
            <ActivityFeed />
        </div>
    );
}