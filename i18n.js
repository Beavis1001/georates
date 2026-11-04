/* GeoRates – client-side i18n (vanilla JS, no dependencies)
 *
 * Deutsch steht hier direkt in der Datei, damit die Seite ohne zweiten Request in der
 * Standardsprache erscheint. Die anderen Sprachen liegen als i18n/<code>.json und werden nur
 * geladen, wenn sie gebraucht werden - vorher trug jeder Besucher 160 KB fuer sechs Sprachen.
 * Bis die Datei da ist, zeigt t() Deutsch; danach wird die Seite einmal neu uebersetzt
 * (translatePage + window.onLanguageChange).
 */
(function () {
  "use strict";

  var SUPPORTED = ["de", "en", "es", "fr", "it", "nl"];
  var STORAGE_KEY = "georates_lang";
  // Absolut, damit die Datei auch aus /en/, /es/ usw. gefunden wird.
  var LANG_PATH = "/i18n/";

  // Jede Sprache hat eine eigene Adresse: Deutsch unter /, die anderen unter /<code>/.
  // Erzeugt von tools/build-langs.js.
  function sprachePfad() {
    var m = location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
    return (m && SUPPORTED.indexOf(m[1]) !== -1 && m[1] !== "de") ? m[1] : null;
  }

  // Seiten, die es unter einer eigenen Adresse je Sprache gibt (siehe tools/build-langs.js).
  // Rechtstexte und Ratgeber liegen nur auf Deutsch im Wurzelverzeichnis; dort wird weiterhin
  // nur der Text im Browser getauscht, ohne Adresswechsel.
  var SEITEN_MIT_SPRACHADRESSE = ["", "index.html", "budget.html", "gruppenkosten.html", "packliste.html"];
  var UEBERSETZTE_SEITEN = SEITEN_MIT_SPRACHADRESSE.indexOf(
    location.pathname.replace(/^\/([a-z]{2}\/)?/, "")
  ) !== -1;

  // Dieselbe Seite in einer anderen Sprache.
  function adresseIn(code) {
    var pfad = location.pathname;
    var vorhanden = sprachePfad();
    if (vorhanden) pfad = pfad.slice(vorhanden.length + 1) || "/";
    if (code !== "de") pfad = "/" + code + (pfad === "/" ? "/" : pfad);
    return pfad + location.search + location.hash;
  }

  var translations = { de: {
      "common_impressum": "Impressum",
      "common_datenschutz": "Datenschutz",
      "common_agb": "Nutzungsbedingungen",
      "common_back_home": "← Zur Startseite",
      "common_cta_text": "Hotel für die Reise schon ausgesucht? Wir checken für dich den Gesamtpreis auf Booking.com.",
      "common_cta_button": "Zur Hotelsuche",
      "common_stand_sep2026": "Stand: September 2026",
      "common_stand_juli2026": "Stand: Juli 2026",
      "idx_title": "GeoRates – Dein automatischer Buchungs-Check für Booking.com",
      "idx_meta_desc": "GeoRates vergleicht Hotelpreise auf Booking.com aus 15 Ländern und zeigt dir, ob dieselbe Buchung aus einem anderen Land günstiger ist – kostenlos, automatisch und unabhängig.",
      "idx_og_title": "GeoRates – Hotelpreise aus 15 Ländern vergleichen",
      "idx_og_desc": "Automatischer Buchungs-Check für Booking.com: Ist dein Zimmer aus einem anderen Land günstiger? Kostenlos, ohne Anmeldung.",
      "idx_nav_how": "So funktioniert's",
      "idx_nav_tools": "Tools",
      "idx_nav_transparency": "Transparenz",
      "idx_nav_cta": "Preis prüfen",
      "idx_hero_eyebrow": "Automatischer Buchungs-Check für Booking.com",
      "idx_hero_h1": "Für dein Wunschzimmer den fairen Gesamtpreis sichern.",
      "idx_hero_sub": "Füg den Booking.com-Link zu deinem Hotel ein, wähl dein Zimmer – wir prüfen automatisch aus 15 Ländern, ob es für exakt dieses Zimmer und diese Verpflegung einen günstigeren, steuer- und gebühreninklusiven Gesamtpreis gibt.",
      "idx_hero_counter": "Bereits {n} Preis-Checks durchgeführt",
      "idx_mock_title": "BEISPIEL · DOPPELZIMMER MIT MEERBLICK, FRÜHSTÜCK",
      "idx_mock_start_label": "Ausgangspreis",
      "idx_mock_arrow": "↓ 160 € gespart",
      "idx_mock_best_label": "Bester gefundener Preis",
      "idx_mock_badge": "≈13 % günstiger",
      "idx_mock_real_title": "Echter Fund · {hotel}",
      "idx_mock_real_start": "Ausgangspreis ({country})",
      "idx_mock_real_best": "Über {country}",
      "idx_mock_real_arrow": "↓ {euro} gespart",
      "idx_mock_real_badge": "≈{pct} % günstiger",
      "idx_mock_real_aria": "Größter echter Fund – zur Liste",
      "idx_guide_title": "So kommst du an den richtigen Link:",
      "idx_guide_svg_caption": "Adresszeile anklicken, alles markieren & kopieren",
      "idx_guide_step1": "Öffne dein Wunschhotel auf Booking.com.",
      "idx_guide_step2": "In die Adresszeile klicken, alles markieren (Strg/⌘+A) und kopieren (Strg/⌘+C) – auch wenn sie gekürzt mit „…\" angezeigt wird, wird die komplette Adresse erfasst.",
      "idx_guide_step3": "Link unten einfügen und dein bevorzugtes Zimmer eintragen.",
      "idx_form_label_link": "Link zu deinem Wunschhotel (Booking.com)",
      "idx_form_hint_link": "Bitte die komplette Adresse aus der Adresszeile einfügen, nicht nur den sichtbaren Teil.",
      "idx_form_label_room": "Bevorzugtes Zimmer",
      "idx_form_placeholder_room": "z. B. Doppelzimmer mit Meerblick",
      "idx_form_hint_room": "Genauer Zimmername wie auf Booking.com – unterschiedliche Zimmerkategorien haben oft unterschiedliche Preise & Stornobedingungen.",
      "idx_form_label_board": "Verpflegung",
      "idx_board_room_only": "Nur Übernachtung",
      "idx_board_breakfast": "Frühstück",
      "idx_board_half": "Halbpension",
      "idx_board_full": "Vollpension",
      "idx_board_allinclusive": "All-Inclusive",
      "idx_board_any": "Egal – günstigster Tarif",
      "idx_form_label_checkin": "Anreise",
      "idx_form_label_checkout": "Abreise",
      "idx_form_label_cancel": "Kostenlos stornierbar?",
      "idx_cancel_yes": "Ja",
      "idx_cancel_no": "Nein",
      "idx_cancel_partial": "Teilweise erstattbar",
      "idx_cancel_unsure": "Egal – günstigster Tarif",
      "idx_form_hint_cancel": "Kostenlos stornierbare Tarife sind oft teurer – so vergleichen wir in jedem Land den passenden Tarif.",
      "idx_form_label_cancel_deadline": "Kostenlos stornierbar bis",
      "idx_form_label_email": "Deine E-Mail (für das Ergebnis)",
      "idx_form_submit": "Preis automatisch prüfen",
      "idx_hero_note": "Kostenlos & unverbindlich · automatischer Check über mehrere Länder-Sessions.",
      "idx_how_label": "So funktioniert's",
      "idx_how_h2": "In drei Schritten zum besten Preis",
      "idx_how_sub": "Ein einfacher Ablauf, der dir Zeit und Geld sparen soll – ganz ohne Umwege beim Buchen.",
      "idx_step1_title": "Hotel-Link & Zimmer angeben",
      "idx_step1_text": "Du fügst den Booking.com-Link zu deinem Hotel ein und wählst dein bevorzugtes Zimmer sowie die gewünschte Verpflegung.",
      "idx_step2_title": "Wir prüfen deinen Preis automatisch",
      "idx_step2_text": "Aus 15 Länder-Sitzungen lesen wir den Preis für exakt dieses Zimmer und diese Verpflegung – steuer- und gebühreninklusiv, mit Genius-Rabatt (bekommt jedes Booking-Konto), in einer Minute.",
      "idx_step3_title": "Du buchst direkt",
      "idx_step3_text": "Die eigentliche Buchung läuft ganz normal über Booking.com – wir zeigen dir nur den besten Weg dorthin.",
      "idx_tools_label": "Kostenlos & ohne Anmeldung",
      "idx_tools_h2": "Reise-Tools für die Planung",
      "idx_tools_sub": "Nützliche Rechner rund um deine Reise – unabhängig davon, wo du am Ende buchst.",
      "idx_tool1_title": "Reisebudget-Rechner",
      "idx_tool1_text": "Schätze dein Gesamtbudget nach Reisestil, Personenzahl und Reisedauer.",
      "idx_tool1_link": "Rechner öffnen →",
      "idx_tool2_title": "Packlisten-Generator",
      "idx_tool2_text": "Individuelle Checkliste je nach Reiseart, Klima und Dauer der Reise.",
      "idx_tool2_link": "Liste erstellen →",
      "idx_tool3_title": "Reisekosten-Tracker",
      "idx_tool3_text": "Gemeinsame Ausgaben in der Gruppe erfassen und fair aufteilen lassen.",
      "idx_tool3_link": "Tracker öffnen →",
      "idx_example_label": "Beispielhaft",
      "idx_example_h2": "So könnte eine Ersparnis aussehen",
      "idx_example_sub": "Illustratives Rechenbeispiel auf Basis typischer Preisunterschiede, die wir beim Testen beobachtet haben – kein konkretes Buchungsversprechen für ein bestimmtes Hotel.",
      "idx_ex_row1_label": "Zimmer & Verpflegung",
      "idx_ex_row1_value": "Doppelzimmer mit Meerblick, Frühstück",
      "idx_ex_row2_label": "Ausgangspreis (inkl. Steuern & Gebühren)",
      "idx_ex_row3_label": "Von uns gefundener Bestpreis (gleiches Zimmer)",
      "idx_ex_row4_label": "Mögliche Ersparnis",
      "idx_ex_row4_value": "160 € (≈ 13 %)",
      "idx_example_disclaimer": "Tatsächliche Preisunterschiede variieren je Hotel und Zeitraum – manchmal ist der angezeigte Ausgangspreis bereits der beste verfügbare.",
      "idx_trust_label": "Transparenz als Prinzip",
      "idx_trust_h2": "Warum du uns die Zahlen glauben kannst",
      "idx_trust1_title": "Immer inkl. Steuern & Gebühren",
      "idx_trust1_text": "Manche Buchungsseiten zeigen zusätzliche Steuern erst später an. Wir rechnen sie immer sofort mit ein, damit die von uns genannte Zahl der tatsächliche Endpreis ist.",
      "idx_trust2_title": "Kein künstlicher Aufschlag",
      "idx_trust2_text": "Der Ausgangspreis, den wir zur Prüfung heranziehen, wird nicht schöngerechnet oder erhöht, um eine größere Ersparnis vorzutäuschen – beide Zahlen sind echte, identisch berechnete Gesamtpreise.",
      "idx_trust3_title": "Du buchst weiterhin direkt",
      "idx_trust3_text": "GeoRates bucht, storniert oder bezahlt nichts für dich – wir zeigen dir nur, wo derselbe Aufenthalt günstiger ist. Gebucht wird ganz normal bei Booking.com.",
      "idx_final_h2": "Bereit für deinen Buchungs-Check?",
      "idx_final_p": "Hotel-Link, Zimmer und Verpflegung eintragen – das Ergebnis erscheint direkt auf der Seite.",
      "idx_footer_line1": "GeoRates · Automatischer Buchungs-Check für Hotelbuchungen · Kein Reiseveranstalter, keine Buchungsabwicklung.",
      "idx_footer_questions": "Fragen?",
      "idx_js_msg_success": "Hotelseite geöffnet & Anfrage vorbereitet – bitte die sich öffnende E-Mail absenden, damit wir sie erhalten.",
      "idx_js_msg_sent": "Anfrage gesendet! Wir prüfen deinen Preis persönlich und melden uns per E-Mail.",
      "budget_title": "Reisebudget-Rechner – GeoRates",
      "budget_meta_desc": "Kostenloser Reisebudget-Rechner: Plane Flug, Unterkunft, Verpflegung und Aktivitäten für deine Reise und behalte deine Ausgaben im Griff.",
      "budget_h1": "Reisebudget-Rechner",
      "budget_sub": "Schätze dein Reisebudget in Sekunden – wähle eine Kategorie oder passe alle Werte selbst an.",
      "budget_panel1_h2": "Angaben zur Reise",
      "budget_label_preset": "Reisestil",
      "budget_opt_cheap": "Günstig (Hostel/Budget)",
      "budget_opt_mid": "Mittel (Standard-Hotel)",
      "budget_opt_luxury": "Luxus",
      "budget_opt_custom": "Eigene Werte",
      "budget_label_personen": "Anzahl Personen",
      "budget_label_naechte": "Anzahl Nächte",
      "budget_panel2_h2": "Kosten (bearbeitbar)",
      "budget_label_unterkunft": "Unterkunft pro Nacht (gesamt, €)",
      "budget_label_verpflegung": "Verpflegung pro Person/Tag (€)",
      "budget_label_transport": "Transport vor Ort pro Person/Tag (€)",
      "budget_label_aktivitaeten": "Aktivitäten pro Person/Tag (€)",
      "budget_label_sonstiges": "Sonstiges pro Person/Tag (€)",
      "budget_btn_calc": "Budget berechnen",
      "budget_hint": "Die Werte sind grobe Richtwerte – passe sie gerne an dein Reiseziel an.",
      "budget_result_h2": "Geschätztes Budget",
      "budget_r_unterkunft": "Unterkunft (gesamt)",
      "budget_r_verpflegung": "Verpflegung (gesamt)",
      "budget_r_transport": "Transport vor Ort (gesamt)",
      "budget_r_aktivitaeten": "Aktivitäten (gesamt)",
      "budget_r_sonstiges": "Sonstiges (gesamt)",
      "budget_r_gesamt": "Gesamtbudget",
      "budget_r_pro_person": "Pro Person",
      "budget_r_pro_tag": "Pro Tag (Gruppe)",
      "gk_title": "Reisekosten-Tracker für Gruppen – GeoRates",
      "gk_meta_desc": "Reisekosten-Tracker für Gruppen: Wer hat was bezahlt? Teile Ausgaben fair auf und sieh sofort, wer wem wie viel schuldet – kostenlos.",
      "gk_h1": "Reisekosten-Tracker für Gruppen",
      "gk_sub": "Erfasse gemeinsame Ausgaben und sieh auf einen Blick, wer wem noch was schuldet.",
      "gk_panel1_h2": "Mitreisende",
      "gk_placeholder_name": "Name eingeben",
      "gk_btn_add_member": "Hinzufügen",
      "gk_hint_local": "Alle Daten bleiben lokal in deinem Browser gespeichert (kein Server, kein Login).",
      "gk_panel2_h2": "Ausgabe hinzufügen",
      "gk_label_desc": "Beschreibung",
      "gk_placeholder_desc": "z. B. Taxi zum Hotel",
      "gk_label_amount": "Betrag (€)",
      "gk_label_paidby": "Bezahlt von",
      "gk_label_split": "Aufgeteilt zwischen",
      "gk_btn_save_expense": "Ausgabe speichern",
      "gk_panel3_h2": "Alle Ausgaben",
      "gk_empty_expenses": "Noch keine Ausgaben erfasst.",
      "gk_panel4_h2": "Kontostand",
      "gk_empty_data": "Noch keine Daten.",
      "gk_empty_members": "Noch keine Mitreisenden.",
      "gk_panel5_h2": "Wer zahlt wem? (vereinfacht)",
      "gk_btn_reset": "Neue Reise starten (alles löschen)",
      "gk_aria_remove": "Entfernen",
      "gk_btn_delete": "Löschen",
      "gk_th_person": "Person",
      "gk_th_balance": "Saldo",
      "gk_label_gets_back": "bekommt zurück",
      "gk_label_owes": "schuldet noch",
      "gk_label_settled": "ausgeglichen",
      "gk_all_settled": "Alles ausgeglichen.",
      "gk_pays_word": "zahlt",
      "gk_confirm_reset": "Wirklich alle Mitreisenden und Ausgaben löschen?",
      "pl_title": "Packlisten-Generator – GeoRates",
      "pl_meta_desc": "Packlisten-Generator für deine Reise: Erstelle in Sekunden eine passende Packliste – nach Reiseart, Dauer und Ziel. Kostenlos und ohne Anmeldung.",
      "pl_h1": "Packlisten-Generator",
      "pl_sub": "Beantworte ein paar Fragen zu deiner Reise – wir erstellen dir eine passende Checkliste.",
      "pl_panel1_h2": "Deine Reise",
      "pl_label_art": "Reiseart",
      "pl_opt_beach": "Strand & Baden",
      "pl_opt_city": "Städtetrip",
      "pl_opt_hiking": "Wandern & Natur",
      "pl_opt_business": "Geschäftsreise",
      "pl_opt_winter": "Winter/Ski",
      "pl_label_tage": "Anzahl Tage",
      "pl_label_klima": "Klima",
      "pl_opt_warm": "Warm",
      "pl_opt_moderate": "Gemäßigt",
      "pl_opt_cold": "Kalt",
      "pl_label_extra": "Zusätzlich",
      "pl_chip_kids": "Mit Kind(ern)",
      "pl_chip_water": "Baden/Wassersport",
      "pl_chip_flight": "Mit Flug (Handgepäck)",
      "pl_btn_generate": "Packliste erstellen",
      "pl_panel2_h2": "Deine Packliste",
      "pl_btn_print": "Liste drucken",
      "pl_cat_documents": "Dokumente",
      "pl_cat_clothing": "Kleidung",
      "pl_cat_electronics": "Elektronik",
      "pl_cat_hygiene": "Hygiene",
      "pl_cat_other": "Sonstiges",
      "pl_item_id": "Ausweis/Reisepass",
      "pl_item_bookings": "Buchungsbestätigungen (digital & Ausdruck)",
      "pl_item_creditcard": "Kreditkarte / Bargeld",
      "pl_item_charger": "Handy-Ladekabel",
      "pl_item_powerbank": "Powerbank",
      "pl_item_toothbrush": "Zahnbürste & Zahnpasta",
      "pl_item_deo": "Deo",
      "pl_item_underwear": "Unterwäsche ({n}x)",
      "pl_item_socks": "Socken ({n}x)",
      "pl_item_sleepwear": "Schlafkleidung",
      "pl_item_tshirts": "Leichte T-Shirts",
      "pl_item_shorts": "Kurze Hosen/Röcke",
      "pl_item_sunscreen": "Sonnencreme",
      "pl_item_sunglasses": "Sonnenbrille",
      "pl_item_warmjacket": "Warme Jacke",
      "pl_item_hat_gloves": "Mütze & Handschuhe",
      "pl_item_sweater": "Pullover/Fleece",
      "pl_item_lipbalm": "Lippenpflege",
      "pl_item_lightjacket": "Leichte Jacke",
      "pl_item_raingear": "Regenschutz",
      "pl_item_swimwear": "Badesachen",
      "pl_item_beachtowel": "Strandtuch",
      "pl_item_aftersun": "After-Sun",
      "pl_item_comfyshoes": "Bequeme Schuhe zum Laufen",
      "pl_item_daypack": "Kleiner Rucksack/Tagestasche",
      "pl_item_hikingboots": "Wanderschuhe",
      "pl_item_functionalclothing": "Funktionskleidung",
      "pl_item_waterbottle": "Trinkflasche",
      "pl_item_firstaid": "Erste-Hilfe-Set",
      "pl_item_headlamp": "Stirnlampe/Taschenlampe",
      "pl_item_businessoutfit": "Business-Outfit(s)",
      "pl_item_laptop": "Laptop & Ladekabel",
      "pl_item_businesscards": "Visitenkarten",
      "pl_item_skijacket": "Skijacke & Skihose",
      "pl_item_thermal": "Thermounterwäsche",
      "pl_item_skigoggles": "Skibrille",
      "pl_item_sunscreen_snow": "Sonnencreme (Schneereflexion)",
      "pl_item_swimtrunks": "Badehose/Bikini",
      "pl_item_microfiber": "Mikrofaser-Handtuch",
      "pl_item_snackstoys": "Snacks & Spielzeug fürs Kind",
      "pl_item_diapering": "Wickelutensilien / Kinderhygiene",
      "pl_item_childid": "Kinderausweis / Geburtsurkunde (je nach Ziel)",
      "pl_item_boardingpass": "Bordkarte (digital/Ausdruck)",
      "pl_item_liquids": "Flüssigkeiten in Behältern ≤100ml",
      "pl_item_neckpillow": "Nackenkissen",
      "rat_title": "Hotelpreise je nach Land günstiger buchen – Ratgeber | GeoRates",
      "rat_meta_desc": "Warum kostet dasselbe Hotelzimmer je nach Land unterschiedlich viel? Der GeoRates-Ratgeber erklärt Länderpreise bei Booking.com und wie du fair vergleichst und günstiger buchst.",
      "rat_og_title": "Hotelpreise je nach Land günstiger buchen – Ratgeber",
      "rat_og_desc": "Warum sich Hotelpreise je nach Land unterscheiden und wie du denselben Aufenthalt fair vergleichst.",
      "rat_h1": "Hotelpreise je nach Land – warum sie sich unterscheiden und wie du günstiger buchst",
      "rat_intro": "Wer schon einmal ein Hotel gebucht hat, kennt vielleicht das Phänomen: Dasselbe Zimmer, dieselben Reisedaten – und trotzdem zeigt die Buchungsseite je nach Land einen anderen Preis an. In diesem Ratgeber erklären wir, warum das so ist, was rechtlich dahintersteckt und wie du für deine konkrete Reise fair vergleichst, statt auf pauschale Versprechen zu vertrauen.",
      "rat_h2_warum": "Warum kostet dasselbe Zimmer je nach Land unterschiedlich viel?",
      "rat_warum_p1": "Große Buchungsplattformen wie Booking.com stellen Preise regional dar. Der angezeigte Betrag hängt unter anderem davon ab, aus welchem Land die Anfrage kommt. Dahinter stecken mehrere Faktoren: unterschiedliche <strong>Kaufkraft</strong> und Preisniveaus in den Zielmärkten, <strong>Wechselkurse</strong> und die jeweils angezeigte Währung, <strong>lokale Nachfrage</strong> und Wettbewerb sowie länderspezifische <strong>Marketing-Aktionen und Rabatte</strong>. Auch die Darstellung von <strong>Steuern und Gebühren</strong> unterscheidet sich: In manchen Ländern erscheint der Preis inklusive aller Abgaben, in anderen werden Steuern separat hinzugerechnet.",
      "rat_warum_p2": "Das Ergebnis: Für ein und denselben Aufenthalt können – je nachdem, „aus welchem Land man schaut\" – spürbar verschiedene Preise entstehen. Ein Vergleich ist deshalb nur dann aussagekräftig, wenn alle Beträge <strong>steuer- und gebühreninklusive</strong> und in derselben Währung gegenübergestellt werden.",
      "rat_h2_erlaubt": "Ist es erlaubt, so zu vergleichen und zu buchen?",
      "rat_erlaubt_p": "Öffentlich einsehbare Preise zu vergleichen ist völlig normal und alltäglich – nichts anderes tun Preisvergleichsseiten. Die tatsächliche <em>Buchung</em> aus einem anderen Land, etwa über ein VPN, bewegt sich hingegen in einer rechtlichen Grauzone und richtet sich nach den jeweiligen Bedingungen der Buchungsplattform. Innerhalb der EU gibt es zwar die sogenannte Geoblocking-Verordnung, die Diskriminierung von Kundinnen und Kunden aufgrund ihres Wohnorts einschränken soll; wie sie im Einzelfall greift, ist jedoch komplex. Dieser Ratgeber ist keine Rechtsberatung – eine VPN-Nutzung erfolgt auf eigene Verantwortung und unter Beachtung der geltenden Bedingungen von Plattform und VPN-Anbieter.",
      "rat_h2_pruefen": "So prüfst du, ob es für deinen Aufenthalt günstiger geht",
      "rat_pruefen_p": "Genau dafür gibt es GeoRates. Du fügst einfach den Link zu deinem Wunschhotel bei Booking.com ein, wählst Zimmer, Verpflegung und die Stornobedingung – und wir rufen den öffentlich angezeigten Preis dieses Zimmers automatisiert über Sitzungen aus mehreren Ländern ab. Alle Preise werden <strong>steuerinklusive</strong> und zum aktuellen Wechselkurs in Euro umgerechnet, sodass du auf einen Blick siehst, ob derselbe Aufenthalt aus einem anderen Land betrachtet günstiger ist. <a href=\"index.html\">Zum kostenlosen Preis-Check &rarr;</a>",
      "rat_h2_vpn": "VPN – was du beachten solltest",
      "rat_vpn_p": "Wenn sich ein niedrigerer Preis über ein anderes Land ergibt, lässt er sich in der Praxis oft nur mit einem VPN aus dem betreffenden Land realisieren. Achte dabei auf einige Punkte: Prüfe die <strong>Zahlungswährung</strong> und mögliche <strong>Fremdwährungsgebühren</strong> deiner Karte, kontrolliere die <strong>Stornobedingungen</strong> und stelle sicher, dass es sich wirklich um dasselbe Zimmer und dieselben Daten handelt. Eine Karte mit günstiger Währungsumrechnung kann zusätzliche Umrechnungskosten vermeiden. Der Hinweis auf eine VPN-Nutzung ist rein informativ.",
      "rat_h2_tipps": "Praktische Tipps für einen fairen Preisvergleich",
      "rat_tipp1": "Vergleiche immer <strong>inklusive Steuern und Gebühren</strong> – sonst wirkt ein Preis günstiger, als er am Ende ist.",
      "rat_tipp2": "Achte auf <strong>identische Zimmerkategorie und Verpflegung</strong> (z. B. Frühstück inklusive vs. gegen Aufpreis).",
      "rat_tipp3": "Prüfe die <strong>Stornobedingungen</strong>: „kostenlos stornierbar\" ist oft etwas teurer als „nicht erstattbar\".",
      "rat_tipp4": "Behalte die <strong>Zahlungswährung</strong> und den Wechselkurs im Blick.",
      "rat_tipp5": "Mach dir zur Sicherheit einen <strong>Screenshot</strong> des Angebots, das du buchen möchtest.",
      "rat_h2_faq": "Häufige Fragen",
      "rat_faq1_q": "Sind Hotels aus einem anderen Land wirklich günstiger?",
      "rat_faq1_a": "Manchmal ja, oft aber nicht. Ob sich ein Unterschied ergibt, hängt vom Hotel, den Reisedaten und der Plattform ab – deshalb lohnt der Vergleich für den konkreten Fall.",
      "rat_faq2_q": "Brauche ich ein VPN, um zu vergleichen?",
      "rat_faq2_a": "Nein. Zum Vergleichen ruft GeoRates die öffentlich angezeigten Preise aus mehreren Ländern für dich ab. Ein VPN brauchst du nur, wenn du selbst aus einem anderen Land buchen willst.",
      "rat_faq3_q": "Ist GeoRates kostenlos?",
      "rat_faq3_a": "Ja. Der automatische Preis-Check ist kostenlos und ohne Anmeldung nutzbar.",
      "rat_faq4_q": "Bucht GeoRates für mich?",
      "rat_faq4_a": "Nein. GeoRates ist ein unabhängiges Vergleichstool und steht in keiner Partnerschaft mit Booking.com. Die Buchung nimmst du selbst direkt auf der Plattform vor.",
      "rat_cta": "<a href=\"index.html\">Jetzt deinen Hotelpreis kostenlos prüfen &rarr;</a>",
      "agb_title": "Nutzungsbedingungen – GeoRates",
      "agb_h1": "Nutzungsbedingungen",
      "agb_h2_1": "1. Geltungsbereich",
      "agb_p1": "Diese Nutzungsbedingungen gelten für die Nutzung der Website georates.tech durch Verbraucher:innen und Unternehmer:innen. Anbieterin ist Christopher Hendrys, Grünbauerstr. 42, 81479 München (siehe <a href=\"impressum.html\">Impressum</a>).",
      "agb_h2_2": "2. Leistungsbeschreibung",
      "agb_p2": "GeoRates ist ein kostenloses, unabhängiges Informations- und Vergleichstool für Hotelpreise auf Booking.com. Nach Eingabe eines Booking.com-Hotellinks samt gewünschtem Zimmer und Verpflegung rufen wir den öffentlich angezeigten Preis dieses Zimmers automatisiert über Sitzungen aus mehreren Ländern ab und zeigen an, ob derselbe Aufenthalt aus einem anderen Land betrachtet günstiger ist. Zur Orientierung weisen wir gegebenenfalls darauf hin, dass sich ein niedrigerer Preis über ein VPN aus dem betreffenden Land erzielen lässt. Die Buchung nimmt die Nutzerin/der Nutzer eigenständig und direkt auf Booking.com vor – GeoRates wickelt weder Buchung noch Zahlung ab. GeoRates ist ein unabhängiger Dritter und steht in keiner Partnerschafts-, Geschäfts- oder Vertragsbeziehung zu Booking.com; wir werden von Booking.com weder unterstützt noch geprüft oder freigegeben. „Booking.com\" ist eine Marke des jeweiligen Inhabers und wird hier nur zur Bezeichnung der Plattform verwendet. Der Hinweis auf eine VPN-Nutzung ist rein informativ; sie erfolgt auf eigene Verantwortung und unter Beachtung der jeweils geltenden Bedingungen von Booking.com sowie des VPN-Anbieters. Eine Gewähr dafür, dass ein günstigerer Preis tatsächlich verfügbar ist oder bei der Buchung anerkannt wird, übernehmen wir nicht. Wir behalten uns vor, das Angebot künftig um weitere Funktionen zu erweitern; über kostenpflichtige Zusatzfunktionen werden Nutzer:innen vorab gesondert und deutlich informiert.",
      "agb_h2_3": "3. Kein Reiseveranstalter, keine Reisevermittlung",
      "agb_p3": "GeoRates vermittelt, veranstaltet und bezahlt keine Hotelaufenthalte und wird zu keinem Zeitpunkt Vertragspartei einer Hotelbuchung. Der Buchungsvertrag kommt ausschließlich zwischen der Nutzerin/dem Nutzer und der jeweiligen Buchungsplattform bzw. dem Hotel zustande. Stornierungen, Umbuchungen und Zahlungen für die Hotelbuchung selbst laufen ausschließlich über die jeweilige Buchungsplattform.",
      "agb_h2_4": "4. Richtigkeit der angezeigten Preise",
      "agb_p4": "Alle von uns angezeigten Preise stammen von Drittplattformen und werden automatisiert abgerufen. Wir bemühen uns um Aktualität und um eine steuer- und gebühreninklusive Darstellung, können jedoch keine Gewähr für Verfügbarkeit, Richtigkeit oder Aktualität der angezeigten Preise übernehmen, da sich diese kurzfristig ändern können. Maßgeblich ist stets der auf der Buchungsplattform zum Zeitpunkt der Buchung angezeigte Preis.",
      "agb_h2_5": "5. Kostenpflichtige Zusatzfunktionen",
      "agb_p5": "Die aktuelle Kernfunktion (der automatische Preis-Check) ist für Nutzer:innen kostenlos. Sollten künftig kostenpflichtige Zusatzfunktionen eingeführt werden, gelten dafür gesondert ausgewiesene Konditionen, denen Nutzer:innen vor Vertragsschluss ausdrücklich zustimmen müssen.",
      "agb_h2_6": "6. Widerrufsrecht bei digitalen Leistungen",
      "agb_p6": "Für etwaige künftige kostenpflichtige Leistungen von GeoRates gelten die gesetzlichen Regelungen zum Fernabsatz- und Widerrufsrecht für Verbraucher:innen. Vor Einführung einer solchen Leistung wird Nutzer:innen vor Vertragsschluss eine gesonderte Widerrufsbelehrung zur Verfügung gestellt.",
      "agb_h2_7": "7. Haftung",
      "agb_p7": "Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach Maßgabe des Produkthaftungsgesetzes. Für leichte Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), begrenzt auf den vertragstypisch vorhersehbaren Schaden. Im Übrigen ist die Haftung ausgeschlossen.",
      "agb_h2_8": "8. Änderungen dieser Bedingungen",
      "agb_p8": "Wir können diese Nutzungsbedingungen anpassen, insbesondere wenn neue Funktionen hinzukommen. Über wesentliche Änderungen informieren wir auf dieser Seite.",
      "agb_h2_9": "9. Anwendbares Recht",
      "agb_p9": "Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Zwingende verbraucherschützende Bestimmungen des Landes, in dem die Nutzerin/der Nutzer ihren/seinen gewöhnlichen Aufenthalt hat, bleiben unberührt.",
      "ds_title": "Datenschutzerklärung – GeoRates",
      "ds_h1": "Datenschutzerklärung",
      "ds_h2_1": "1. Verantwortlicher",
      "ds_p1": "Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br>Christopher Hendrys, Grünbauerstr. 42, 81479 München, Deutschland<br>E-Mail: <a href=\"mailto:info@georates.tech\">info@georates.tech</a>",
      "ds_h2_2": "2. Allgemeines zur Datenverarbeitung",
      "ds_p2": "Wir verarbeiten personenbezogene Daten unserer Nutzer:innen grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Rechtsgrundlagen sind je nach Verarbeitung Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), Art. 6 Abs. 1 lit. b DSGVO (Vertrag/vorvertragliche Maßnahmen) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).",
      "ds_h2_3": "3. Bereitstellung der Website / Hosting",
      "ds_p3": "Die Website wird bei GitHub Pages (GitHub, Inc., USA) gehostet. Der automatische Preisvergleich läuft zusätzlich über eine Serverless-Funktion bei Vercel (Vercel, Inc., USA). Beide Anbieter verarbeiten beim Aufruf automatisch technische Zugriffsdaten (sog. Server-Logfiles: IP-Adresse, Datum/Uhrzeit, aufgerufene Seite, Browsertyp, Referrer-URL). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Betrieb und Sicherheit der Website). Da beide Anbieter ihren Sitz in den USA haben, kann dabei eine Verarbeitung außerhalb der EU stattfinden.",
      "ds_h2_4": "4. Buchungs-Check (Hotel-Link, Zimmer, Verpflegung)",
      "ds_p4": "Über das Formular auf der Startseite gibst du einen Booking.com-Link zu deinem Wunschhotel an sowie Zimmer, Verpflegung, den Wunsch zur kostenlosen Stornierbarkeit und optional eine Auswahl der zu prüfenden Länder. Beim Start des automatischen Checks und beim Laden der Zimmerliste werden diese Angaben an unsere Serverless-Funktion übertragen. Dort wird zunächst per Cloudflare Turnstile (Cloudflare, Inc., USA) geprüft, ob die Anfrage von einem Menschen stammt. Anschließend ruft die Funktion die öffentlich einsehbare Booking.com-Seite deines Hotels über Proxy-Verbindungen aus verschiedenen Ländern ab (Anbieter: Smartproxy/Decodo) und liest den angezeigten Preis aus. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung der von dir angeforderten Leistung).<br><br>Das Ergebnis wird für 24 Stunden zwischengespeichert (Upstash, Inc., USA), um wiederholte Abrufe zu vermeiden; der Hotel-Link wird dafür vorher von Sitzungs- und Tracking-Kennungen bereinigt. Zusätzlich wird jedes fertige Ergebnis 30 Tage unter einer zufälligen Kurz-ID gespeichert, damit du es über den Knopf „Ergebnis-Link kopieren“ teilen kannst; gespeichert sind dabei Hotelname, Land des Hotels, Zimmer, Verpflegung und die ermittelten Länderpreise – nicht der Booking-Link und nicht dein Reisezeitraum. Zum Schutz vor Missbrauch zählen wir Anfragen pro Stunde je Absender; dafür wird deine IP-Adresse nur als kryptografischer Hash für höchstens eine Stunde gespeichert.<br><br>Jede Abfrage wird in einer Tabelle bei Google Sheets (Google Ireland Ltd.) protokolliert: Zeitpunkt, Hotel-Link (ohne Sitzungs- und Tracking-Parameter), Zimmer, Verpflegung, Stornowunsch, die ermittelten Preise aller geprüften Länder sowie das Land, aus dem die Anfrage kam. Das Herkunftsland wird von Vercel aus deiner IP-Adresse abgeleitet und nur als Länderkürzel (z. B. „DE“) gespeichert – deine IP-Adresse selbst speichern wir nicht. Dasselbe Länderkürzel legt fest, gegen welches Land verglichen wird: Wir fragen den Preis zusätzlich in deinem eigenen Land ab, damit der Vergleich zu dem Preis passt, den du selbst siehst. Zweck ist die Verbesserung der Website, die Auswertung, in welchen Ländern tatsächlich günstigere Preise angezeigt werden, und die Veröffentlichung der größten Funde auf der Startseite („Echte Funde“) – dort ausschließlich mit Hotelname, Land, Ersparnis und Messtag, ohne Link und ohne Reisezeitraum. Zu den Einträgen speichern wir weder Namen noch E-Mail-Adresse noch IP-Adresse, und sie sind keinem Nutzerkonto zugeordnet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Bitte beachte: Der von dir eingegebene Hotel-Link kann Angaben zu deinem geplanten Reisezeitraum enthalten und wird in der Tabelle in dieser Form gespeichert. Schreibst du uns eine E-Mail an info@georates.tech, verarbeiten wir deine Angaben ausschließlich zur Beantwortung deiner Nachricht (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO).",
      "ds_h2_5": "5. Reise-Tools (Budget-Rechner, Packlisten-Generator, Reisekosten-Tracker)",
      "ds_p5": "Der Reisebudget-Rechner und der Packlisten-Generator verarbeiten deine Eingaben ausschließlich im Browser, ohne sie zu speichern oder an uns zu übermitteln. Der Reisekosten-Tracker für Gruppen speichert die von dir eingegebenen Namen und Ausgaben im lokalen Speicher deines Browsers (Local Storage), damit sie beim nächsten Besuch noch vorhanden sind. Auch diese Daten werden nicht an uns oder Dritte übermittelt; du kannst sie jederzeit über den Button „Neue Reise starten\" in diesem Tool selbst löschen oder über die Browser-Einstellungen entfernen.",
      "ds_h2_6": "6. Cookies und Tracking",
      "ds_p6": "Diese Seite setzt keine Cookies und keine Analyse- oder Trackingdienste ein. Im lokalen Speicher deines Browsers (Local Storage) merken wir uns lediglich deine Sprachwahl und ob du den Hinweis zur App-Installation geschlossen hast; beides bleibt auf deinem Gerät. Cloudflare Turnstile kann für die Bot-Prüfung technisch notwendige Daten in deinem Browser ablegen. Die Verweise auf Launch-Plattformen im Fußbereich sind reine Textlinks – erst ein Klick darauf überträgt etwas an den jeweiligen Anbieter. Beim Aufruf der Seite fließen keine Daten an Dritte. Sollte sich das ändern (z. B. durch ein Analyse-Tool), wird diese Erklärung entsprechend aktualisiert und – soweit erforderlich – vorab eine Einwilligung eingeholt.",
      "ds_h2_7": "7. Künftige Funktionen",
      "ds_p7": "Wir planen, das Angebot von GeoRates künftig um weitere Funktionen zu erweitern. Sobald eine neue Funktion die Verarbeitung zusätzlicher personenbezogener Daten erfordert, wird diese Datenschutzerklärung vor Einführung entsprechend ergänzt.",
      "ds_h2_8": "8. Weitergabe von Daten an Dritte",
      "ds_p8": "Eine Weitergabe deiner Daten an Booking.com findet durch uns nicht statt. Wenn du über einen auf dieser Seite angezeigten Link zu Booking.com wechselst und dort buchst, gilt ab diesem Zeitpunkt die Datenschutzerklärung von Booking.com; die dort eingegebenen Daten verarbeiten wir nicht.",
      "ds_h2_9": "9. Deine Rechte",
      "ds_p9_intro": "Du hast jederzeit das Recht auf:",
      "ds_right_1": "Auskunft über die zu deiner Person gespeicherten Daten (Art. 15 DSGVO)",
      "ds_right_2": "Berichtigung unrichtiger Daten (Art. 16 DSGVO)",
      "ds_right_3": "Löschung deiner Daten (Art. 17 DSGVO)",
      "ds_right_4": "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
      "ds_right_5": "Datenübertragbarkeit (Art. 20 DSGVO)",
      "ds_right_6": "Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)",
      "ds_right_7": "Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)",
      "ds_p9_outro": "Zudem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde, z. B. dem Bayerischen Landesamt für Datenschutzaufsicht.",
      "ds_h2_10": "10. Kontakt",
      "ds_p10": "Für Fragen zum Datenschutz wende dich an: <a href=\"mailto:info@georates.tech\">info@georates.tech</a>",
      "imp_title": "Impressum – GeoRates",
      "imp_h1": "Impressum",
      "imp_updated": "Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)",
      "imp_h2_1": "Angaben zum Diensteanbieter",
      "imp_h2_2": "Kontakt",
      "imp_p_kontakt": "E-Mail: <a href=\"mailto:info@georates.tech\">info@georates.tech</a><br>Telefon: 0174 2919906",
      "imp_h2_3": "Umsatzsteuer-Identifikationsnummer",
      "imp_h2_4": "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
      "imp_h2_5": "Haftung für Inhalte",
      "imp_p_haftung_inhalte": "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.",
      "imp_h2_6": "Haftung für Links",
      "imp_p_haftung_links": "Unser Angebot enthält Links zu externen Webseiten Dritter (insbesondere Booking.com), auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
      "imp_h2_7": "Hinweis zu Affiliate-Links",
      "imp_p_affiliate": "Diese Seite enthält derzeit <strong>keine Affiliate- oder Provisionslinks</strong>; GeoRates verdient aktuell nichts an Buchungen. Sollte sich das künftig ändern, werden entsprechende Links hier und an der betreffenden Stelle deutlich als solche gekennzeichnet. Der Preis für Nutzer:innen ändert sich durch solche Links grundsätzlich nicht.",
      "imp_h2_8": "Streitschlichtung",
      "imp_p_streitschlichtung": "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href=\"https://ec.europa.eu/consumers/odr/\" target=\"_blank\" rel=\"noopener\">https://ec.europa.eu/consumers/odr/</a>. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      "idx_nav_guide": "Ratgeber",
      "idx_menu_aria": "Menü öffnen",
      "idx_final_button": "Zum Formular",
      "idx_form_label_userprice": "Preis, den du gerade siehst (optional, €)",
    "idx_form_placeholder_userprice": "z. B. 1.240,00",
    "idx_form_hint_userprice": "Booking zeigt je Sitzung leicht unterschiedliche Preise. Trag ein, was du in deinem Browser siehst – wir rechnen gegen den niedrigeren von beiden.",
    "err_invalid_price": "Der eingetragene Preis ist keine Zahl – bitte nur den Betrag, z. B. 1.240,00.",
    "idx_deal_mobile": "Mobile Rate",
    "idx_deal_online_payment": "Rabatt für Online-Zahlung",
    "idx_deal_genius": "Genius",
    "idx_deal_genius_hint": "Genius möglich",
    "idx_deal_early": "Frühbucher",
    "idx_deal_last_minute": "Kurzfristig-Deal",
    "idx_deal_secret": "Geheimangebot",
    "idx_deal_deal": "Deal",
    "idx_res_samples": "Abrufe: {prices}",
    "idx_res_baseline_two": "Booking zeigte in {baseline} bei mehreren Abrufen verschiedene Preise ({prices}, {pct} % auseinander). Wir rechnen gegen den niedrigsten.",
    "idx_res_userprice": "Unser Preis für dein Ausgangsland: {ours}. Du siehst {yours}. Gerechnet wird gegen den niedrigeren: {used}.",
    "idx_res_userprice_best": "Dein Preis ({yours}) ist günstiger als alle {count} Länder (ab {min}). Booking gibt einzelnen Sitzungen eigene Rabatte, etwa „Booking.com bezahlt“ bei Online-Zahlung. Buch am besten genau in diesem Browserfenster, bevor der Preis wieder verschwindet.",
    "idx_res_genius_all": "in allen Ländern",
    "idx_res_genius_hint": "Booking kündigt einen möglichen Genius-Rabatt an ({countries}). Abgezogen wird er erst beim Buchen, eingeloggt – und nicht in jedem Land gleich: Bei einem Hotel auf Rhodos gab es ihn in der US-Sitzung, in der deutschen nicht. Bei größeren Beträgen lohnt es, den Endpreis im Checkout in zwei Ländern zu vergleichen.",
    "idx_res_confirmed": "Fund bestätigt: {country} lag bei einem zweiten Abruf weiterhin günstiger ({before} % → {after} %).",
    "idx_res_unstable": "Unterschied nicht stabil: Bei einem zweiten Abruf war {country} nicht mehr so günstig ({before} % → {after} %). Das war vermutlich ein Sitzungs-Los, kein Landespreis.",
    "idx_res_unstable_other": "Unterschied nicht stabil: Bei einem zweiten Abruf lag {country} nicht mehr vorn (zuerst {before} %). Bestes Land ist jetzt {newcountry} mit {after} %.",
    "idx_res_spread_note": "Booking teilt Preise pro Sitzung zu (Deals, Zahlungsart, Gerät). Deshalb prüfen wir das Ausgangsland doppelt, bestätigen Funde einmal und zeigen erkannte Deal-Plaketten an.",
    "idx_row_mobile": "Smartphone",
    "idx_res_mobile_saving": "Am Smartphone ca. {pct} % günstiger: {price} statt des Computer-Preises über {baseline} – ohne VPN.",
    "idx_res_mobile_best": "Das Smartphone schlägt alle Länder: ca. {pct} % günstiger ({price}) als am Computer über {baseline} – ganz ohne VPN.",
    "idx_res_mobile_how": "So bekommst du den Preis: Hotel-Link auf dem Handy im Browser oder in der Booking-App öffnen, ausgeloggt prüfen, dann buchen. Mobile Rate und Länderpreis zusammen haben wir nicht gemessen.",
    "idx_res_mobile_none": "Am Smartphone kein günstigerer Preis ({price}).",
    "idx_res_mobile_confirmed": "Smartphone-Preis bestätigt: Bei einem zweiten Abruf weiterhin günstiger ({before} % → {after} %).",
    "idx_res_mobile_unstable": "Smartphone-Vorteil nicht stabil: Beim zweiten Abruf war er weg ({before} % → {after} %). Vermutlich ein Sitzungs-Los.",
    "idx_res_mobile_varies": "Den Smartphone-Rabatt gab Booking nicht in jeder Sitzung ({prices}). Mit etwas Glück ca. {pct} % günstiger als am Computer über {baseline} – einfach auf dem Handy nachsehen.",
    "idx_res_mobile_upto": "Nicht jede Handy-Sitzung bekam denselben Preis ({prices}). Mit etwas Glück sogar {best}.",
      "idx_step2_hint": "Zimmer, Verpflegung und Storno erscheinen nach dem Laden – mit den Optionen, die es für dieses Hotel wirklich gibt.",
    "idx_manual_entry": "Oder Zimmernamen selbst eintragen",
    "idx_load_rooms_btn": "Zimmer von Booking laden",
      "idx_load_rooms_loading": "Zimmer werden geladen …",
      "idx_load_rooms_need_link": "Bitte zuerst den Booking.com-Link oben einfügen.",
      "idx_load_rooms_inactive": "Zimmer-Laden ist noch nicht aktiv.",
      "idx_load_rooms_wait": "Booking.com wird für dich aufgerufen – das dauert etwa 20 Sekunden.",
      "idx_load_rooms_fail_with_dates": "Zimmer konnten gerade nicht geladen werden – bitte den Zimmernamen manuell eintragen.",
      "idx_load_rooms_fail_no_dates": "Keine Zimmer gefunden. Dein Link enthält keine Reisedaten – öffne das Hotel auf Booking.com mit An- und Abreisedatum und kopiere die Adresse erneut. Alternativ den Zimmernamen manuell eintragen.",
      "idx_load_rooms_done": "{n} Zimmer geladen – bitte oben auswählen.",
      "idx_load_rooms_manual": "Nicht dabei? Manuell eintragen",
      "idx_load_rooms_timeout": "Zimmer-Laden hat zu lange gedauert – bitte den Zimmernamen manuell eintragen.",
      "idx_room_choose": "– Zimmer wählen –",
      "idx_link_err_not_booking": "Das sieht nicht nach einer Booking.com-Adresse aus. Bitte die komplette Adresse aus der Adresszeile einfügen.",
      "idx_link_err_searchresults": "Das ist eine Ergebnisliste, keine Hotelseite. Bitte zuerst das gewünschte Hotel öffnen und dann dessen Adresse kopieren.",
      "idx_link_err_no_hotel": "In der Adresse fehlt der Teil „/hotel/“. Bitte die Seite des konkreten Hotels öffnen und deren Adresse kopieren.",
      "idx_link_warn_no_dates": "In deinem Link stehen keine Reisedaten. Booking sucht sich dann selbst einen Termin aus – oft zeigt die Seite dann gar keine Preise, und der Ländervergleich kann auf unterschiedlichen Terminen beruhen. Am besten: Hotel auf Booking.com mit deinen An- und Abreisedaten öffnen und die Adresse dann erneut kopieren. Der Check läuft trotzdem, ist so aber weniger verlässlich.",
      "idx_prefill_done": "Link übernommen – jetzt „Zimmer von Booking laden“ klicken.",
      "err_room_empty": "Bitte ein Zimmer auswählen oder den Zimmernamen eintragen.",
      "err_turnstile_missing": "Bitte kurz die Sicherheitsprüfung oben im Formular abschließen.",
      "err_bot_check_failed": "Sicherheitsprüfung fehlgeschlagen – bitte Haken oben erneut setzen und nochmal senden.",
      "err_invalid_link": "Der Link sieht nicht wie ein gültiger Booking.com-Link aus.",
      "err_missing_room": "Bitte ein Zimmer angeben.",
      "err_invalid_room": "Der Zimmername ist zu lang – bitte den Namen so eintragen, wie er auf Booking.com steht.",
      "err_proxy_not_configured": "Der automatische Check ist noch nicht vollständig eingerichtet.",
      "err_price_not_found": "Für dieses Zimmer konnte in keinem geprüften Land ein Preis gefunden werden. Häufigste Ursache: Der Link enthält keine Reisedaten – dann zeigt Booking je nach Zufall gar keine Zimmerpreise. Öffne das Hotel auf Booking.com mit deinen An- und Abreisedaten, kopiere die Adresse erneut und versuche es damit. Möglich ist auch, dass das Zimmer für diesen Zeitraum ausgebucht ist oder anders heißt als eingegeben.",
      "err_price_not_found_with_dates": "Für dieses Zimmer konnte in keinem geprüften Land ein Preis gefunden werden. Dein Link enthält Reisedaten, daran liegt es also nicht. Wahrscheinlich ist das Zimmer für diesen Zeitraum ausgebucht oder heißt auf der Hotelseite anders – am zuverlässigsten ist „Zimmer von Booking laden“ und dann aus der Liste auswählen.",
      "err_fx_unavailable": "Die aktuellen Wechselkurse konnten gerade nicht geladen werden – für einen korrekten Vergleich bitte in ein paar Minuten erneut versuchen.",
      "err_rate_limited": "Du hast in der letzten Stunde sehr viele Abfragen gestartet. Jede lädt echte Booking.com-Seiten, deshalb ist die Anzahl pro Stunde begrenzt. Bitte später nochmal versuchen.",
      "err_rooms_not_loaded": "Die Zimmerliste konnte nicht geladen werden – bitte den Zimmernamen manuell eintragen.",
      "err_generic": "Der automatische Check war gerade nicht möglich. Bitte später erneut versuchen.",
      "err_timeout": "Der automatische Check hat zu lange gedauert oder ist fehlgeschlagen – bitte später erneut versuchen.",
      "idx_progress_1": "Ausgangsland wird aus deinem Link ermittelt …",
      "idx_progress_2": "Aktuelle Wechselkurse werden geladen …",
      "idx_progress_3": "Echte Booking.com-Seiten werden über Länder-Sessions geladen – die ersten Preise erscheinen gleich hier …",
      "idx_checking_btn": "Länderpreise werden geprüft …",
      "idx_live_progress": "{done} von {total} Ländern geprüft – die Auswertung kommt, sobald alle durch sind.",
      "idx_table_caption": "Preis desselben Zimmers je Länder-Sitzung",
      "idx_th_country": "Land-Session",
      "idx_th_local": "Preis vor Ort",
      "idx_th_euro": "≈ in Euro",
      "idx_res_local_note": "Die Spalte „Preis vor Ort“ zeigt den Betrag in der Landeswährung – so kannst du prüfen, ob dein VPN wirklich im jeweiligen Land ist und dir derselbe Preis angezeigt wird.",
      "idx_res_open_hotel": "Hotelseite öffnen →",
      "idx_res_share": "Ergebnis-Link kopieren",
      "idx_res_share_copied": "Link kopiert – 30 Tage gültig, ohne Reisedaten.",
      "idx_res_permalink_note": "Geteiltes Ergebnis vom {date}: {hotel}, {room}. Preise sind eine Momentaufnahme.",
      "idx_res_baseline_missing": "Der Ausgangspreis ({baseline}) konnte diesmal nicht geladen werden – deshalb ist gerade kein zuverlässiger Vergleich möglich. Bitte in ein bis zwei Minuten erneut prüfen. Die oben gefundenen Länderpreise dienen nur zur groben Orientierung.",
      "idx_res_savings": "Über {country} ca. {pct} % günstiger als über {baseline}.",
      "idx_res_steps_title": "So buchst du zum gefundenen Preis:",
      "idx_res_step_vpn": "Mit einem VPN dein Land auf <strong>{country}</strong> stellen.",
      "idx_res_step_vpn_link": "VPN-Empfehlung",
      "idx_res_step_logout": "Bei Booking.com <strong>ausgeloggt</strong> bleiben bzw. ein privates Browserfenster nutzen, damit keine personalisierten Preise angezeigt werden.",
      "idx_res_step_reload": "Hotelseite neu laden und Preis prüfen – er sollte jetzt dem oben gefundenen entsprechen.",
      "idx_res_step_currency": "Im Buchungsvorgang <strong>in der Währung der Unterkunft zahlen</strong>, nicht in der angebotenen Landeswährung – Bookings eigene Umrechnung kostet sonst einen Teil des Vorteils. Dazu eine Karte ohne Fremdwährungsgebühr.",
      "idx_res_step_revolut": "Am besten mit <a href=\"{url}\" target=\"_blank\" rel=\"noopener\">Revolut</a> bezahlen (gute Wechselkurse, keine versteckten Auslandsgebühren).",
      "idx_res_small_saving": "Über {country} nur ca. {pct} % günstiger als über {baseline}. Das ist zwar ein echter Unterschied, für den Aufwand mit VPN und möglichen Fremdwährungsgebühren lohnt er sich aber meist nicht – am besten normal direkt auf Booking.com buchen.",
      "idx_res_none": "Kein Land günstiger als {baseline} – am besten ganz normal direkt auf Booking.com buchen. Abweichungen unter {threshold} % zählen wir bewusst nicht als Fund, das ist Wechselkurs-Rundung und kein echter Vorteil.",
      "idx_res_converted_note": "Der günstigste Preis stand in einer anderen Währung und wurde von uns umgerechnet. Weil Booking dort mit eigenem Kurs verkauft, gilt hier eine Schwelle von {threshold} % statt 1 %.",
      "idx_res_partial": "Hinweis: Zeitbudget erreicht – es konnten nicht alle Länder geprüft werden.",
      "idx_res_cache": "Ergebnis aus dem Cache (dieselbe Suche wurde kürzlich schon geprüft).",
      "idx_res_selection": "Geprüft wurden nur die von dir gewählten Länder.",
      "idx_diag_room_missing": "Dieses Zimmer gibt es auf der Hotelseite nicht unter diesem Namen – deshalb konnte kein Preis geprüft werden.",
      "idx_diag_rooms_listed": "Booking.com listet dort diese Zimmer:",
      "idx_diag_use_loader": "Am einfachsten: oben auf „Zimmer von Booking laden“ klicken und aus der Liste auswählen – dann stimmt der Name garantiert.",
      "idx_diag_no_price": "Das Zimmer steht auf der Hotelseite, wir konnten dazu aber keinen Preis auslesen. Das kann bedeuten, dass es für deinen Zeitraum nicht buchbar ist – es kann auch an uns liegen.",
      "idx_diag_works_for": "Bei diesen Zimmern desselben Hotels klappt es gerade:",
      "idx_diag_board_mismatch": "Dieses Zimmer gibt es, aber nicht mit der gewählten Verpflegung – deshalb kein Preis.",
      "idx_diag_offered": "Angeboten wird dort: ",
      "idx_diag_set_any": "Stell die Verpflegung auf „Egal“ und versuch es nochmal.",
      "idx_countries_toggle": "Nur bestimmte Länder prüfen (z. B. die, in denen dein VPN Server hat)",
      "idx_countries_hint": "Weniger Länder = schnelleres Ergebnis. Dein Ausgangsland ist immer dabei.",
      "idx_countries_all": "Alle",
      "idx_countries_none": "Keine",
      "idx_bestof_label": "Echte Funde",
      "idx_bestof_h2": "Die größten Ersparnisse der letzten Wochen",
      "idx_bestof_sub": "Anonymisiert aus echten Suchen: Hotel, Land der Sitzung und Ersparnis – ohne Reisedaten, ohne Link.",
      "idx_bestof_empty": "Noch keine Funde im Zeitraum – oder die Liste ist gerade nicht erreichbar.",
      "idx_bestof_via": "über {country}",
      "idx_bestof_open": "Ergebnis ansehen",
      "idx_oneclick_label": "Ein Klick statt Kopieren",
      "idx_oneclick_h2": "Booking-Seite direkt an GeoRates schicken",
      "idx_oneclick_share_title": "Am Handy: Teilen-Menü",
      "idx_oneclick_share_text": "GeoRates als App installieren, dann auf der Booking.com-Hotelseite „Teilen“ antippen und GeoRates auswählen – der Link steht sofort im Formular.",
      "idx_oneclick_bm_title": "Am Rechner: Lesezeichen",
      "idx_oneclick_bm_text": "Diesen Knopf in die Lesezeichenleiste ziehen. Ein Klick auf einer Booking.com-Hotelseite öffnet GeoRates mit dem Link.",
      "idx_oneclick_bm_label": "→ Bei GeoRates prüfen",
      "idx_pwa_title": "GeoRates als App",
      "idx_pwa_text": "Auf dem Startbildschirm speichern – startet im Vollbild und nimmt Booking-Links per „Teilen“ an.",
      "idx_pwa_ios": "Tippe unten auf das Teilen-Symbol und dann auf „Zum Home-Bildschirm“.",
      "idx_pwa_install": "Installieren",
      "idx_pwa_close": "Schließen",
      "err_daily_budget_reached": "Für heute ist das Abfrage-Kontingent aufgebraucht. Jeder Ländervergleich lädt rund 30 MB über bezahlte Verbindungen – damit das Projekt kostenlos bleiben kann, gibt es eine Tagesgrenze. Morgen geht es wieder.",
      "lp_title": "Booking.com Länderpreise: Wie oft lohnen sie sich wirklich? | GeoRates",
      "lp_h1": "Booking.com Länderpreise: Was sie sind und wie oft sie sich lohnen",
      "guide_stand": "Datenstand: 4. November 2026",
      "lp_intro": "Booking.com kann dasselbe Zimmer zu denselben Daten je nach Land unterschiedlich teuer anzeigen. Das ist kein Mythos, aber auch kein Spartrick, der immer funktioniert. Hier steht, wie Länderpreise entstehen und was unsere Messungen tatsächlich zeigen.",
      "lp_h2_woher": "Woher Länderpreise kommen",
      "lp_woher_p": "Hotels können bei Booking.com sogenannte <strong>Preise für bestimmte Länder</strong> einstellen: einen Rabatt ab 5 %, den nur Gäste sehen, die die Plattform aus bestimmten Ländern oder Regionen nutzen (<a href=\"https://partner.booking.com/de/hilfe/raten-verf%C3%BCgbarkeiten/raten-angebote/preise-f%C3%BCr-bestimmte-l%C3%A4nder-einstellen\" target=\"_blank\" rel=\"noopener\">Booking.com for Partners</a>). Laut Booking lassen sich diese Rabatte mit Genius-, Frühbucher- und Last-Minute-Angeboten kombinieren, <strong>nicht</strong> aber mit Handy-Raten oder zeitlich begrenzten Aktionen.",
      "lp_woher_p2": "Dazu kommen Effekte, die wie Länderpreise aussehen, aber keine sind: Wechselkurse, gerundete Umrechnungen, Steuern, die mal enthalten sind und mal nicht, und Genius-Rabatte, die in manchen Sitzungen eingeblendet werden und in anderen nicht.",
      "lp_h2_eu": "Warum ein VPN innerhalb der EU meist nichts bringt",
      "lp_eu_p": "Die EU-Geoblocking-Verordnung verbietet es, Kundinnen und Kunden aus der EU wegen Staatsangehörigkeit oder Wohnort unterschiedliche Preise oder Bedingungen anzubieten. Das gilt ausdrücklich auch für Hotels (<a href=\"https://www.verbraucherzentrale.de/wissen/digitale-welt/onlinedienste/kein-geoblocking-mehr-beim-onlineshopping-32025\" target=\"_blank\" rel=\"noopener\">Verbraucherzentrale</a>, <a href=\"https://eur-lex.europa.eu/EN/legal-content/summary/geo-blocking-addressing-discriminatory-treatment-of-customers.html\" target=\"_blank\" rel=\"noopener\">EUR-Lex</a>). Ein Wechsel von Deutschland nach Spanien bringt daher in der Regel keinen Preisvorteil. Interessant sind Länder außerhalb des EWR.",
      "lp_h2_messung": "Was unsere Messungen zeigen",
      "lp_messung_p": "GeoRates fragt dasselbe Zimmer mit derselben Verpflegung, Stornobedingung, denselben Daten und derselben Personenzahl im selben Durchlauf aus 15 Länder-Sitzungen ab, immer inklusive Steuern und Gebühren, umgerechnet in Euro. Unterschiede unter 1 % werten wir als „kein Unterschied“.",
      "lp_messung_lead": "<strong>Unsere Daten (GeoRates-Log, 16.09.–04.11.2026):</strong> 223 Abfragen mit Ergebnis zu 139 Hotels, fast alle mit Deutschland als Ausgangsland.",
      "lp_stat1": "In <strong>59,6 %</strong> der Abfragen war ein anderes Land um mindestens 1 % günstiger (ohne Mehrfachabfragen desselben Angebots: 51,8 %).",
      "lp_stat2": "<strong>Mindestens 10 %</strong> Ersparnis gab es in 26,9 % der Abfragen.",
      "lp_stat3": "Typisch ist wenig: Die <strong>Median-Ersparnis liegt bei 2,2 % bzw. 12,60 €</strong>, der Durchschnitt bei 4,89 % bzw. 61,29 €. Wenn es einen Treffer gab, lag er im Median bei 8,3 % (42,79 €).",
      "lp_cap": "Wie oft das Land um mindestens 1 % das günstigste war, und die durchschnittliche Ersparnis dieser Treffer. GeoRates-Log, 16.09.–04.11.2026.",
      "lp_th_land": "Land",
      "lp_th_n": "Treffer",
      "lp_th_avg": "Ø Ersparnis",
      "lp_c_us": "USA",
      "lp_c_us_n": "42",
      "lp_c_us_avg": "6,7 %",
      "lp_c_in": "Indien",
      "lp_c_in_n": "30",
      "lp_c_in_avg": "8,4 %",
      "lp_c_jp": "Japan",
      "lp_c_jp_n": "22",
      "lp_c_jp_avg": "12,8 %",
      "lp_c_co": "Kolumbien",
      "lp_c_co_n": "19",
      "lp_c_co_avg": "6,0 %",
      "lp_c_ar": "Argentinien",
      "lp_c_ar_n": "5",
      "lp_c_ar_avg": "17,7 %",
      "lp_ausreisser": "Ausreißer: 51,1 % über Argentinien (400,01 € → 195,58 €, Hotel in Thailand, 20.09.2026) und die größte Euro-Ersparnis von 553,54 € über Indien (2.873,40 € → 2.319,86 €, 17.09.2026). Ein Teil der Treffer war bei einer zweiten Abfrage nicht stabil.",
      "lp_korrektur": "Zur Einordnung: Am 18.09.2026 kam eine Korrektur dazu, weil Genius-Rabatte den Vergleich verzerren konnten. Ab dem 19.09. (140 Abfragen mit Ergebnis) war in 62,1 % ein anderes Land mindestens 1 % günstiger, der Schnitt lag bei 4,46 %, der Median bei 2,1 %. Davor (83 Abfragen) waren es 55,4 %, 5,61 % und 3,3 %. Die Tabelle oben mischt beide Zeiträume. Der Argentinien-Ausreißer vom 20.09. liegt nach der Korrektur, die Indien-Ersparnis von 553,54 € am 17.09. davor.",
      "lp_forum_lead": "Zum Vergleich unsere frühere, im Forum veröffentlichte Stichprobe (49 Messungen Ende Juli bis September 2026, vor der Genius-Korrektur, daher nur eingeschränkt belastbar):",
      "lp_forum1": "Zweistellige Ersparnisse gab es nur über <strong>Kolumbien</strong> (bis 29,4 %) und <strong>Indien</strong> (bis 19,3 %).",
      "lp_forum2": "Die größten Einzelersparnisse in Euro: 647,35 € und 553,54 € (Indien).",
      "lp_forum3": "<strong>Ägypten</strong> war oft „am günstigsten“, aber nur um 0,1–0,3 %. Das ist Rundung, kein Fund.",
      "lp_forum4": "Bei etlichen Hotels war <strong>Deutschland selbst am günstigsten</strong>.",
      "lp_lesart": "Unsere ehrliche Lesart: Länderpreise gibt es, aber seltener, als viele Ratgeber behaupten, und sie konzentrieren sich auf wenige Märkte. Es lohnt sich, das zu prüfen, vor allem bei teuren Aufenthalten. Garantiert ist eine Ersparnis nie. Was die Japan-Zahlen im Einzelnen bedeuten, steht in der <a href=\"booking-aus-japan-buchen.html\">Auswertung zur Buchung aus Japan</a>.",
      "lp_h2_buchen": "Den Preis wirklich buchen",
      "lp_buchen_p": "Vergleichen geht bei GeoRates ohne VPN. Um einen Länderpreis zu <strong>buchen</strong>, brauchst du zwei Dinge:",
      "lp_buchen_li1": "ein VPN mit einem Server im gefundenen Land,",
      "lp_buchen_li2": "eine Karte ohne Fremdwährungsgebühr, falls in Landeswährung abgerechnet wird.",
      "lp_bedingungen": "Lies vor der Buchung die Bedingungen: Wenn ein Tarif ausdrücklich nur für Einwohner eines Landes gilt, buche ihn nicht.",
      "lp_cta": "<a href=\"index.html\">Jetzt deinen Booking.com-Link prüfen →</a>",
      "lp_h2_faq": "Häufige Fragen",
      "lp_faq1_q": "Gibt es bei Booking.com wirklich unterschiedliche Preise je Land?",
      "lp_faq1_a": "Ja. Hotels können Länderrabatte ab 5 % für bestimmte Märkte einstellen. In unseren Messungen war in 59,6 % der Abfragen ein anderes Land um mindestens 1 % günstiger. Der Median lag aber nur bei 2,2 %.",
      "lp_faq2_q": "Lohnt sich ein VPN innerhalb der EU?",
      "lp_faq2_a": "Meist nicht. Die EU-Geoblocking-Verordnung verbietet unterschiedliche Preise nach Wohnort innerhalb der EU. Interessant sind Länder außerhalb des EWR.",
      "lp_faq3_q": "Aus welchem Land ist Booking.com am günstigsten?",
      "lp_faq3_a": "Am häufigsten waren im gesamten Log ab dem 16.09. die USA (42 Mal), Indien (30 Mal) und Japan (22 Mal) günstiger, jeweils um mindestens 1 %. Japan hatte dabei den höchsten Schnitt unter den häufigen Ländern (12,8 %), Argentinien lag mit 17,7 % höher, aber nur bei 5 Treffern. Ab dem 19.09. (140 Abfragen) waren es die USA 31 Mal, Indien 20 Mal und Japan 6 Mal.",
      "lp_faq4_q": "Brauche ich zum Vergleichen ein VPN?",
      "lp_faq4_a": "Nein. GeoRates ruft die Preise aus allen Ländern für dich ab. Ein VPN brauchst du nur, wenn du den gefundenen Preis selbst buchen willst.",
      "lp_faq5_q": "Warum zeigt GeoRates manchmal „kein Unterschied“, obwohl ein Land minimal günstiger ist?",
      "lp_faq5_a": "Unterschiede unter 1 % entstehen meist durch Rundung bei der Währungsumrechnung und sind beim Bezahlen nicht real.",
      "guide_more_h2": "Weiterlesen",
      "guide_link_rat": "Ratgeber: warum sich Hotelpreise je nach Land unterscheiden",
      "guide_link_vpn": "Hotel mit VPN günstiger buchen – ohne stundenlanges Server-Wechseln",
      "guide_link_jp": "Booking.com aus Japan buchen: Wie viel lässt sich sparen?",
      "guide_footer_rat": "Ratgeber",
      "vpn_title": "Hotel mit VPN günstiger buchen – ohne Server-Raten | GeoRates",
      "vpn_h1": "Hotel mit VPN günstiger buchen – ohne stundenlanges Server-Wechseln",
      "vpn_intro": "Die klassische Anleitung lautet: VPN an, Land wechseln, Inkognito-Fenster, Hotel neu suchen, Preis notieren und das Ganze für zehn Länder wiederholen. Das kostet eine Stunde und führt oft zu falschen Ergebnissen, weil sich nebenbei Zimmer, Verpflegung oder Storno ändern.",
      "vpn_h2_problem": "Das Problem beim Durchprobieren von Hand",
      "vpn_prob1": "<strong>Ungleiche Angebote:</strong> Ein nicht erstattbares Zimmer ohne Frühstück ist natürlich günstiger als ein flexibler Tarif.",
      "vpn_prob2": "<strong>Steuern und Gebühren:</strong> Manche Länder zeigen Preise ohne Steuern an. Die Ersparnis existiert dann an der Kasse nicht.",
      "vpn_prob3": "<strong>Zeitversatz:</strong> Zwischen der ersten und der zehnten Abfrage kann sich der Preis ändern.",
      "vpn_prob4": "<strong>Genius und Handy-Raten:</strong> Rabatte, die nur in manchen Sitzungen erscheinen, verfälschen den Ländervergleich.",
      "vpn_prob5": "<strong>EU-Länder bringen meist nichts:</strong> Die Geoblocking-Verordnung verbietet Preisunterschiede nach Wohnort innerhalb der EU (<a href=\"https://www.verbraucherzentrale.de/wissen/digitale-welt/onlinedienste/kein-geoblocking-mehr-beim-onlineshopping-32025\" target=\"_blank\" rel=\"noopener\">Verbraucherzentrale</a>).",
      "vpn_h2_schritte": "Der schnellere Weg in 4 Schritten",
      "vpn_s1": "<strong>Hotel auf Booking.com aussuchen</strong> und den Link kopieren (mit Reisedaten und Personenzahl).",
      "vpn_s2": "<strong>Link bei <a href=\"index.html\">GeoRates</a> einfügen</strong> und Zimmer, Verpflegung und Storno wählen. Die Optionen kommen direkt von Booking.com.",
      "vpn_s3": "<strong>Ergebnis abwarten:</strong> GeoRates fragt 15 Länder im selben Durchlauf ab, inklusive Steuern und Gebühren, in Euro. Ein gefundener Vorteil wird durch einen zweiten Abruf bestätigt.",
      "vpn_s4": "<strong>Nur wenn es sich lohnt:</strong> VPN mit dem gefundenen Land verbinden, Booking.com neu laden, Endpreis kontrollieren und buchen.",
      "vpn_h2_zahlen": "Beim Bezahlen nicht die Ersparnis verlieren",
      "vpn_zahlen_p": "Wird in Landeswährung abgerechnet, kostet eine normale Bankkarte oft 1–2 % Auslandseinsatzentgelt plus Wechselkursaufschlag. Wenn Booking anbietet, in Euro umzurechnen, ist der Kurs meist schlechter. Wähle die Landeswährung und zahle mit einer Karte ohne Fremdwährungsgebühr.",
      "vpn_h2_real": "Wie viel bringt das realistisch?",
      "vpn_real_p": "In 223 GeoRates-Abfragen (16.09.–04.11.2026) war in 59,6 % ein anderes Land um mindestens 1 % günstiger, in 26,9 % um mindestens 10 %. Der Median lag bei 2,2 % (12,60 €), der Durchschnitt bei 4,89 % bzw. 61,29 €. Das höchste Ergebnis waren 51,1 %, die größte Euro-Ersparnis 553,54 €. Ab dem 19.09., nach einer Korrektur wegen Genius-Rabatten, sah der Median mit 2,1 % fast gleich aus (140 Abfragen). Unser Rat: Bei teuren Buchungen lohnt sich ein Check, mehr als eine Minute muss er nicht kosten. Die Aufschlüsselung nach Land steht im <a href=\"booking-laenderpreise.html\">Überblick zu den Länderpreisen</a>.",
      "vpn_h2_erlaubt": "Ist das erlaubt?",
      "vpn_erlaubt_p": "Ein VPN zu nutzen ist in Deutschland legal. Ob ein konkreter Tarif für dich gilt, steht in den Buchungsbedingungen: Tarife „nur für Einwohner von …“ solltest du nicht buchen. Prüfe außerdem die Stornobedingungen, denn günstige Tarife sind oft nicht erstattbar. Das hier ist keine Rechtsberatung.",
      "vpn_cta": "<a href=\"index.html\">Jetzt Booking.com-Link prüfen →</a>",
      "vpn_h2_faq": "Häufige Fragen",
      "vpn_faq1_q": "Kann ich mit VPN wirklich günstiger buchen?",
      "vpn_faq1_a": "Manchmal. In unseren Daten war in 59,6 % der Abfragen ein Land mindestens 1 % günstiger, in 26,9 % mindestens 10 %. Der Median lag aber nur bei 2,2 %.",
      "vpn_faq2_q": "Welches Land sollte ich beim VPN wählen?",
      "vpn_faq2_a": "Das hängt vom Hotel ab. Am häufigsten waren in unseren Daten die USA, Indien und Japan günstiger (42, 30 und 22 Mal, jeweils mindestens 1 %). GeoRates zeigt dir für dein Hotel das passende Land.",
      "vpn_faq3_q": "Brauche ich das VPN schon zum Vergleichen?",
      "vpn_faq3_a": "Nein, nur zum Buchen.",
      "vpn_faq4_q": "Muss ich den Browser-Verlauf löschen?",
      "vpn_faq4_a": "Zum Buchen solltest du ein privates Fenster nutzen, damit Booking.com dein Land nicht aus alten Cookies übernimmt.",
      "vpn_faq5_q": "Welche Karte sollte ich nutzen?",
      "vpn_faq5_a": "Eine Karte ohne Auslandseinsatzentgelt. Zahle in Landeswährung statt in der Euro-Umrechnung, die Booking anbietet.",
      "guide_link_lp": "Booking.com Länderpreise: Was sie sind und wie oft sie sich lohnen",
      "jp_title": "Booking.com aus Japan buchen: Was die Messungen zeigen | GeoRates",
      "jp_h1": "Booking.com aus Japan buchen: Wie viel lässt sich sparen?",
      "jp_intro": "Japan fällt in unserem Log nicht dadurch auf, dass es am häufigsten gewinnt. Die USA waren 42 Mal das günstigste Land mit mindestens 1 % Vorsprung, Indien 30 Mal, Japan 22 Mal. Wenn Japan gewinnt, ist die Ersparnis im Schnitt aber höher als bei diesen häufigeren Ländern: 12,8 % im Mittel, 11,0 % im Median, einmal 38,1 %. Argentinien liegt mit 17,7 % im Schnitt darüber, allerdings bei nur 5 Treffern. Japan ist deshalb kein Land, das man blind wählt, sondern eines, das sich zu prüfen lohnt, wenn der konkrete Aufenthalt teuer ist.",
      "jp_h2_daten": "Was unsere Daten zeigen",
      "jp_daten_p": "Das Log umfasst 223 Abfragen mit Ergebnis vom 16.09. bis 04.11.2026, fast alle mit Deutschland als Ausgangsland, zu 139 Hotels. GeoRates fragt dasselbe Zimmer, dieselbe Verpflegung, dieselbe Stornobedingung und dieselben Daten im selben Durchlauf aus 15 Länder-Sitzungen ab, inklusive Steuern und Gebühren, in Euro. Unterschiede unter 1 % zählen wir nicht als Fund.",
      "jp_li1": "Bei Treffern ab 1 % war Japan <strong>22 Mal</strong> das günstigste Land. Über alle 223 Abfragen stand Japan <strong>40 Mal</strong> als bestes Land. Die Differenz sind Fälle unter 1 %, meist Rundung und kein echter Vorsprung.",
      "jp_li2": "Bei den 22 Treffern lag die Ersparnis im <strong>Schnitt bei 12,8 %</strong>, im <strong>Median bei 11,0 %</strong>, im <strong>Maximum bei 38,1 %</strong>. 12,8 % ist der Schnitt dieser Treffer, nicht der Schnitt aller Abfragen. Über alle Abfragen mit Ergebnis lag der Median bei 2,2 %.",
      "jp_li3": "Häufiger, im Schnitt aber niedriger: USA 42 Treffer bei 6,7 %, Indien 30 bei 8,4 %, Kolumbien 19 bei 6,0 % (Median dort nur 1,5 %). Kolumbien wird in Foren oft als Spar-Land genannt; in diesem Log ist der typische Treffer klein.",
      "jp_li4": "Argentinien kam auf 17,7 % im Schnitt, bei 5 Treffern, darunter ein Ausreißer von 51,1 % (400,01 € → 195,58 €, Hotel in Thailand, 20.09.2026). Peru lag bei 4 Treffern im Schnitt bei 11,7 %, also unter Japan.",
      "jp_li5": "Konkreter Fund am <strong>20.09.2026</strong>, nach der Methodenkorrektur: 267 € im Ausgang, 165,22 € über Japan. Das sind 101,78 € und die im Log geführten 38,1 %. Es ist der höchste Japan-Wert im Log, nicht der typische.",
      "jp_zeitraum": "Am 18.09.2026 wurde die Messung um eine Genius-Korrektur ergänzt. Davor (83 Ergebniszeilen, 16.–18.09.) lag der Anteil mit mindestens 1 % Ersparnis bei 55,4 %, der Schnitt bei 5,61 %, der Median bei 3,3 %. Ab dem 19.09. (140 Zeilen) waren es 62,1 %, im Schnitt 4,46 %, Median 2,1 %. Das gilt für alle Länder zusammen. Im engeren Fenster ab dem 19.09. (140 Abfragen) war Japan nur 6 Mal das günstigste Land mit mindestens 1 %, im Schnitt 12,0 %, im Median 8,5 %, höchstens weiter 38,1 %. Die 22 Treffer und die 12,8 % auf dieser Seite beziehen sich auf das gesamte Log ab dem 16.09., also einschließlich der Tage vor der Korrektur. Die engere Aufstellung steht im <a href=\"booking-laender-ranking.html\">Länder-Ranking</a>. 19 Zeilen tragen später ein Genius-Flag; frühere Zeilen lassen sich daran nicht prüfen.",
      "jp_fazit": "Fazit: Wenn Japan in diesem Log gewinnt, ist der Abstand im Mittel größer als bei USA, Indien oder Kolumbien. Ob das für dein Hotel gilt, sagt nur eine Abfrage für genau dieses Zimmer. Die größte Euro-Ersparnis im Log lief nicht über Japan, sondern über Indien: 553,54 € am 17.09.2026, vor der Korrektur (2.873,40 € → 2.319,86 €).",
      "jp_h2_warum": "Warum Japan manchmal günstiger ist",
      "jp_warum_p": "Sicher wissen wir es nicht. Plausibel ist, dass Hotels bei Booking.com Rabatte für bestimmte Länder und Regionen einstellen können (<a href=\"https://partner.booking.com/de/hilfe/raten-verf%C3%BCgbarkeiten/raten-angebote/preise-f%C3%BCr-bestimmte-l%C3%A4nder-einstellen\" target=\"_blank\" rel=\"noopener\">Booking.com for Partners</a>). Wir messen nur, was die Sitzung anzeigt. Wechselkurse, gerundete Umrechnungen und Rabatte, die nur in manchen Sitzungen erscheinen, können zusätzlich wie ein Länderpreis aussehen.",
      "jp_h2_haken": "Haken",
      "jp_haken1": "Ersparnisse sind nicht immer stabil. Im gesamten Log sind 15 Zeilen als „nicht stabil“ markiert und 33 als „stabil“. Die Markierung ist nicht nach Land aufgeschlüsselt, also auch nicht speziell für Japan. Wir können nicht sagen, wie viele der 22 Japan-Treffer eine zweite Abfrage überstanden hätten.",
      "jp_haken2": "22 Treffer sind eine kleine Stichprobe. Der Median von 11,0 % liegt dicht am Schnitt von 12,8 %; der einzelne Fall mit 38,1 % zieht den Schnitt trotzdem nach oben. Beides ist kein Versprechen für die nächste Buchung.",
      "jp_haken3": "Innerhalb der EU bringt ein Länderwechsel wegen der Geoblocking-Verordnung meist nichts (<a href=\"https://www.verbraucherzentrale.de/wissen/digitale-welt/onlinedienste/kein-geoblocking-mehr-beim-onlineshopping-32025\" target=\"_blank\" rel=\"noopener\">Verbraucherzentrale</a>, <a href=\"https://eur-lex.europa.eu/EN/legal-content/summary/geo-blocking-addressing-discriminatory-treatment-of-customers.html\" target=\"_blank\" rel=\"noopener\">EUR-Lex</a>). Japan liegt außerhalb des EWR, deshalb ist eine Japan-Sitzung von dieser Regel nicht erfasst. Ein Wechsel von Deutschland nach Spanien bleibt uninteressant.",
      "jp_h2_buchen": "So buchst du einen Japan-Preis",
      "jp_s1": "Prüfe dein Hotel mit <a href=\"index.html\">GeoRates</a>. Nur wenn Japan günstiger angezeigt wird, lohnt sich der Rest.",
      "jp_s2": "Verbinde ein VPN mit einem Server in Japan und öffne Booking.com in einem privaten Fenster, damit alte Cookies das Land nicht überschreiben.",
      "jp_s3": "Kontrolliere Zimmer, Verpflegung, Storno und den Endpreis inklusive Steuern. Ein nicht erstattbarer Tarif ist kein fairer Vergleich mit einem flexiblen.",
      "jp_s4": "Zahle in Yen (JPY) mit einer Karte ohne Fremdwährungsgebühr und lehne die Euro-Umrechnung durch Booking ab. Wird in Yen abgerechnet, kann eine normale Bankkarte ein Auslandseinsatzentgelt und einen Wechselkursaufschlag kosten. Daran kann ein Teil der Ersparnis hängen bleiben.",
      "jp_s5": "Steht im Tarif „nur für Einwohner von Japan“, buche ihn nicht.",
      "jp_h2_beispiel": "Rechenbeispiel aus dem Log",
      "jp_beispiel": "20.09.2026, nach der Genius-Korrektur: 267 € aus dem Ausgang, 165,22 € über Japan, also <strong>101,78 € (38,1 %) weniger</strong>. Davon gehen VPN-Kosten ab, falls kein Abo vorhanden ist, und eventuelle Kartengebühren. Es ist der höchste Japan-Wert im Log. Der Median der 22 Treffer liegt bei 11,0 %, nicht bei 38 %.",
      "jp_cta": "<a href=\"index.html\">Prüfen, ob dein Hotel aus Japan günstiger ist →</a>",
      "jp_h2_faq": "Häufige Fragen",
      "jp_faq1_q": "Ist Booking.com aus Japan immer günstiger?",
      "jp_faq1_a": "Nein. In 22 von 223 Abfragen mit Ergebnis war Japan das günstigste Land mit mindestens 1 % Vorteil. In 40 von 223 stand es als bestes Land; der Rest davon lag unter 1 % und zählt bei uns nicht als Fund.",
      "jp_faq2_q": "Wie viel kann ich sparen, wenn Japan gewinnt?",
      "jp_faq2_a": "In diesen 22 Treffern im Schnitt 12,8 %, im Median 11,0 %, höchstens 38,1 % (20.09.2026, 267 € zu 165,22 €). Das ist der Schnitt über das ganze Log ab dem 16.09. Im engeren Fenster ab dem 19.09. sind es 6 Treffer, im Schnitt 12,0 % und im Median 8,5 %.",
      "jp_faq3_q": "Sind andere Länder häufiger oder im Schnitt günstiger?",
      "jp_faq3_a": "Häufiger waren die USA (42 Mal, Schnitt 6,7 %) und Indien (30 Mal, Schnitt 8,4 %). Argentinien lag im Schnitt höher (17,7 %), aber nur bei 5 Treffern. Welches Land bei deinem Hotel vorn liegt, hängt vom Angebot ab.",
      "jp_faq4_q": "Lohnt sich ein VPN in ein EU-Land, um an den Japan-Preis zu kommen?",
      "jp_faq4_a": "Nein. Die Geoblocking-Verordnung verbietet unterschiedliche Preise nach Wohnort innerhalb der EU. Japan liegt außerhalb des EWR. Zum Vergleichen brauchst du kein VPN. Ein VPN mit Server in Japan brauchst du nur, wenn du den gefundenen Preis selbst buchen willst.",
      "jp_faq5_q": "In welcher Währung soll ich bezahlen?",
      "jp_faq5_a": "In Yen (JPY), mit einer Karte ohne Fremdwährungsgebühr. Die Umrechnung in Euro, die Booking anbietet, ist meist teurer.",
      "jp_faq6_q": "Ist das erlaubt?",
      "jp_faq6_a": "Ein VPN zu nutzen ist in Deutschland legal. Ob ein konkreter Tarif für dich gilt, steht in den Buchungsbedingungen. Tarife, die ausdrücklich nur für Einwohner Japans gelten, solltest du nicht buchen. Das ist keine Rechtsberatung.",
      "rat_more_h2": "Weitere Ratgeber",
      "rat_more_p": "Auswertungen unserer Messungen: wie oft ein anderes Land günstiger ist, das Ranking ab dem 19.09.2026, und was Buchungen aus den USA, aus Indien und aus Japan in den Daten gezeigt haben.",
      "rat_more_lp": "Booking.com Länderpreise: Was sie sind und wie oft sie sich lohnen",
      "rat_more_vpn": "Hotel mit VPN günstiger buchen – ohne stundenlanges Server-Wechseln",
      "rat_more_jp": "Booking.com aus Japan buchen: Wie viel lässt sich sparen?",
      "in_title": "Booking.com aus Indien buchen: Wie viel spart man wirklich? | GeoRates",
      "in_h1": "Booking.com aus Indien buchen: Echte Zahlen statt Mythos",
      "in_intro": "Indien taucht in vielen VPN-Ratgebern als Spartipp auf. Wir haben nachgemessen: Dasselbe Zimmer mit derselben Verpflegung, demselben Storno und denselben Daten wurde im selben Durchlauf aus 15 Ländern abgefragt, immer inklusive Steuern und Gebühren. Unterschiede unter 1 % zählen nicht als Fund.",
      "in_h2_daten": "Was unsere Daten zeigen",
      "in_daten_lead": "Aus dem GeoRates-Log, nur der Abschnitt nach der Genius-Korrektur: 140 Abfragen mit Ergebnis vom 19.09. bis 04.11.2026. Ausgangsland war fast immer Deutschland.",
      "in_li1": "<strong>Indien war 20 Mal das günstigste Land</strong> mit mindestens 1 % Vorteil. Nur die USA kamen häufiger vor (31 Mal).",
      "in_li2": "<strong>Median-Ersparnis: 7,8 %</strong>, Durchschnitt 7,2 %, Höchstwert 11,3 %. In 9 der 20 Fälle waren es 10 % oder mehr. Der Median liegt hier über dem Durchschnitt, weil ein paar kleine Treffer den Schnitt ziehen. 7,8 % ist der typische Treffer, nicht der Schnitt aller Abfragen.",
      "in_li3": "In Euro: im Median <strong>47,50 €</strong>, im Schnitt 107,07 €, maximal <strong>297,94 €</strong>.",
      "in_li4": "Die Indien-Treffer betrafen vor allem Hotels in <strong>Thailand (6), Tansania (6) und Spanien (5)</strong>.",
      "in_beispiel": "<strong>Stabil bestätigtes Beispiel:</strong> Ein Hotel in Spanien kostete aus Deutschland 2.787,00 €, aus Indien 2.489,06 €. Das sind <strong>297,94 € (10,7 %) weniger</strong>. Ein zweiter Abruf bestätigte den Wert. Drei Tage später lag die Ersparnis immer noch bei 10,6 %.",
      "in_stabil": "Zur Einordnung: 4 Indien-Treffer wurden per zweitem Abruf als stabil bestätigt, 3 waren nicht stabil. Die übrigen stammen aus der Zeit, bevor GeoRates jeden Fund doppelt prüfte. 7 geprüfte Fälle sind zu wenig, um die anderen 13 für sicher zu halten.",
      "in_fenster": "Dieses Fenster ist enger als das gesamte Log ab dem 16.09. Dort war Indien 30 Mal günstigstes Land, im Schnitt 8,4 %, höchstens 19,3 %. Die größte Euro-Ersparnis im gesamten Log, 553,54 € am 17.09.2026, liegt vor der Korrektur und ist hier nicht enthalten. Die 11,3 % und die 297,94 € sind die Höchstwerte nur ab dem 19.09.",
      "in_h2_warum": "Warum ein Hotel in Spanien aus Indien günstiger sein kann",
      "in_warum_p": "Die EU-Geoblocking-Verordnung verbietet unterschiedliche Preise nach Wohnort <strong>innerhalb</strong> der EU (<a href=\"https://www.verbraucherzentrale.de/wissen/digitale-welt/onlinedienste/kein-geoblocking-mehr-beim-onlineshopping-32025\" target=\"_blank\" rel=\"noopener\">Verbraucherzentrale</a>, <a href=\"https://eur-lex.europa.eu/EN/legal-content/summary/geo-blocking-addressing-discriminatory-treatment-of-customers.html\" target=\"_blank\" rel=\"noopener\">EUR-Lex</a>). Indien liegt außerhalb. Hotels dürfen dort eigene Länderrabatte anbieten (<a href=\"https://partner.booking.com/de/hilfe/raten-verf%C3%BCgbarkeiten/raten-angebote/preise-f%C3%BCr-bestimmte-l%C3%A4nder-einstellen\" target=\"_blank\" rel=\"noopener\">Booking.com for Partners</a>). Deshalb kann sogar ein spanisches Hotel aus Indien günstiger erscheinen als aus Deutschland. Ob es das bei deinem Hotel tut, sagt nur die Abfrage.",
      "in_h2_haken": "Haken",
      "in_haken1": "Kein Automatismus: Indien war in 20 von 140 Abfragen das günstigste Land, in den übrigen nicht.",
      "in_haken2": "Preise können schwanken. Prüfe direkt vor der Buchung erneut.",
      "in_haken3": "Abgerechnet wird eventuell in Rupien (INR). Dann gehen Kartengebühren und schlechte Umrechnungskurse von der Ersparnis ab.",
      "in_haken4": "Tarife „nur für Einwohner von Indien“ nicht buchen.",
      "in_h2_buchen": "So buchst du einen Indien-Preis",
      "in_s1": "Hotel bei <a href=\"index.html\">GeoRates</a> prüfen.",
      "in_s2": "Wenn Indien vorne liegt: VPN mit einem Server in Indien verbinden und Booking.com im privaten Fenster öffnen.",
      "in_s3": "Zimmer, Verpflegung, Storno und Endpreis kontrollieren.",
      "in_s4": "In Landeswährung (gegebenenfalls Rupien) mit einer Karte ohne Fremdwährungsgebühr zahlen und die Euro-Umrechnung von Booking ablehnen.",
      "in_cta": "<a href=\"index.html\">Prüfen, ob dein Hotel aus Indien günstiger ist →</a>",
      "in_h2_faq": "Häufige Fragen",
      "in_faq1_q": "Ist Booking.com aus Indien günstiger?",
      "in_faq1_a": "Manchmal. In den 140 Abfragen seit dem 19.09.2026 war Indien 20 Mal das günstigste Land, im Median um 7,8 %. In den übrigen Abfragen nicht.",
      "in_faq2_q": "Wie viel kann ich maximal sparen?",
      "in_faq2_a": "In diesem Fenster lag der höchste Prozentwert bei 11,3 %. Die größte Ersparnis in Euro waren 297,94 € bei einem Hotel in Spanien (2.787,00 € zu 2.489,06 €), per zweitem Abruf bestätigt. Der Median der 20 Treffer liegt bei 7,8 % bzw. 47,50 €.",
      "in_faq3_q": "Warum ist ein EU-Hotel aus Indien günstiger?",
      "in_faq3_a": "Die Geoblocking-Verordnung gilt nur innerhalb der EU. Für Länder außerhalb dürfen Hotels eigene Rabatte festlegen. Das passiert nicht bei jedem Hotel.",
      "in_faq4_q": "In welcher Währung zahle ich?",
      "in_faq4_a": "Möglicherweise in Rupien (INR). Nutze eine Karte ohne Fremdwährungsgebühr und lehne die Umrechnung durch Booking ab.",
      "in_faq5_q": "Brauche ich zum Vergleichen ein VPN?",
      "in_faq5_a": "Nein, GeoRates vergleicht für dich. Ein VPN brauchst du erst zum Buchen.",
      "guide_link_rank": "Aus welchem Land ist Booking.com am günstigsten? Das Ranking",
      "guide_link_us": "Booking.com aus den USA buchen: Überraschend oft günstiger",
      "us_title": "Booking.com aus den USA buchen: Das häufigste Spar-Land | GeoRates",
      "us_h1": "Booking.com aus den USA buchen: Überraschend oft günstiger",
      "us_intro": "Wer an Länderpreise denkt, denkt meist an Indien oder Kolumbien. In unseren Daten ab dem 19.09.2026 war aber ein anderes Land am häufigsten vorn: <strong>die USA</strong>. Häufig heißt nicht hoch. Der typische Vorsprung ist klein.",
      "us_h2_daten": "Was unsere Daten zeigen",
      "us_daten_lead": "GeoRates-Log, 140 Abfragen mit Ergebnis vom 19.09. bis 04.11.2026, also nach der Genius-Korrektur. Dasselbe Zimmer, dieselbe Verpflegung, dasselbe Storno, dieselben Daten, 15 Länder im selben Durchlauf, immer inklusive Steuern und Gebühren. Unterschiede unter 1 % zählen nicht.",
      "us_li1": "<strong>31 Mal waren die USA das günstigste Land</strong> mit mindestens 1 % Vorteil, häufiger als jedes andere Land in diesem Fenster.",
      "us_li2": "<strong>Median-Ersparnis: 5,7 %</strong>, Durchschnitt 7,0 %, Höchstwert 27,3 %. In 9 Fällen waren es mindestens 10 %. Der Durchschnitt liegt über dem Median, weil einzelne hohe Werte ihn ziehen. Typisch sind 5,7 %.",
      "us_li3": "In Euro: im Median <strong>29,79 €</strong>, im Schnitt 54,69 €, maximal 197,16 €.",
      "us_li4": "Die meisten US-Treffer betrafen Hotels in <strong>Griechenland (10)</strong> und <strong>Italien (5)</strong>, außerdem in Portugal, Deutschland und Tansania (je 3).",
      "us_li5": "<strong>Alle 7 per zweitem Abruf geprüften US-Treffer waren stabil.</strong> Geprüft sind 7 von 31, nicht alle.",
      "us_beispiele": "<strong>Stabil bestätigte Beispiele:</strong> ein Hotel in Griechenland um 134,23 € (6,3 %) günstiger aus den USA, ein Hotel in Sri Lanka um 166,73 € (6,4 %) günstiger, ein Hotel in Italien um 12,3 % günstiger (18,89 €). Die Ersparnisse sind also eher moderat. Der Ausreißer von 27,3 % ist die Ausnahme.",
      "us_fenster": "Im gesamten Log ab dem 16.09. waren die USA 42 Mal vorn, im Schnitt 6,7 %, im Median 5,5 %, höchstens ebenfalls 27,3 %. Die 31 Treffer auf dieser Seite sind der engere Abschnitt ab dem 19.09.",
      "us_h2_warum": "Warum gerade die USA?",
      "us_warum_p": "Das ist nicht sicher geklärt. Hotels können Rabatte für einzelne Länder oder Regionen einstellen (<a href=\"https://partner.booking.com/de/hilfe/raten-verf%C3%BCgbarkeiten/raten-angebote/preise-f%C3%BCr-bestimmte-l%C3%A4nder-einstellen\" target=\"_blank\" rel=\"noopener\">Booking.com for Partners</a>), zum Beispiel um US-Gäste zu gewinnen. Da die USA nicht zur EU gehören, gilt die EU-Geoblocking-Verordnung hier nicht (<a href=\"https://www.verbraucherzentrale.de/wissen/digitale-welt/onlinedienste/kein-geoblocking-mehr-beim-onlineshopping-32025\" target=\"_blank\" rel=\"noopener\">Verbraucherzentrale</a>, <a href=\"https://eur-lex.europa.eu/EN/legal-content/summary/geo-blocking-addressing-discriminatory-treatment-of-customers.html\" target=\"_blank\" rel=\"noopener\">EUR-Lex</a>). Ein Hotel in Griechenland darf US-Besuchern also einen anderen Preis zeigen als Deutschen. Ob es das tut, messen wir nur am konkreten Zimmer.",
      "us_h2_haken": "Haken",
      "us_haken1": "Achte auf den Endpreis: In den USA werden Preise oft ohne Steuern angezeigt. GeoRates vergleicht immer inklusive, beim Buchen musst du selbst kontrollieren.",
      "us_haken2": "Bei Zahlung in US-Dollar können Kartengebühren einen Teil der Ersparnis auffressen. Der Median von 29,79 € ist schnell aufgezehrt.",
      "us_haken3": "Tarife „nur für Einwohner der USA“ nicht buchen.",
      "us_h2_buchen": "So buchst du einen US-Preis",
      "us_s1": "Hotel bei <a href=\"index.html\">GeoRates</a> prüfen. Nur wenn die USA vorne liegen, lohnt sich der Rest.",
      "us_s2": "VPN mit einem US-Server verbinden und Booking.com im privaten Fenster öffnen.",
      "us_s3": "Zimmer, Verpflegung, Storno und Gesamtpreis inklusive Steuern kontrollieren.",
      "us_s4": "In USD mit einer Karte ohne Fremdwährungsgebühr oder direkt in Euro zahlen, je nachdem, welcher Endbetrag niedriger ist.",
      "us_cta": "<a href=\"index.html\">Prüfen, ob dein Hotel aus den USA günstiger ist →</a>",
      "us_h2_faq": "Häufige Fragen",
      "us_faq1_q": "Ist Booking.com aus den USA günstiger?",
      "us_faq1_a": "In den 140 Abfragen ab dem 19.09.2026 waren die USA das häufigste Spar-Land: 31 Mal, im Median 5,7 % günstiger. Häufig heißt nicht, dass jede Buchung spürbar günstiger wird.",
      "us_faq2_q": "Gilt das auch für Hotels in Europa?",
      "us_faq2_a": "In diesem Fenster ja, und zwar oft: 10 der 31 Treffer betrafen Hotels in Griechenland, 5 Hotels in Italien. Die EU-Geoblocking-Regel gilt nur innerhalb der EU, nicht gegenüber den USA.",
      "us_faq3_q": "Wie verlässlich sind die US-Preise?",
      "us_faq3_a": "Alle 7 per zweitem Abruf geprüften Treffer waren stabil. Die anderen 24 sind nicht doppelt geprüft. Prüfe trotzdem kurz vor der Buchung erneut.",
      "us_faq4_q": "Warum sieht der US-Preis auf Booking zuerst niedriger aus?",
      "us_faq4_a": "In den USA werden Preise oft ohne Steuern angezeigt. Vergleiche immer den Endpreis. GeoRates rechnet Steuern und Gebühren mit ein.",
      "us_faq5_q": "Brauche ich zum Vergleichen ein VPN?",
      "us_faq5_a": "Nein. GeoRates fragt die Länder für dich ab. Ein VPN mit Server in den USA brauchst du nur, wenn du den gefundenen Preis selbst buchen willst.",
      "guide_link_in": "Booking.com aus Indien buchen: Echte Zahlen statt Mythos",
      "rk_title": "Aus welchem Land ist Booking.com am günstigsten? Ranking 2026 | GeoRates",
      "rk_h1": "Aus welchem Land ist Booking.com am günstigsten? Unser Ranking",
      "rk_stand": "Stand: 4. November 2026. Wird aktualisiert, sobald neue Abfragen vorliegen.",
      "rk_intro": "Wir haben ausgewertet, welche Länder bei GeoRates-Abfragen am häufigsten den günstigsten Preis für exakt dasselbe Zimmer lieferten. Grundlage sind 140 Abfragen mit Ergebnis vom 19.09. bis 04.11.2026, nach der Genius-Korrektur vom 18.09. Ausgangsland war meist Deutschland, Steuern und Gebühren sind immer enthalten. Unterschiede unter 1 % zählen nicht.",
      "rk_h2_wichtig": "Das Wichtigste vorab",
      "rk_wichtig1": "In <strong>62,1 %</strong> der Abfragen war ein anderes Land mindestens 1 % günstiger, in 32 Fällen (22,9 %) sogar mindestens 10 %.",
      "rk_wichtig2": "Die <strong>Median-Ersparnis über alle Abfragen lag aber nur bei 2,1 %</strong>, der Durchschnitt bei 4,46 %. Große Sprünge sind die Ausnahme.",
      "rk_h2_ranking": "Ranking: Wie oft war welches Land günstigstes?",
      "rk_th_n": "#",
      "rk_th_land": "Land",
      "rk_th_hits": "Treffer",
      "rk_th_med": "Median",
      "rk_th_avg": "Ø",
      "rk_th_max": "Max",
      "rk_r1_n": "1",
      "rk_r1_land": "USA",
      "rk_r1_hits": "31",
      "rk_r1_med": "5,7 %",
      "rk_r1_avg": "7,0 %",
      "rk_r1_max": "27,3 %",
      "rk_r2_n": "2",
      "rk_r2_land": "Indien",
      "rk_r2_hits": "20",
      "rk_r2_med": "7,8 %",
      "rk_r2_avg": "7,2 %",
      "rk_r2_max": "11,3 %",
      "rk_r3_n": "3",
      "rk_r3_land": "Kolumbien",
      "rk_r3_hits": "13",
      "rk_r3_med": "1,5 %",
      "rk_r3_avg": "3,6 %",
      "rk_r3_max": "17,1 %",
      "rk_r4_n": "4",
      "rk_r4_land": "Japan",
      "rk_r4_hits": "6",
      "rk_r4_med": "8,5 %",
      "rk_r4_avg": "12,0 %",
      "rk_r4_max": "38,1 %",
      "rk_r5_n": "5",
      "rk_r5_land": "Argentinien",
      "rk_r5_hits": "5",
      "rk_r5_med": "9,0 %",
      "rk_r5_avg": "17,7 %",
      "rk_r5_max": "51,1 %",
      "rk_r6_n": "6",
      "rk_r6_land": "Peru",
      "rk_r6_hits": "4",
      "rk_r6_med": "9,5 %",
      "rk_r6_avg": "11,7 %",
      "rk_r6_max": "20,8 %",
      "rk_r7_n": "7",
      "rk_r7_land": "Ägypten",
      "rk_r7_hits": "2",
      "rk_r7_med": "7,8 %",
      "rk_r7_avg": "7,8 %",
      "rk_r7_max": "9,8 %",
      "rk_r8_n": "7",
      "rk_r8_land": "Pakistan",
      "rk_r8_hits": "2",
      "rk_r8_med": "13,4 %",
      "rk_r8_avg": "13,4 %",
      "rk_r8_max": "14,9 %",
      "rk_cap": "Treffer mit mindestens 1 % Ersparnis, nur wenn das Land das günstigste war. 140 Abfragen, 19.09.–04.11.2026. Median, Schnitt und Maximum beziehen sich auf diese Treffer, nicht auf alle Abfragen. Ägypten und Pakistan liegen gleichauf auf Platz 7.",
      "rk_einmal": "Jeweils einmal vorn lagen die Philippinen (15,1 %), Mexiko (14,4 %), Sri Lanka (13,9 %) und Vietnam (6,5 %). Ein einzelner Treffer ist kein Muster.",
      "rk_h2_lesen": "So liest du das Ranking",
      "rk_lesen_us": "<strong>USA:</strong> am häufigsten günstiger, die Ersparnis ist moderat (Median 5,7 %). Alle 7 doppelt geprüften Treffer hielten. <a href=\"booking-usa.html\">Zur USA-Seite</a>",
      "rk_lesen_in": "<strong>Indien:</strong> seltener, im Median aber höher (7,8 %). Der Schnitt von 7,2 % liegt darunter. <a href=\"booking-indien.html\">Zur Indien-Seite</a>",
      "rk_lesen_co": "<strong>Kolumbien:</strong> oft genannt, im Median aber nur 1,5 % (13 Treffer, Schnitt 3,6 %, höchstens 17,1 %). Eine eigene Seite gibt es dafür nicht.",
      "rk_lesen_jp": "<strong>Japan:</strong> in diesem Fenster nur 6 Treffer, dann aber im Schnitt 12,0 % (Median 8,5 %, einmal 38,1 %). Über das ganze Log ab dem 16.09. sind es 22 Treffer und 12,8 % im Schnitt. <a href=\"booking-aus-japan-buchen.html\">Zur Japan-Seite</a>",
      "rk_lesen_ar": "<strong>Argentinien:</strong> 5 Treffer, Schnitt 17,7 %, einmal 51,1 % (400,01 € → 195,58 €, Hotel in Thailand, 20.09.2026). Solche Ausreißer unbedingt doppelt prüfen. Eine eigene Seite gibt es nicht.",
      "rk_lesen_eg": "<strong>Ägypten:</strong> in der ungefilterten Gesamtstatistik oft „am günstigsten“, aber fast immer nur um Rundungsbeträge unter 1 %. In dieser Tabelle stehen nur die 2 Fälle mit mindestens 1 %.",
      "rk_fenster": "Die Seiten zu den Länderpreisen allgemein und zu Japan werten das gesamte Log ab dem 16.09. aus (223 Abfragen mit Ergebnis). Dieses Ranking nur den Abschnitt ab dem 19.09. Deshalb stehen dort andere Trefferzahlen, zum Beispiel Japan 22 statt 6 und die USA 42 statt 31.",
      "rk_h2_eu": "Warum keine EU-Länder im Ranking stehen",
      "rk_eu_p": "Innerhalb der EU verbietet die Geoblocking-Verordnung unterschiedliche Preise nach Wohnort (<a href=\"https://www.verbraucherzentrale.de/wissen/digitale-welt/onlinedienste/kein-geoblocking-mehr-beim-onlineshopping-32025\" target=\"_blank\" rel=\"noopener\">Verbraucherzentrale</a>, <a href=\"https://eur-lex.europa.eu/EN/legal-content/summary/geo-blocking-addressing-discriminatory-treatment-of-customers.html\" target=\"_blank\" rel=\"noopener\">EUR-Lex</a>). GeoRates prüft deshalb vor allem Länder außerhalb der EU. Ein Wechsel von Deutschland nach Spanien bringt in der Regel nichts. Ein EU-Hotel kann trotzdem aus Indien oder den USA günstiger sein, weil diese Länder außerhalb liegen.",
      "rk_h2_methodik": "Methodik und Grenzen",
      "rk_meth1": "Gleiches Zimmer, gleiche Verpflegung, gleiches Storno, gleiche Daten, alle Länder im selben Durchlauf, Preise inklusive Steuern und Gebühren, in Euro.",
      "rk_meth2": "Daten erst ab dem 19.09.2026, um verfälschte Genius-Einblendungen aus früheren Messungen auszuschließen. Davor (83 Abfragen, 16.–18.09.) lag der Anteil mit mindestens 1 % bei 55,4 %, der Schnitt bei 5,61 %, der Median bei 3,3 %.",
      "rk_meth3": "Neuere Treffer werden per zweitem Abruf bestätigt. Im Log sind 15 Funde als nicht stabil markiert und 33 als stabil. Sie bleiben in den Zählungen. Die Markierung ist nicht nach Datum getrennt, deshalb lässt sich nicht sagen, wie viele der 15 in dieses Fenster fallen.",
      "rk_meth4": "Die Stichprobe ist klein (140 Abfragen) und hängt davon ab, welche Hotels Nutzer prüfen. Platz 4 bis 7 und die Einmaltreffer sind dafür zu dünn, um ein Land zum Standard zu machen.",
      "rk_h2_buchen": "Den Preis wirklich buchen",
      "rk_buchen_p": "Vergleichen geht bei GeoRates ohne VPN. Zum Buchen brauchst du einen Server im gefundenen Land und, falls in Landeswährung abgerechnet wird, eine Karte ohne Fremdwährungsgebühr. Den Ablauf beschreibt der <a href=\"hotel-vpn-guenstiger-buchen.html\">Ratgeber zum VPN</a>. Tarife nur für Einwohner eines Landes nicht buchen.",
      "rk_cta": "<a href=\"index.html\">Dein Hotel jetzt in 15 Ländern prüfen →</a>",
      "rk_h2_faq": "Häufige Fragen",
      "rk_faq1_q": "Aus welchem Land ist Booking.com am günstigsten?",
      "rk_faq1_a": "In den 140 Abfragen ab dem 19.09.2026 am häufigsten aus den USA (31 Treffer), danach Indien (20) und Kolumbien (13). Der Median der Kolumbien-Treffer lag nur bei 1,5 %. Welches Land bei deinem Hotel vorn liegt, hängt vom Angebot ab.",
      "rk_faq2_q": "Wie oft lohnt sich der Ländervergleich?",
      "rk_faq2_a": "In 62,1 % der Abfragen war ein Land mindestens 1 % günstiger, in 32 Fällen (22,9 %) mindestens 10 %. Die Median-Ersparnis über alle Abfragen lag aber nur bei 2,1 %, der Durchschnitt bei 4,46 %.",
      "rk_faq3_q": "Welches Land bringt die höchste Ersparnis?",
      "rk_faq3_a": "Der größte Einzelwert in diesem Fenster war 51,1 % über Argentinien (400,01 € zu 195,58 €). Japan kam einmal auf 38,1 %. Solche Ausreißer sind selten: Argentinien war nur 5 Mal vorn, Japan 6 Mal.",
      "rk_faq4_q": "Warum taucht kein EU-Land auf?",
      "rk_faq4_a": "Die EU-Geoblocking-Verordnung verbietet Preisunterschiede nach Wohnort innerhalb der EU. GeoRates prüft vor allem Länder außerhalb.",
      "rk_faq5_q": "Wie oft wird das Ranking aktualisiert?",
      "rk_faq5_a": "Sobald neue Abfragen vorliegen. Das Datum steht oben auf der Seite. Dieser Stand ist der 4. November 2026.",
      "rat_more_rank": "Aus welchem Land ist Booking.com am günstigsten? Das Ranking",
      "rat_more_us": "Booking.com aus den USA buchen: Überraschend oft günstiger",
      "rat_more_in": "Booking.com aus Indien buchen: Echte Zahlen statt Mythos"
  } };
  var loading = {};

  function detectLang() {
    // Deutschsprachige SEO-Ratgeber (data-i18n-lock="de", 04.11.2026) gibt es nicht
    // in anderen Sprachen. Ohne diese Sperre setzt ein englischer Browser lang="en"
    // auf der deutschen URL, und eine Suchmaschine kann die Seite falsch zuordnen.
    var lock = document.documentElement.getAttribute("data-i18n-lock");
    if (lock && SUPPORTED.indexOf(lock) !== -1) return lock;

    // Die Adresse schlaegt alles andere: wer /es/ aufruft, bekommt Spanisch - auch wenn
    // frueher einmal Deutsch gewaehlt wurde. Sonst zeigte dieselbe Adresse zwei Sprachen.
    var ausPfad = sprachePfad();
    if (ausPfad) return ausPfad;

    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) { /* localStorage may be unavailable */ }

    var navLangs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
    for (var i = 0; i < navLangs.length; i++) {
      var nl = navLangs[i];
      if (!nl) continue;
      var code = nl.slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(code) !== -1) return code;
    }
    return "de";
  }

  var currentLang = detectLang();

  function t(key, vars) {
    var dict = translations[currentLang] || translations.de;
    var str = (dict && dict[key] !== undefined) ? dict[key] : (translations.de[key] !== undefined ? translations.de[key] : key);
    if (vars) {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          str = str.split("{" + k + "}").join(vars[k]);
        }
      }
    }
    return str;
  }

  function translatePage() {
    var i, el, key, val;

    var nodes = document.querySelectorAll("[data-i18n]");
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      key = el.getAttribute("data-i18n");
      val = t(key);
      if (val !== undefined) el.innerHTML = val;
    }

    nodes = document.querySelectorAll("[data-i18n-placeholder]");
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      key = el.getAttribute("data-i18n-placeholder");
      val = t(key);
      if (val !== undefined) el.setAttribute("placeholder", val);
    }

    nodes = document.querySelectorAll("[data-i18n-title]");
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      key = el.getAttribute("data-i18n-title");
      val = t(key);
      if (val === undefined) continue;
      if (el.tagName === "TITLE") {
        document.title = val;
      } else {
        el.setAttribute("title", val);
      }
    }

    nodes = document.querySelectorAll("[data-i18n-aria]");
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    }
  }

  // Sprachdatei nachladen. Kein fetch-Fallback fuer file:// noetig - die Seite laeuft auf https.
  function ensureLoaded(code, done) {
    if (translations[code]) { done(); return; }
    if (loading[code]) { loading[code].push(done); return; }
    loading[code] = [done];
    var finish = function () { var cbs = loading[code] || []; delete loading[code]; cbs.forEach(function (cb) { cb(); }); };
    if (typeof fetch !== "function") { finish(); return; }
    fetch(LANG_PATH + code + ".json", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (dict) { if (dict) translations[code] = dict; finish(); })
      .catch(finish);
  }

  function ensureSwitcherStyle() {
    if (document.getElementById("i18n-style")) return;
    var style = document.createElement("style");
    style.id = "i18n-style";
    style.textContent =
      "#lang-switch{border:1px solid var(--border,#E3E9ED);background:#fff;" +
      "color:var(--navy-dark,#011d3a);font-size:12.5px;font-weight:600;" +
      "padding:5px 8px;border-radius:6px;cursor:pointer;line-height:1.2;}" +
      "#lang-switch:focus{outline:2px solid var(--accent,#028659);outline-offset:1px;}" +
      "#i18n-nav-right{display:flex;align-items:center;gap:16px;}";
    document.head.appendChild(style);
  }

  function injectSwitcher() {
    if (document.getElementById("lang-switch")) return;
    // Gesperrte Seiten bleiben in einer Sprache. Ein Umschalter wuerde nur
    // Versatzstuecke tauschen und so tun, als gaelbe es eine Uebersetzung.
    if (document.documentElement.getAttribute("data-i18n-lock")) return;
    var navInner = document.querySelector("header.nav .nav-inner");
    if (!navInner) return;

    ensureSwitcherStyle();

    // Gibt es schon einen rechten Bereich (Startseite mit Menue), den Umschalter dort einhaengen.
    var right = navInner.querySelector(".nav-right");
    if (!right) {
      var logo = navInner.querySelector(".logo");
      var rest = [];
      for (var i = 0; i < navInner.children.length; i++) {
        if (navInner.children[i] !== logo) rest.push(navInner.children[i]);
      }
      right = document.createElement("div");
      right.id = "i18n-nav-right";
      rest.forEach(function (elChild) { right.appendChild(elChild); });
      navInner.appendChild(right);
    }

    var select = document.createElement("select");
    select.id = "lang-switch";
    select.setAttribute("aria-label", "Language / Sprache");
    SUPPORTED.forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = code.toUpperCase();
      select.appendChild(opt);
    });
    select.value = currentLang;
    select.addEventListener("change", function () {
      var code = select.value;
      try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
      // Zur Adresse derselben Seite in der gewaehlten Sprache wechseln, damit die Wahl
      // teilbar und fuer Suchmaschinen sichtbar ist. Nur wo es die Adresse gibt -
      // Rechtstexte und Ratgeber liegen weiterhin nur im Wurzelverzeichnis.
      var ziel = adresseIn(code);
      if (UEBERSETZTE_SEITEN && ziel !== location.pathname + location.search + location.hash) {
        location.assign(ziel);
        return;
      }
      applyLanguage(code);
    });

    right.appendChild(select);
  }

  function apply() {
    document.documentElement.lang = currentLang;
    var sel = document.getElementById("lang-switch");
    if (sel) sel.value = currentLang;
    translatePage();
    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange();
    }
  }

  function applyLanguage(code) {
    if (SUPPORTED.indexOf(code) === -1) code = "de";
    currentLang = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
    ensureLoaded(code, apply);
  }

  function init() {
    injectSwitcher();

    // Kommt die Seite schon uebersetzt aus dem Netz (/en/, /es/ ...), darf sie nicht
    // erst auf Deutsch ueberschrieben werden - das waere ein sichtbares Flackern, und
    // haette das Woerterbuch Ladeprobleme, bliebe die Seite auf Deutsch stehen.
    var fertigUebersetzt = document.documentElement.getAttribute("data-i18n-prerendered");
    if (fertigUebersetzt && fertigUebersetzt === currentLang) {
      ensureLoaded(currentLang, apply);
      return;
    }

    // Erst Deutsch anwenden (sofort), dann die Zielsprache, sobald sie da ist.
    apply();
    if (currentLang !== "de") ensureLoaded(currentLang, apply);
  }

  window.t = t;
  window.applyLanguage = applyLanguage;
  window.currentLang = function () { return currentLang; };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
