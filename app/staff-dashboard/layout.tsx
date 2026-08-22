// app/staff-dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useStore";
import { logoutClinic } from "@/lib/auth";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import IdleWarningModal from "@/components/shared/idle-warning-modal";

const ROLE_LABELS: Record<string, string> = {
  vet: "Vet",
  receptionist: "Receptionist",
  sales: "Sales",
};

export default function StaffDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const clinicToken = useAuthStore((s) => s.clinic_token);
  const role = useAuthStore((s) => s.role);
  const profile = useAuthStore((s) => s.profile);

  const { showWarning, secondsLeft, stay, logoutNow } = useIdleLogout(20);

  useEffect(() => {
    if (!clinicToken) {
      router.replace("/login");
      return;
    }
    if (role === "clinic") {
      router.replace("/dashboard");
    }
  }, [clinicToken, role, router]);

  if (!clinicToken || role === "clinic" || !role) {
    return null;
  }

  const staffProfile = profile as {
    fullname?: string;
    customRoleName?: string | null;
    clinicName?: string;
  };

  const roleLabel =
    role === "custom"
      ? staffProfile?.customRoleName ?? "Custom Role"
      : ROLE_LABELS[role] ?? role;

  const initials = (staffProfile?.fullname ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    await logoutClinic();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-pry-clr">
      {showWarning && (
        <IdleWarningModal
          secondsLeft={secondsLeft}
          onStay={stay}
          onLogout={logoutNow}
        />
      )}

      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-acc-clr/10 flex items-center justify-center text-sm font-semibold text-acc-clr pry-ff">
              {initials || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 pry-ff">
                {staffProfile?.fullname ?? "Staff"}
              </p>
              <p className="text-xs text-gray-500 sec-ff">
                {roleLabel} · {staffProfile?.clinicName ?? "Clinic"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors pry-ff cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}