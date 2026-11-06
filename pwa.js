/* GeoRates – Service Worker registrieren und App-Installation anbieten.
 * Auf jeder Seite eingebunden (statt sechs Kopien als Inline-Skript), damit eine Content-
 * Security-Policy ohne 'unsafe-inline' fuer Skripte moeglich ist. */
(function () {
  // Besucherzaehler. Ein Signal je Seitenansicht an die eigene API - kein Cookie, kein
  // Drittanbieter, keine Einwilligung noetig. Uebertragen werden nur Pfad und verweisende
  // Domain; Land und Einzelbesucher-Kennung bildet der Server selbst (api/hit.js).
  // Scheitert der Aufruf, passiert nichts weiter: Messen darf die Seite nie stoeren.
  // Nur die echte Seite zaehlt. Aufrufe von localhost (Entwicklung, e2e-Test) wuerden die
  // Statistik verfaelschen - und in der CI gibt es kein Netz nach aussen, der fehlgeschlagene
  // Aufruf landet dort als Konsolenfehler und laesst den e2e-Test rot werden.
  try {
    var host = location.hostname;
    if (host === 'georates.tech' || /\.georates\.tech$/.test(host)) {
      var ziel = 'https://georates-price-api.vercel.app/api/hit'
        + '?p=' + encodeURIComponent(location.pathname)
        + (document.referrer ? '&r=' + encodeURIComponent(document.referrer) : '');
      fetch(ziel, { method: 'GET', mode: 'cors', cache: 'no-store', keepalive: true })
        .catch(function () { /* Messung ist Zugabe */ });
    }
  } catch (e) { /* Messung ist Zugabe */ }

  if ('serviceWorker' in navigator) {
    addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () { /* offline-Funktion ist Zugabe */ });
    });
  }

  // Installations-Hinweis gibt es nur auf Seiten mit dem Kasten (Startseite).
  var box = document.getElementById('pwa-install');
  var btn = document.getElementById('pwa-install-btn');
  var closeBtn = document.getElementById('pwa-install-close');
  var txt = document.getElementById('pwa-install-text');
  if (!box || !btn || !closeBtn || !txt) return;
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var hidden = false;
  try { hidden = localStorage.getItem('pwaHide') === '1'; } catch (e) { /* ignorieren */ }
  if (standalone || hidden) return;

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    btn.style.display = '';
    box.style.display = 'block';
  });

  // iOS bietet keinen Installations-Prompt an - dort die manuelle Anleitung zeigen.
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  if (isIOS) {
    btn.style.display = 'none';
    txt.setAttribute('data-i18n', 'idx_pwa_ios');
    if (typeof window.t === 'function') txt.textContent = window.t('idx_pwa_ios');
    box.style.display = 'block';
  }

  btn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; box.style.display = 'none'; });
  });
  closeBtn.addEventListener('click', function () {
    box.style.display = 'none';
    try { localStorage.setItem('pwaHide', '1'); } catch (e) { /* ignorieren */ }
  });
})();
