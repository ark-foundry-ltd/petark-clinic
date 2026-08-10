// components/notifications/IOSInstallBanner.tsx
'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { isIOS, isStandalone } from '@/lib/platform';

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(isIOS() && !isStandalone());
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="relative z-20 flex flex-col gap-3 p-4 bg-pry-clr rounded-xl border border-gray-100 mb-4 pry-ff">
      <div className="relative flex items-center gap-4">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-2 bg-acc-clr rounded-lg text-pry-clr shrink-0">
          <Download className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-semibold text-sec-clr">Install PetArk</h3>
          <p className="text-sm text-gray-500">Install PetArk for a faster, better experience.</p>
        </div>

        <button
          onClick={() => setShowInstructions((v) => !v)}
          className="px-4 py-1.5 bg-acc-clr text-pry-clr text-sm font-medium rounded-full hover:opacity-90 transition-opacity shrink-0"
        >
          Install Now
        </button>
      </div>

      {showInstructions && (
        <p className="text-sm text-gray-500 pl-13">
          Tap the <strong className="text-sec-clr">Share</strong> icon, then <strong className="text-sec-clr">&quot;Add to Home Screen&quot;</strong> — then open PetArk from your home screen.
        </p>
      )}
    </div>
  );
}