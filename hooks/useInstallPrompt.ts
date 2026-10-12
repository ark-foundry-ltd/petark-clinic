// hooks/useInstallPrompt.ts
'use client';
import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export function initInstallPromptCapture() {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // stop Chrome's mini-infobar, we show our own banner
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export async function promptInstall() {
  if (!deferredPrompt) return;
  const evt = deferredPrompt;
  deferredPrompt = null; // a captured prompt can only be used once
  notify();
  await evt.prompt();
  await evt.userChoice;
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export function useInstallPrompt() {
  const prompt = useSyncExternalStore(
    subscribe,
    () => deferredPrompt,
    () => null // server snapshot
  );
  return { canInstall: !!prompt, install: promptInstall };
}