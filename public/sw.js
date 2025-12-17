
// This is a basic Service Worker to make the app installable on Android.
// It satisfies the PWA requirements: HTTPS + Manifest + Service Worker.

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Active');
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Basic pass-through fetch. 
  // In a full production app, you would add caching logic here to work offline.
  e.respondWith(fetch(e.request));
});
