// lib/plan.ts
import type { User, StaffProfile } from "@/lib/user";

export type Plan =
    | "free" | "starter" | "cms_starter"
    | "standard" | "cms_standard" | "pro" | "enterprise";

export interface PlanFeatures {
    ims: boolean;       // inventory, POS, sales history
    locations: boolean; // location management
}

// Mirror of the backend PLAN_FEATURES. Display only; the backend is the real gate.
export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
    free:         { ims: false, locations: true },
    starter:      { ims: true,  locations: true },
    cms_starter:  { ims: false, locations: false },
    standard:     { ims: true,  locations: true },
    cms_standard: { ims: false, locations: false },
    pro:          { ims: true,  locations: true },
    enterprise:   { ims: true,  locations: true },
};

// Plan not known yet (still loading): show everything so menus don't flicker.
const PERMISSIVE: PlanFeatures = { ims: true, locations: true };

export const getFeatures = (plan?: string | null): PlanFeatures =>
    plan ? PLAN_FEATURES[plan as Plan] ?? PLAN_FEATURES.free : PERMISSIVE;

// CMS plans share the rank of their IMS sibling, same as the backend.
const RANK: Record<Plan, number> = {
    free: 0, starter: 1, cms_starter: 1, standard: 2, cms_standard: 2, pro: 3, enterprise: 4,
};

export const planAtLeast = (plan: string | null | undefined, min: Plan) =>
    (RANK[plan as Plan] ?? 0) >= RANK[min];

export const PLAN_LABELS: Record<Plan, string> = {
    free: "Free", starter: "Starter", cms_starter: "CMS Starter",
    standard: "Standard", cms_standard: "CMS Standard", pro: "Pro", enterprise: "Enterprise",
};

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