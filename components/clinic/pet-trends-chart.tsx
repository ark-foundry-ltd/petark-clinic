// components/clinic/pet-trends-chart.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useStore";
import { getPetTrends, type VitalsTrendPoint, type WeightTrendPoint } from "@/lib/visit";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Loader2, Weight } from "lucide-react";
import { getPlanInfo } from "@/lib/plan";
import LockedFeature from "@/components/clinic/locked-feature";

interface PetTrendsChartProps {
    petId: string;
}

const VITAL_LINES = [
    { key: "temp",        label: "Temp (°C)",   color: "#f59e0b" },
    { key: "pulse",       label: "Pulse (bpm)", color: "#3b82f6" },
    { key: "respiration", label: "Resp (brpm)", color: "#8b5cf6" },
];

export default function PetTrendsChart({ petId }: Readonly<PetTrendsChartProps>) {
    const { profile } = useAuthStore();
    const { plan, status } = getPlanInfo(profile);

    // Matches the backend gate: Pro or above, and the subscription is active
    const hasPro = (plan === "pro" || plan === "enterprise") && status === "active";

    // Set when the server says "locked" even though the profile said Pro
    // (e.g. the plan expired since the profile was loaded)
    const [serverLocked, setServerLocked] = useState(false);
    const locked = !hasPro || serverLocked;

    const [vitalsTrend, setVitalsTrend] = useState<VitalsTrendPoint[]>([]);
    const [weightTrend, setWeightTrend] = useState<WeightTrendPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!hasPro || !petId) return; // never call the Pro endpoint for other plans

        let cancelled = false;

        async function fetchTrends() {
            setLoading(true);
            setError(null);
            try {
                const res = await getPetTrends(petId);
                if (cancelled) return;

                if (res.locked) {
                    setServerLocked(true);
                    return;
                }

                setVitalsTrend(res.data.vitalsTrend);
                setWeightTrend(res.data.weightTrend);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load trends");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchTrends();

        return () => {
            cancelled = true;
        };
    }, [petId, hasPro]);

    // ── Locked: faded chart behind a lock, no error ───────────────
    if (locked) {
        return (
            <LockedFeature
                title="TPR & Vitals Trends"
                description="Track temperature, pulse, respiration and weight trends across visits."
                requiredPlan="Pro"
            />
        );
    }

    // ── Loading ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-sec-clr">TPR & Vitals Trends</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-sec-clr">TPR & Vitals Trends</h3>
                </div>
                <p className="text-sm text-red-500">{error}</p>
            </div>
        );
    }

    // ── Not enough data ───────────────────────────────────────────
    if (vitalsTrend.length < 2) {
        return (
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-sec-clr">TPR & Vitals Trends</h3>
                    <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto">
                        Pro
                    </span>
                </div>
                <p className="text-sm text-gray-400 text-center py-6">
                    Need at least 2 completed visits to show trends.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── TPR Trends chart ─────────────────────────────── */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-violet-500" />
                    <h3 className="font-semibold text-sec-clr">TPR Trends</h3>
                    <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto">
                        Pro ✦
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={vitalsTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                fontSize: 12,
                                borderRadius: 12,
                                border: "1px solid #f1f5f9",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
                            }}
                            formatter={(value, name, props) => {
                                const diagnosis = props.payload?.diagnosis;
                                return [value, diagnosis ? `${name} (${diagnosis})` : name];
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                        {VITAL_LINES.map(({ key, label, color }) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={label}
                                stroke={color}
                                strokeWidth={2}
                                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* ── Weight trajectory chart ───────────────────────── */}
            {weightTrend.length >= 2 && (
                <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Weight className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold text-sec-clr">Weight Trajectory</h3>
                        <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto">
                            Pro ✦
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={weightTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                                unit="kg"
                            />
                            <Tooltip
                                contentStyle={{
                                    fontSize: 12,
                                    borderRadius: 12,
                                    border: "1px solid #f1f5f9",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
                                }}
                                formatter={(value) => [`${value}kg`, "Weight"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                name="Weight (kg)"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}