// components/clinic/decline-referral.tsx
"use client";

import { useState } from "react";
import { declineReferral } from "@/lib/referral";

interface DeclineReferralButtonProps {
  referralId: string;
  onDeclined: () => void;
}

export default function DeclineReferralButton({
  referralId,
  onDeclined,
}: DeclineReferralButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await declineReferral(referralId);
      onDeclined();
    } catch (err) {
      setError("Couldn't decline this referral. Try again.");
      setSubmitting(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
      >
        Decline
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Decline this referral?</span>
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        onClick={submit}
        disabled={submitting}
        className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Declining..." : "Confirm decline"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={submitting}
        className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}