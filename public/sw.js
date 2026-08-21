/* Cypress PM — Web Push service worker.
 * Receives push messages from the browser's push service (even when the app is
 * closed) and shows an OS notification. Clicking it focuses/opens the console at
 * the deep-link URL carried in the push payload. */

self.addEventListener('install', () => {
  // Activate immediately so pushes work on first subscribe without a reload.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Cypress PM', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Cypress PM';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.template || 'cpm-notification',
    data: { url: data.url || '/notifications' },
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an existing tab and navigate it if one is already open.
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(target);
          return undefined;
        }
      }
      // Otherwise open a fresh window.
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    }),
  );
});
