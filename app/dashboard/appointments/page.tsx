// app/dashboard/appointments/page.tsx
import { Metadata } from "next";
import { AppointmentsProvider } from "@/context/appointments-context";
import AppointmentHeader from "@/components/clinic/appointment-header";
import AppointmentStats from "@/components/clinic/appointment-stats";
import GetAppointments from "@/components/clinic/get-appointments";
// import GetVisits from "@/components/clinic/get-visits";
import ActivityFeed from "@/components/clinic/activity-feed";

export const metadata: Metadata = {
    title: "Appointments",
    description: "Manage your appointments",
};

export default function AppointmentsPage() {
    return (
        <AppointmentsProvider>
            <div className="px-8 py-8 space-y-10 pry-ff">
                <AppointmentHeader />
                <AppointmentStats />
                
                {/* Two column layout: GetVisits (left) + GetAppointments (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <GetAppointments />
                    </div>
                    <div>
                        {/* <GetVisits /> */}
                        <ActivityFeed />
                    </div>
                </div>
            </div>
        </AppointmentsProvider>
    );
}