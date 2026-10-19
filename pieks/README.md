# Pieks — Neas Mathe-Igel (Brüche, Volumen & Dreisätze)

URL: https://42.ai/pieks/ (die alte Adresse https://42.ai/nea/ leitet hierher weiter;
Fortschritt und Statistik bleiben erhalten, sie hängen an 42.ai und nicht am Pfad)

Mathe-Training mit **Pieks**, einem frechen Igel, der spricht (ElevenLabs-Stimme
«Lucy Fennek»), Wortwitze macht und nach ein paar richtigen Aufgaben spannende
Fakten erzählt. Gebaut für das Tablet (quer und hochkant), läuft auch am Computer
und auf dem Handy.

## Ablauf
- **Pieks wecken**: Beim Öffnen schläft Pieks als Stachelkugel. Der Tipp zum Wecken
  gibt im Browser auch den Ton frei. Danach begrüsst er Nea passend zur Tageszeit.
- **Lichtung** (Startseite): Thema wählen (Brüche, Volumen, Dreisätze oder Wald-Mix)
  und pro Thema die Stufe (Einfach / Mittel / Schwer). Von hier aus geht's auch ins
  Album, in die Garderobe, zu den Erfolgen und in den Elternbereich.
- **Training**: Antwort über die Tasten rechts eintippen (kein Textfeld, die
  Tablet-Tastatur geht nie auf). Bei Brüchen wechselt die Taste «Nenner» nach unten.
  Mit dem Haus oben links geht's jederzeit zurück zur Lichtung, mit dem Themen-Knopf
  daneben wechselt man Stufe oder Thema mitten in der Runde.
- Am Computer gehen auch Ziffern, Komma/Punkt, Backspace, Enter und Pfeil hoch/runter
  (oder `/`) für Zähler/Nenner.

## Hilfe beim Rechnen
- **Tipp** (Glühbirne): Pieks sagt, wie man vorgeht. Weitere Tipps zeigen Schritt für
  Schritt den Lösungsweg, aber nie das Ergebnis. Bei Volumen erscheint die Liter-Treppe.
- **Fehler-Diagnose**: Pieks erkennt typische Fehler, z.B. «Nenner zusammengezählt»,
  «Kehrwert vergessen», «um eine Stelle verrutscht (Einheit)», «noch nicht gekürzt»,
  «knapp daneben».
- Nach dem 2. Fehlversuch gibt es den Knopf «Lösung», nach dem 3. erscheint der
  Lösungsweg automatisch. Dann tippt Nea das Ergebnis selbst ein.
- **Notizblock**: Häuschenpapier zum Mitrechnen mit Finger oder Stift.

## Belohnungen
- **Äpfel** pro Aufgabe: Einfach 3, Mittel 4, Schwer 5. Jeder Fehler und jeder Tipp
  kostet einen Apfel, mindestens 1 gibt es immer. Bonus für Serien (5, 10, 15 … in
  Folge) und für das Tagesziel.
- **Garderobe**: 18 Teile für Pieks (Krone, Zauberhut, Astronautenhelm, Brille …),
  von 30 bis 800 Äpfel. Pieks trägt sie überall in der App.
- **Ränge**: 13 Ränge nach allen je gesammelten Äpfeln (Laub-Neuling bis Galaktische
  Igel-Meisterin).
- **Erfolge**: 27 Stück, z.B. Serien, Fleiss, Nachteule, alle Tiere entdeckt.
- **Tagesziel**: Ring oben rechts, im Elternbereich einstellbar (5–30 Aufgaben).

## Waldbesucher und Album
- 19 Besucher ziehen über die Lichtung: Fuchs, Eichhörnchen, Dachs, Maus, Maulwurf,
  Eule, Fledermaus, Glühwürmchen, Wildgänse, Drachen … und ganz selten ein Goldkäfer
  oder ein UFO. Antippen gibt Äpfel, einen Spruch oder Fakt und einen Album-Eintrag.
- Manche kommen nur zu bestimmten Zeiten (Eule und Dachs nur abends, Glühwürmchen
  nur in Sommernächten, Wildgänse im Frühling und Herbst). Das Album verrät es.
