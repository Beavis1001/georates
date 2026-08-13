/* GeoRates Service Worker – App-Shell-Cache für Offline-Nutzung & Installierbarkeit */
const CACHE = 'georates-v1';
const ASSETS = [
  '/', '/index.html', '/budget.html', '/gruppenkosten.html', '/packliste.html', '/ratgeber.html',
  '/app.css', '/legal.css', '/i18n.js',
  '/icon-192.png', '/icon-512.png', '/favicon-32.png', '/apple-touch-icon.png', '/nav-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Nur eigene GET-Anfragen behandeln; die Preis-API (andere Domain) nie abfangen/cachen.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Seitenaufrufe: erst Netzwerk (frischer Inhalt), bei Offline aus dem Cache.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Statische Dateien: aus dem Cache, sonst Netzwerk (und nachladen).
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res;
    }).catch(() => cached))
  );
});
