// components/clinic/mark-visit-paid-btn.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Banknote, CreditCard, Landmark, Loader2 } from "lucide-react";
import { markVisitPaid, type PaymentMethod, type Visit } from "@/lib/visit";

interface MarkVisitPaidBtnProps {
    visit: Visit;
    onPaid: (updated: Visit) => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "transfer", label: "Transfer", icon: Landmark },
    { value: "pos_card", label: "POS / Card", icon: CreditCard },
];

export default function MarkVisitPaidBtn({ visit, onPaid }: Readonly<MarkVisitPaidBtnProps>) {
    const [selected, setSelected] = useState<PaymentMethod | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (visit.status !== "completed") {
        return (
            <p className="text-xs text-gray-400 text-center py-2">
                Payment can be recorded once the visit is completed
            </p>
        );
    }

    const handleConfirm = async () => {
        if (!selected) {
            toast.error("Select a payment method first");
            return;
        }
        setSubmitting(true);
        try {
            const updated = await markVisitPaid(visit._id, { paymentMethod: selected });
            toast.success("Visit marked as paid");
            onPaid({ ...visit, ...updated });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not mark visit as paid");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setSelected(value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-colors ${
                            selected === value
                                ? "border-acc-clr bg-green-50 text-acc-clr"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>
            <button
                type="button"
                disabled={!selected || submitting}
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-acc-clr text-pry-clr text-sm font-semibold py-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity sec-ff cursor-pointer"
            >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Confirm Payment"}
            </button>
        </div>
    );
}