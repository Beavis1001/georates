/* GeoRates – erzeugt die Sprachfassungen als eigene Adressen.
 *
 * Warum es das gibt
 * -----------------
 * Die Seite uebersetzt sich im Browser. Fuer Besucher reicht das, fuer Suchmaschinen nicht:
 * es gab nur eine einzige Adresse (georates.tech/) mit lang="de" und deutscher Beschreibung.
 * Damit konnte die Seite ausserhalb des deutschsprachigen Raums gar nicht gefunden werden.
 *
 * Dieses Skript schreibt deshalb zu jeder deutschen Seite eine fertig uebersetzte Fassung
 * unter /en/, /es/, /fr/, /it/ und /nl/ - mit eigener Sprache, eigenem Titel, eigener
 * Beschreibung und hreflang-Verweisen auf alle Geschwister. Deutsch bleibt da, wo es war
 * (/ und /budget.html), damit keine bestehende Adresse kaputtgeht.
 *
 * Die erzeugten Dateien werden mit eingecheckt. GitHub Pages liefert das Repo direkt aus,
 * es gibt also weiterhin keinen Build-Schritt beim Deployen.
 *
 * Aufruf:  node tools/build-langs.js          (schreibt die Dateien)
 *          node tools/build-langs.js --check  (prueft nur, Exit-Code 1 bei Abweichung)
 *
 * Nach jeder Aenderung an einer Seite aus SEITEN oder an den Sprachdateien neu laufen
 * lassen. test/check.js erinnert daran, falls nicht.
 *
 * Nie deutschen Text in i18n/en.json oder auch nur in eine der Geschwister kopieren,
 * nur damit der Schluessel-Abgleich gruen ist. Eine Seite ohne Uebersetzung gehoert
 * nach NUR_DEUTSCH und wird erst nach SEITEN verschoben, wenn die Texte wirklich
 * uebersetzt sind. test/check.js meldet den kopierten Langtext je Datei.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const BASIS = 'https://georates.tech';

const QUELLSPRACHE = 'de';
const SPRACHEN = ['de', 'en', 'es', 'fr', 'it', 'nl'];

// Seiten, die es in allen Sprachen gibt. Die SEO-Ratgeber gehoeren hierher,
// seit die Texte in en/es/fr/it/nl wirklich uebersetzt sind (nicht nur kopiertes Deutsch).
const GUIDE_DE = ['booking-laenderpreise.html', 'hotel-vpn-guenstiger-buchen.html', 'booking-aus-japan-buchen.html', 'booking-indien.html', 'booking-usa.html', 'booking-laender-ranking.html', 'booking-tuerkei.html', 'booking-aegypten.html', 'hotel-vpn-eu-geoblocking.html'];
const SEITEN = ['index.html', 'budget.html', 'gruppenkosten.html', 'packliste.html', 'ratgeber.html'].concat(GUIDE_DE);

// Seiten, die es nur auf Deutsch als Adresse gibt (Rechtstexte).
// Links darauf zeigen aus jeder Sprachfassung auf die deutsche Datei im Wurzelverzeichnis.
// Wer eine neue deutsche Seite noch nicht uebersetzt hat, haengt sie hier an und
// kopiert den deutschen Text NICHT in die fremden Sprachdateien.
const NUR_DEUTSCH = ['impressum.html', 'datenschutz.html', 'agb.html'];

// Welcher i18n-Schluessel liefert Beschreibung und og-Texte je Seite.
const META = {
  'index.html':         { desc: 'idx_meta_desc',    ogTitle: 'idx_og_title', ogDesc: 'idx_og_desc' },
  'budget.html':        { desc: 'budget_meta_desc', ogTitle: 'budget_title', ogDesc: 'budget_meta_desc' },
  'gruppenkosten.html': { desc: 'gk_meta_desc',     ogTitle: 'gk_title',     ogDesc: 'gk_meta_desc' },
  'packliste.html':     { desc: 'pl_meta_desc',     ogTitle: 'pl_title',     ogDesc: 'pl_meta_desc' },
  'ratgeber.html':      { desc: 'rat_meta_desc',    ogTitle: 'rat_og_title', ogDesc: 'rat_og_desc' },
  'booking-laenderpreise.html':       { desc: 'lp_meta_desc', ogTitle: 'lp_h1', ogDesc: 'lp_meta_desc' },
  'hotel-vpn-guenstiger-buchen.html': { desc: 'vpn_meta_desc', ogTitle: 'vpn_h1', ogDesc: 'vpn_meta_desc' },
  'booking-aus-japan-buchen.html':    { desc: 'jp_meta_desc', ogTitle: 'jp_h1', ogDesc: 'jp_meta_desc' },
  'booking-indien.html':              { desc: 'in_meta_desc', ogTitle: 'in_h1', ogDesc: 'in_meta_desc' },
  'booking-usa.html':                 { desc: 'us_meta_desc', ogTitle: 'us_h1', ogDesc: 'us_meta_desc' },
  'booking-laender-ranking.html':     { desc: 'rk_meta_desc', ogTitle: 'rk_h1', ogDesc: 'rk_meta_desc' },
  'booking-tuerkei.html':             { desc: 'tr_meta_desc', ogTitle: 'tr_h1', ogDesc: 'tr_meta_desc' },
  'booking-aegypten.html':            { desc: 'eg_meta_desc', ogTitle: 'eg_h1', ogDesc: 'eg_meta_desc' },
  'hotel-vpn-eu-geoblocking.html':    { desc: 'eu_meta_desc', ogTitle: 'eu_h1', ogDesc: 'eu_meta_desc' }
};

// FAQ je Seite, in der Reihenfolge auf der Seite. Article-Headline und -Beschreibung
// kommen aus ARTICLE, damit die Auszeichnung wortgleich mit dem sichtbaren Text ist.
const ARTICLE = {
  'ratgeber.html': { h1: 'rat_h1', desc: 'rat_og_desc' },
  'booking-laenderpreise.html': { h1: 'lp_h1', desc: 'lp_meta_desc', dated: true },
  'hotel-vpn-guenstiger-buchen.html': { h1: 'vpn_h1', desc: 'vpn_meta_desc', dated: true },
  'booking-aus-japan-buchen.html': { h1: 'jp_h1', desc: 'jp_meta_desc', dated: true },
  'booking-indien.html': { h1: 'in_h1', desc: 'in_meta_desc', dated: true },
  'booking-usa.html': { h1: 'us_h1', desc: 'us_meta_desc', dated: true },
  'booking-laender-ranking.html': { h1: 'rk_h1', desc: 'rk_meta_desc', dated: true },
  // Datenfenster dieser drei Seiten endet am 07.11.2026, deshalb eigenes Datum.
  'booking-tuerkei.html': { h1: 'tr_h1', desc: 'tr_meta_desc', dated: true, date: '2026-11-07' },
  'booking-aegypten.html': { h1: 'eg_h1', desc: 'eg_meta_desc', dated: true, date: '2026-11-07' },
  'hotel-vpn-eu-geoblocking.html': { h1: 'eu_h1', desc: 'eu_meta_desc', dated: true, date: '2026-11-07' }
};

const FAQ_PAARE = {
  'ratgeber.html': [['rat_faq1_q', 'rat_faq1_a'], ['rat_faq2_q', 'rat_faq2_a'],
                    ['rat_faq3_q', 'rat_faq3_a'], ['rat_faq4_q', 'rat_faq4_a']],
  'booking-laenderpreise.html': [['lp_faq1_q', 'lp_faq1_a'], ['lp_faq2_q', 'lp_faq2_a'],
    ['lp_faq3_q', 'lp_faq3_a'], ['lp_faq4_q', 'lp_faq4_a'], ['lp_faq5_q', 'lp_faq5_a']],
  'hotel-vpn-guenstiger-buchen.html': [['vpn_faq1_q', 'vpn_faq1_a'], ['vpn_faq2_q', 'vpn_faq2_a'],
    ['vpn_faq3_q', 'vpn_faq3_a'], ['vpn_faq4_q', 'vpn_faq4_a'], ['vpn_faq5_q', 'vpn_faq5_a']],
  'booking-aus-japan-buchen.html': [['jp_faq1_q', 'jp_faq1_a'], ['jp_faq2_q', 'jp_faq2_a'],
    ['jp_faq3_q', 'jp_faq3_a'], ['jp_faq4_q', 'jp_faq4_a'], ['jp_faq5_q', 'jp_faq5_a'],
    ['jp_faq6_q', 'jp_faq6_a']],
  'booking-indien.html': [['in_faq1_q', 'in_faq1_a'], ['in_faq2_q', 'in_faq2_a'],
    ['in_faq3_q', 'in_faq3_a'], ['in_faq4_q', 'in_faq4_a'], ['in_faq5_q', 'in_faq5_a']],
  'booking-usa.html': [['us_faq1_q', 'us_faq1_a'], ['us_faq2_q', 'us_faq2_a'],
    ['us_faq3_q', 'us_faq3_a'], ['us_faq4_q', 'us_faq4_a'], ['us_faq5_q', 'us_faq5_a']],
  'booking-laender-ranking.html': [['rk_faq1_q', 'rk_faq1_a'], ['rk_faq2_q', 'rk_faq2_a'],
    ['rk_faq3_q', 'rk_faq3_a'], ['rk_faq4_q', 'rk_faq4_a'], ['rk_faq5_q', 'rk_faq5_a']],
  'booking-tuerkei.html': [['tr_faq1_q', 'tr_faq1_a'], ['tr_faq2_q', 'tr_faq2_a'],
    ['tr_faq3_q', 'tr_faq3_a'], ['tr_faq4_q', 'tr_faq4_a'], ['tr_faq5_q', 'tr_faq5_a'],
    ['tr_faq6_q', 'tr_faq6_a']],
  'booking-aegypten.html': [['eg_faq1_q', 'eg_faq1_a'], ['eg_faq2_q', 'eg_faq2_a'],
    ['eg_faq3_q', 'eg_faq3_a'], ['eg_faq4_q', 'eg_faq4_a'], ['eg_faq5_q', 'eg_faq5_a'],
    ['eg_faq6_q', 'eg_faq6_a']],
  'hotel-vpn-eu-geoblocking.html': [['eu_faq1_q', 'eu_faq1_a'], ['eu_faq2_q', 'eu_faq2_a'],
    ['eu_faq3_q', 'eu_faq3_a'], ['eu_faq4_q', 'eu_faq4_a'], ['eu_faq5_q', 'eu_faq5_a']]
};

/* ---------------------------------------------------------------- Woerterbuecher */

