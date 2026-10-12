// components/notifications/InstallBanner.tsx
'use client';
import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import Image from 'next/image';

export function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="relative z-20 flex items-center gap-4 p-4 bg-pry-clr rounded-xl border border-gray-100 mb-4 pry-ff">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-2 bg-bg-clr rounded-lg text-pry-clr shrink-0">
        <Image
            src="/petark_logo.png"
            alt="PetArk Logo"
            width={24}
            height={24}
        /> 
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <h3 className="font-semibold text-sec-clr">Install PetArk</h3>
        <p className="text-sm text-gray-500">Install PetArk for a faster, better experience.</p>
      </div>

      <button
        onClick={install}
        className="px-4 py-1.5 bg-acc-clr text-pry-clr text-sm font-medium rounded-full hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
      >
        Install Now
      </button>
    </div>
  );
}