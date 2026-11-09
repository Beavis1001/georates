/* GeoRates Service Worker – App-Shell-Cache für Offline-Nutzung & Installierbarkeit */
const CACHE = 'georates-v28';
const ASSETS = [
  '/', '/index.html', '/budget.html', '/gruppenkosten.html', '/packliste.html', '/ratgeber.html',
  '/booking-laenderpreise.html', '/hotel-vpn-guenstiger-buchen.html', '/booking-aus-japan-buchen.html',
  '/booking-indien.html', '/booking-usa.html', '/booking-laender-ranking.html',
  '/booking-tuerkei.html', '/booking-aegypten.html', '/hotel-vpn-eu-geoblocking.html',
  '/tokens.css', '/app.css', '/legal.css', '/i18n.js', '/app.js', '/pwa.js',
  '/budget.js', '/packliste.js', '/gruppenkosten.js',
  '/i18n/en.json', '/i18n/es.json', '/i18n/fr.json', '/i18n/it.json', '/i18n/nl.json',
  '/icon-192.png', '/icon-512.png', '/icon-512-maskable.png', '/favicon-32.png', '/favicon-16x16.png', '/favicon.ico',
  '/apple-touch-icon.png', '/nav-icon.png', '/logo.png', '/logo@2x.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // cache: 'reload' erzwingt, dass jede Datei frisch vom Server geholt wird, am Browser-
      // und am CDN-Zwischenspeicher vorbei. Ohne das kann beim Ausrollen ein Wettlauf
      // entstehen: GitHub Pages liefert das neue sw.js bereits aus, waehrend das CDN fuer
      // andere Dateien noch die alte Fassung hat. Der Service Worker friert dann genau diese
      // veraltete Fassung unter der NEUEN Cache-Version ein - und sie bleibt dort, bis jemand
      // die Version erneut hochzaehlt. Am 06.11.2026 ist so der frisch gebaute Besucherzaehler
      // auf der Live-Seite nicht angelaufen, obwohl die Datei auf dem Server korrekt war.
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(new Request(u, { cache: 'reload' })))))
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

  // Statische Dateien: ebenfalls erst Netzwerk, Cache nur als Offline-Reserve. Sonst wuerden
  // nach einem Update weiterhin alte Skripte/Styles ausgeliefert.
  e.respondWith(
    fetch(req)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req))
  );
});
