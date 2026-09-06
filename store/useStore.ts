// @/store/useStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe, isClinicResponse } from "@/lib/user";
import type { User, StaffProfile } from "@/lib/user";

type Profile = User | StaffProfile;
type Role = "clinic" | "vet" | "receptionist" | "sales" | "custom";

interface AuthState {
    clinic_token: string | null;
    profile: Profile | null;
    role: Role | null;
    permissions: string[];
    activeLocationId: string | null; // staff's chosen branch for this session
    isLoading: boolean;
    error: string | null;
    hasHydrated: boolean;
}

interface AuthActions {
    setClinicToken: (clinic_token: string | null) => void;
    setProfile: (profile: Profile | null, role?: Role, permissions?: string[]) => void;
    setActiveLocationId: (locationId: string | null) => void;
    fetchProfile: () => Promise<void>;
    logout: () => void;
    clearAuth: () => void;
    setHasHydrated: (value: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            clinic_token: null,
            profile: null,
            role: null,
            permissions: [],
            activeLocationId: null,
            isLoading: false,
            error: null,
            hasHydrated: false,

            setClinicToken: (clinic_token) => set({ clinic_token }),

            setProfile: (profile, role, permissions) =>
                set({
                    profile,
                    ...(role ? { role } : {}),
                    ...(permissions ? { permissions } : {}),
                }),

            setActiveLocationId: (locationId) => set({ activeLocationId: locationId }),

            fetchProfile: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const me = await getMe();
                    const profile = isClinicResponse(me) ? me.clinic : me.profile;
                    set({ profile, role: me.role, permissions: me.permissions, isLoading: false });
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : "Failed to fetch profile",
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("clinic_token");
                    localStorage.removeItem("auth-storage");
                }
                set({
                    clinic_token: null,
                    profile: null,
                    role: null,
                    permissions: [],
                    activeLocationId: null,
                    isLoading: false,
                    error: null
                });
            },

            clearAuth: () => {
                set({
                    clinic_token: null,
                    profile: null,
                    role: null,
                    permissions: [],
                    activeLocationId: null,
                    error: null
                });
            },

            setHasHydrated: (value) => set({ hasHydrated: value }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                clinic_token: state.clinic_token,
                profile: state.profile,
                role: state.role,
                permissions: state.permissions,
                activeLocationId: state.activeLocationId,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);