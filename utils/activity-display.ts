// utils/activity-display.ts

import {
    UserPlus,
    CalendarPlus,
    CalendarClock,
    Stethoscope,
    CheckCircle2,
    ShoppingCart,
    Undo2,
    AlertTriangle,
    Send,
    Inbox,
    ThumbsUp,
    ThumbsDown,
    UserCog,
    Wallet,
    Circle,
} from "lucide-react";
import type { ActivityType } from "@/lib/activity";

export const ACTIVITY_ICONS: Record<ActivityType, typeof Circle> = {
    patient_new: UserPlus,
    appointment_booked: CalendarPlus,
    appointment_scheduled: CalendarClock,
    visit_new: Stethoscope,
    visit_completed: CheckCircle2,
    sale_made: ShoppingCart,
    sale_voided: Undo2,
    stock_low: AlertTriangle,
    referral_sent: Send,
    referral_received: Inbox,
    referral_accepted: ThumbsUp,
    referral_declined: ThumbsDown,
    staff_invited: UserCog,
    payment_received: Wallet,
};

export const ACTIVITY_ICON_COLORS: Record<ActivityType, string> = {
    patient_new: "text-acc-clr bg-acc-clr/10",
    appointment_booked: "text-blue-600 bg-blue-50",
    appointment_scheduled: "text-blue-600 bg-blue-50",
    visit_new: "text-acc-clr bg-acc-clr/10",
    visit_completed: "text-acc-clr bg-acc-clr/10",
    sale_made: "text-acc-clr bg-acc-clr/10",
    sale_voided: "text-red-500 bg-red-50",
    stock_low: "text-amber-600 bg-amber-50",
    referral_sent: "text-blue-600 bg-blue-50",
    referral_received: "text-blue-600 bg-blue-50",
    referral_accepted: "text-acc-clr bg-acc-clr/10",
    referral_declined: "text-red-500 bg-red-50",
    staff_invited: "text-slate-600 bg-slate-100",
    payment_received: "text-acc-clr bg-acc-clr/10",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
    patient_new: "New Patient",
    appointment_booked: "Appointment Booked",
    appointment_scheduled: "Appointment Scheduled",
    visit_new: "New Visit",
    visit_completed: "Visit Completed",
    sale_made: "Sale Made",
    sale_voided: "Sale Voided",
    stock_low: "Low Stock",
    referral_sent: "Referral Sent",
    referral_received: "Referral Received",
    referral_accepted: "Referral Accepted",
    referral_declined: "Referral Declined",
    staff_invited: "Staff Invited",
    payment_received: "Payment Received",
};

export function timeAgo(dateString: string): string {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function fullTimestamp(dateString: string): string {
    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}