// app/dashboard/clinical/locations/[locationId]/layout.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { listLocations, type Location } from "@/lib/location";

const TABS = [
    { href: "inventory", label: "Inventory" },
    { href: "sales", label: "Sales" },
    { href: "reports", label: "Reports" },
];

export default function LocationDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const params = useParams<{ locationId: string }>();
    const locationId = params.locationId;

    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);

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

    const activeTab = TABS.find((t) => pathname.includes(`/${t.href}`))?.href ?? "inventory";

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

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-6 border-b border-slate-200">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={`/dashboard/clinical/locations/${locationId}/${tab.href}`}
                            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition ${
                                isActive
                                    ? "border-acc-clr text-acc-clr"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            {children}
        </div>
    );
}