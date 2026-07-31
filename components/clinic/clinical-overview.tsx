// components/clinic/clinical-overview.tsx

import Link from "next/link";
import { PawPrint, ClipboardList, Package, AlertTriangle, ArrowLeftRight } from "lucide-react";
import GetVisits from "@/components/clinic/get-visits";

export default function ClinicalOverview() {
    return (
        <div className="w-full pry-ff">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-sec-clr">Clinical</h1>
                <p className="text-sm text-gray-500">
                    Manage patients, visit records, and inventory.
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

                <Link
                    href="/dashboard/clinical/inventory"
                    className="bg-pry-clr border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition"
                >
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <Package className="w-5 h-5 text-acc-clr" />
                    </div>
                    <h3 className="font-semibold text-sec-clr mb-1">Inventory</h3>
                    <p className="text-sm text-gray-500 mb-3">
                        Track drugs, supplies, and stock levels
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Coming soon
                    </p>
                </Link>

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
            </div>

            {/* Recent Visits */}
            <GetVisits />
        </div>
    );
}