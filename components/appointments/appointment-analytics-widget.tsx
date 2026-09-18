// components/appointments/appointment-analytics-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { getAppointmentWidget, type AppointmentWidgetData } from "@/lib/analytics";

export default function AppointmentAnalyticsWidget() {
    const [data, setData] = useState<AppointmentWidgetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getAppointmentWidget()
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch(() => {
                if (!cancelled) setData(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 p-4">
                <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
            </div>
        );
    }

    if (!data) return null;

    const maxTrend = Math.max(...data.trend.map((p) => p.value), 1);

    return (
        <div className="rounded-xl border border-gray-100 p-4 bg-pry-clr shadow">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-acc-clr" />
                <h3 className="text-sm font-semibold text-gray-900 pry-ff">
                    {data.scope === "personal" ? "Your Appointments" : "Appointments"}
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 sec-ff">
                <div>
                    <p className="text-xs text-gray-400">Today</p>
                    <p className="text-sm font-semibold text-gray-900">{data.today}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">This Week</p>
                    <p className="text-sm font-semibold text-gray-900">{data.thisWeek.total}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Completed</p>
                    <p className="text-sm font-semibold text-gray-900">{data.thisWeek.completed}</p>
                </div>
            </div>

            <div className="flex items-end gap-1.5 h-16 sec-ff">
                {data.trend.map((p) => (
                    <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center h-12">
                            <div
                                className="w-full max-w-5 rounded-t bg-acc-clr/70"
                                style={{ height: `${Math.max(4, (p.value / maxTrend) * 100)}%` }}
                                title={`${p.value} appointments`}
                            />
                        </div>
                        <span className="text-[9px] text-gray-400">{p.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}