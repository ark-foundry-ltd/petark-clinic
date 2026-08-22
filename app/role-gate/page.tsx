// app/role-gate/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useStore";

export default function RoleGatePage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const clinicToken = useAuthStore((s) => s.clinic_token);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!clinicToken) {
        router.replace("/login");
        return;
      }

      let currentRole = role;

      if (!currentRole) {
        try {
          await fetchProfile();
          currentRole = useAuthStore.getState().role;
        } catch {
          if (!cancelled) router.replace("/login");
          return;
        }
      }

      if (cancelled) return;

      if (currentRole === "clinic") {
        router.replace("/dashboard");
      } else if (currentRole) {
        router.replace("/staff-dashboard");
      } else {
        router.replace("/login");
      }
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [role, clinicToken, fetchProfile, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-acc-clr" />
        <p className="text-sm text-gray-500 sec-ff">Taking you to your dashboard...</p>
      </div>
    </div>
  );
}