function ladeWoerterbuecher() {
  const src = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
  const m = src.match(/var translations = \{ de: ([\s\S]*?) \};\n  var loading/);
  if (!m) throw new Error('i18n.js: deutsches Woerterbuch nicht gefunden');
  const woerter = { de: vm.runInNewContext('(' + m[1] + ')') };
  for (const code of SPRACHEN) {
    if (code === 'de') continue;
    woerter[code] = JSON.parse(fs.readFileSync(path.join(root, 'i18n', code + '.json'), 'utf8'));
  }
  return woerter;
}

/* ------------------------------------------------------- HTML: Elemente finden */

// Quotenbewusst das Ende eines oeffnenden Tags suchen: ein '>' innerhalb von "..." oder '...'
// beendet das Tag nicht.
function endeDesTags(html, start) {
  let quote = null;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '>') return i;
  }
  return -1;
}

// Vom Fundort eines Attributs zurueck zum '<' des zugehoerigen Tags.
function anfangDesTags(html, pos) {
  for (let i = pos; i >= 0; i--) if (html[i] === '<') return i;
  return -1;
}

// Inhalt eines Elements: ab Ende des oeffnenden Tags bis zum passenden </tag>,
// verschachtelte gleichnamige Tags mitgezaehlt.
function inhaltsBereich(html, tagName, nachOeffnung) {
  const auf = new RegExp('<' + tagName + '(?=[\\s/>])', 'gi');
  const zu = new RegExp('</' + tagName + '\\s*>', 'gi');
  let tiefe = 1;
  let i = nachOeffnung;
  while (i < html.length) {
    auf.lastIndex = i; zu.lastIndex = i;
    const a = auf.exec(html);
    const z = zu.exec(html);
    if (!z) return null;
    if (a && a.index < z.index) { tiefe++; i = a.index + 1; continue; }
    tiefe--;
    if (tiefe === 0) return { von: nachOeffnung, bis: z.index };
    i = z.index + 1;
  }
  return null;
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Strukturierte Daten duerfen kein HTML enthalten und sollen wortgleich mit dem
// sichtbaren Text sein - sonst beanstandet Google die FAQ-Auszeichnung.
function ohneHtml(s) {
  return String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/&rarr;/g, '→').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

// Article- und FAQPage-Block aus den Schluesseln derselben Sprache bauen.
function strukturierteDaten(html, code, seite, dict, deDict) {
  const art = ARTICLE[seite];
  const paare = FAQ_PAARE[seite];
  if (!art) return html;
  const t = (k) => (dict[k] !== undefined ? dict[k] : deDict[k]);
  const adresse = adresseFuer(code, seite);

  const article = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: ohneHtml(t(art.h1)),
    description: ohneHtml(t(art.desc)),
    inLanguage: code,
    author: { '@type': 'Organization', name: 'GeoRates' },
    publisher: { '@type': 'Organization', name: 'GeoRates' },
    mainEntityOfPage: adresse
  };
  if (art.dated) {
    // Seit 09.11.2026 kann eine Seite ein eigenes Datum tragen. Die aelteren
    // Ratgeber bleiben beim 04.11.2026, dem Datenstand ihrer Auswertung.
    const datum = art.date || '2026-11-04';
    article.datePublished = datum;
    article.dateModified = datum;
  }
  const faq = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: paare.map(([f, a]) => ({
      '@type': 'Question', name: ohneHtml(t(f)),
      acceptedAnswer: { '@type': 'Answer', text: ohneHtml(t(a)) }
    }))
  };

  const setzen = (name, objekt) => {
    const re = new RegExp('(<script type="application/ld\\+json" data-i18n-ld="' + name + '">)[\\s\\S]*?(</script>)');
    if (!re.test(html)) throw new Error(seite + ': ld+json-Block "' + name + '" nicht gefunden');
    html = html.replace(re, (m, auf, zu) => auf + '\n' + JSON.stringify(objekt) + '\n' + zu);
  };
  setzen('article', article);
  setzen('faq', faq);
  return html;
}

