const CACHE_NAME = 'drinkometer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/css/style.css',
  '/js/main.js',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installé.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mise en cache des fichiers nécessaires.');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation et suppression des anciens caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Suppression de l'ancien cache : ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Prendre le contrôle immédiatement
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Mise à jour du Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});