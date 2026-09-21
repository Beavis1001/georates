/* GeoRates – Startseite: Zimmer laden, Link pruefen, Preis-Check mit Live-Tabelle, Ergebnis,
 * Laenderauswahl, Permalinks, Best-of, Link-Uebernahme aus Teilen-Menue und Lesezeichen.
 *
 * Alle sichtbaren Texte laufen ueber t() aus i18n.js - vorher waren Ergebnis- und Fehlertexte
 * hart auf Deutsch, obwohl die Seite sechs Sprachen anbietet. */
(function () {
  'use strict';

  // Ruft die Serverless-Function auf (siehe georates-price-api-Repo), die ueber Proxy-Sessions
  // aus mehreren Laendern den Booking.com-Preis fuer das gewuenschte Zimmer ausliest.
  var API_BASE = 'https://georates-price-api.vercel.app/api';
  var PRICE_API_URL = API_BASE + '/check-price';
  var BESTOF_API_URL = API_BASE + '/best-of';
  var RESULT_API_URL = API_BASE + '/result';
  var PRICE_API_READY = !PRICE_API_URL.startsWith('YOUR_');

  // Sobald echte Partner-Links vorhanden sind, hier eintragen - tauchen dann automatisch in
  // den Buchungs-Anweisungen unterhalb des Ergebnisses auf. Das Impressum muss dann angepasst werden.
  var VPN_AFFILIATE_URL = 'YOUR_VPN_AFFILIATE_URL';
  var REVOLUT_AFFILIATE_URL = 'YOUR_REVOLUT_AFFILIATE_URL';

  // Die 15 festen Laender in der Reihenfolge des Backends - Grundlage fuer die Laenderauswahl.
  var FIXED_COUNTRIES = ['DE', 'CO', 'AR', 'EG', 'IN', 'VN', 'ID', 'PK', 'LK', 'PE', 'MX', 'PH', 'TH', 'US', 'JP'];

  // Die 15 festen Laender plus alle, die ueber den dynamischen Platz dazukommen koennen (das Land
  // der Unterkunft). Fehlt ein Eintrag, zeigt die Tabelle das Kuerzel - unschoen, aber nicht falsch.
  // Laendernamen kommen aus dem Browser (Intl.DisplayNames) in der aktuellen Sprache; die Liste
  // hier ist nur der Rueckfall fuer alte Browser.
  var COUNTRY_NAMES_DE = {
    DE: 'Deutschland', CO: 'Kolumbien', US: 'USA', TH: 'Thailand', IN: 'Indien', EG: 'Ägypten',
    AR: 'Argentinien', TR: 'Türkei', LK: 'Sri Lanka', VN: 'Vietnam', ID: 'Indonesien', PK: 'Pakistan',
    PE: 'Peru', MX: 'Mexiko', PH: 'Philippinen', JP: 'Japan',
    FR: 'Frankreich', IT: 'Italien', ES: 'Spanien', PT: 'Portugal', NL: 'Niederlande',
    BE: 'Belgien', AT: 'Österreich', IE: 'Irland', GR: 'Griechenland', FI: 'Finnland',
    EE: 'Estland', LV: 'Lettland', LT: 'Litauen', SK: 'Slowakei', SI: 'Slowenien',
    LU: 'Luxemburg', MT: 'Malta', CY: 'Zypern', HR: 'Kroatien', ME: 'Montenegro', XK: 'Kosovo',
    GB: 'Großbritannien', CH: 'Schweiz', SE: 'Schweden', NO: 'Norwegen', DK: 'Dänemark',
    PL: 'Polen', CZ: 'Tschechien', HU: 'Ungarn', RO: 'Rumänien', BG: 'Bulgarien',
    RS: 'Serbien', UA: 'Ukraine', IS: 'Island', AL: 'Albanien', BA: 'Bosnien-Herzegowina',
    MK: 'Nordmazedonien', MD: 'Moldau', GE: 'Georgien', AM: 'Armenien', AZ: 'Aserbaidschan',
    CA: 'Kanada', BR: 'Brasilien', CL: 'Chile', UY: 'Uruguay', PY: 'Paraguay', BO: 'Bolivien',
    EC: 'Ecuador', PA: 'Panama', CR: 'Costa Rica', GT: 'Guatemala', DO: 'Dominikanische Republik',
    JM: 'Jamaika', TT: 'Trinidad und Tobago', BS: 'Bahamas', BB: 'Barbados',
    CN: 'China', HK: 'Hongkong', TW: 'Taiwan', KR: 'Südkorea', SG: 'Singapur', MY: 'Malaysia',
    BD: 'Bangladesch', NP: 'Nepal', KH: 'Kambodscha', LA: 'Laos', MN: 'Mongolei',
    KZ: 'Kasachstan', UZ: 'Usbekistan', MV: 'Malediven', BN: 'Brunei',
    AE: 'VAE', SA: 'Saudi-Arabien', QA: 'Katar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman',
    JO: 'Jordanien', IL: 'Israel',
    MA: 'Marokko', TN: 'Tunesien', ZA: 'Südafrika', KE: 'Kenia', TZ: 'Tansania', UG: 'Uganda',
    NG: 'Nigeria', GH: 'Ghana', ET: 'Äthiopien', MU: 'Mauritius', SC: 'Seychellen',
    NA: 'Namibia', BW: 'Botswana', ZM: 'Sambia',
    AU: 'Australien', NZ: 'Neuseeland', FJ: 'Fidschi', PG: 'Papua-Neuguinea',
  };
  var displayNamesCache = {};
  function countryName(code) {
    if (!code) return '';
    var lang = (typeof window.currentLang === 'function') ? window.currentLang() : 'de';
    try {
      if (window.Intl && Intl.DisplayNames) {
        if (!displayNamesCache[lang]) displayNamesCache[lang] = new Intl.DisplayNames([lang], { type: 'region' });
        var n = displayNamesCache[lang].of(code);
        if (n && n !== code) return n;
      }
    } catch (e) { /* alter Browser */ }
    return COUNTRY_NAMES_DE[code] || code;
  }
  function t(key, vars) { return (typeof window.t === 'function') ? window.t(key, vars) : key; }
  function lang() { return (typeof window.currentLang === 'function') ? window.currentLang() : 'de'; }
  function locale() { return ({ de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', nl: 'nl-NL' })[lang()] || 'de-DE'; }

  function pctText(v) { return v === null || v === undefined ? '–' : Number(v).toLocaleString(locale(), { maximumFractionDigits: 1 }); }
  function euro(val) {
    return val.toLocaleString(locale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  function localPrice(r) {
    if (r.priceLocal === null || r.priceLocal === undefined || !r.currency) return '–';
    return r.priceLocal.toLocaleString(locale(), { maximumFractionDigits: 2 }) + ' ' + r.currency;
  }
  var escHtml = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  var BOARD_KEYS = { uebernachtung: 'idx_board_room_only', fruehstueck: 'idx_board_breakfast', halbpension: 'idx_board_half', vollpension: 'idx_board_full', allinclusive: 'idx_board_allinclusive', egal: 'idx_board_any' };
  var CANCEL_KEYS = { ja: 'idx_cancel_yes', teilweise: 'idx_cancel_partial', nein: 'idx_cancel_no', unsicher: 'idx_cancel_unsure' };
  var CANCEL_FALLBACK = { ja: 'Kostenlos stornierbar', teilweise: 'Teilweise erstattbar', nein: 'Nicht kostenlos stornierbar' };
  var DEAL_KEYS = { mobile: 'idx_deal_mobile', online_payment: 'idx_deal_online_payment', genius: 'idx_deal_genius', early: 'idx_deal_early', last_minute: 'idx_deal_last_minute', secret: 'idx_deal_secret', deal: 'idx_deal_deal' };
  function dealLabel(k) { return DEAL_KEYS[k] ? t(DEAL_KEYS[k]) : k; }
  function boardLabel(v) { return BOARD_KEYS[v] ? t(BOARD_KEYS[v]) : v; }
  function cancelLabel(v) { var s = CANCEL_KEYS[v] ? t(CANCEL_KEYS[v]) : v; return s === CANCEL_KEYS[v] ? (CANCEL_FALLBACK[v] || v) : s; }
  function hatReisedaten(link) { return /[?&](checkin|checkout)=/i.test(link || '') || /[?&]checkin_year=/i.test(link || ''); }
  function setMsg(el, text, tone) {
    el.textContent = text || '';
    el.style.color = tone === 'error' ? 'var(--danger)' : tone === 'ok' ? 'var(--accent-dark)' : 'var(--muted)';
  }
  function turnstileToken(form) {
    var v = new FormData(form).get('cf-turnstile-response');
    return v ? String(v) : '';
  }
  function turnstileReset(form) {
    if (typeof window.turnstile === 'undefined') return;
    try { window.turnstile.reset(form.querySelector('.cf-turnstile')); } catch (e) { /* ignorieren */ }
  }

  // ---- Link-Pruefung -------------------------------------------------------------------------
  // Auswertung des Logs vom 17.09.: Alle fehlgeschlagenen Checks hatten denselben Link-Typ -
  // die blanke Hotelseite ohne Reisedaten. Ohne checkin/checkout sucht Booking sich selbst einen
  // Termin aus; oft gibt es dann keine Zimmertabelle, und im schlimmsten Fall bekommt jede
  // Laender-Sitzung einen anderen Standardtermin. Deshalb: hinweisen, nicht blockieren.
  function pruefeBookingLink(link) {
    var l = (link || '').trim();
    if (!l) return null;
    if (!/^https?:\/\/([a-z0-9-]+\.)*booking\.com\//i.test(l)) return t('idx_link_err_not_booking');
    if (/\/searchresults/i.test(l)) return t('idx_link_err_searchresults');
    if (!/\/hotel\//i.test(l)) return t('idx_link_err_no_hotel');
    if (!hatReisedaten(l)) return t('idx_link_warn_no_dates');
    return null;
  }
  function ueberwacheLinkFeld(feld, kasten) {
    var pruefen = function () {
      var txt = pruefeBookingLink(feld.value);
      kasten.textContent = txt || '';
      kasten.classList.toggle('is-visible', !!txt);
    };
    feld.addEventListener('input', pruefen);
    feld.addEventListener('blur', pruefen);
    feld.addEventListener('paste', function () { setTimeout(pruefen, 0); });
    return pruefen;
  }

  // ---- Laenderauswahl -------------------------------------------------------------------------
  // Wer nur in zwei Laendern einen VPN-Server hat, braucht die anderen dreizehn nicht - und jedes
  // gesparte Land ist gesparter Proxy-Traffic. Standard: alle. Das Ausgangsland haengt das Backend
  // immer an, deshalb wird es hier nicht extra erzwungen.
  function setupCountryPicker(wrap) {
    var toggle = wrap.querySelector('.countries-toggle');
    var panel = wrap.querySelector('.countries-panel');
    var list = wrap.querySelector('.countries-list');
    var render = function () {
      list.innerHTML = FIXED_COUNTRIES.map(function (c) {
        var checked = list.querySelector('input[value="' + c + '"]');
        var on = checked ? checked.checked : true;
        return '<label class="country-chip"><input type="checkbox" value="' + c + '"' + (on ? ' checked' : '') + '> ' + escHtml(countryName(c)) + '</label>';
      }).join('');
    };
    render();
    window.addEventListener('georates:langchange', render);
    toggle.addEventListener('click', function () {
      var open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : 'block';
      toggle.setAttribute('aria-expanded', String(!open));
    });
    wrap.querySelector('.countries-all').addEventListener('click', function () {
      list.querySelectorAll('input').forEach(function (i) { i.checked = true; });
    });
    wrap.querySelector('.countries-none').addEventListener('click', function () {
      list.querySelectorAll('input').forEach(function (i) { i.checked = false; });
    });
    // null = keine Einschraenkung (Panel zu oder alles angehakt)
    return function selection() {
      if (panel.style.display === 'none') return null;
      var on = [].map.call(list.querySelectorAll('input:checked'), function (i) { return i.value; });
      if (!on.length || on.length === FIXED_COUNTRIES.length) return null;
      return on;
    };
  }

  // ---- Zimmer laden ---------------------------------------------------------------------------
  // Ruft die echten Zimmer der Booking.com-Seite ab (ein Abruf) und fuellt das Auswahl-Dropdown.
  // Je Zimmer kommen die real vorhandenen Verpflegungs- und Storno-Optionen mit und werden beim
  // Auswaehlen in die beiden Dropdowns uebernommen.
  function setupRoomLoader(form, el) {
    var boardDefault = el.board.innerHTML;
    var cancelDefault = el.cancel.innerHTML;
    var loadedRooms = [];

    el.roomSelect.addEventListener('change', function () {
      if (!el.roomSelect.value) return;
      el.room.value = el.roomSelect.value;
      // Eine alte Fehlermeldung "Bitte ein Zimmer auswaehlen" steht in einem ANDEREN Feld als
      // die Meldungen des Zimmer-Laders (request-msg gegen load-rooms-msg) und blieb deshalb
      // stehen, bis der Nutzer erneut absendet - auch wenn laengst ein Zimmer gewaehlt war.
      // Sobald eines gewaehlt ist, ist der Grund weg, also auch die Meldung.
      setMsg(el.msg, '');
      var room = loadedRooms.find(function (r) { return r.name === el.roomSelect.value; }) || {};
      if (room.boards && room.boards.length) {
        el.board.innerHTML = room.boards.map(function (v) { return '<option value="' + escHtml(v) + '">' + escHtml(boardLabel(v)) + '</option>'; }).join('')
          + '<option value="egal">' + escHtml(t('idx_board_any')) + '</option>';
        // Standard: die guenstigste Variante, die es wirklich gibt - nicht blind "Fruehstueck".
        el.board.value = room.boards[0];
      } else {
        el.board.innerHTML = boardDefault;
        el.board.value = 'egal';
      }
      if (room.cancels && room.cancels.length) {
        el.cancel.innerHTML = room.cancels.map(function (v) { return '<option value="' + escHtml(v) + '">' + escHtml(cancelLabel(v)) + '</option>'; }).join('')
          + '<option value="unsicher">' + escHtml(t('idx_cancel_unsure')) + '</option>';
      } else {
        el.cancel.innerHTML = cancelDefault;
      }
    });

    // Schritt 2 (Zimmer, Verpflegung, Storno, Laender, Absenden) ist versteckt, bis Zimmer geladen
    // sind oder jemand ausdruecklich von Hand eintragen will. Vorher standen alle Felder von Anfang
    // an da und der Lade-Knopf war ein Nebenweg; die meisten "Zimmer nicht gefunden"-Laeufe kamen
    // von frei getippten Namen - jeder davon kostet rund 30 MB Proxy-Traffic.
    var zeigeSchritt2 = function () {
      if (!el.step2) return;
      el.step2.hidden = false;
      if (el.step2Hint) el.step2Hint.hidden = true;
    };
    var zurManuellenEingabe = function () {
      zeigeSchritt2();
      el.roomSelect.style.display = 'none';
      el.room.style.display = 'block';
      el.room.focus();
      el.board.innerHTML = boardDefault;
      el.cancel.innerHTML = cancelDefault;
    };
    if (el.manualEntry) el.manualEntry.addEventListener('click', function (e) { e.preventDefault(); zurManuellenEingabe(); });

    // Enter im Link-Feld laedt die Zimmer. Ohne das schickte der Browser das Formular ab
    // (implizites Absenden ueber den versteckten Absende-Knopf in Schritt 2), und der Nutzer
    // bekam am 21.09.2026 "Bitte ein Zimmer auswaehlen", obwohl noch gar keine Zimmer da waren.
    // Link einfuegen, Enter, Zimmer sehen - das ist der erwartete Ablauf.
    el.link.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.isComposing) return;
      e.preventDefault();
      if (!el.loadBtn.disabled) el.loadBtn.click();
    });

    el.loadBtn.addEventListener('click', async function () {
      // Wer neu laedt, faengt neu an: Ein Fehler aus einem frueheren Absendeversuch gehoert
      // nicht mehr auf den Schirm, egal wie dieser Abruf ausgeht.
      setMsg(el.msg, '');
      var link = el.link.value.trim();
      if (!link) { setMsg(el.loadMsg, t('idx_load_rooms_need_link'), 'error'); return; }
      if (!PRICE_API_READY) { setMsg(el.loadMsg, t('idx_load_rooms_inactive')); return; }
      // Der Zimmer-Abruf laeuft seit dem Audit ebenfalls durch den Bot-Check: Er kostet echten
      // Proxy-Traffic. Der Turnstile-Token gilt einmal; nach dem Abruf wird das Widget neu gesetzt.
      var token = turnstileToken(form);
      if (!token) { setMsg(el.loadMsg, t('err_turnstile_missing'), 'error'); return; }
      // Rueckmeldung gehoert AUF den Knopf: Nach dem Klick schaut man auf die Stelle, die man
      // geklickt hat. Ein grauer Hinweis acht Pixel tiefer wird uebersehen.
      var btnLabel = el.loadBtn.textContent;
      el.loadBtn.disabled = true;
      el.loadBtn.setAttribute('aria-busy', 'true');
      el.loadBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>' + escHtml(t('idx_load_rooms_loading'));
      setMsg(el.loadMsg, t('idx_load_rooms_wait'));
      try {
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 55000);
        var res = await fetch(PRICE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'rooms', link: link, turnstileToken: token }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        var json = await res.json();
        if (!json || json.success === false || !json.rooms || !json.rooms.length) {
          // Die wahrscheinlichste Ursache benennen statt nur "hat nicht geklappt". Kennt das
          // Backend einen konkreten Grund (z. B. die Zaehlbremse), hat der Vorrang.
          var key = json && json.reason && ('err_' + json.reason);
          setMsg(el.loadMsg, (key && t(key) !== key) ? t(key)
            : hatReisedaten(link) ? t('idx_load_rooms_fail_with_dates') : t('idx_load_rooms_fail_no_dates'), 'error');
          // Schlaegt das Laden fehl, darf der Weg zur Handeingabe nicht verschwinden.
          if (el.step2Hint) el.step2Hint.hidden = false;
          return;
        }
        // Backend kann Objekte {name,boards,cancels} ODER (Fallback) reine Strings liefern.
        loadedRooms = json.rooms.map(function (r) { return typeof r === 'string' ? { name: r, boards: [], cancels: [] } : r; });
        // Kein Platzhalter "- Zimmer waehlen -" mehr davor. An dieser Stelle steht fest, dass
        // mindestens ein Zimmer geladen wurde (leere Antworten sind oben abgefangen), also wird
        // das erste gleich ausgewaehlt. Der Platzhalter war ein zusaetzlicher Klick fuer alle -
        // und eine Fehlerquelle, weil man ihn versehentlich wieder auswaehlen und damit ohne
        // Zimmer abschicken konnte. Aendern geht weiterhin jederzeit ueber das Dropdown.
        el.roomSelect.innerHTML = loadedRooms.map(function (r) { return '<option>' + escHtml(r.name) + '</option>'; }).join('');
        zeigeSchritt2();
        el.roomSelect.style.display = 'block';
        el.room.style.display = 'none';
        el.room.value = '';
        // change ausloesen statt nur den Wert zu setzen: Daran haengt das Befuellen von
        // Verpflegung und Storno mit den Optionen, die es fuer DIESES Zimmer wirklich gibt.
        el.roomSelect.selectedIndex = 0;
        el.roomSelect.dispatchEvent(new Event('change'));
        el.loadMsg.innerHTML = escHtml(t('idx_load_rooms_done', { n: loadedRooms.length })) + ' <a href="#" class="manual-room-link">' + escHtml(t('idx_load_rooms_manual')) + '</a>';
        el.loadMsg.style.color = 'var(--accent-dark)';
        var manual = el.loadMsg.querySelector('.manual-room-link');
        if (manual) manual.addEventListener('click', function (e) { e.preventDefault(); zurManuellenEingabe(); });
        el.roomSelect.focus();
      } catch (err) {
        setMsg(el.loadMsg, t('idx_load_rooms_timeout'), 'error');
        if (el.step2Hint) el.step2Hint.hidden = false;
      } finally {
        el.loadBtn.disabled = false;
        el.loadBtn.removeAttribute('aria-busy');
        el.loadBtn.textContent = btnLabel;
        turnstileReset(form);
      }
    });
  }

  // ---- Ergebnis-Darstellung -------------------------------------------------------------------
  function tableHtml(results, bestCountry) {
    var rows = results.map(function (r) {
      var isBest = bestCountry && r.country === bestCountry;
      var priceText = r.priceEuro !== null && r.priceEuro !== undefined ? euro(r.priceEuro) : '–';
      // Deal-Plaketten und Stichproben unter dem Laendernamen: Der Grund eines niedrigeren
      // Preises (Online-Zahlung, Mobile Rate ...) und ob zwei Abrufe verschiedene Preise zeigten.
      var extra = '';
      if (r.deals && r.deals.length) {
        extra += '<span class="deal-tags">' + r.deals.map(function (d) { return '<span class="deal-tag">' + escHtml(dealLabel(d)) + '</span>'; }).join('') + '</span>';
      }
      var samples = (r.samples || []).filter(function (v) { return v !== null && v !== undefined; });
      if (samples.length >= 2 && r.spreadPct > 0) {
        extra += '<span class="row-note">' + escHtml(t('idx_res_samples', { prices: samples.map(euro).join(' / ') })) + '</span>';
      }
      return '<tr class="' + (isBest ? 'best-row' : '') + '"><th scope="row">' + escHtml(countryName(r.country)) + extra + '</th><td>' + escHtml(localPrice(r)) + '</td><td>' + escHtml(priceText) + '</td></tr>';
    }).join('');
    return '<table class="result-table"><caption class="sr-only">' + escHtml(t('idx_table_caption')) + '</caption><thead><tr><th scope="col">' + escHtml(t('idx_th_country')) + '</th><th scope="col">' + escHtml(t('idx_th_local')) + '</th><th scope="col">' + escHtml(t('idx_th_euro')) + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  // Zwischenstand waehrend der Check noch laeuft. Bewusst ohne Bewertung: Es wird noch kein Land
  // hervorgehoben und keine Ersparnis genannt, weil beides sich mit jedem weiteren Land noch
  // aendern kann. Gezeigt werden nur die nackten Zahlen und der Fortschritt.
  function renderLiveTable(panel, live) {
    panel.style.display = 'block';
    panel.innerHTML = tableHtml(live.results, null)
      + '<div class="form-msg" style="color:var(--muted);">' + escHtml(t('idx_live_progress', { done: live.results.length, total: live.total || '?' })) + '</div>';
  }

  function renderResults(panel, json, hotelLink) {
    panel.style.display = 'block';
    if (!json || json.success === false) {
      var d = json && json.diagnose;
      var liste = function (arr) { return '<ul style="margin:6px 0 10px 18px;padding:0;">' + arr.map(function (z) { return '<li>' + escHtml(z.name) + '</li>'; }).join('') + '</ul>'; };
      // Wenn der Grund schlicht ein Zimmername ist, den es auf der Hotelseite nicht gibt, ist
      // "kein Preis gefunden" die unbrauchbarste aller Antworten. Dann zeigen wir stattdessen,
      // welche Zimmer dort tatsaechlich stehen.
      if (d && d.zimmerAufSeite && d.zimmerAufSeite.length && d.zimmerGefunden === false) {
        panel.innerHTML = '<div class="form-msg msg-error">' + escHtml(t('idx_diag_room_missing')) + '</div>'
          + '<div class="form-msg msg-muted">' + escHtml(t('idx_diag_rooms_listed')) + '</div>' + liste(d.zimmerAufSeite)
          + '<div class="form-msg msg-muted">' + escHtml(t('idx_diag_use_loader')) + '</div>';
        return;
      }
      // Zimmer steht auf der Seite, wir konnten dazu aber keine Preiszeile lesen. Das heisst NICHT
      // "ausgebucht" - beim Ruby Lilly hatte genau so ein Zimmer zwei Tarife und wurde trotzdem
      // nicht erkannt. Also nur sagen, was wir wissen.
      if (d && d.zimmerGefunden === true && d.ohneTarife === true) {
        var lesbar = (d.zimmerAufSeite || []).filter(function (z) { return (z.boards && z.boards.length) || (z.cancels && z.cancels.length); });
        panel.innerHTML = '<div class="form-msg msg-error">' + escHtml(t('idx_diag_no_price')) + '</div>'
          + (lesbar.length ? '<div class="form-msg msg-muted">' + escHtml(t('idx_diag_works_for')) + '</div>' + liste(lesbar) : '');
        return;
      }
      if (d && d.zimmerGefunden === true && d.verpflegungPasst === false) {
        var treffer = (d.zimmerAufSeite || []).filter(function (z) { return z.boards && z.boards.length; });
        panel.innerHTML = '<div class="form-msg msg-error">' + escHtml(t('idx_diag_board_mismatch')) + '</div>'
          + (treffer.length ? '<div class="form-msg msg-muted">' + escHtml(t('idx_diag_offered'))
            + escHtml(treffer.map(function (z) { return z.name + ' (' + z.boards.map(boardLabel).join(', ') + ')'; }).join(' · ')) + '</div>' : '')
          + '<div class="form-msg msg-muted">' + escHtml(t('idx_diag_set_any')) + '</div>';
        return;
      }
      var reason = json && json.reason;
      var text = (reason && t('err_' + reason) !== 'err_' + reason) ? t('err_' + reason) : t('err_generic');
      // Dem Nutzer keine fehlenden Reisedaten unterstellen, wenn sein Link welche enthaelt.
      if (reason === 'price_not_found' && hatReisedaten(hotelLink)) text = t('err_price_not_found_with_dates');
      panel.innerHTML = '<div class="form-msg msg-error">' + escHtml(text) + '</div>';
      return;
    }

    // Ein Vorsprung unter der Schwelle ist Wechselkurs-Rundung, kein Fund. Dann wird auch keine
    // Zeile als "beste" hervorgehoben - sonst sieht es aus, als haette der Check etwas gefunden.
    var relevantSaving = json.relevantSaving === true;
    var threshold = json.relevantThresholdPct != null ? json.relevantThresholdPct : 1;
    var html = tableHtml(json.results, relevantSaving && json.best ? json.best.country : null)
      + '<p class="result-partial-note">' + escHtml(t('idx_res_local_note')) + '</p>';
    var actions = [];
    if (hotelLink && /^https?:\/\//i.test(hotelLink)) {
      actions.push('<a href="' + escHtml(hotelLink) + '" target="_blank" rel="noopener" class="result-link">' + escHtml(t('idx_res_open_hotel')) + '</a>');
    }
    if (json.resultId) {
      actions.push('<button type="button" class="result-share" data-id="' + escHtml(json.resultId) + '">' + escHtml(t('idx_res_share')) + '</button>');
    }
    if (actions.length) html += '<p class="result-actions">' + actions.join(' ') + '</p>';

    var baselineName = countryName(json.baselineCountry) || json.baselineCountry || '';
    var baselineRow = json.results.find(function (r) { return r.country === json.baselineCountry; });
    var baselineMissing = !baselineRow || baselineRow.priceEuro === null;
    var isRealUrl = function (u) { return u && u.indexOf('YOUR_') !== 0; };

    if (json.fromPermalink) {
      html += '<div class="result-partial-note">' + escHtml(t('idx_res_permalink_note', { date: json.datum || '', hotel: json.hotelName || '', room: json.room || '' })) + '</div>';
    }
    if (baselineMissing) {
      html += '<div class="form-msg msg-error">' + escHtml(t('idx_res_baseline_missing', { baseline: baselineName })) + '</div>';
    } else if (json.recommendVpnCountry) {
      var cn = countryName(json.recommendVpnCountry);
      html += '<div class="result-savings">' + escHtml(t('idx_res_savings', { country: cn, pct: json.savingsPct, baseline: baselineName })) + '</div>';
      var vpnStep = t('idx_res_step_vpn', { country: escHtml(cn) })
        + (isRealUrl(VPN_AFFILIATE_URL) ? ' (<a href="' + escHtml(VPN_AFFILIATE_URL) + '" target="_blank" rel="noopener sponsored">' + escHtml(t('idx_res_step_vpn_link')) + '</a>)' : '');
      var steps = '<li>' + vpnStep + '</li><li>' + t('idx_res_step_logout') + '</li><li>' + t('idx_res_step_reload') + '</li><li>' + t('idx_res_step_currency') + '</li>';
      if (isRealUrl(REVOLUT_AFFILIATE_URL)) steps += '<li>' + t('idx_res_step_revolut', { url: escHtml(REVOLUT_AFFILIATE_URL) }) + '</li>';
      html += '<div class="result-instructions"><h4>' + escHtml(t('idx_res_steps_title')) + '</h4><ol>' + steps + '</ol></div>';
    } else if (relevantSaving && json.savingsPct != null) {
      html += '<div class="form-msg msg-ok">' + escHtml(t('idx_res_small_saving', { country: countryName(json.best.country), pct: json.savingsPct, baseline: baselineName })) + '</div>';
    } else {
      html += '<div class="form-msg msg-ok">' + escHtml(t('idx_res_none', { baseline: baselineName, threshold: threshold })) + '</div>';
    }
    if (json.convertedCurrency && threshold > 1) html += '<div class="result-partial-note">' + escHtml(t('idx_res_converted_note', { threshold: threshold })) + '</div>';
    // Preisstreuung offen benennen: zwei Abrufe im Ausgangsland, verschiedene Preise -> wir
    // rechnen gegen den niedrigeren. Das ist die Antwort auf "ihr rechnet den Ausgangspreis hoch".
    var bs = (json.baselineSamples || []).filter(function (v) { return v !== null && v !== undefined; });
    if (bs.length >= 2 && json.baselineSpreadPct > 0) {
      html += '<div class="result-partial-note">' + escHtml(t('idx_res_baseline_two', { baseline: baselineName, prices: bs.map(euro).join(' / '), pct: pctText(json.baselineSpreadPct) })) + '</div>';
    }
    if (json.userPriceEuro && json.userPriceDiffers && baselineRow && baselineRow.priceEuro !== null) {
      html += '<div class="result-partial-note">' + escHtml(t('idx_res_userprice', { ours: euro(baselineRow.priceEuro), yours: euro(json.userPriceEuro), used: euro(json.baselineUsedEuro) })) + '</div>';
    }
    if (json.confirmation && json.confirmation.done) {
      var c = json.confirmation;
      html += '<div class="result-partial-note' + (c.stable ? '' : ' msg-error') + '">' + escHtml(t(c.stable ? 'idx_res_confirmed' : 'idx_res_unstable', { country: countryName(c.country), before: pctText(c.savingsBeforePct), after: pctText(c.savingsAfterPct) })) + '</div>';
    }
    html += '<div class="result-partial-note">' + escHtml(t('idx_res_spread_note')) + '</div>';
    if (json.partial) html += '<div class="result-partial-note">' + escHtml(t('idx_res_partial')) + '</div>';
    if (json.fromCache) html += '<div class="result-partial-note">' + escHtml(t('idx_res_cache')) + '</div>';
    if (json.countries && json.countries.length && json.countries.length < FIXED_COUNTRIES.length) html += '<div class="result-partial-note">' + escHtml(t('idx_res_selection')) + '</div>';

    panel.innerHTML = html;
    var share = panel.querySelector('.result-share');
    if (share) share.addEventListener('click', function () {
      var url = location.origin + location.pathname + '?r=' + encodeURIComponent(share.getAttribute('data-id'));
      var done = function () { share.textContent = t('idx_res_share_copied'); share.disabled = true; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('Link', url); });
      else window.prompt('Link', url);
    });
  }

  // ---- Preis-Check ----------------------------------------------------------------------------
  function handleRequest(form, el, selection) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var data = {
        link: el.link.value.trim(),
        room: (el.roomSelect.style.display !== 'none' ? el.roomSelect.value : el.room.value).trim(),
        board: el.board.value,
        cancel: el.cancel.value,
        userPrice: el.userPrice ? el.userPrice.value.trim() : '',
      };
      if (!data.link) { el.link.focus(); return; }
      // Schritt 2 ist noch zu, also gibt es noch nichts zu pruefen: Ein Absenden an dieser Stelle
      // (Enter in einem Feld von Schritt 1) meint "Zimmer laden", nicht "Preis pruefen".
      if (el.step2 && el.step2.hidden) { el.loadBtn.click(); return; }
      // Frueher brach der Code hier stumm ab, wenn kein Zimmer gewaehlt war - besonders nach
      // "Zimmer laden" ohne Auswahl sah es aus, als sei der Knopf kaputt.
      if (!data.room) {
        setMsg(el.msg, t('err_room_empty'), 'error');
        (el.roomSelect.style.display !== 'none' ? el.roomSelect : el.room).focus();
        return;
      }
      var token = turnstileToken(form);
      if (!token) { setMsg(el.msg, t('err_turnstile_missing'), 'error'); return; }

      el.panel.style.display = 'none';
      if (!PRICE_API_READY) {
        window.open(data.link, '_blank', 'noopener');
        setMsg(el.msg, t('err_proxy_not_configured'));
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var submitLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>' + escHtml(t('idx_checking_btn'));

      // Statusmeldungen fuer die Anlaufphase. Sobald die erste Laenderzeile aus dem Stream
      // eintrifft, werden sie abgeschaltet - ab da ist die sich fuellende Tabelle der Fortschritt.
      var progressSteps = [t('idx_progress_1'), t('idx_progress_2'), t('idx_progress_3')];
      var stepIdx = 0;
      setMsg(el.msg, progressSteps[0]);
      var progressTimer = setInterval(function () {
        stepIdx = Math.min(stepIdx + 1, progressSteps.length - 1);
        setMsg(el.msg, progressSteps[stepIdx]);
      }, 7000);

      try {
        var controller = new AbortController();
        // Muss ueber maxDuration der Serverless-Funktion liegen (180s), sonst bricht der Browser
        // ab, waehrend der Check serverseitig noch laeuft.
        var timeout = setTimeout(function () { controller.abort(); }, 190000);
        var body = { link: data.link, room: data.room, board: data.board, cancel: data.cancel, turnstileToken: token, stream: true };
        if (data.userPrice) body.userPrice = data.userPrice;
        var countries = selection();
        if (countries) body.countries = countries;
        var res = await fetch(PRICE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        var json = null;
        var contentType = res.headers.get('Content-Type') || '';
        if (res.body && res.body.getReader && contentType.indexOf('ndjson') !== -1) {
          clearInterval(progressTimer);
          setMsg(el.msg, '');
          var live = { results: [], total: null };
          var reader = res.body.getReader();
          var decoder = new TextDecoder();
          var buffer = '';
          for (;;) {
            var chunk = await reader.read();
            if (chunk.done) break;
            buffer += decoder.decode(chunk.value, { stream: true });
            var nl;
            while ((nl = buffer.indexOf('\n')) >= 0) {
              var line = buffer.slice(0, nl).trim();
              buffer = buffer.slice(nl + 1);
              if (!line) continue;
              var evt;
              try { evt = JSON.parse(line); } catch (err2) { continue; }
              if (evt.type === 'meta') { live.total = evt.totalCountries; renderLiveTable(el.panel, live); }
              else if (evt.type === 'country') { live.results.push(evt.result); renderLiveTable(el.panel, live); }
              else if (evt.type === 'update') {
                // Bestaetigungsabruf: die Zeile des Landes wird ersetzt, nicht angehaengt.
                var idx = live.results.findIndex(function (x) { return x.country === evt.result.country; });
                if (idx >= 0) live.results[idx] = evt.result; else live.results.push(evt.result);
                renderLiveTable(el.panel, live);
              }
              else if (evt.type === 'summary') { json = evt; }
            }
          }
          if (!json) throw new Error('stream ended without summary');
        } else {
          json = await res.json();
        }
        clearTimeout(timeout);
        setMsg(el.msg, '');
        renderResults(el.panel, json, data.link);
      } catch (err) {
        setMsg(el.msg, t('err_timeout'), 'error');
      } finally {
        clearInterval(progressTimer);
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = submitLabel;
        turnstileReset(form);
      }
    });
  }

  // ---- Link von aussen uebernehmen ------------------------------------------------------------
  // Drei Wege fuehren mit Link hierher: das Teilen-Menue der installierten App (share_target im
  // Manifest, Parameter url/text), das Lesezeichen (?link=) und ein Permalink (?r=). Der Link
  // wird ins Feld gesetzt und aus der Adresszeile entfernt, damit er nicht in Verlauf und
  // Screenshots haengen bleibt.
  function uebernehmeParameter(el, pruefen) {
    var params = new URLSearchParams(location.search);
    var kandidat = params.get('link') || params.get('url') || params.get('text') || '';
    var m = kandidat.match(/https?:\/\/[^\s"'<>]+booking\.com[^\s"'<>]*/i);
    var r = params.get('r');
    if (m) {
      el.link.value = m[0];
      pruefen();
      setMsg(el.loadMsg, t('idx_prefill_done'), 'ok');
      el.link.closest('.request-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (m || r) {
      try { history.replaceState(null, '', location.pathname + (r ? '?r=' + encodeURIComponent(r) : '') + location.hash); } catch (e) { /* ignorieren */ }
    }
    if (r && /^[A-Za-z0-9_-]{12}$/.test(r) && PRICE_API_READY) {
      fetch(RESULT_API_URL + '?id=' + encodeURIComponent(r))
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (json) {
          if (!json || !json.success) return;
          renderResults(el.panel, json, '');
          el.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(function () { /* Permalink abgelaufen oder API nicht erreichbar */ });
    }
  }

  // ---- Best-of --------------------------------------------------------------------------------
  function ladeBestOf() {
    var box = document.getElementById('bestof-list');
    if (!box || !PRICE_API_READY) return;
    var render = function (eintraege) {
      if (!eintraege || !eintraege.length) { box.innerHTML = '<p class="empty">' + escHtml(t('idx_bestof_empty')) + '</p>'; return; }
      box.innerHTML = eintraege.map(function (e) {
        var open = e.resultId ? ' <a href="?r=' + escHtml(e.resultId) + '">' + escHtml(t('idx_bestof_open')) + '</a>' : '';
        return '<div class="bestof-row"><div class="bestof-hotel"><strong>' + escHtml(e.hotel || '–') + '</strong><span class="bestof-meta">' + escHtml(countryName(e.hotelLand)) + ' · ' + escHtml(t('idx_bestof_via', { country: countryName(e.land) })) + ' · ' + escHtml(e.datum || '') + open + '</span></div>'
          + '<div class="bestof-saving">−' + escHtml(String(e.pct).replace('.', lang() === 'en' ? '.' : ',')) + ' %<span>' + escHtml(euro(e.euro)) + '</span></div></div>';
      }).join('');
    };
    var daten = null;
    fetch(BESTOF_API_URL).then(function (r) { return r.ok ? r.json() : null; }).then(function (json) {
      daten = json && json.eintraege;
      render(daten);
    }).catch(function () { render(null); });
    window.addEventListener('georates:langchange', function () { render(daten); });
  }

  // ---- Bookmarklet ----------------------------------------------------------------------------
  function setupBookmarklet() {
    var a = document.getElementById('bookmarklet');
    if (!a) return;
    a.setAttribute('href', "javascript:(function(){location.href='" + location.origin + "/?link='+encodeURIComponent(location.href);})();");
    a.addEventListener('click', function (e) {
      // Ein Klick auf der eigenen Seite bringt nichts - der Knopf ist zum Ziehen gedacht.
      e.preventDefault();
    });
  }

  // ---- Mobile Navigation ----------------------------------------------------------------------
  function setupMenu() {
    var btn = document.getElementById('menu-toggle');
    var nav = document.getElementById('nav-links');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  }

  // ---- Start ----------------------------------------------------------------------------------
  function init() {
    var form = document.getElementById('request-form');
    if (!form) return;
    var el = {
      link: document.getElementById('link'), linkWarn: document.getElementById('link-warn'),
      loadBtn: document.getElementById('load-rooms'), loadMsg: document.getElementById('load-rooms-msg'),
      roomSelect: document.getElementById('room-select'), room: document.getElementById('room'),
      board: document.getElementById('board'), cancel: document.getElementById('cancel'),
      userPrice: document.getElementById('user-price'),
      msg: document.getElementById('request-msg'), panel: document.getElementById('result-panel'),
      step2: document.getElementById('step2'), step2Hint: document.getElementById('step2-hint'),
      manualEntry: document.getElementById('manual-entry'),
    };
    var pruefen = ueberwacheLinkFeld(el.link, el.linkWarn);
    var selection = setupCountryPicker(document.getElementById('countries'));
    setupRoomLoader(form, el);
    handleRequest(form, el, selection);
    uebernehmeParameter(el, pruefen);
    ladeBestOf();
    setupBookmarklet();
    setupMenu();
  }

  // i18n.js ruft window.onLanguageChange nach jedem Sprachwechsel; daran haengen wir ein Event
  // fuer die dynamischen Teile (Laender-Chips, Best-of), die sich selbst neu zeichnen.
  window.onLanguageChange = function () { window.dispatchEvent(new Event('georates:langchange')); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