/* ------------------------------------------------------------- Uebersetzen */

function uebersetze(html, dict, deDict, seite, code) {
  const fehlend = [];
  const t = (key) => {
    if (dict[key] !== undefined) return dict[key];
    fehlend.push(key);
    return deDict[key] !== undefined ? deDict[key] : key;
  };

  // Ersetzungen sammeln und am Ende von hinten nach vorn anwenden,
  // damit die Positionen gueltig bleiben.
  const ers = [];

  // 1) Textinhalte: data-i18n="KEY"
  const reInhalt = /data-i18n="([^"]+)"/g;
  let m;
  while ((m = reInhalt.exec(html)) !== null) {
    const start = anfangDesTags(html, m.index);
    if (start < 0) throw new Error(seite + ': kein Tag-Anfang zu data-i18n="' + m[1] + '"');
    const tagName = (html.slice(start + 1).match(/^[a-zA-Z0-9-]+/) || [''])[0];
    const ende = endeDesTags(html, start);
    if (ende < 0 || !tagName) throw new Error(seite + ': Tag unvollstaendig bei ' + m[1]);
    if (html[ende - 1] === '/') continue; // selbstschliessend: kein Inhalt
    const bereich = inhaltsBereich(html, tagName, ende + 1);
    if (!bereich) throw new Error(seite + ': kein schliessendes </' + tagName + '> zu ' + m[1]);
    ers.push({ von: bereich.von, bis: bereich.bis, text: t(m[1]) });
  }

  // 2) <title data-i18n-title="KEY">...</title> und title-Attribute
  const reTitle = /data-i18n-title="([^"]+)"/g;
  while ((m = reTitle.exec(html)) !== null) {
    const start = anfangDesTags(html, m.index);
    const tagName = (html.slice(start + 1).match(/^[a-zA-Z0-9-]+/) || [''])[0];
    const ende = endeDesTags(html, start);
    if (tagName.toLowerCase() === 'title') {
      const bereich = inhaltsBereich(html, tagName, ende + 1);
      if (!bereich) throw new Error(seite + ': </title> fehlt');
      ers.push({ von: bereich.von, bis: bereich.bis, text: t(m[1]) });
    } else {
      ers.push({ von: m.index, bis: m.index + m[0].length, text: m[0] + ' title="' + escAttr(t(m[1])) + '"' });
    }
  }

  // 3) Platzhalter und aria-label als Attribute daneben setzen.
  //    Ein evtl. vorhandenes Original-Attribut wird vorher entfernt, sonst gaebe es zwei.
  const attrRegeln = [
    { re: /data-i18n-placeholder="([^"]+)"/g, attr: 'placeholder' },
    { re: /data-i18n-aria="([^"]+)"/g, attr: 'aria-label' }
  ];
  for (const regel of attrRegeln) {
    regel.re.lastIndex = 0;
    while ((m = regel.re.exec(html)) !== null) {
      const start = anfangDesTags(html, m.index);
      const ende = endeDesTags(html, start);
      const offenesTag = html.slice(start, ende + 1);
      const vorhanden = new RegExp('\\s' + regel.attr + '="[^"]*"').exec(offenesTag);
      if (vorhanden) {
        ers.push({ von: start + vorhanden.index, bis: start + vorhanden.index + vorhanden[0].length, text: '' });
      }
      ers.push({ von: m.index, bis: m.index + m[0].length, text: m[0] + ' ' + regel.attr + '="' + escAttr(t(m[1])) + '"' });
    }
  }

  ers.sort((a, b) => b.von - a.von);
  let out = html;
  for (const e of ers) out = out.slice(0, e.von) + e.text + out.slice(e.bis);
  return { html: out, fehlend: [...new Set(fehlend)] };
}

