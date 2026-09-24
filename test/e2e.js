// End-to-End-Tests der Startseite und der Rechner im echten Chromium, ohne Netz nach aussen.
//
// Die Preis-API und Turnstile werden mit page.route gemockt: Kein Abruf gegen Booking, kein
// Proxy-Traffic, kein Token. Alle Hotel- und Reisedaten hier sind erfunden (Regel 4 in CLAUDE.md).
//
// Anlass (21.09.2026): Enter im Link-Feld schickte das Formular ab und zeigte "Bitte ein Zimmer
// auswaehlen", obwohl noch keine Zimmer geladen waren. test/check.js prueft nur Text, so ein
// Ablauffehler faellt erst im Browser auf. Diese Tests liefen bis dahin nur ausserhalb des Repos.
//
// Aufruf:  cd test && npm install && npx playwright install chromium && node e2e.js
// Laeuft als Job "e2e" in .github/workflows/check.yml. Startet einen eigenen kleinen Server, weil
// fetch() auf i18n/*.json unter file:// nicht funktioniert.

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };
function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p === '/') p = '/index.html';
      const datei = path.join(ROOT, p);
      if (!datei.startsWith(ROOT) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(datei)] || 'application/octet-stream' });
      fs.createReadStream(datei).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

let fehler = 0;
const ok = (name, cond, info) => { if (!cond) fehler++; console.log((cond ? 'OK   | ' : 'FEHL | ') + name + (info !== undefined && !cond ? '  [' + String(info).slice(0, 160) + ']' : '')); };

// Erfundene Daten. Der Link traegt Reisedaten, damit die Formularpruefung den "echten" Fall sieht.
const LINK = 'https://www.booking.com/hotel/de/beispiel.de.html?checkin=2027-03-01&checkout=2027-03-03'; // leck-check-ok: erfundenes Hotel
const CORS = { 'access-control-allow-origin': '*' };
const TURNSTILE_STUB = 'window.turnstile={reset(){}};document.addEventListener("DOMContentLoaded",()=>{const f=document.getElementById("request-form");const i=document.createElement("input");i.type="hidden";i.name="cf-turnstile-response";i.value="tok";f.appendChild(i);});';
const ROOMS = { success: true, rooms: [{ name: 'Doppelzimmer <Meerblick>', boards: ['uebernachtung', 'fruehstueck'], cancels: ['ja', 'nein'] }, { name: 'Suite', boards: [], cancels: [] }], baselineCountry: 'DE' };
function ndjson(zeilen) { return zeilen.map((z) => JSON.stringify(z)).join('\n') + '\n'; }

async function neueSeite(browser, opts) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'de-DE' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route(/challenges\.cloudflare\.com/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: TURNSTILE_STUB }));
  const calls = [];
  await page.route(/api\/check-price/, async (r) => {
    const body = JSON.parse(r.request().postData());
    calls.push(body);
    if (body.mode === 'rooms') return r.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(ROOMS) });
    return r.fulfill({ status: 200, contentType: 'application/x-ndjson; charset=utf-8', headers: CORS, body: opts.preisAntwort(body) });
  });
  await page.route(/api\/best-of/, (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(opts.bestOf || { success: true, eintraege: [] }) }));
  await page.route(/api\/result\?id=/, (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(opts.permalink || { success: false }) }));
  return { page, ctx, errors, calls };
}

