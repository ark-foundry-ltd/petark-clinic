// app/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, TrendingUp, Calendar, Users, Activity } from "lucide-react";
import { getAnalyticsOverview, type AnalyticsOverview } from "@/lib/analytics";

function Trend({ title, points, prefix = "" }: Readonly<{ title: string; points: { label: string; value: number }[]; prefix?: string }>) {
    const max = Math.max(1, ...points.map((p) => p.value));
    return (
        <div className="rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 pry-ff mb-4">{title}</h3>
            <div className="flex items-end gap-2 h-32">
                {points.map((p) => (
                    <div key={p.label} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full flex items-end justify-center h-24">
                            <div
                                className="w-full max-w-6 rounded-t bg-acc-clr/80"
                                style={{ height: `${Math.max(4, (p.value / max) * 100)}%` }}
                                title={`${prefix}${p.value.toLocaleString()}`}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400 sec-ff">{p.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getAnalyticsOverview()
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load analytics.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-5xl px-4 py-6 space-y-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 pry-ff">Analytics</h1>
                        <p className="text-sm text-gray-500 sec-ff">
                            {data?.range
                                ? `${new Date(data.range.from).toLocaleDateString()} – ${new Date(data.range.to).toLocaleDateString()}`
                                : "Clinic performance over time"}
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-acc-clr" />
                    </div>
                )}

                {!loading && error && <p className="py-8 text-center text-sm text-red-500">{error}</p>}

                {!loading && !error && data?.locked && (
                    <div className="text-center py-16 border border-gray-100 rounded-2xl space-y-3">
                        <p className="text-sm font-medium text-gray-700 pry-ff">
                            Detailed clinic performance insights are available on Pro.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/profile/subscription")}
                            className="text-sm font-medium bg-acc-clr text-pry-clr px-4 py-2 rounded-lg pry-ff"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                )}

                {!loading && !error && data && !data.locked && (
                    <div className="space-y-6">
                        {data.snapshot && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                <Stat icon={TrendingUp} label="Revenue (MTD)" value={`₦${data.snapshot.revenue.toLocaleString()}`} />
                                <Stat icon={Activity} label="Sales" value={data.snapshot.salesCount.toLocaleString()} />
                                <Stat icon={Calendar} label="Appointments" value={data.snapshot.appointmentCount.toLocaleString()} />
                                <Stat icon={Users} label="New Patients" value={data.snapshot.newPatientsCount.toLocaleString()} />
                                <Stat icon={Users} label="Active Staff" value={data.snapshot.activeStaffCount.toLocaleString()} />
                            </div>
                        )}

                        {data.revenueTrend && (
                            <Trend title="Revenue Trend" points={data.revenueTrend} prefix="₦" />
                        )}

                        {data.appointmentTrend?.total && (
                            <Trend title="Appointment Volume" points={data.appointmentTrend.total} />
                        )}

                        {data.patientGrowthTrend && (
                            <Trend title="New Patients" points={data.patientGrowthTrend} />
                        )}

{data.staffPerformance && (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 pry-ff mb-3">Top Sales Staff</h3>
            {data.staffPerformance.salesByStaff.length === 0 ? (
                <p className="text-sm text-gray-400">No sales in this range.</p>
            ) : (
                <ul className="space-y-2.5">
                    {(() => {
                        const maxRevenue = Math.max(...data.staffPerformance.salesByStaff.map((s) => s.revenue), 1);
                        return data.staffPerformance.salesByStaff.map((s) => (
                            <li key={s.staffId ?? s.name}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-700">{s.name}</span>
                                    <span className="font-medium text-gray-900">
                                        ₦{s.revenue.toLocaleString()} <span className="text-gray-400">({s.salesCount})</span>
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-acc-clr"
                                        style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                                    />
                                </div>
                            </li>
                        ));
                    })()}
                </ul>
            )}
        </div>
        <div className="rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 pry-ff mb-3">Vet Completed Appointments</h3>
            {data.staffPerformance.appointmentsByVet.length === 0 ? (
                <p className="text-sm text-gray-400">No completed appointments in this range.</p>
            ) : (
                <ul className="space-y-2.5">
                    {(() => {
                        const maxCount = Math.max(...data.staffPerformance.appointmentsByVet.map((v) => v.completedCount), 1);
                        return data.staffPerformance.appointmentsByVet.map((v) => (
                            <li key={v.staffId ?? v.name}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-700">{v.name}</span>
                                    <span className="font-medium text-gray-900">{v.completedCount}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-acc-clr"
                                        style={{ width: `${(v.completedCount / maxCount) * 100}%` }}
                                    />
                                </div>
                            </li>
                        ));
                    })()}
                </ul>
            )}
        </div>
    </div>
)}

                        {data.weeklyVisits && (
                            <div className="rounded-xl border border-gray-100 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900 pry-ff">This Week's Visits</h3>
                                    <span className="text-xs text-gray-400">
                                        {data.weeklyVisits.completedThisWeek} of {data.weeklyVisits.totalThisWeek} completed
                                    </span>
                                </div>
                                <div className="flex items-end gap-2 h-32">
                                    {data.weeklyVisits.dailyVisits.map((d) => {
                                        const max = Math.max(1, ...data.weeklyVisits!.dailyVisits.map((x) => x.total));
                                        return (
                                            <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                                                <div className="w-full flex items-end justify-center h-24 gap-0.5">
                                                    <div
                                                        className="w-full max-w-4 rounded-t bg-acc-clr"
                                                        style={{ height: `${Math.max(4, (d.completed / max) * 100)}%` }}
                                                        title={`${d.completed} completed`}
                                                    />
                                                    <div
                                                        className="w-full max-w-4 rounded-t bg-acc-clr/25"
                                                        style={{ height: `${Math.max(4, ((d.total - d.completed) / max) * 100)}%` }}
                                                        title={`${d.total - d.completed} other`}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-400 sec-ff">{d.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function Stat({ icon: Icon, label, value }: Readonly<{ icon: typeof TrendingUp; label: string; value: string }>) {
    return (
        <div className="rounded-xl border border-gray-100 p-3">
            <Icon className="w-3.5 h-3.5 text-acc-clr mb-1" />
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-base font-semibold text-gray-900">{value}</p>
        </div>
    );
}