/* ------------------------------------------------------------- Pfade & Kopf */

function adresseFuer(code, seite) {
  const datei = seite === 'index.html' ? '' : seite;
  return code === QUELLSPRACHE ? BASIS + '/' + datei : BASIS + '/' + code + '/' + datei;
}

// Relative Verweise umschreiben, damit sie aus dem Unterordner heraus stimmen.
function pfadeUmschreiben(html, code) {
  let out = html.replace(/(\b(?:href|src)=")([^"#][^"]*)"/g, (ganz, pre, ziel) => {
    // "/" ist die Startseite: in der Sprachfassung die eigene, nicht die deutsche.
    if (ziel === '/' || ziel === '/index.html') return pre + '/' + code + '/"';
    if (/^(https?:|mailto:|tel:|data:|\/|#)/i.test(ziel)) return ganz;
    const [datei, rest] = ziel.split(/(?=[?#])/);
    if (SEITEN.includes(datei)) {
      const neu = datei === 'index.html' ? '' : datei;
      return pre + '/' + code + '/' + neu + (rest || '') + '"';
    }
    if (NUR_DEUTSCH.includes(datei)) return pre + '/' + datei + (rest || '') + '"';
    return pre + '/' + ziel + '"'; // Bilder, Styles, Skripte
  });

  // srcset enthaelt mehrere Bildpfade mit Groessenangabe - sonst waere das Logo
  // im Unterordner ein 404.
  out = out.replace(/(\bsrcset=")([^"]+)"/g, (ganz, pre, liste) => {
    const neu = liste.split(',').map((teil) => {
      const stueck = teil.trim().split(/\s+/);
      if (!stueck[0] || /^(https?:|data:|\/)/i.test(stueck[0])) return teil.trim();
      stueck[0] = '/' + stueck[0];
      return stueck.join(' ');
    }).join(', ');
    return pre + neu + '"';
  });

  return out;
}

function hreflangBlock(seite) {
  const zeilen = SPRACHEN.map(
    (c) => '<link rel="alternate" hreflang="' + c + '" href="' + adresseFuer(c, seite) + '">'
  );
  zeilen.push('<link rel="alternate" hreflang="x-default" href="' + adresseFuer(QUELLSPRACHE, seite) + '">');
  return '<!-- hreflang:start (erzeugt von tools/build-langs.js - nicht von Hand aendern) -->\n' +
         zeilen.join('\n') + '\n<!-- hreflang:ende -->';
}

function ersetzeOderErgaenze(html, re, neu, nachAnker) {
  if (re.test(html)) return html.replace(re, neu);
  return html.replace(nachAnker, (m) => m + '\n' + neu);
}

function kopfSetzen(html, code, seite, dict, deDict) {
  const t = (k) => (dict[k] !== undefined ? dict[k] : deDict[k]);
  const meta = META[seite];
  const adresse = adresseFuer(code, seite);

  // Sprache am <html>-Tag; das Merkmal sagt i18n.js, dass der Text schon uebersetzt ankommt.
  html = html.replace(/<html[^>]*>/i,
    '<html lang="' + code + '"' + (code === QUELLSPRACHE ? '' : ' data-i18n-prerendered="' + code + '"') + '>');

  html = ersetzeOderErgaenze(html,
    /<meta name="description" content="[^"]*">/i,
    '<meta name="description" content="' + escAttr(t(meta.desc)) + '">',
    /<meta name="viewport"[^>]*>/i);

  html = html.replace(/<link rel="canonical" href="[^"]*">/i,
    '<link rel="canonical" href="' + adresse + '">');

  html = ersetzeOderErgaenze(html,
    /<meta property="og:title" content="[^"]*">/i,
    '<meta property="og:title" content="' + escAttr(t(meta.ogTitle)) + '">',
    /<link rel="canonical"[^>]*>/i);
  html = ersetzeOderErgaenze(html,
    /<meta property="og:description" content="[^"]*">/i,
    '<meta property="og:description" content="' + escAttr(t(meta.ogDesc)) + '">',
    /<meta property="og:title"[^>]*>/i);
  html = ersetzeOderErgaenze(html,
    /<meta property="og:url" content="[^"]*">/i,
    '<meta property="og:url" content="' + adresse + '">',
    /<meta property="og:description"[^>]*>/i);
  html = ersetzeOderErgaenze(html,
    /<meta property="og:locale" content="[^"]*">/i,
    '<meta property="og:locale" content="' + code + '">',
    /<meta property="og:url"[^>]*>/i);

  // hreflang-Block erneuern bzw. hinter das Canonical setzen.
  const block = hreflangBlock(seite);
  const vorhanden = /<!-- hreflang:start[\s\S]*?<!-- hreflang:ende -->/;
  html = vorhanden.test(html)
    ? html.replace(vorhanden, block)
    : html.replace(/<link rel="canonical"[^>]*>/i, (m) => m + '\n' + block);

  return html;
}

