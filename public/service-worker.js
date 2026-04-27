/* eslint-disable no-restricted-globals */

// Sowntra Service Worker
// v3: JS/CSS now use Network-First so dev builds are never served stale
const CACHE_NAME = 'sowntra-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// Install Event - Pre-cache basic shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching Core Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Strategic Caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 0. Ignore non-HTTP(S) schemes and non-GET requests
  if (!url.protocol.startsWith('http') || request.method !== 'GET') {
    return;
  }

  // 1. JS/CSS Static Assets - Network-First
  //    This ensures the dev server's freshly compiled bundles always reach the browser.
  //    Falls back to cache only when offline.
  const isJSorCSS =
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.startsWith('/static/');

  if (isJSorCSS) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 2. Fonts and Images - Cache-First (these never change)
  const isStaticMedia =
    request.destination === 'font' ||
    request.destination === 'image';

  if (isStaticMedia) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Navigation Requests (HTML) - Network-First, fallback to Index
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('/index.html') || await cache.match('/');
        return fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // 4. API Calls & Others - Network-First, fallback to Cache
  event.respondWith(
    fetch(request).catch(async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      throw new Error('Network error');
    })
  );
});
