// components/clinic/addon-buy-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2, Minus, Plus, X } from "lucide-react";
import {
    ADDON_PRICING,
    MAX_PACKS_PER_PURCHASE,
    initiateAddonPurchase,
    type AddonResource,
} from "@/lib/addons";

const COPY: Record<AddonResource, { title: string; unit: string; scopeNote: string }> = {
    treatments: {
        title: "Add more treatments",
        unit: "treatments",
        scopeNote: "Valid for this month only. Does not roll over.",
    },
    remindersPerMonth: {
        title: "Add more reminders",
        unit: "reminders",
        scopeNote: "Valid for this month only. Does not roll over.",
    },
    inventorySkus: {
        title: "Add more inventory items",
        unit: "inventory items",
        scopeNote: "Permanent for as long as your plan includes inventory.",
    },
};

function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString("en-NG")}`;
}

// Render this only while it should be open ({open && <AddonBuyModal ... />}),
// so the pack count resets every time it opens.
export default function AddonBuyModal({
    resource,
    onClose,
}: Readonly<{ resource: AddonResource; onClose: () => void }>) {
    const [packs, setPacks] = useState(1);
    const [buying, setBuying] = useState(false);

    const copy = COPY[resource];
    const pricing = ADDON_PRICING[resource];
    const units = pricing.unitsPerPurchase * packs;
    const price = pricing.price * packs;

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape" && !buying) onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, buying]);

    async function handleBuy() {
        setBuying(true);
        try {
            const { authorizationUrl } = await initiateAddonPurchase({ resource, packs });
            window.location.assign(authorizationUrl);
        } catch (err) {
            const message =
                err instanceof AxiosError ? err.response?.data?.message : undefined;
            toast.error(message || "We couldn't start checkout. Please try again.");
            setBuying(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            onClick={() => !buying && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={copy.title}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-pry-clr p-5 shadow-xl pry-ff sm:p-6"
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">{copy.title}</h2>
                        <p className="sec-ff mt-0.5 text-xs text-slate-500">
                            {pricing.unitsPerPurchase} {copy.unit} per pack ·{" "}
                            {formatNaira(pricing.price)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={buying}
                        aria-label="Close"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setPacks((p) => Math.max(1, p - 1))}
                            disabled={packs <= 1 || buying}
                            aria-label="Fewer packs"
                            className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[3.5rem] text-center text-sm font-semibold text-slate-900">
                            {packs} {packs === 1 ? "pack" : "packs"}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPacks((p) => Math.min(MAX_PACKS_PER_PURCHASE, p + 1))}
                            disabled={packs >= MAX_PACKS_PER_PURCHASE || buying}
                            aria-label="More packs"
                            className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="sec-ff text-right text-xs text-slate-500">
                        +{units} {copy.unit}
                        <br />
                        <span className="text-sm font-semibold text-slate-900">
                            {formatNaira(price)}
                        </span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleBuy}
                    disabled={buying}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-acc-clr py-2.5 text-sm font-semibold text-white shadow-sm shadow-acc-clr/30 hover:opacity-90 disabled:opacity-60"
                >
                    {buying && <Loader2 className="h-4 w-4 animate-spin" />}
                    {buying ? "Redirecting to checkout..." : `Pay ${formatNaira(price)}`}
                </button>

                <p className="sec-ff mt-3 text-center text-xs text-slate-400">
                    {copy.scopeNote} Paid by card. Referral credit can&apos;t be used for add-ons.
                </p>
            </div>
        </div>
    );
}