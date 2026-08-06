// components/inventory/help-tooltip.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface HelpTooltipProps {
    text: string;
    label: string; // used for aria-label, e.g. "What is SKU?"
}

export default function HelpTooltip({ text, label }: Readonly<HelpTooltipProps>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    // Close on outside click/tap, since hover alone doesn't work on touch devices
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <span ref={ref} className="relative inline-flex">
            <button
                type="button"
                aria-label={label}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                className="text-slate-300 hover:text-slate-500 focus:outline-none focus:text-slate-500"
            >
                <HelpCircle className="h-3.5 w-3.5" />
            </button>

            {open && (
                <span
                    role="tooltip"
                    className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-snug text-pry-clr shadow-lg"
                >
                    {text}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </span>
            )}
        </span>
    );
}