/* ------------------------------------------------------------------ Sitemap */

function sitemap() {
  const heute = new Date().toISOString().slice(0, 10);
  const eintraege = [];
  for (const code of SPRACHEN) {
    for (const seite of SEITEN) {
      const alt = SPRACHEN.map(
        (c) => '    <xhtml:link rel="alternate" hreflang="' + c + '" href="' + adresseFuer(c, seite) + '"/>'
      ).join('\n');
      eintraege.push(
        '  <url>\n' +
        '    <loc>' + adresseFuer(code, seite) + '</loc>\n' +
        alt + '\n' +
        '    <xhtml:link rel="alternate" hreflang="x-default" href="' + adresseFuer(QUELLSPRACHE, seite) + '"/>\n' +
        '    <lastmod>' + heute + '</lastmod>\n' +
        '    <changefreq>' + (seite === 'index.html' ? 'weekly' : 'monthly') + '</changefreq>\n' +
        '    <priority>' + (seite === 'index.html' ? (code === QUELLSPRACHE ? '1.0' : '0.9') : '0.8') + '</priority>\n' +
        '  </url>'
      );
    }
  }
  for (const seite of NUR_DEUTSCH) {
    eintraege.push(
      '  <url>\n' +
      '    <loc>' + BASIS + '/' + seite + '</loc>\n' +
      '    <lastmod>' + heute + '</lastmod>\n' +
      '    <changefreq>monthly</changefreq>\n' +
      '    <priority>' + (GUIDE_DE.indexOf(seite) !== -1 ? '0.7' : '0.3') + '</priority>\n' +
      '  </url>'
    );
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
         '<!-- Erzeugt von tools/build-langs.js - nicht von Hand aendern. -->\n' +
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
         '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
         eintraege.join('\n') + '\n</urlset>\n';
}

/* ------------------------------------------------------- Echte Funde fest einsetzen */
/*
 * Die Startseite laedt die groessten Ersparnisse per JavaScript nach. Crawler fuehren das
 * nicht aus und sahen an der Stelle nur "…" - ausgerechnet dort, wo die nachpruefbaren
 * Belege der Seite stehen. Hier werden sie fest in die Seite geschrieben, in jeder Sprache.
 *
 * Das JavaScript bleibt: Es ueberschreibt den festen Stand beim Laden mit dem aktuellen.
 * Besucher sehen also weiterhin Tagesaktuelles, Crawler sehen wenigstens den Stand des
 * letzten Laufs statt nichts.
 *
 * Die Daten kommen aus data/bestof.json (tools/fetch-bestof.js). Fehlt die Datei, bleibt
 * die Seite unveraendert - der Bau darf nicht am fehlenden Netz scheitern.
 */

const FUNDE_DATEI = path.join(root, 'data', 'bestof.json');

function ladeFunde() {
  if (!fs.existsSync(FUNDE_DATEI)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(FUNDE_DATEI, 'utf8'));
    return Array.isArray(d.eintraege) && d.eintraege.length ? d : null;
  } catch (e) {
    console.log('WARN | data/bestof.json ist unlesbar, Startseite bleibt ohne feste Funde.');
    return null;
  }
}

