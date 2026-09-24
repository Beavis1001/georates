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
  var LANG_PATH = "i18n/";

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
      "idx_nav_how": "So funktioniert's",
      "idx_nav_tools": "Tools",
      "idx_nav_transparency": "Transparenz",
      "idx_nav_cta": "Preis prüfen",
      "idx_hero_eyebrow": "Automatischer Buchungs-Check für Booking.com",
      "idx_hero_h1": "Für dein Wunschzimmer den fairen Gesamtpreis sichern.",
      "idx_hero_sub": "Füg den Booking.com-Link zu deinem Hotel ein, wähl dein Zimmer – wir prüfen automatisch aus 15 Ländern, ob es für exakt dieses Zimmer und diese Verpflegung einen günstigeren, steuer- und gebühreninklusiven Gesamtpreis gibt.",
      "idx_mock_title": "BEISPIEL · DOPPELZIMMER MIT MEERBLICK, FRÜHSTÜCK",
      "idx_mock_start_label": "Ausgangspreis",
      "idx_mock_arrow": "↓ 160 € gespart",
      "idx_mock_best_label": "Bester gefundener Preis",
      "idx_mock_badge": "≈13 % günstiger",
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
      "idx_board_any": "Egal",
      "idx_form_label_checkin": "Anreise",
      "idx_form_label_checkout": "Abreise",
      "idx_form_label_cancel": "Kostenlos stornierbar?",
      "idx_cancel_yes": "Ja",
      "idx_cancel_no": "Nein",
      "idx_cancel_partial": "Teilweise erstattbar",
      "idx_cancel_unsure": "Weiß ich nicht",
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
      "ds_p4": "Über das Formular auf der Startseite gibst du einen Booking.com-Link zu deinem Wunschhotel an sowie Zimmer, Verpflegung, den Wunsch zur kostenlosen Stornierbarkeit und optional eine Auswahl der zu prüfenden Länder. Beim Start des automatischen Checks und beim Laden der Zimmerliste werden diese Angaben an unsere Serverless-Funktion übertragen. Dort wird zunächst per Cloudflare Turnstile (Cloudflare, Inc., USA) geprüft, ob die Anfrage von einem Menschen stammt. Anschließend ruft die Funktion die öffentlich einsehbare Booking.com-Seite deines Hotels über Proxy-Verbindungen aus verschiedenen Ländern ab (Anbieter: Smartproxy/Decodo) und liest den angezeigten Preis aus. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung der von dir angeforderten Leistung).<br><br>Das Ergebnis wird für 24 Stunden zwischengespeichert (Upstash, Inc., USA), um wiederholte Abrufe zu vermeiden; der Hotel-Link wird dafür vorher von Sitzungs- und Tracking-Kennungen bereinigt. Zusätzlich wird jedes fertige Ergebnis 30 Tage unter einer zufälligen Kurz-ID gespeichert, damit du es über den Knopf „Ergebnis-Link kopieren“ teilen kannst; gespeichert sind dabei Hotelname, Land des Hotels, Zimmer, Verpflegung und die ermittelten Länderpreise – nicht der Booking-Link und nicht dein Reisezeitraum. Zum Schutz vor Missbrauch zählen wir Anfragen pro Stunde je Absender; dafür wird deine IP-Adresse nur als kryptografischer Hash für höchstens eine Stunde gespeichert.<br><br>Jede Abfrage wird in einer Tabelle bei Google Sheets (Google Ireland Ltd.) protokolliert: Zeitpunkt, Hotel-Link (ohne Sitzungs- und Tracking-Parameter), Zimmer, Verpflegung, Stornowunsch, die ermittelten Preise aller geprüften Länder sowie das Land, aus dem die Anfrage kam. Das Herkunftsland wird von Vercel aus deiner IP-Adresse abgeleitet und nur als Länderkürzel (z. B. „DE“) gespeichert – deine IP-Adresse selbst speichern wir nicht. Zweck ist die Verbesserung der Website, die Auswertung, in welchen Ländern tatsächlich günstigere Preise angezeigt werden, und die Veröffentlichung der größten Funde auf der Startseite („Echte Funde“) – dort ausschließlich mit Hotelname, Land, Ersparnis und Messtag, ohne Link und ohne Reisezeitraum. Zu den Einträgen speichern wir weder Namen noch E-Mail-Adresse noch IP-Adresse, und sie sind keinem Nutzerkonto zugeordnet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Bitte beachte: Der von dir eingegebene Hotel-Link kann Angaben zu deinem geplanten Reisezeitraum enthalten und wird in der Tabelle in dieser Form gespeichert. Schreibst du uns eine E-Mail an info@georates.tech, verarbeiten wir deine Angaben ausschließlich zur Beantwortung deiner Nachricht (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO).",
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
    "idx_deal_early": "Frühbucher",
    "idx_deal_last_minute": "Kurzfristig-Deal",
    "idx_deal_secret": "Geheimangebot",
    "idx_deal_deal": "Deal",
    "idx_res_samples": "zwei Abrufe: {prices}",
    "idx_res_baseline_two": "Booking zeigte in {baseline} bei zwei Abrufen verschiedene Preise ({prices}, {pct} % auseinander). Wir rechnen gegen den niedrigeren.",
    "idx_res_userprice": "Unser Preis für dein Ausgangsland: {ours}. Du siehst {yours}. Gerechnet wird gegen den niedrigeren: {used}.",
    "idx_res_confirmed": "Fund bestätigt: {country} lag bei einem zweiten Abruf weiterhin günstiger ({before} % → {after} %).",
    "idx_res_unstable": "Unterschied nicht stabil: Bei einem zweiten Abruf war {country} nicht mehr so günstig ({before} % → {after} %). Das war vermutlich ein Sitzungs-Los, kein Landespreis.",
    "idx_res_spread_note": "Booking teilt Preise pro Sitzung zu (Deals, Zahlungsart, Gerät). Deshalb prüfen wir das Ausgangsland doppelt, bestätigen Funde einmal und zeigen erkannte Deal-Plaketten an.",
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
      "err_daily_budget_reached": "Für heute ist das Abfrage-Kontingent aufgebraucht. Jeder Ländervergleich lädt rund 30 MB über bezahlte Verbindungen – damit das Projekt kostenlos bleiben kann, gibt es eine Tagesgrenze. Morgen geht es wieder."
  } };
  var loading = {};

  function detectLang() {
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
      applyLanguage(select.value);
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
