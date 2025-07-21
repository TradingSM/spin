self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('diamond-roulette-v1.2').then((cache) => { // Updated cache version to force refresh
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/app.js',
                '/manifest.json',
                '/icon-192.png',
                '/icon-512.png',
                '/logo.png',
                '/spin.mp3',
                '/win.mp3',
                '/lose.mp3'
            ]).catch(error => {
                console.error('Failed to add assets to cache during install:', error);
            });
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request).catch(error => {
                console.error('Fetch failed for:', e.request.url, error);
            });
        })
    );
});
