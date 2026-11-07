/* ReeNomade PWA — v6.1 (shell de instalación, sin caché de datos personales). */
const CACHE_VERSION = 'reenomade-offline-v1';
const OFFLINE_URL = new URL('./offline.html', self.registration.scope).href;
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((name) => name.startsWith('reenomade-offline-') && name !== CACHE_VERSION)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Solo navegación a esta PWA. NO interceptar Firebase, terceros, API ni contenido personal.
  if (request.method !== 'GET' || request.mode !== 'navigate') return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  event.respondWith(fetch(request).catch(async () => {
    return (await caches.match(OFFLINE_URL)) || Response.error();
  }));
});
