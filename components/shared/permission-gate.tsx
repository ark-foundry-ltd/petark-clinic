// components/shared/permission-gate.tsx
"use client";

import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/store/useStore";

const ALL_PERMISSIONS = "all_permissions";

interface PermissionGateProps {
  /** One permission, or a list — gate passes if the user has it (any/all, see `mode`) */
  need: string | string[];
  /** "any" (default) = needs at least one of the listed permissions. "all" = needs every one. */
  mode?: "any" | "all";
  children: ReactNode;
  /** Optional short label shown on the lock overlay, e.g. "Inventory" */
  label?: string;
}

export default function PermissionGate({
  need,
  mode = "any",
  children,
  label,
}: Readonly<PermissionGateProps>) {
  const permissions = useAuthStore((s) => s.permissions);

  const required = Array.isArray(need) ? need : [need];
  const hasAll = permissions.includes(ALL_PERMISSIONS);

  const allowed = hasAll || (
    mode === "all"
      ? required.every((p) => permissions.includes(p))
      : required.some((p) => permissions.includes(p))
  );

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-sm opacity-60"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/40">
        <div className="w-8 h-8 rounded-full bg-gray-900/80 flex items-center justify-center">
          <Lock className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-xs font-medium text-gray-700 sec-ff">
          {label ? `${label} is restricted` : "You don't have access to this"}
        </p>
      </div>
    </div>
  );
}