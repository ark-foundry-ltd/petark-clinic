// app/dashboard/client-layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useStore";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { MobileTopBar, MobileBottomNav, Sidebar } from "@/components/clinic/sidebar";
import { NotificationPermissionBanner } from "@/components/notifications/NotificationPermissionBanner";
import { Loader2 } from "lucide-react";

function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        <MobileTopBar />
        <main className="flex-1 min-w-0 overflow-y-auto pb-16">
          <div className="p-4 absolute z-20">
            <NotificationPermissionBanner />
          </div>
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4">
          <NotificationPermissionBanner />
        </div>
        {children}
      </main>
    </div>
  );
}

export default function DashboardClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { clinic_token, profile, role, fetchProfile, isLoading, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return; // wait for localStorage to restore before deciding anything

    if (!clinic_token) {
      router.replace("/login");
      return;
    }
    if (clinic_token && !profile && !isLoading) {
      fetchProfile().catch(console.error);
    }
  }, [hasHydrated, clinic_token, profile, isLoading, fetchProfile, router]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (role && role !== "clinic") {
      router.replace("/staff-dashboard");
    }
  }, [hasHydrated, role, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-acc-clr" />
      </div>
    );
  }

  if (!clinic_token) {
    return null;
  }

  if (clinic_token && !profile && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-acc-clr mx-auto" />
          <p className="mt-4 text-gray-600 pry-ff">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (role && role !== "clinic") {
    return null;
  }

  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
}