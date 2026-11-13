# Yuna — Mathe-Training (Grundrechenarten)

URL: https://42.ai/yuna/

## Funktionen
- Algorithmisch generierte Aufgaben (keine Datenbank):
  - **Addition**: a + b ≤ 100
  - **Subtraktion**: a − b mit a ≤ 100, b ≤ a
  - **Multiplikation**: 1..5 × 1..4 (max 5·4 = 20)
  - **Division**: Umkehrungen davon (z.B. 12 : 4, 12 : 3)
- Gewichtung: + und − häufiger als · und :
- Statistik über die Zeit (heute / 7T / 30T / Total + 14-Tage-Chart)

## Passwort
- SHA-256-Hash als Konstante `PW_HASH` in `yuna/index.html`, nach Eingabe 30 Tage gemerkt
  (pro Gerät & Browser)
- Ändern: `echo -n "neuespasswort" | sha256sum`, Hash in `PW_HASH` ersetzen, pushen

## Statistik
- localStorage pro Gerät & Browser
- "Statistik zurücksetzen" Button vorhanden
- Eigener Storage-Key (`yuna_mathe_stats_v1`) — vermischt sich nicht mit Neas Stats

## Updates via Claude
Ordner auswählen, editieren, pushen.
