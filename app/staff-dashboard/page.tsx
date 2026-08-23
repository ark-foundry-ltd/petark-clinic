// app/staff-dashboard/page.tsx
"use client";

import Link from "next/link";
import { Calendar, PawPrint, Package, ArrowLeftRight, BarChart3, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useStore";

const OVERVIEW_CARDS = [
  { name: "Appointments", href: "/staff-dashboard/appointments", icon: Calendar, need: "manage_appointments", desc: "View and manage today's appointments" },
  { name: "Patients", href: "/staff-dashboard/patients", icon: PawPrint, need: "view_patients", desc: "Search, register, and start visits" },
  { name: "Inventory", href: "/staff-dashboard/inventory", icon: Package, need: "view_inventory", desc: "Check stock levels" },
  { name: "Referrals", href: "/staff-dashboard/referrals", icon: ArrowLeftRight, need: "view_referrals", desc: "Track incoming and outgoing referrals" },
  { name: "Reports", href: "/staff-dashboard/reports", icon: BarChart3, need: "view_reports", desc: "Sales and inventory reports" },
];

export default function StaffDashboardOverview() {
  const permissions = useAuthStore((s) => s.permissions);
  const profile = useAuthStore((s) => s.profile) as { fullname?: string } | null;
  const hasAll = permissions.includes("all_permissions");

  return (
    <div className="w-full pry-ff">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-sec-clr">
          {profile?.fullname ? `Welcome, ${profile.fullname.split(" ")[0]}` : "Welcome"}
        </h1>
        <p className="text-sm text-gray-500">Here's what you have access to today.</p>
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