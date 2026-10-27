"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import type { Visit } from "@/lib/visit";

interface CompleteVisitBtnProps {
    visit: Visit;
    /** e.g. "/dashboard/appointments" or "/dashboard/clinical/records" */
    basePath?: string;
    /** ID used in the URL. Falls back to the appointment ID. */
    routeId?: string;
    /** No longer used: completing now happens on its own page. */
    onComplete?: (updated: Visit) => void;
}

export default function CompleteVisitBtn({
    visit,
    basePath = "/dashboard/appointments",
    routeId,
}: Readonly<CompleteVisitBtnProps>) {
    if (visit.status !== "in-progress") return null;

    const id = routeId ?? visit.appointmentId;

    return (
        <Link
            href={`${basePath}/${id}/complete-visit`}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-acc-clr text-pry-clr text-sm font-medium shadow-sm hover:bg-acc-clr/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc-clr"
        >
            <ClipboardCheck size={16} />
            Complete visit
        </Link>
    );
}