
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('greenkast-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './script.js',
        './libs/ml5.min.js',
        './libs/chart.min.js',
        './libs/leaflet.js',
        './libs/leaflet.css'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
