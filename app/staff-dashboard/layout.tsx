// app/staff-dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useStore";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import IdleWarningModal from "@/components/shared/idle-warning-modal";
import { StaffSidebar, StaffMobileTopBar, StaffMobileBottomNav } from "@/components/staff-dashboard/sidebar";
import { SidebarProvider } from "@/context/sidebar-context";
import { Loader2 } from "lucide-react";

export default function StaffDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const clinicToken = useAuthStore((s) => s.clinic_token);
  const role = useAuthStore((s) => s.role);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const { showWarning, secondsLeft, stay, logoutNow } = useIdleLogout(20);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!clinicToken) {
      router.replace("/login");
      return;
    }
    if (role === "clinic") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, clinicToken, role, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-acc-clr" />
      </div>
    );
  }

  if (!clinicToken || role === "clinic" || !role) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white">
        {showWarning && <IdleWarningModal secondsLeft={secondsLeft} onStay={stay} onLogout={logoutNow} />}
        <StaffSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="md:hidden">
            <StaffMobileTopBar />
          </div>
          <main className="flex-1 overflow-y-auto max-w-5xl w-full mx-auto px-4 py-6 pb-20 md:pb-6">
            {children}
          </main>
          <div className="md:hidden">
            <StaffMobileBottomNav />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}