/* GeoRates – Service Worker registrieren und App-Installation anbieten.
 * Auf jeder Seite eingebunden (statt sechs Kopien als Inline-Skript), damit eine Content-
 * Security-Policy ohne 'unsafe-inline' fuer Skripte moeglich ist. */
(function () {
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
