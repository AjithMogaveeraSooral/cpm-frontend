// Web Push subscription helpers. Registers the service worker, creates a browser
// PushSubscription bound to the backend's VAPID public key, and syncs it with the
// backend so the notification worker can deliver OS-level push (even when the app
// is closed). Also supports unsubscribing.

import { api } from './api-client';

interface VapidKeyResponse {
  public_key: string;
  enabled: boolean;
}

// Converts a base64url VAPID public key into the ArrayBuffer the PushManager needs.
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return buffer;
}

// Reports whether the current browser supports Web Push at all.
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/sw.js');
  if (existing) return existing;
  return navigator.serviceWorker.register('/sw.js');
}

/**
 * Enables web push for the signed-in user: requests notification permission,
 * registers the service worker, subscribes via the browser push service using
 * the backend VAPID key, and stores the subscription server-side.
 *
 * Returns true on success. Throws if permission is denied or push is disabled
 * on the backend (no VAPID key configured).
 */
export async function enablePush(): Promise<boolean> {
  if (!isPushSupported()) throw new Error('Push notifications are not supported in this browser.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const { data } = await api.get<VapidKeyResponse>('/push/vapid-public-key');
  if (!data.enabled || !data.public_key) {
    throw new Error('Push notifications are not configured on the server yet.');
  }

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  // Reuse an existing subscription if present, else create a new one.
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.public_key),
    });
  }

  const json = subscription.toJSON();
  await api.post('/push/subscribe', {
    endpoint: json.endpoint,
    keys: json.keys,
  });

  return true;
}

/** Disables web push: removes the browser subscription and the server record. */
export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  try {
    await api.post('/push/unsubscribe', { endpoint });
  } catch {
    // Best-effort server cleanup; the browser subscription is already gone.
  }
}
