// app/staff-dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, PawPrint, Package, ArrowLeftRight, BarChart3, ShoppingCart, Receipt, Lock, MapPin, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useStore";
import { listLocations, type Location } from "@/lib/location";

const OVERVIEW_CARDS = [
  { name: "Appointments", href: "/staff-dashboard/appointments", icon: Calendar, need: "manage_appointments", desc: "View and manage today's appointments" },
  { name: "Patients", href: "/staff-dashboard/patients", icon: PawPrint, need: "view_patients", desc: "Search, register, and start visits" },
  { name: "Inventory", href: "/staff-dashboard/inventory", icon: Package, need: "view_inventory", desc: "Check stock levels" },
  { name: "POS", href: "/staff-dashboard/pos", icon: ShoppingCart, need: "access_pos", desc: "Ring up a sale" },
  { name: "Sales History", href: "/staff-dashboard/sales-history", icon: Receipt, need: "view_sales_history", desc: "Browse past transactions" },
  { name: "Referrals", href: "/staff-dashboard/referrals", icon: ArrowLeftRight, need: "view_referrals", desc: "Track incoming and outgoing referrals" },
  { name: "Reports", href: "/staff-dashboard/reports", icon: BarChart3, need: "view_reports", desc: "Sales and inventory reports" },
];

const LOCATION_RELEVANT_PERMISSIONS = [
  "access_pos",
  "view_inventory",
  "manage_inventory",
  "view_inventory_cost",
  "view_sales_history",
];

export default function StaffDashboardOverview() {
  const permissions = useAuthStore((s) => s.permissions);
  const profile = useAuthStore((s) => s.profile) as { fullname?: string } | null;
  const activeLocationId = useAuthStore((s) => s.activeLocationId);
  const hasAll = permissions.includes("all_permissions");
  const isLocationRelevant =
    hasAll || LOCATION_RELEVANT_PERMISSIONS.some((p) => permissions.includes(p));

  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!isLocationRelevant) return;
    let cancelled = false;
    listLocations()
      .then((data) => {
        if (!cancelled) setLocations(data.filter((l) => l.isActive));
      })
      .catch(() => {
        // Non-fatal — the switcher just won't render this cycle.
      });
    return () => {
      cancelled = true;
    };
  }, [isLocationRelevant]);

  const currentLocation = locations.find((l) => l._id === activeLocationId);
  const showSwitcher = isLocationRelevant && locations.length > 1;

  return (
    <div className="w-full pry-ff">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-sec-clr">
            {profile?.fullname ? `Welcome, ${profile.fullname.split(" ")[0]}` : "Welcome"}
          </h1>
          <p className="text-sm text-gray-500">Here's what you have access to today.</p>
        </div>

        {isLocationRelevant && currentLocation && (
          <Link
            href="/staff-dashboard/select-location"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-pry-clr px-3 py-2 text-sm hover:border-acc-clr transition-colors"
          >
            <MapPin className="w-4 h-4 text-acc-clr shrink-0" />
            <span className="text-gray-700">
              Working at <span className="font-medium">{currentLocation.name}</span>
            </span>
            {showSwitcher && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {OVERVIEW_CARDS.map((card) => {
          const Icon = card.icon;
          const unlocked = hasAll || permissions.includes(card.need);

          if (!unlocked) {
            return (
              <div
                key={card.name}
                className="relative bg-gray-50 border border-gray-100 rounded-xl p-5 opacity-75"
              >
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold bg-gray-400 text-white px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" />
                  Restricted
                </span>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-400 mb-1">{card.name}</h3>
                <p className="text-sm text-gray-400">{card.desc}</p>
              </div>
            );
          }

          return (
            <Link
              key={card.name}
              href={card.href}
              className="bg-pry-clr border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-acc-clr" />
              </div>
              <h3 className="font-semibold text-sec-clr mb-1">{card.name}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}