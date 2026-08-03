// components/clinic/treatment-type-config.tsx
// shared type/status config + helpers (used by both the form and the card)

import {
    Syringe, Pill, Shield, Leaf, Sparkles,
    FolderPlus, Clock, AlertTriangle, CheckCircle,
} from "lucide-react";

export interface TypeConfig {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
}

export const KNOWN_TYPE_CONFIG: Record<string, TypeConfig> = {
    vaccination: {
        label: "Vaccination",
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-100",
        icon: <Syringe size={14} />,
    },
    medication: {
        label: "Medication",
        color: "text-violet-700",
        bg: "bg-violet-50",
        border: "border-violet-100",
        icon: <Pill size={14} />,
    },
    deworming: {
        label: "Deworming",
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-100",
        icon: <Shield size={14} />,
    },
    supplement: {
        label: "Supplement",
        color: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-100",
        icon: <Leaf size={14} />,
    },
    surgery: {
        label: "Surgery",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-100",
        icon: <Sparkles size={14} />,
    },
    other: {
        label: "Other",
        color: "text-gray-700",
        bg: "bg-gray-50",
        border: "border-gray-100",
        icon: <FolderPlus size={14} />,
    },
};

const DEFAULT_TYPE_CONFIG: TypeConfig = {
    label: "Other",
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-100",
    icon: <FolderPlus size={14} />,
};

export function getTypeConfig(type: string): TypeConfig {
    const known = KNOWN_TYPE_CONFIG[type];
    if (known) return known;
    // Custom/free-text type — reuse default styling, but keep the clinic's own label
    return { ...DEFAULT_TYPE_CONFIG, label: type.charAt(0).toUpperCase() + type.slice(1) };
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active:    { label: "Active",    color: "text-blue-600 bg-blue-50",   icon: <Clock size={11} /> },
    upcoming:  { label: "Upcoming",  color: "text-amber-600 bg-amber-50", icon: <Clock size={11} /> },
    overdue:   { label: "Overdue",   color: "text-red-600 bg-red-50",     icon: <AlertTriangle size={11} /> },
    completed: { label: "Completed", color: "text-green-600 bg-green-50", icon: <CheckCircle size={11} /> },
};

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

export function getDaysUntil(iso: string): string {
    const diff = new Date(iso).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days}d`;
}