// lib/plan.ts
import type { User, StaffProfile } from "@/lib/user";

export function getPlanInfo(profile: User | StaffProfile | null | undefined): {
    plan: string | undefined;
    status: string | undefined;
} {
    if (!profile) return { plan: undefined, status: undefined };

    if ("subscription" in profile) {
        return { plan: profile.subscription?.plan, status: profile.subscription?.status };
    }

    return { plan: profile.clinicPlan, status: profile.clinicPlanStatus };
}