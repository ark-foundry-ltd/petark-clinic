// lib/push.ts
import api from '@/lib/api';

const SYNCED_KEY = 'petark-push-synced';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function pushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

async function getOrCreateSubscription(registration: ServiceWorkerRegistration) {
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
  });
}

// User-initiated: asks for permission, then saves the subscription to the account.
export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  const subscription = await getOrCreateSubscription(registration);
  await api.post('/push/subscribe', subscription.toJSON());
  sessionStorage.setItem(SYNCED_KEY, subscription.endpoint);
  return subscription;
}

// Call after login and on app load. Never prompts: it only re-attaches this device to the
// signed-in account when permission was already granted (covers re-login, shared computers,
// and browsers that rotate subscriptions).
export async function ensurePushSubscription() {
  if (!pushSupported() || Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await getOrCreateSubscription(registration);

  if (sessionStorage.getItem(SYNCED_KEY) === subscription.endpoint) return; // already synced this session
  await api.post('/push/subscribe', subscription.toJSON());
  sessionStorage.setItem(SYNCED_KEY, subscription.endpoint);
}

// Call on logout: removes this device from the account but keeps the browser subscription,
// so the next login can re-attach it without asking for permission again.
export async function detachPushFromAccount() {
  sessionStorage.removeItem(SYNCED_KEY);
  await api.post('/push/unsubscribe');
}

// Full opt-out: turns notifications off for this device.
export async function unsubscribeFromPush() {
  sessionStorage.removeItem(SYNCED_KEY);
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
  await api.post('/push/unsubscribe'); // always clear the server copy, even if the browser one was already gone
}

export async function sendTestNotification() {
  await api.post('/push/test-notify');
}