const LOCALE = { de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', nl: 'nl-NL' };

// Gleiche Darstellung wie in app.js - sonst springt die Liste beim Laden sichtbar um.
function escHtml(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function landName(code, loc) {
  if (!code) return '';
  try {
    const n = new Intl.DisplayNames([loc], { type: 'region' }).of(code);
    if (n && n !== code) return n;
  } catch (e) { /* Sprache ohne Laenderliste -> Code */ }
  return code;
}
function datumText(d, loc) {
  try {
    return new Date(d + 'T12:00:00Z').toLocaleDateString(loc, { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return d; }
}
function euroText(v, loc) {
  return Number(v).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
// app.js schreibt Prozente mit Komma, ausser auf Englisch. Hier genauso.
function prozentText(v, code) {
  return String(v).replace('.', code === 'en' ? '.' : ',');
}
function setze(vorlage, werte) {
  return String(vorlage || '').replace(/\{(\w+)\}/g, (m, k) => (k in werte ? werte[k] : m));
}

function fundZeile(e, code, w) {
  const loc = LOCALE[code] || 'de-DE';
  const offen = e.resultId
    ? ' <a href="?r=' + escHtml(e.resultId) + '">' + escHtml(w.idx_bestof_open) + '</a>'
    : '';
  return '<div class="bestof-row"><div class="bestof-hotel"><strong>' + escHtml(e.hotel)
    + '</strong><span class="bestof-meta">' + escHtml(landName(e.hotelLand, loc))
    + ' · ' + escHtml(setze(w.idx_bestof_via, { country: landName(e.land, loc) }))
    + ' · ' + escHtml(datumText(e.datum, loc)) + offen + '</span></div>'
    + '<div class="bestof-saving">−' + escHtml(prozentText(e.pct, code))
    + ' %<span>' + escHtml(euroText(e.euro, loc)) + '</span></div></div>';
}

function echteFundeEinsetzen(html, code, w, funde) {
  if (!funde) return html;
  const loc = LOCALE[code] || 'de-DE';

  // Die Liste. Der Ersatz greift auch, wenn schon Zeilen drinstehen - das Skript muss
  // mehrfach hintereinander laufen koennen, ohne etwas anzuhaengen.
  // Die eingesetzten Zeilen stehen zwischen Markierungen. Ohne sie waere nicht zu
  // erkennen, wo der Inhalt aufhoert: Jede Fundzeile enthaelt selbst "</div></div>",
  // ein Ersatz "bis zum naechsten </div>" wuerde beim zweiten Lauf mittendrin abbrechen.
  const zeilen = funde.eintraege.map((e) => fundZeile(e, code, w)).join('');
  const reListe = /<div class="bestof-list" id="bestof-list">(?:<!--funde-->[\s\S]*?<!--\/funde-->|<p class="empty">[\s\S]*?<\/p>)<\/div>/;
  if (!reListe.test(html)) throw new Error('index.html: Behaelter #bestof-list nicht gefunden oder von Hand veraendert.');
  html = html.replace(reListe,
    '<div class="bestof-list" id="bestof-list"><!--funde-->' + zeilen + '<!--/funde--></div>');

  // Der Zaehler im Kopfbereich. Er steht auf "hidden", weil ihn sonst niemand fuellt;
  // mit festem Wert darf er sichtbar sein.
  if (funde.suchenGesamt > 0) {
    const text = escHtml(setze(w.idx_hero_counter, { n: Number(funde.suchenGesamt).toLocaleString(loc) }));
    html = html.replace(
      /<p class="hero-counter" id="search-counter"[^>]*>[\s\S]*?<\/p>/,
      '<p class="hero-counter" id="search-counter">' + text + '</p>'
    );
  }
  return html;
}

/* --------------------------------------------------------------------- Lauf */

function baue() {
  const woerter = ladeWoerterbuecher();
  const de = woerter.de;
  const dateien = new Map();
  const warnungen = [];
  const funde = ladeFunde();
  if (!funde) warnungen.push('data/bestof.json fehlt - die Startseite bleibt ohne feste Funde (nur Crawler merken das).');

  for (const seite of SEITEN) {
    const quelle = fs.readFileSync(path.join(root, seite), 'utf8');
    // Nur die Startseite traegt die Fundliste und den Zaehler.
    const funde1 = seite === 'index.html' ? funde : null;

    // Deutsch: nur der Kopf wird gepflegt (hreflang, canonical, og) - Text bleibt wie er ist.
    dateien.set(seite, echteFundeEinsetzen(
      strukturierteDaten(kopfSetzen(quelle, QUELLSPRACHE, seite, de, de), QUELLSPRACHE, seite, de, de),
      QUELLSPRACHE, de, funde1));

    for (const code of SPRACHEN) {
      if (code === QUELLSPRACHE) continue;
      const { html, fehlend } = uebersetze(quelle, woerter[code], de, seite, code);
      if (fehlend.length) warnungen.push(code + '/' + seite + ': ohne Uebersetzung -> ' + fehlend.join(', '));
      const mitKopf = strukturierteDaten(kopfSetzen(html, code, seite, woerter[code], de), code, seite, woerter[code], de);
      dateien.set(path.join(code, seite), echteFundeEinsetzen(
        pfadeUmschreiben(mitKopf, code), code, woerter[code], funde1));
    }
  }

  dateien.set('sitemap.xml', sitemap());
  return { dateien, warnungen };
}

function main() {
  const nurPruefen = process.argv.includes('--check');
  const { dateien, warnungen } = baue();
  warnungen.forEach((w) => console.log('WARN | ' + w));

  let abweichungen = 0;
  for (const [rel, inhalt] of dateien) {
    const ziel = path.join(root, rel);
    // Die Sitemap traegt das Tagesdatum - beim Pruefen nur den Rest vergleichen.
    const norm = (s) => (rel === 'sitemap.xml' ? s.replace(/<lastmod>[^<]*<\/lastmod>/g, '') : s);
    const alt = fs.existsSync(ziel) ? fs.readFileSync(ziel, 'utf8') : null;
    if (alt !== null && norm(alt) === norm(inhalt)) continue;

    if (nurPruefen) { abweichungen++; console.log('FEHL | nicht aktuell: ' + rel); continue; }
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    fs.writeFileSync(ziel, inhalt);
    console.log('OK   | geschrieben: ' + rel);
  }

  if (nurPruefen) {
    if (abweichungen) {
      console.log('\n' + abweichungen + ' Datei(en) veraltet. Bitte "node tools/build-langs.js" laufen lassen und mit einchecken.');
      process.exit(1);
    }
    console.log('OK   | Sprachfassungen sind aktuell');
  }
}

main();
