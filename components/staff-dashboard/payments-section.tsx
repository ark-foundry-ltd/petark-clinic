// components/staff-dashboard/payments-section.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Banknote, Check, CreditCard, Landmark, Loader2, ShoppingCart, Wallet } from "lucide-react";
import { toast } from "sonner";
import PermissionGate from "@/components/shared/permission-gate";
import { useAuthStore } from "@/store/useStore";
import {
  getPendingVisitPayments,
  markVisitPaid,
  type PaymentMethod,
  type PendingVisitPayment,
} from "@/lib/visit-payment";

// Anyone holding at least one of these sees the section.
// Each action inside is still gated by its own permission.
export const PAYMENT_PERMISSIONS = ["generate_invoice", "confirm_payment", "access_pos"];

// The pending list endpoint accepts these two; access_pos alone gets the POS shortcut only.
const LIST_PERMISSIONS = ["generate_invoice", "confirm_payment"];

const METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "transfer", label: "Transfer", icon: Landmark },
  { value: "pos_card", label: "POS card", icon: CreditCard },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function useCan() {
  const permissions = useAuthStore((s) => s.permissions);
  const hasAll = permissions.includes("all_permissions");
  return (...needed: string[]) => hasAll || needed.some((p) => permissions.includes(p));
}

// ─── Entry point ────────────────────────────────────────────────────────────
// The locked state renders a static placeholder, never the live body, so a
// user without access doesn't trigger the fetch behind the blur.
export default function PaymentsSection() {
  const can = useCan();

  if (!can(...PAYMENT_PERMISSIONS)) {
    return (
      <PermissionGate need={PAYMENT_PERMISSIONS} label="Payments">
        <PaymentsPlaceholder />
      </PermissionGate>
    );
  }
  return <PaymentsBody />;
}

function PaymentsPlaceholder() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3 h-56">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-12 bg-gray-100 rounded-lg" />
      <div className="h-12 bg-gray-100 rounded-lg" />
    </div>
  );
}

// ─── Body ───────────────────────────────────────────────────────────────────
function PaymentsBody() {
  const can = useCan();
  const canPos = can("access_pos");
  const canList = can(...LIST_PERMISSIONS);
  const canConfirm = can("generate_invoice", "confirm_payment");

  const [visits, setVisits] = useState<PendingVisitPayment[]>([]);
  const [count, setCount] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [loading, setLoading] = useState(canList);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    if (!canList) return;
    setFailed(false);
    try {
      const res = await getPendingVisitPayments();
      setVisits(res.data);
      setCount(res.count);
      setOutstanding(res.outstanding);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [canList]);

  useEffect(() => {
    load();
  }, [load]);

  let subtitle = "Ring up sales from the POS";
  if (canList) {
    if (loading) subtitle = "Loading…";
    else if (count === 0) subtitle = "No visits waiting for payment";
    else subtitle = `${count} awaiting payment · ${naira(outstanding)} outstanding`;
  }

  return (
    <section className="bg-white border border-gray-100 rounded-xl shadow-sm pry-ff">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-acc-clr/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-acc-clr" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Payments</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        {canPos && (
          <Link
            href="/staff-dashboard/pos"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-acc-clr text-white text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            New sale
          </Link>
        )}
      </header>

      {canList && (
        <div className="p-2">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading visits
            </div>
          )}

          {!loading && failed && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-700">Couldn&apos;t load unpaid visits.</p>
              <button onClick={load} className="mt-2 text-sm font-medium text-acc-clr hover:underline">
                Try again
              </button>
            </div>
          )}

          {!loading && !failed && visits.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-500">
              Completed visits that haven&apos;t been paid will show up here.
            </p>
          )}

          {!loading &&
            !failed &&
            visits.map((visit) => (
              <VisitRow key={visit._id} visit={visit} canConfirm={canConfirm} onPaid={load} />
            ))}

          {!loading && !failed && count > visits.length && (
            <p className="px-3 py-2 text-xs text-gray-500">
              Showing the {visits.length} most recent of {count}.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Visit row with inline confirm flow ────────────────────────────────────
function VisitRow({
  visit,
  canConfirm,
  onPaid,
}: Readonly<{ visit: PendingVisitPayment; canConfirm: boolean; onPaid: () => void }>) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    try {
      await markVisitPaid(visit._id, method);
      toast.success(`${naira(visit.total)} payment confirmed for ${visit.petName}`);
      setOpen(false);
      onPaid();
    } catch {
      toast.error("Couldn't confirm this payment. It may already be marked paid — refresh and check.");
      onPaid();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg hover:bg-gray-50/60 transition-colors">
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {visit.petName}
            {visit.ownerName && <span className="text-gray-400 font-normal"> · {visit.ownerName}</span>}
          </p>
          <p className="text-xs text-gray-500">
            Completed {new Date(visit.completedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-gray-900">{naira(visit.total)}</span>
          {canConfirm && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-white active:scale-[0.97] transition-all"
            >
              {open ? "Cancel" : "Confirm payment"}
            </button>
          )}
        </div>
      </div>

      {open && canConfirm && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-3">
          <p className="text-xs text-gray-600">How was {naira(visit.total)} paid?</p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setMethod(value)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  method === value
                    ? "border-acc-clr bg-acc-clr/5 text-acc-clr"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={confirm}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-acc-clr text-white text-sm font-medium disabled:opacity-50 active:scale-[0.97] transition-all"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Confirm {naira(visit.total)} received
          </button>
        </div>
      )}
    </div>
  );
}