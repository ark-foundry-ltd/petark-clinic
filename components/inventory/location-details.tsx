// components/inventory/location-details.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { listLocations, type Location } from "@/lib/location";
import InventoryDashboard from "@/components/inventory/inventory-dashboard";
import PosCheckout from "../sales/pos-checkout";
import SalesHistory from "../sales/sales-history";

type Tab = "inventory" | "sales" | "reports";

const TABS: { key: Tab; label: string }[] = [
    { key: "inventory", label: "Inventory" },
    { key: "sales", label: "Sales" },
    { key: "reports", label: "Reports" },
];

interface LocationDetailsProps {
    locationId: string;
}

function SalesSubView({ locationId }: { locationId: string }) {
    const [subTab, setSubTab] = useState<"checkout" | "history">("checkout");

    return (
        <div>
            <div className="mb-4 flex gap-2">
                <button
                    type="button"
                    onClick={() => setSubTab("checkout")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        subTab === "checkout" ? "bg-acc-clr text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    New Sale
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab("history")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        subTab === "history" ? "bg-acc-clr text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    History
                </button>
            </div>

            {subTab === "checkout" ? (
                <PosCheckout locationId={locationId} />
            ) : (
                <SalesHistory locationId={locationId} />
            )}
        </div>
    );
}

export default function LocationDetails({ locationId }: Readonly<LocationDetailsProps>) {
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("inventory");

    useEffect(() => {
        let cancelled = false;
        listLocations()
            .then((data) => {
                if (cancelled) return;
                setLocation(data.find((l) => l._id === locationId) ?? null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [locationId]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 pry-ff">
            {/* Breadcrumb */}
            <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
                <Link href="/dashboard/clinical/locations" className="hover:text-acc-clr">
                    Locations
                </Link>
                <span>/</span>
                <span className="text-slate-500">{loading ? "…" : location?.name ?? "Unknown"}</span>
            </div>

            <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-slate-800">
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-acc-clr" />
                ) : (
                    location?.name ?? "Location not found"
                )}
            </h1>

            {/* Tabs — local state, not separate routes */}
            <div className="mb-6 flex items-center gap-6 border-b border-slate-200">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition ${
                                isActive
                                    ? "border-acc-clr text-acc-clr"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === "inventory" && !loading && (
                <InventoryDashboard locationId={locationId} />
            )}

            {/* {activeTab === "sales" && (
                <p className="py-12 text-center text-sm text-slate-400">
                    Sales for this location — coming soon.
                </p>
            )} */}

            {activeTab === "sales" && !loading && (
                <SalesSubView locationId={locationId} />
            )}

            {activeTab === "reports" && (
                <p className="py-12 text-center text-sm text-slate-400">
                    Reports for this location — coming soon.
                </p>
            )}
        </div>
    );
}