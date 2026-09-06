# Nea — Mathe-Training (Brüche, Volumen & Dreisätze)

URL: https://42.ai/nea/

## Funktionen
- Brüche-Modus: Addition, Subtraktion, Multiplikation, Division — mit Textaufgaben
- Volumen-Modus: ml, cl, dl, l, hl — mit Textaufgaben
- Dreisatz-Modus: direkte und umgekehrte (indirekte) Dreisätze — mit Brüchen, Hohlmassen und Geld
- 3 Schwierigkeitsstufen (Einfach / Mittel / Schwer), wählbar beim Start
- Statistik über die Zeit (heute / 7T / 30T / Total + 14-Tage-Chart)
- Antworten müssen gekürzt sein (z.B. 2/4 wird als falsch gewertet — richtig ist 1/2)

## Dreisätze
- 128 Aufgaben-Vorlagen (40 einfach / 42 mittel / 46 schwer), jede mit Zufallszahlen → über 12'000 verschiedene konkrete Aufgaben pro Stufe
- Einfach: direkte Dreisätze mit ganzen Zahlen, dazu einfache umgekehrte (teilen, Arbeiter/Tage, Vorrat)
- Mittel: Preise mit Rappen, Hohlmasse mit Umrechnung (ml/cl/dl/l/hl), Massstab, viele umgekehrte Dreisätze
- Schwer: Bruchmengen (¾ kg, ⅖ l …), Antworten als gekürzter Bruch, Dezimalzahlen, mehrstufige Umrechnungen, zusammengesetzte Dreisätze
- Antwort als Dezimalzahl möglich, Punkt und Komma werden beide akzeptiert (12.50 = 12,50)
- Ab dem 2. Fehlversuch erscheint ein Tipp (direkt vs. umgekehrt), ab dem 4. die Lösung
- Papier und Bleistift sind ausdrücklich erwünscht

## Passwort
- Aktuell: `zug2026`
- Wird gehasht (SHA-256), nicht im Klartext gespeichert
- Nach Eingabe 30 Tage gemerkt (pro Gerät & Browser)
- Geteilt mit Yunas App — einmal eingeben reicht für beide

## Passwort ändern
1. Neuen Hash erzeugen: `echo -n "neuespasswort" | sha256sum`
2. In `nea/index.html` und `yuna/index.html` die Konstante `PW_HASH` aktualisieren
3. Push → GitHub Pages deployt automatisch
4. Auf allen Geräten neu eingeben (alte Session wird ungültig nach 30T)

## Statistik
- Wird im Browser (localStorage) gespeichert
- Pro Gerät & Browser separat (kein Cloud-Sync)
- "Statistik zurücksetzen" Button löscht die Daten

## Updates via Claude
1. Ordner `C:\Users\r\CODING\42.ai\www` in Cowork auswählen
2. Claude bitten, Änderungen vorzunehmen (z.B. "füge mehr Volumen-Aufgaben hinzu")
3. `git add . && git commit -m "..." && git push`
4. GitHub Pages deployt automatisch (~1 Min)
