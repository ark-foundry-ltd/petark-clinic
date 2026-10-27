// hooks/use-logout.ts
"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useStore";
import { logoutClinic } from "@/lib/auth";
import { detachPushFromAccount } from "@/lib/push";

// One logout path for the header and both sidebars, so push is always detached first.
export function useLogout() {
    const router = useRouter();
    const { profile, logout: storeLogout } = useAuthStore();

    return async () => {
        // Must run while the token is still valid: stops this device receiving this account's pushes
        await detachPushFromAccount().catch(() => {});

        if (!profile) {
            storeLogout();
            router.replace("/login");
            return;
        }
        await logoutClinic();
        router.replace("/login");
    };
}