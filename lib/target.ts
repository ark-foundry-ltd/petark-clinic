// lib/target.ts
import api from "@/lib/api";

export type TargetPace = "done" | "ahead" | "on_track" | "behind";

export interface TargetProgress {
    metric: string;
    label: string;
    unit: "naira" | "count";
    period: "weekly" | "monthly";
    periodKey: string;
    periodLabel: string; // "this week" | "this month"
    goal: number;
    current: number;
    remaining: number;
    percent: number; // 0-100, whole number
    elapsedFraction: number; // how much of the period has passed, 0-1
    pace: TargetPace;
    display: { goal: string; current: string; remaining: string };
}

export interface AvailableMetric {
    metric: string;
    label: string;
    unit: "naira" | "count";
    period: "weekly" | "monthly";
}

export interface TargetsResponse {
    targets: TargetProgress[];
    available: AvailableMetric[];
}

// NOTE: same assumption as lib/notification.ts: `api` returns the raw axios response (payload in `res.data`).
export async function getTargets(): Promise<TargetsResponse> {
    const { data } = await api.get<TargetsResponse>("/targets");
    return data;
}

export async function setTarget(metric: string, goal: number): Promise<TargetProgress> {
    const { data } = await api.put<{ target: TargetProgress }>(`/targets/${metric}`, { goal });
    return data.target;
}

export async function removeTarget(metric: string): Promise<void> {
    await api.delete(`/targets/${metric}`);
}