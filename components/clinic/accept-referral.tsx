// components/clinic/accept-referral.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { acceptReferral, AcceptReferralResult } from "@/lib/referral";

interface AcceptReferralButtonProps {
  referralId: string;
  onAccepted: (result: AcceptReferralResult) => void;
}

export default function AcceptReferralButton({
  referralId,
  onAccepted,
}: AcceptReferralButtonProps) {
  const [showWaiverForm, setShowWaiverForm] = useState(false);
  const [feeWaived, setFeeWaived] = useState(false);
  const [waiverReason, setWaiverReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (feeWaived && waiverReason.trim() === "") {
      setError("Add a reason for waiving the fee.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await acceptReferral(referralId, {
        feeWaived,
        waiverReason: feeWaived ? waiverReason.trim() : undefined,
      });

      toast.success(
        result.alreadyPatient
          ? "Referral accepted — pet is already a registered patient here"
          : "Referral accepted — patient registered"
      );

      onAccepted(result);
    } catch (err) {
      setError("Couldn't accept this referral. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!showWaiverForm) {
    return (
      <button
        onClick={() => setShowWaiverForm(true)}
        className="w-full sm:w-auto px-3 py-1.5 text-sm font-medium rounded-md bg-acc-clr text-pry-clr hover:bg-emerald-700 transition-colors cursor-pointer"
      >
        Accept
      </button>
    );
  }

  return (
    <div className="w-full border border-emerald-200 bg-emerald-50 rounded-md p-3 flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={feeWaived}
          onChange={(e) => setFeeWaived(e.target.checked)}
          className="rounded border-gray-300"
        />
        Waive the registration fee
      </label>

      {feeWaived && (
        <textarea
          value={waiverReason}
          onChange={(e) => setWaiverReason(e.target.value)}
          placeholder="Reason for waiving the fee"
          rows={2}
          className="w-full text-sm border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full sm:w-auto px-3 py-1.5 text-sm font-medium rounded-md bg-acc-clr text-pry-clr hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? "Accepting..." : "Confirm accept"}
        </button>
        <button
          onClick={() => {
            setShowWaiverForm(false);
            setError(null);
          }}
          disabled={submitting}
          className="w-full sm:w-auto px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}