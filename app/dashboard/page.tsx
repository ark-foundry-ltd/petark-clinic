// app/dashboard/page.tsx

import DashboardStats from "@/components/dashboard/dashboard-stats";

export default function DashboardPage() {
  return (
    <div className="pry-ff p-4 md:p-10 lg:p-8">
      <h1 className="text-2xl font-bold text-sec-clr mb-6">Dashboard</h1>
      
      <DashboardStats />
    </div>
  );
}