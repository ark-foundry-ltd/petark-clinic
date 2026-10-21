import type { User } from "@/lib/user";

export type ProfileSection = "businessHours" | "services" | "animals" | "registration";

export const SECTION_LABELS: Record<ProfileSection, string> = {
    businessHours: "Business hours",
    services: "Services provided",
    animals: "Animals handled",
    registration: "Patient registration",
};

export function getProfileCompletion(profile: User) {
    const sections: Record<ProfileSection, boolean> = {
        businessHours:
            !!profile.startingTime &&
            !!profile.closingTime &&
            (profile.daysOpen?.length ?? 0) > 0,
        services: (profile.servicesProvided?.length ?? 0) > 0,
        animals: (profile.animalsHandled?.length ?? 0) > 0,
        // Done once the clinic has made a choice (fee on or off).
        registration: profile.registration !== undefined && profile.registration !== null,
    };

    const keys = Object.keys(sections) as ProfileSection[];
    const missing = keys.filter((k) => !sections[k]);

    return {
        sections,
        missing,
        done: keys.length - missing.length,
        total: keys.length,
        isComplete: missing.length === 0,
    };
}