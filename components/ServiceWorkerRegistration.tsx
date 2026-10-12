// components/ServiceWorkerRegistration.tsx
'use client';
import { useEffect } from 'react';
import { initInstallPromptCapture } from '@/hooks/useInstallPrompt';

initInstallPromptCapture();

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);
  return null;
}