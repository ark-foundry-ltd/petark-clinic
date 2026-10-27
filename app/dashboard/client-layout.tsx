// app/dashboard/client-layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useStore";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { MobileBottomNav, Sidebar } from "@/components/clinic/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { NotificationPermissionBanner } from "@/components/notifications/NotificationPermissionBanner";
import { Loader2 } from "lucide-react";
import { IOSInstallBanner } from "@/components/notifications/IOSInstallBanner";
import { InstallBanner } from "@/components/notifications/InstallBanner";

function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        <DashboardHeader />
        <main className="relative flex-1 min-w-0 overflow-y-auto pb-16">
          <div className="absolute top-0 inset-x-0 z-20 p-4">
            <IOSInstallBanner />
            <InstallBanner />
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
      {/* Header and page content share the column to the right of the sidebar */}
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardHeader />
        <main className="relative flex-1 min-w-0 overflow-y-auto">
          <div className="absolute top-0 inset-x-0 z-20 p-4">
            <NotificationPermissionBanner />
            <IOSInstallBanner />
            <InstallBanner />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { clinic_token, profile, role, fetchProfile, isLoading, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

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