// ---- 1. Zwei-Schritte-Formular, Stream, Permalink, Sprache, Mobil -------------------------------
async function zweiSchritte(browser, base) {
  const results = ['DE', 'CO', 'JP', 'US'].map((c, i) => ({ country: c, priceEuro: [1000, 890, 950, 980][i], priceLocal: [1000, 4000000, 160000, 1080][i], currency: ['EUR', 'COP', 'JPY', 'USD'][i] }));
  const summary = { type: 'summary', success: true, results, best: results[1], savingsPct: 11, relevantSaving: true, relevantThresholdPct: 3, convertedCurrency: true, recommendVpnCountry: 'CO', baselineCountry: 'DE', partial: false, resultId: 'abcDEF123456', countries: ['DE', 'CO', 'JP', 'US'] };
  const { page, ctx, errors, calls } = await neueSeite(browser, {
    preisAntwort: () => ndjson([{ type: 'meta', baselineCountry: 'DE', totalCountries: 4 }].concat(results.map((x) => ({ type: 'country', result: x }))).concat([summary])),
    bestOf: { success: true, eintraege: [{ hotel: 'Beispiel Hof', hotelLand: 'DE', land: 'JP', pct: 9.1, euro: 53.54, datum: '2026-09-18', resultId: 'abcDEF123456' }] },
    permalink: Object.assign({}, summary, { type: undefined, fromPermalink: true, hotelName: 'Beispiel Hof', room: 'Suite', datum: '2026-09-18' }),
  });
  await page.goto(base + '?link=' + encodeURIComponent(LINK), { waitUntil: 'load' });
  await page.waitForTimeout(400);
  ok('Link aus ?link= uebernommen', (await page.inputValue('#link')) === LINK);
  ok('Adresszeile bereinigt', !(await page.evaluate(() => location.search)).includes('link='));
  ok('Best-of gerendert', (await page.textContent('#bestof-list')).includes('Beispiel Hof'));
  ok('Bookmarklet href gesetzt', (await page.getAttribute('#bookmarklet', 'href')).startsWith('javascript:'));
  ok('Verpflegung-Standard = egal', (await page.inputValue('#board')) === 'egal');
  ok('Schritt 2 anfangs versteckt', !(await page.isVisible('#step2')));
  ok('Turnstile vor dem Lade-Knopf', await page.evaluate(() => { const els = [...document.getElementById('request-form').querySelectorAll('.cf-turnstile,#load-rooms')]; return els[0].classList.contains('cf-turnstile') && els[1].id === 'load-rooms'; }));

  // Handeingabe ohne Zimmer -> Meldung
  await page.click('#manual-entry'); await page.waitForTimeout(100);
  ok('Handeingabe zeigt Schritt 2 mit Textfeld', (await page.isVisible('#step2')) && (await page.isVisible('#room')) && !(await page.isVisible('#room-select')));
  await page.click('#request-form button[type="submit"]'); await page.waitForTimeout(200);
  ok('Leeres Zimmer wird gemeldet', (await page.textContent('#request-msg')).includes('Zimmer'));

  // Zimmer laden -> erstes Zimmer gewaehlt, Optionen uebernommen, Meldung weg
  await page.click('#load-rooms');
  await page.waitForSelector('#room-select:not([style*="display: none"])', { timeout: 5000 });
  ok('rooms-Aufruf traegt turnstileToken', calls[0].mode === 'rooms' && calls[0].turnstileToken === 'tok');
  ok('Erstes Zimmer direkt ausgewaehlt', (await page.inputValue('#room-select')) === 'Doppelzimmer <Meerblick>');
  ok('Alte Fehlermeldung nach Auswahl weg', (await page.textContent('#request-msg')).trim() === '');
  ok('Zimmername mit < > sauber escaped', (await page.$$eval('#room-select option', (o) => o.map((x) => x.textContent))).includes('Doppelzimmer <Meerblick>'));
  ok('Verpflegung aus Zimmeroptionen', (await page.$$eval('#board option', (o) => o.map((x) => x.value))).join(',') === 'uebernachtung,fruehstueck,egal');
  ok('Storno aus Zimmeroptionen', (await page.$$eval('#cancel option', (o) => o.map((x) => x.value))).join(',') === 'ja,nein,unsicher');

  // Laenderauswahl: nur JP + US
  await page.click('.countries-toggle'); await page.click('.countries-none');
  await page.check('.countries-list input[value="JP"]'); await page.check('.countries-list input[value="US"]');

  // Preis-Check mit Stream
  await page.click('#request-form button[type="submit"]');
  await page.waitForSelector('.result-savings', { timeout: 8000 });
  const call = calls[calls.length - 1];
  ok('Preis-Check sendet Zimmer, stream, countries', call.room === 'Doppelzimmer <Meerblick>' && call.stream === true && JSON.stringify(call.countries) === '["US","JP"]', JSON.stringify(call.countries));
  const panel = await page.textContent('#result-panel');
  ok('Ersparnis-Text mit Laendernamen', /Kolumbien.*11.*Deutschland/.test(panel), panel.slice(0, 120));
  ok('Hinweis auf 3-%-Schwelle bei Umrechnung', panel.includes('3 %'));
  ok('Waehrungs-Schritt in der Anleitung', panel.includes('Währung der Unterkunft'));
  ok('Ergebnis-Link-Knopf vorhanden', !!(await page.$('.result-share')));
  ok('Tabelle mit Zeilenkoepfen', (await page.$$eval('#result-panel th[scope="row"]', (x) => x.length)) === 4);
  ok('Hotel-Link im href unveraendert', (await page.getAttribute('#result-panel a.result-link', 'href')) === LINK);

  // Permalink
  await page.goto(base + '?r=abcDEF123456', { waitUntil: 'load' });
  await page.waitForSelector('#result-panel .result-savings', { timeout: 5000 });
  ok('Permalink rendert Ergebnis', (await page.textContent('#result-panel')).includes('Beispiel Hof'));

  // Sprachwechsel
  await page.selectOption('#lang-switch', 'en'); await page.waitForTimeout(600);
  ok('EN: Knopf "Load rooms"', (await page.textContent('#load-rooms')).includes('Load rooms'));
  ok('EN: Laender-Chips uebersetzt', (await page.textContent('.countries-list')).includes('Germany'));
  await page.evaluate(() => localStorage.setItem('georates_lang', 'de'));

  // Mobil
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(400);
  ok('Mobil: Menue-Knopf sichtbar', await page.isVisible('#menu-toggle'));
  await page.click('#menu-toggle');
  ok('Mobil: Menue klappt auf', await page.isVisible('#nav-links a[href="ratgeber.html"]'));
  ok('Mobil: SVG-Anleitung versteckt', !(await page.isVisible('.guide-diagram')));
  ok('Mobil: kein horizontales Scrollen', !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)));
  for (const p of ['ratgeber.html', 'datenschutz.html', 'impressum.html', 'agb.html']) {
    await page.goto(base + p, { waitUntil: 'load' }); await page.waitForTimeout(150);
  }
  ok('Zwei Schritte: keine JS-Fehler', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 2. Preisstreuung: Deals, Stichproben, update-Zeile, Nutzerpreis, nicht stabil -------------
async function streuung(browser, base) {
  const de = { country: 'DE', priceEuro: 1264, priceLocal: 1264, currency: 'EUR', samples: [1292.06, 1264], spreadPct: 2.2, deals: [] };
  const co = { country: 'CO', priceEuro: 890, priceLocal: 4000000, currency: 'COP', deals: ['online_payment'] };
  const coUpd = Object.assign({}, co, { priceEuro: 1250, samples: [890, 1250], spreadPct: 40.4 });
  const jp = { country: 'JP', priceEuro: 1150, priceLocal: 190000, currency: 'JPY', deals: ['mobile'] };
  // Smartphone-Zeile (API-Experiment MOBILE_CHECK): 1.080 gegen 1.200 = 10 %, schlaegt Japan (1.150).
  const mobil = { country: 'DE', device: 'Android/Smartphone', mobile: true, priceEuro: 1080, priceLocal: 1080, currency: 'EUR', deals: ['mobile'] };
  const mobilBewertet = Object.assign({}, mobil, { samples: [1080, 1080], spreadPct: 0, savingsPct: 10, relevant: true, implausible: false, beatsBestCountry: true, confirmation: { done: true, savingsBeforePct: 10, savingsAfterPct: 10, stable: true } });
  const summary = { type: 'summary', success: true, results: [de, coUpd, jp], best: jp, savingsPct: 9, relevantSaving: true, relevantThresholdPct: 3, convertedCurrency: true, recommendVpnCountry: null, baselineCountry: 'DE',
    baselineUsedEuro: 1200, userPriceEuro: 1200, userPriceDiffers: true, baselineSamples: [1292.06, 1264], baselineSpreadPct: 2.2, mobile: mobilBewertet,
    confirmation: { done: true, country: 'CO', savingsBeforePct: 29.6, savingsAfterPct: 9, stable: false }, partial: false, resultId: 'abcDEF123456', countries: ['DE', 'CO', 'JP'] };
  const { page, ctx, errors, calls } = await neueSeite(browser, {
    preisAntwort: () => ndjson([{ type: 'meta', baselineCountry: 'DE', totalCountries: 3 }, { type: 'mobile', result: mobil }].concat([de, co, jp].map((x) => ({ type: 'country', result: x }))).concat([{ type: 'update', result: coUpd }, summary])),
  });
  await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(300);
  await page.fill('#link', LINK); await page.click('#manual-entry'); await page.fill('#room', 'Doppelzimmer'); await page.fill('#user-price', '1.200,00');
  await page.click('#request-form button[type="submit"]');
  await page.waitForSelector('#result-panel .result-partial-note', { timeout: 8000 }); await page.waitForTimeout(200);
  ok('userPrice wird mitgeschickt', calls[0].userPrice === '1.200,00');
  const txt = await page.textContent('#result-panel');
  ok('update ersetzt Zeile statt anzuhaengen (3 Laender + 1 Smartphone-Zeile)', (await page.$$eval('#result-panel tbody tr', (x) => x.length)) === 4);
  ok('Smartphone-Zeile direkt unter Deutschland mit Plakette', (await page.$$eval('#result-panel tbody tr', (x) => x.map((r) => r.className + ':' + r.firstChild.textContent.slice(0, 11)))).slice(0, 2).join('|') === ':Deutschland|mobile-row:Deutschland' && (await page.textContent('.mobile-row .device-tag')) === 'Smartphone');
  ok('Smartphone schlaegt alle Laender (Text, 10 %, kein VPN)', /schlägt alle Länder/.test(txt) && txt.includes('10 %') && /ohne VPN/.test(txt));
  ok('Smartphone: Weg zum Preis genannt', txt.includes('Booking-App'));
  ok('Smartphone-Preis bestaetigt', /Smartphone-Preis bestätigt/.test(txt));
  ok('Deal-Tag Online-Zahlung', txt.includes('Rabatt für Online-Zahlung'));
  ok('Deal-Tag Mobile Rate', txt.includes('Mobile Rate'));
  ok('Mehrere Ausgangspreise mit lokalisiertem Prozent', /mehreren Abrufen verschiedene Preise/.test(txt) && txt.includes('2,2 %'));
  ok('Nutzerpreis-Hinweis', txt.includes('Du siehst 1.200,00 €'));
  ok('Nicht stabil fuer Kolumbien', /nicht stabil/.test(txt) && txt.includes('Kolumbien'));
  ok('Streuungshinweis', txt.includes('pro Sitzung'));
  ok('Zeilen-Notiz mit Abrufen', txt.includes('Abrufe: 1.292,06 € / 1.264,00 €') && !txt.includes('zwei Abrufe'));
  ok('Streuung: keine JS-Fehler', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 2b. Handy-Rabatt nicht in jeder Sitzung (echter Lauf 24.09.2026, Zahlen nachgestellt) ----
async function handySchwankt(browser, base) {
  const de = { country: 'DE', priceEuro: 194.56, priceLocal: 194.56, currency: 'EUR', samples: [209.1, 209.1, 194.56], spreadPct: 7.5, deals: ['deal'] };
  const inn = { country: 'IN', priceEuro: 187.38, priceLocal: 20446.07, currency: 'INR', deals: ['online_payment'] };
  const mobil = { country: 'DE', device: 'Android/Smartphone', mobile: true, priceEuro: 209, priceLocal: 209, currency: 'EUR', samples: [188, 209], spreadPct: 11.2, deals: ['mobile'],
    savingsPct: -7.4, relevant: false, implausible: false, beatsBestCountry: false, schwankt: true, bestSeenEuro: 188, bestSeenSavingsPct: 3.4,
    confirmation: { done: true, savingsBeforePct: 10.1, savingsAfterPct: -7.4, stable: false } };
  const summary = { type: 'summary', success: true, results: [de, inn], best: inn, savingsPct: 3.7, relevantSaving: true, relevantThresholdPct: 3, convertedCurrency: true, recommendVpnCountry: null, baselineCountry: 'DE',
    baselineUsedEuro: 194.56, baselineSamples: [209.1, 209.1, 194.56], baselineSpreadPct: 7.5, mobile: mobil,
    confirmation: { done: true, country: 'IN', savingsBeforePct: 10.4, savingsAfterPct: 3.7, stable: true }, partial: false, resultId: 'abcDEF654321', countries: ['DE', 'IN'] };
  const { page, ctx, errors } = await neueSeite(browser, { preisAntwort: () => ndjson([{ type: 'meta', baselineCountry: 'DE', totalCountries: 2 }].concat([de, inn].map((x) => ({ type: 'country', result: x }))).concat([{ type: 'mobile', result: mobil }, summary])) });
  await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(300);
  await page.fill('#link', LINK); await page.click('#manual-entry'); await page.fill('#room', 'Doppelzimmer');
  await page.click('#request-form button[type="submit"]');
  await page.waitForSelector('#result-panel .result-partial-note', { timeout: 8000 }); await page.waitForTimeout(200);
  const txt = await page.textContent('#result-panel');
  ok('Handy-Zeile zeigt Preis statt "–"', (await page.textContent('.mobile-row')).includes('209,00 €'));
  ok('Hinweis: Rabatt nicht in jeder Sitzung, beide Preise, 3,4 %', /nicht in jeder Sitzung/.test(txt) && txt.includes('188,00 € / 209,00 €') && txt.includes('3,4 %'));
  ok('kein roter "nicht stabil"-Hinweis fuer das Handy daneben', !/Smartphone-Vorteil nicht stabil/.test(txt));
  ok('Prozent in der Zusammenfassung lokalisiert (3,7 statt 3.7)', txt.includes('3,7 %') && !txt.includes('3.7 %'));
  ok('Handy schwankt: keine JS-Fehler', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 3. Enter im Link-Feld laedt Zimmer (Anlass dieses Tests, 21.09.2026) ---------------------
async function enterLaedtZimmer(browser, base) {
  const { page, ctx, errors, calls } = await neueSeite(browser, { preisAntwort: () => ndjson([{ type: 'summary', success: false, reason: 'error' }]) });
  await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(300);
  await page.fill('#link', LINK);
  await page.press('#link', 'Enter');
  await page.waitForSelector('#room-select:not([style*="display: none"])', { timeout: 5000 });
  ok('Enter loest genau einen rooms-Aufruf aus', calls.length === 1 && calls[0].mode === 'rooms', JSON.stringify(calls.map((c) => c.mode)));
  ok('Enter: keine Fehlermeldung', (await page.textContent('#request-msg')).trim() === '', await page.textContent('#request-msg'));
  ok('Enter: Schritt 2 offen, erstes Zimmer gewaehlt', (await page.isVisible('#step2')) && (await page.inputValue('#room-select')) === 'Doppelzimmer <Meerblick>');
  await page.press('#link', 'Enter'); await page.waitForTimeout(500);
  ok('Zweites Enter im Link-Feld laedt erneut Zimmer', calls.length === 2 && calls[1].mode === 'rooms');
  await page.press('#user-price', 'Enter'); await page.waitForTimeout(500);
  ok('Enter in Schritt 2 startet den Preis-Check', calls.length === 3 && calls[2].mode !== 'rooms');
  await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(300);
  const n = calls.length; await page.press('#link', 'Enter'); await page.waitForTimeout(300);
  ok('Leerer Link + Enter: kein Aufruf, Hinweis am Lade-Knopf', calls.length === n && (await page.textContent('#load-rooms-msg')).length > 0);
  ok('Enter: keine JS-Fehler', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 4. Rechner (seit 21.09.2026 mit ausgelagertem Skript und strenger CSP) -------------------
async function rechner(browser, base) {
  const ctx = await browser.newContext({ locale: 'de-DE' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(base + 'budget.html', { waitUntil: 'load' });
  await page.fill('#personen', '2'); await page.fill('#naechte', '3'); await page.selectOption('#preset', 'mittel');
  await page.click('#calc-btn'); await page.waitForTimeout(100);
  ok('Budget: Ergebnis sichtbar', await page.isVisible('#result-panel'));
  ok('Budget: Gesamtsumme berechnet', /\d/.test(await page.textContent('#r-gesamt')), await page.textContent('#r-gesamt'));

  await page.goto(base + 'packliste.html', { waitUntil: 'load' });
  await page.fill('#tage', '5');
  await page.click('#gen-btn'); await page.waitForTimeout(200);
  ok('Packliste: Checkboxen erzeugt', (await page.$$eval('input[type="checkbox"]', (x) => x.length)) > 5);

  await page.goto(base + 'gruppenkosten.html', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await page.fill('#member-input', 'Anna <b>'); await page.click('#add-member-btn'); await page.waitForTimeout(200);
  ok('Gruppenkosten: Mitglied erscheint escaped', (await page.textContent('#member-chips')).includes('Anna <b>') && !(await page.$('#member-chips b')));
  ok('Gruppenkosten: in localStorage gespeichert', (await page.evaluate(() => localStorage.getItem('georates_gruppenkosten_v1') || '')).includes('Anna'));
  ok('Rechner: keine JS-Fehler (auch keine CSP-Blockade)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

(async () => {
  const { srv, base } = await startServer();
  const browser = await chromium.launch();
  try {
    for (const suite of [zweiSchritte, streuung, handySchwankt, enterLaedtZimmer, rechner]) {
      console.log('\n== ' + suite.name);
      await suite(browser, base);
    }
  } catch (e) {
    fehler++; console.error('ABBRUCH', e);
  } finally {
    await browser.close(); srv.close();
  }
  console.log(fehler ? `\n${fehler} FEHLER` : '\nalle E2E-Tests bestanden');
  process.exit(fehler ? 1 : 0);
})();
