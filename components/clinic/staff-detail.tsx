// components/clinic/staff-detail.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck, Clock } from "lucide-react";
import { StaffRole, StaffStatus } from "@/lib/staff";

const ROLE_LABELS: Record<string, string> = {
  vet: "vet",
  receptionist: "receptionist",
  clinic: "clinic",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  invited: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-100 text-gray-500",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function StaffDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const fullname = params.get("fullname") ?? "";
  const email = params.get("email") ?? "";
  const role = (params.get("role") ?? "") as StaffRole;
  const status = (params.get("status") ?? "") as StaffStatus;
  const isEmailVerified = params.get("isEmailVerified") === "true";
  const createdAt = params.get("createdAt") ?? "";

  if (!fullname) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-gray-500 sec-ff">Staff member not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-acc-clr pry-ff hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const initials = fullname
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 pry-ff">
              Staff Profile
            </h1>
            <p className="text-sm text-gray-500 sec-ff">
              Viewing staff member details
            </p>
          </div>
        </div>

        {/* Avatar + name + status */}
        <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
          <div className="w-14 h-14 rounded-full bg-acc-clr/10 flex items-center justify-center text-lg font-semibold text-acc-clr pry-ff flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 pry-ff truncate">
              {fullname}
            </p>
            <p className="text-sm text-gray-500 sec-ff">
              {ROLE_LABELS[role] ?? role}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 sec-ff ${
              STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 sec-ff">Email</p>
              <p className="text-sm font-medium text-gray-900 pry-ff">{email}</p>
            </div>
            {isEmailVerified && (
              <ShieldCheck className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
            )}
          </div>

          {/* Invited on */}
          <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 sec-ff">Invited on</p>
              <p className="text-sm font-medium text-gray-900 pry-ff">
                {createdAt ? formatDate(createdAt) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}