- Tag/Nacht nach der echten Uhrzeit, Jahreszeiten nach dem Datum (Herbstlaub,
  Schnee im Winter, Blüten im Frühling).

## Fakten
- 447 Fakten in 13 Kategorien (Igel, Wald, Tierwelt, Körper, Essen, Erde und Wetter,
  Weltall, Mathe, Messen und Liter, Schweiz mit Zug, Erfindungen, Geschichte, Kurioses).
- Nach jeder dritten richtigen Aufgabe erzählt Pieks einen, keiner doppelt, bis alle
  dran waren. Im Album lassen sich alle gehörten Fakten nochmal anhören.

## Dateien
- `index.html` Aufbau und Landschaft · `stil.css` Aussehen · `app.js` Ablauf
- `aufgaben.js` alle Aufgaben-Generatoren (über 400 Vorlagen, mit Zufallszahlen)
- `texte.js` alles, was Pieks sagt, Besucher, Garderobe, Ränge, Erfolge
- `fakten.js` der Faktenkatalog · `grafik.js` Pieks und alle Tiere als SVG
- `audio/` die Aufnahmen · `make-audio.mjs` erzeugt sie
- `sw.js` und `manifest.webmanifest`: installierbar und offline nutzbar

## Als App installieren
- **iPad/iPhone (Safari)**: Teilen (Viereck mit Pfeil) → «Zum Home-Bildschirm».
- **Android, Chrome, Edge**: im Browser-Menü «App installieren», am Computer auch über
  das Symbol rechts in der Adresszeile. Im Elternbereich gibt es dafür einen Knopf,
  sobald der Browser die Installation anbietet.
- Installiert startet der Mathe-Igel im Vollbild und läuft auch ohne Internet: Der
  Service Worker (`sw.js`) speichert die App und alle Sätze von Pieks und den
  Besuchern; Fakten kommen beim ersten Hören dazu.

## Vertonung (ElevenLabs)
1. Sätze oder Fakten in `texte.js` / `fakten.js` ergänzen.
2. `node pieks/make-audio.mjs --dry` zeigt, was fehlt und wie viele Zeichen es kostet.
3. `node pieks/make-audio.mjs` vertont nur das Fehlende (Schlüssel aus `ELEVENLABS_API_KEY`).
   Reicht das Kontingent nicht, bricht es sauber ab; nochmal starten macht weiter.
   Reihenfolge: Pieks' Sätze, dann Besucher, dann Fakten.
4. In `sw.js` die «Stand»-Zeile ändern, damit Geräte die neuen Aufnahmen holen.

Fehlt eine Aufnahme, zeigt die App den Text trotzdem an; Fakten mit Ton kommen zuerst
(`audio/vorhanden.json`). Zahlen in Fakten liest die Stimme automatisch als Wörter,
Schweizer «ss» nach langem Vokal wird für die Stimme zu «ß» (siehe `texte.js`).

## Passwort
- Aktuell: `zug2026`
- Wird gehasht (SHA-256), nicht im Klartext gespeichert
- Nach Eingabe 30 Tage gemerkt (pro Gerät & Browser)
- Geteilt mit Yunas App — einmal eingeben reicht für beide

## Passwort ändern
1. Neuen Hash erzeugen: `echo -n "neuespasswort" | sha256sum`
2. In `pieks/app.js` und `yuna/index.html` die Konstante `PW_HASH` aktualisieren
3. Push → GitHub Pages deployt automatisch
4. Auf allen Geräten neu eingeben (alte Session wird ungültig nach 30T)

## Statistik und Fortschritt
- Die Tages-Statistik bleibt im bisherigen Format (`bruchrechnen_stats_v1`), die alte
  Geschichte geht also nicht verloren. Ansehen und löschen im Elternbereich.
- Äpfel, Album, Garderobe und Erfolge liegen unter `nea.igel.stand`.
- Alles nur im Browser (localStorage), pro Gerät & Browser, kein Cloud-Sync.
