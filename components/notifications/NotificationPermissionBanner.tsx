'use client';
import { useState } from 'react';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { toast } from 'sonner';

export function NotificationPermissionBanner() {
  const { permission, isSubscribed, loading, subscribe } = usePushSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Only show on first login: permission not yet decided, not subscribed, not dismissed this session
  if (loading || dismissed || permission !== 'default' || isSubscribed) return null;

  const handleEnable = async () => {
    try {
      await subscribe();
      toast.success('Notifications enabled');
    } catch {
      toast.error('Could not enable notifications');
    }
    setDismissed(true);
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-acc-clr/10 border border-acc-clr px-4 py-3 mb-4">
      <p className="text-sm text-pry-clr">Turn on notifications to get reminders and updates.</p>
      <div className="flex gap-2">
        <button onClick={handleEnable} className="text-sm font-medium text-acc-clr">Enable</button>
        <button onClick={() => setDismissed(true)} className="text-sm text-sec-clr">Not now</button>
      </div>
    </div>
  );
}