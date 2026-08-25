"use client";

// components/clinic/visit-btn.tsx

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { type Appointment, updateAppointmentStatus } from "@/lib/appointment";

interface VisitBtnProps {
    appointmentId: string;
    status: Appointment["status"];
    visitStatus?: "in-progress" | "completed";
    onConfirmed?: () => void;
    basePath?: string;
}

export default function VisitBtn({
    appointmentId,
    status,
    visitStatus,
    onConfirmed,
    basePath = "/dashboard/appointments",
}: Readonly<VisitBtnProps>) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleConfirm() {
        setLoading(true);
        try {
            await updateAppointmentStatus(appointmentId, "confirmed");
            onConfirmed?.();
        } finally {
            setLoading(false);
        }
    }

    function handleCreateVisit() {
        router.push(`${basePath}/${appointmentId}/create-visit`);
    }

    // pending → "Confirm" button
    if (status === "pending") {
        return (
            <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap hover:bg-yellow-500 cursor-pointer"
            >
                {loading ? <Loader2 size={13} className="animate-spin text-yellow-900" /> : "Confirm"}
            </button>
        );
    }

    // completed / cancelled / missed → static label
    if (status !== "confirmed") {
        const labels: Partial<Record<Appointment["status"], { label: string; className: string }>> = {
            completed: { label: "Visit closed", className: "text-blue-500"  },
            cancelled: { label: "Cancelled",    className: "text-red-400"   },
            missed:    { label: "Missed",        className: "text-gray-400"  },
        };
        const fallback = labels[status];
        return fallback
            ? <span className={`text-xs italic ${fallback.className}`}>{fallback.label}</span>
            : null;
    }

    // confirmed + visit in progress
    if (visitStatus === "in-progress") {
        return <span className="text-xs italic text-orange-500">Visit in progress</span>;
    }

    // confirmed + visit completed
    if (visitStatus === "completed") {
        return <span className="text-xs italic text-blue-500">Visit closed</span>;
    }

    // confirmed + no visit yet → "Create Visit"
    return (
        <button
            onClick={handleCreateVisit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc-clr text-pry-clr text-xs font-medium transition-colors whitespace-nowrap hover:bg-acc-clr/90 cursor-pointer"
        >
            Create Visit
        </button>
    );
}