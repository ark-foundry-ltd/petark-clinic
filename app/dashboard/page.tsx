// app/dashboard/page.tsx

import DashboardStats from "@/components/dashboard/dashboard-stats";
import UsageAddon from "@/components/clinic/usage-addon";

export default function DashboardPage() {
  return (
    <div className="pry-ff p-4 md:p-10 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="text-2xl font-bold text-sec-clr">Dashboard</h1>

        {/* Renders nothing until usage loads, and nothing for staff accounts
            (/usage is clinic-owner only), so no empty pill box is ever shown. */}
        <UsageAddon
          resource="remindersPerMonth"
          label="Reminders this month"
          className="rounded-full border border-gray-200 bg-pry-clr px-3.5 py-1.5"
        />
      </div>

      <DashboardStats />
    </div>
  );
}