// components/clinic/locked-feature.tsx
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

interface LockedFeatureProps {
    title: string;
    description?: string;
    // Plan name shown to the clinic, e.g. "Pro" or "Standard"
    requiredPlan: string;
    // What the faded background looks like
    preview?: "chart" | "list";
    className?: string;
}

function ChartPreview() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 400 160"
            preserveAspectRatio="none"
            className="pointer-events-none h-44 w-full select-none opacity-40 blur-[3px]"
        >
            <g stroke="#e5e7eb" strokeWidth="1">
                <line x1="0" y1="40" x2="400" y2="40" />
                <line x1="0" y1="80" x2="400" y2="80" />
                <line x1="0" y1="120" x2="400" y2="120" />
            </g>
            <polyline
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                points="0,120 50,95 100,105 150,70 200,85 250,50 300,65 350,30 400,45"
            />
            <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                points="0,135 50,125 100,130 150,110 200,118 250,100 300,108 350,90 400,96"
            />
        </svg>
    );
}

function ListPreview() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none h-44 w-full select-none space-y-3 p-5 opacity-40 blur-[3px]"
        >
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-100" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 rounded bg-gray-200" />
                        <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                    </div>
                    <div className="h-5 w-14 rounded-full bg-green-100" />
                </div>
            ))}
        </div>
    );
}

export default function LockedFeature({
    title,
    description,
    requiredPlan,
    preview = "chart",
    className = "",
}: Readonly<LockedFeatureProps>) {
    return (
        <div
            className={`relative overflow-hidden rounded-xl border border-violet-100 bg-pry-clr shadow-sm ${className}`}
        >
            {preview === "list" ? <ListPreview /> : <ChartPreview />}

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 px-6 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50">
                    <Lock className="h-5 w-5 text-violet-500" />
                </span>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                {description && <p className="max-w-xs text-xs text-gray-500">{description}</p>}
                <p className="flex items-center gap-1.5 text-xs font-medium text-violet-600">
                    <Sparkles size={13} />
                    Available on {requiredPlan}
                </p>
                <Link
                    href="/dashboard/profile/upgrade"
                    className="mt-1 rounded-lg bg-acc-clr px-4 py-1.5 text-xs font-semibold text-pry-clr hover:opacity-90"
                >
                    Upgrade
                </Link>
            </div>
        </div>
    );
}