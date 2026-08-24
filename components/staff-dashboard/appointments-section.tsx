"use client";

import { AppointmentsProvider } from "@/context/appointments-context";
import AppointmentStats from "@/components/clinic/appointment-stats";
import GetAppointments from "@/components/clinic/get-appointments";

export default function AppointmentsSection() {
    return (
        <AppointmentsProvider>
            <div className="space-y-6">
                <div>
                    <h1 className="text-lg font-bold text-sec-clr pry-ff">Appointments</h1>
                    <p className="text-sm text-gray-400">Your clinic's appointment schedule</p>
                </div>

                <AppointmentStats />
                <GetAppointments basePath="/staff-dashboard/appointments" />
            </div>
        </AppointmentsProvider>
    );
}