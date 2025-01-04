const CACHE_NAME = "v0.0";
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
];

// *** Installation : Mise en cache des ressources statiques ***
self.addEventListener('install', (event) => {
  // console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // console.log('[Service Worker] Mise en cache des ressources...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  self.skipWaiting(); // Force le Service Worker à passer immédiatement à l'étape d'activation
});

// *** Activation : Nettoyage des anciens caches ***
self.addEventListener('activate', (event) => {
  // console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Suppression de l'ancien cache : ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );

  self.clients.claim(); // Rend le nouveau Service Worker actif immédiatement
});

// *** Interception des requêtes : Mise en cache ou récupération ***
self.addEventListener('fetch', (event) => {
  // Vérifie si l'URL a un schéma supporté
  if (!event.request.url.startsWith('https://')) {
    // console.log('[Service Worker] URL non supportée :', event.request.url);
    return; // Ignore cette requête
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Retourne la réponse depuis le cache
      }

      // Sinon, récupère depuis le réseau et met en cache
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

// *** Gestion des messages pour récupérer le cache actif ***
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_CACHE_NAME') {
    console.log('[Service Worker] Demande de cache reçue');
    event.ports[0].postMessage({ cacheName: CACHE_NAME });
  }
});