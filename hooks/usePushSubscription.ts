// hooks/usePushSubscription.ts
'use client';
import { useEffect, useState, useCallback } from 'react';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push';

export function usePushSubscription() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    await Promise.resolve(); // defer — avoids "setState synchronously within an effect"

    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setLoading(false);
      return;
    }
    setPermission(Notification.permission);
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setIsSubscribed(!!sub);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const subscribe = async () => {
    await subscribeToPush();
    await refresh();
  };

  const unsubscribe = async () => {
    await unsubscribeFromPush();
    await refresh();
  };

  return { permission, isSubscribed, loading, subscribe, unsubscribe };
}