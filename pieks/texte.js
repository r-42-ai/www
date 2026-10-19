'use strict';

/* =====================================================================
   TEXTE
   Alles, was Pieks sagt. Jeder Satz wird mit make-audio.mjs einmal bei
   ElevenLabs vertont und liegt dann als audio/<kennung>.mp3 im Ordner.

   Ein Eintrag ist entweder ein Text, der genau so angezeigt und
   gesprochen wird, oder { t: 'angezeigt', s: 'gesprochen' }, wenn die
   Stimme etwas anderes lesen soll (Zahlen ausgeschrieben, Zeichen als
   Wort …). Ziffern in Fakten liest die Stimme über zahlenSprechen()
   automatisch als Wörter.

   Neue Sätze einfach ergänzen und danach
     node pieks/make-audio.mjs
   laufen lassen: es vertont nur, was noch fehlt.
   Schweizer Schreibweise: ss statt ß.
   ===================================================================== */

// So spricht die Stimme Neas Namen aus
const SPRECHNAME = 'Nea';

const TEXTE = {
  /* ---------- Begrüssung nach dem Aufwecken ---------- */
  aufwachen: [
    'Huch! Bin ich eingeschlafen?',
    'Oh! Ich habe gerade von Brüchen geträumt.',
    'Hmm? Ah, ich bin wach, ich bin wach!',
    'Gähn! Oh, Besuch!',
    'Was? Wer? Ach so, du bist es!',
  ],
  gruss_morgen: [
    'Guten Morgen, Nea! Ich bin noch ganz verstrubbelt. Aber rechnen geht immer.',
    'Morgen, Nea! Eigentlich gehe ich um diese Zeit schlafen. Wir Igel sind ja nachtaktiv. Aber für dich bleibe ich wach!',
    'Hoi Nea! Ein frischer Morgen, ein frisches Hirn. Los geht\'s!',
    'Guten Morgen! Ich habe schon gefrühstückt: drei Käfer und einen Regenwurm. Und du?',
    'Hoi Nea! Früh übt sich, wer ein Mathe-Profi werden will.',
    'Guten Morgen, Nea! Der Tau glitzert, die Zahlen warten.',
  ],
  gruss_tag: [
    'Hoi Nea! Schön, dass du da bist.',
    'Da bist du ja! Ich habe die Äpfel schon gezählt. Zweimal.',
    'Hoi Nea! Bereit für ein paar Rechen-Abenteuer?',
    'Hallo Nea! Ich war gerade am Dösen. Jetzt bin ich hellwach!',
    'Hey Nea! Die Lichtung hat dich vermisst. Und ich auch.',
    'Hoi Nea! Lass uns ein paar Aufgaben knacken. Wie Nüsse, nur ohne Zähne.',
    'Hallo Nea! Schön, dich zu sehen. Was rechnen wir heute?',
    'Hoi Nea! Meine Stacheln kribbeln. Das heisst: Heute wird ein guter Rechentag!',
  ],
  gruss_abend: [
    'Guten Abend, Nea! Jetzt beginnt meine Lieblingszeit. Wir Igel sind ja Nachtschwärmer.',
    'Hoi Nea! Es wird dunkel, und ich werde wach. Perfekt zum Rechnen!',
    'Guten Abend! Der Mond schaut auch schon zu.',
    'Hallo Nea! Abends rechne ich am liebsten. Da sind meine Stacheln am spitzesten.',
    'Guten Abend, Nea! Noch ein paar Aufgaben vor dem Schlafen?',
    'Hoi Nea! Die Eule hat mir schon verraten, dass du kommst.',
  ],
  gruss_nacht: [
    'Nanu, Nea! So spät noch wach? Ich bin ja ein Igel, ich darf das.',
    'Psst, Nea! Mitten in der Nacht rechnen nur Igel und echte Profis.',
    'Hoi Nea! Es ist schon spät. Vielleicht nur ein paar Aufgaben, okay?',
    'Guten Abend, Nachteule! Äh, ich meine: Nacht-Nea!',
  ],
  gruss_wieder: [
    'Nea! Da bist du ja wieder! Ich dachte schon, du machst Winterschlaf.',
    'Endlich! Ich habe dich vermisst. Die Äpfel auch.',
    'Hoi Nea! Lange nicht gesehen! Mal schauen, ob du noch alles weisst.',
    'Willkommen zurück, Nea! Ich habe in der Zwischenzeit meine Stacheln poliert.',
  ],
  gruss_serie: [
    'Hoi Nea! Schon wieder da! Du bist ja richtig fleissig.',
    'Du kommst jeden Tag! Ich bin mächtig stolz auf dich.',
    'Hoi Nea! Deine Tages-Serie wächst und wächst. Weiter so!',
    'Hallo Nea! Wieder ein Tag, wieder ein Besuch. Super!',
  ],
  gruss_winter: [
    'Hoi Nea! Eigentlich sollte ich im Winterschlaf sein. Aber Mathe ist mir wichtiger!',
    'Brrr, ist das kalt! Gut, dass Rechnen warm hält.',
  ],

  // Allererstes Öffnen: Pieks stellt sich vor
  vorstellen: [
    'Hoi Nea! Ich bin Pieks, der Mathe-Igel. Ab heute rechnen wir zusammen: Brüche, Liter und Dreisätze. Für jede richtige Antwort sammeln wir Äpfel. Und mit den Äpfeln kannst du mir in der Garderobe coole Sachen kaufen. Ich hätte gern eine Krone. Nur so als Tipp.',
  ],
  // Erstes Training: wie man eintippt
  erstes_training: [
    { t: 'Tippe die Antwort mit den Tasten ein und drücke ✓. Bei Brüchen kommst du mit der Taste «Nenner» nach unten.',
      s: 'Tippe die Antwort mit den Tasten ein und drücke auf den grünen Haken. Bei Brüchen kommst du mit der Taste Nenner nach unten.' },
  ],
  erster_besuch: ['Psst, Nea! Da kommt Besuch. Tippe das Tier an!'],

  /* ---------- Thema gewählt ---------- */
  thema_brueche: [
    'Brüche! Mein Lieblingsthema. Ich teile nämlich gern. Ausser Käfer.',
    'Brüche, super! Pizza, Kuchen und Schoggi warten schon.',
    'Auf zu den Brüchen! Zähler oben, Nenner unten. Wie bei mir: Stacheln oben, Bauch unten.',
    'Brüche knacken? Gerne! Denk dran: Am Schluss immer kürzen.',
    'Brüche! Bist du bereit, ein paar Pizzas gerecht zu teilen?',
  ],
  thema_volumen: [
    'Volumen! Jetzt wird es flüssig.',
    'Liter, Deziliter, Zentiliter, Milliliter. Ich liebe diese Treppe!',
    'Auf zu den Hohlmassen! Achte immer gut auf die Einheit.',
    'Volumen, prima! Vom vielen Rechnen bekomme ich glatt Durst.',
    'Wie viel passt in den Krug? Das finden wir heraus!',
  ],
  thema_dreisatz: [
    'Dreisätze! Drei Sätze, und du bist ein Profi.',
    'Dreisatz, mein Freund! Zuerst auf eins, dann auf die gesuchte Zahl.',
    'Dreisätze! Nimm am besten den Notizblock dazu.',
    'Auf zu den Dreisätzen! Überleg immer zuerst: Gibt mehr auch mehr, oder gibt mehr weniger?',
    'Dreisätze, super! Damit rechnen sogar die Händler auf dem Markt.',
  ],
  thema_mix: [
    'Der Wald-Mix! Brüche, Liter und Dreisätze, alles durcheinander.',
    'Gemischt? Mutig! Ich bin gespannt, was kommt.',
    'Überraschungs-Mix! Ich weiss selbst nicht, was als Nächstes kommt.',
    'Alles gemischt, wie ein Laubhaufen im Herbst!',
  ],
  start_schwer: [
    'Schwer? Wow, du traust dich was!',
    'Stufe Schwer! Dafür gibt es extra viele Äpfel.',
    'Schwer! Meine Stacheln stellen sich vor Aufregung auf.',
  ],

  /* ---------- Neue Aufgabe (nur ab und zu) ---------- */
  neue_aufgabe: [
    'Nächste Aufgabe!', 'Weiter geht\'s!', 'Und noch eine!', 'Schau mal, die hier!',
    'Neue Aufgabe, neues Glück!', 'Lies genau, Nea!', 'Die schaffst du!', 'Ich bin gespannt!',
    'Hier kommt Nachschub!', 'Diese habe ich extra für dich ausgesucht.',
    'Mal sehen, wie schnell du die löst!', 'Packen wir es an!', 'Die hier ist ein bisschen knifflig.',
  ],

  /* ---------- Richtig ---------- */
  richtig: [
    'Super!', 'Richtig!', 'Genau!', 'Stark!', 'Klasse!', 'Perfekt!', 'Bingo!', 'Volltreffer!',
    'Stachelstark!', 'Igelitastisch!', 'Sauber gerechnet!', 'Jawohl!', 'Hervorragend!',
    'Grossartig!', 'Wunderbar!', 'Ausgezeichnet!', 'Stimmt genau!', 'Läuft bei dir!',
    'Das sitzt!', 'Mega!', 'Wow, richtig!', { t: 'Bravo!', s: 'Brawo!' },
    'Spitze! Und ich muss es wissen, ich habe siebentausend Spitzen.',
    'Richtig! Mir stehen vor Freude die Stacheln zu Berge.',
    'Genau! Du rechnest schneller, als ich mich einrollen kann.',
    'Super! Das gibt einen Apfel-Regen.',
    'Richtig! Ich mache einen Freudensprung. Na ja, einen Igel-Hüpfer.',
    'Klasse! Dein Hirn ist heute auf Hochtouren.',
    'Stark! Sogar die Eule wäre beeindruckt.',
    'Perfekt! Ich würde ja klatschen, aber meine Pfoten sind zu kurz.',
    'Genau so! Das war sauber.',
    'Bingo! Du hast den Dreh raus.',
    'Super! Da staunt sogar der Fuchs.',
    'Wow! Das ging ja wie geschmiert.',
    'Richtig! Dafür bekommst du einen Stachel-Stern.',
    'Treffer! Du bist eine echte Rechen-Rakete.',
  ],
  richtig_nachfehler: [
    'Jetzt stimmt\'s!', 'Na also! Geschafft.', 'Siehst du, du kannst es!',
    'Gut, dass du drangeblieben bist!', 'Richtig! Nicht aufgeben lohnt sich.',
    'Jetzt passt es! Fehler sind zum Lernen da.', 'Genau! Beim zweiten Anlauf geklappt.',
    'Bravo, du hast nicht aufgegeben!',
  ],
  richtig_schwer: [
    'Und das auf Stufe Schwer! Wow!',
    'Schwer? Für dich offenbar nicht!',
    'Das war eine harte Nuss. Und du hast sie geknackt!',
    'Wahnsinn, sogar die schweren schaffst du!',
    'Profi-Niveau, Nea!',
  ],
  richtig_nachloesung: [
    'Genau so geht\'s. Merk dir den Weg!',
    'Richtig! Jetzt kennst du den Trick.',
    'Gut gemacht! Beim nächsten Mal schaffst du es allein.',
  ],

  /* ---------- Falsch ---------- */
  falsch: [
    'Hmm, das stimmt noch nicht. Probier es nochmal!',
    'Nicht ganz. Du schaffst das!',
    'Fast! Schau nochmal genau hin.',
    'Das war es noch nicht. Noch ein Versuch?',
    'Ups! Rechne nochmal in Ruhe.',
    'Hmm, da hat sich ein Fehler versteckt.',
    'Noch nicht. Aber Fehler sind zum Lernen da!',
    'Nicht schlimm! Atme kurz durch und probier es nochmal.',
    'Oh, das passt nicht ganz. Nochmal!',
    'Da stimmt was nicht. Prüf deine Rechnung!',
    'Noch nicht. Ich drücke dir die Pfoten!',
    'Hmm, nochmal überlegen!',
  ],
  falsch_zweimal: [
    'Noch nicht. Tipp auf die Glühbirne, dann helfe ich dir!',
    'Hmm, knifflig. Wie wäre es mit einem Tipp?',
    'Nicht aufgeben! Die Glühbirne hat einen Tipp für dich.',
    'Fast! Probier es doch mal mit einem Tipp.',
  ],
  falsch_kuerzen: [
    'Der Wert stimmt! Aber du kannst noch kürzen.',
    'Fast perfekt! Kürze den Bruch noch.',
    'Richtig gerechnet, aber noch nicht ganz gekürzt!',
    'Gut! Jetzt noch kürzen, so weit es geht.',
  ],
  falsch_nenner_fehlt: [
    'Vergiss den Nenner nicht!',
    'Da fehlt noch die Zahl unter dem Strich.',
    'Tippe auch den Nenner ein. Mit der Taste Nenner kommst du nach unten.',
  ],
  falsch_leer: ['Zuerst eine Zahl eintippen!', 'Hoppla, das Feld ist noch leer.'],
  falsch_zaehler_fehlt: ['Oben fehlt noch der Zähler!'],
  nenner_null: ['Durch null kann man nicht teilen! Der Nenner darf nicht null sein.'],
  falsch_nenner_addiert: [
    'Achtung: Die Nenner zählst du nicht zusammen! Mach sie zuerst gleich.',
    'Hmm, Nenner plus Nenner geht nicht. Zuerst gleichnamig machen!',
    'Fast! Bei Brüchen rechnest du nur mit den Zählern, und zwar mit gleichen Nennern.',
  ],
  falsch_kehrwert: [
    'Beim Teilen durch einen Bruch nimmst du mit dem Kehrwert mal!',
    'Achtung, beim Teilen musst du den zweiten Bruch umdrehen.',
  ],
  falsch_einheit: [
    'Die Ziffern stimmen, aber nicht die Grösse! Schau, ob du eine Null oder das Komma verschoben hast.',
    'Fast! Du bist um eine Stelle verrutscht. Achte auf die Einheit.',
    'Hmm, da fehlt eine Null oder es ist eine zu viel. Prüf die Umrechnung!',
    'Achtung Einheit! Ein Liter hat zehn Deziliter, hundert Zentiliter und tausend Milliliter.',
  ],
  falsch_knapp: [
    'Ganz knapp daneben!',
    'Huch, ganz nah dran! Rechne nochmal genau.',
    'Fast! Nur ein kleines bisschen daneben.',
  ],

  /* ---------- Tipps und Lösung ---------- */
  tipp_vor: ['Tipp:', 'Pass auf:', 'Hör mal:', 'Ein kleiner Trick:'],
  tipp_schritt: [
    'Schau, ich zeige dir den ersten Schritt.',
    'Hier ist ein Schritt vom Lösungsweg.',
    'Ich verrate dir noch einen Schritt.',
  ],
  tipp_genug: ['Mehr verrate ich nicht! Den Rest schaffst du.', 'Jetzt bist du dran!'],
  loesung: [
    'Schau, so geht\'s. Tippe die Lösung ein!',
    'Hier ist der Lösungsweg. Rechne mit und tippe das Ergebnis ein.',
    'Kein Problem, ich zeige es dir. Danach tippst du die Lösung ein.',
    'So rechnet man das. Jetzt du!',
    'Schau dir den Weg genau an. Dann tippe die Lösung ein.',
  ],
  warten: [
    'Brauchst du Hilfe? Tipp auf die Glühbirne!',
    'Hmm, knifflig? Nimm ruhig den Notizblock.',
    'Ich warte gemütlich. Lass dir Zeit!',
    'Lies die Aufgabe nochmal langsam durch.',
    'Zzz… Oh! Ich bin wach, ich bin wach!',
    'Kein Stress. Gute Rechnungen brauchen Zeit.',
    'Weisst du was? Zeichne dir die Aufgabe im Notizblock auf!',
  ],

  /* ---------- Stufe vorschlagen ---------- */
  vorschlag_hoch: [
    'Das ist ja viel zu leicht für dich! Willst du eine Stufe höher?',
    'Du rechnest wie ein Profi. Probieren wir die nächste Stufe?',
    'Zu einfach? Die nächste Stufe wartet auf dich!',
  ],
  vorschlag_runter: [
    'Puh, das ist knifflig. Willst du kurz eine Stufe leichter üben?',
    'Kein Problem! Wollen wir eine Stufe leichter machen? Dann klappt es bestimmt.',
  ],
  stufe_gewechselt: ['Alles klar, neue Stufe!', 'Gut, dann so!', 'Abgemacht!'],

  /* ---------- Zurück auf der Lichtung ---------- */
  lichtung: [
    'Zurück auf der Lichtung! Was als Nächstes?',
    'Pause auf der Lichtung. Willst du etwas anderes üben?',
    'Willkommen zurück! Wohin geht die Reise?',
    'Na, was üben wir jetzt?',
    'Hier sind wir wieder. Such dir etwas aus!',
  ],

  /* ---------- Belohnungen ---------- */
  fakt_vor: [
    'Wusstest du?', 'Schon gewusst?', 'Zeit für einen Fakt!', 'Hör mal:', 'Spannend:', 'Stell dir vor:',
    'Achtung, Stachel-Wissen:', 'Weisst du was?', 'Ein Fakt für dein Album:', 'Pieks weiss Bescheid:',
  ],
  tagesziel: [
    'Tagesziel geschafft! Hurra, Nea!',
    'Das Tagesziel ist erreicht! Du bist super.',
    'Tagesziel erreicht! Ab jetzt ist alles Bonus.',
    'Juhu, Tagesziel geschafft! Ich bin stolz auf dich.',
  ],
  rang_vor: ['Neuer Rang! Du bist jetzt:', 'Aufgestiegen! Ab sofort bist du:', 'Wow, ein neuer Rang:'],
  erfolg_vor: ['Neuer Erfolg!', 'Erfolg freigeschaltet!', 'Du hast einen Erfolg geholt!'],
  album_neu: ['Neu im Album!'],

  /* ---------- Garderobe, Album, Erfolge ---------- */
  garderobe_auf: ['Willkommen in meiner Garderobe! Was soll ich anziehen?', 'Mode-Zeit! Such mir etwas Schönes aus.'],
  album_auf: ['Unser Sammelalbum! Wen haben wir schon entdeckt?', 'Hier sammeln wir alle Tiere und Fakten.'],
  erfolge_auf: ['Deine Erfolge! Ich bin mächtig stolz.', 'Schau, was du schon alles geschafft hast!'],
  kaufen: ['Danke, Nea! Wie sehe ich aus?', 'Juhu, etwas Neues zum Anziehen!', 'Ich fühle mich wie ein neuer Igel!', 'Schick, oder?'],
  zu_teuer: [
    'Dafür brauchen wir noch ein paar Äpfel. Weiter rechnen!',
    'Noch nicht genug Äpfel. Aber bald!',
    'Spar noch ein bisschen. Jede Aufgabe bringt Äpfel!',
  ],
  ausziehen: ['Ab in den Schrank damit.', 'Gut, dann eben ohne.'],

  /* ---------- Pieks antippen ---------- */
  kitzeln: [
    'Hihi, das kitzelt!', 'Hey, nicht so stürmisch!', 'Achtung, ich pieks dich!', 'Huch!',
    'Hihi! Hör auf!', 'Ich bin kitzlig, das weiss doch jeder!', 'Noch einmal, und ich rolle mich ein!',
    'Hehe, gleich mache ich eine Kugel.', 'Hallo? Ich arbeite hier!', 'Stups mich nicht, rechne lieber!',
  ],
  einrollen: ['So, jetzt bin ich eine Kugel. Zufrieden?'],
  ausrollen: ['Na gut, ich komme wieder raus.'],

  notiz_auf: ['Kritzle ruhig drauf los!', 'Der Notizblock ist offen. Rechne mit!'],
  stimme_an: ['Ich lese dir wieder vor!'],
};

// Lob für Serien: genau bei diesen Zahlen richtig hintereinander
const SERIE = {
  3: 'Drei richtig hintereinander!',
  5: 'Fünf richtig in Folge! Dafür gibt es Bonus-Äpfel!',
  10: 'Zehn in Folge! Unglaublich, Nea!',
  15: 'Fünfzehn am Stück! Bist du ein Rechen-Roboter?',
  20: 'Zwanzig in Folge! Das schafft nicht mal die Eule.',
  25: 'Fünfundzwanzig! Ich muss mich kurz setzen. Ach, ich sitze ja schon.',
  30: 'Dreissig in Folge! Du bist eine Legende!',
  40: 'Vierzig! Ich bin sprachlos. Fast.',
  50: 'Fünfzig in Folge! Ich rolle mich vor Ehrfurcht ein!',
};

/* =====================================================================
   TIPPS: Schlüssel wie in aufgaben.js (hint)
   ===================================================================== */
const TIPPS = {
  addSame: 'Gleiche Nenner: Zähle nur die Zähler zusammen, der Nenner bleibt gleich.',
  subSame: 'Gleiche Nenner: Rechne nur mit den Zählern, der Nenner bleibt gleich.',
  addDiff: 'Verschiedene Nenner: Mach die Brüche zuerst gleichnamig. Suche dazu eine Zahl, in der beide Nenner aufgehen.',
  subDiff: 'Verschiedene Nenner: Mach die Brüche zuerst gleichnamig. Dann ziehst du die Zähler voneinander ab.',
  mulFrac: 'Mal rechnen ist bei Brüchen einfach: Zähler mal Zähler und Nenner mal Nenner.',
  divFrac: 'Durch einen Bruch teilen heisst: mit seinem Kehrwert malnehmen. Dreh den zweiten Bruch einfach um!',
  mixedAdd: 'Verwandle die gemischte Zahl zuerst in einen unechten Bruch: Ganze mal Nenner, plus Zähler.',
  mixedSub: 'Verwandle die gemischte Zahl zuerst in einen unechten Bruch: Ganze mal Nenner, plus Zähler.',
  simplifyFrac: 'Suche eine Zahl, durch die du Zähler und Nenner beide teilen kannst. Wiederhole das, bis es nicht mehr geht.',
  mulFracWhole: 'Bei Zahl mal Bruch nimmst du nur den Zähler mal. Der Nenner bleibt.',
  fracOfNumber: 'Teile die Zahl zuerst durch den Nenner. Dann nimmst du das Ergebnis mal den Zähler.',
  bruchText: 'Überlege: Was ist das Ganze? Der Nenner sagt, in wie viele Teile es geteilt ist, der Zähler, wie viele Teile gemeint sind. Und am Schluss kürzen!',
  bruchMenge: 'Rechne zuerst einen Teil aus: die Menge geteilt durch den Nenner. Dann rechnest du weiter mit dem Zähler.',
  vGleich: 'Gleiche Einheiten: Du kannst direkt rechnen, die Einheit bleibt gleich.',
  vMisch: 'Verschiedene Einheiten: Rechne zuerst alles in die Einheit der Antwort um.',
  vMal: 'Die Einheit bleibt gleich. Rechne einfach mit der Zahl.',
  vUmrechnen: { t: 'Die Liter-Treppe: 1 hl = 100 l, 1 l = 10 dl, 1 dl = 10 cl, 1 cl = 10 ml. Nach unten wird die Zahl grösser.',
    s: 'Die Liter-Treppe: Ein Hektoliter sind hundert Liter. Ein Liter sind zehn Deziliter. Ein Deziliter sind zehn Zentiliter. Ein Zentiliter sind zehn Milliliter. Nach unten wird die Zahl grösser.' },
  volumenText: { t: 'Rechne zuerst alles in die Einheit der Antwort um. 1 l = 10 dl = 100 cl = 1000 ml.',
    s: 'Rechne zuerst alles in die Einheit der Antwort um. Ein Liter sind zehn Deziliter, hundert Zentiliter oder tausend Milliliter.' },
  HD: { t: 'Rechne zuerst auf 1 herunter (÷), dann auf die gesuchte Anzahl hoch (·).',
    s: 'Rechne zuerst auf eins herunter, also teilen. Dann rechnest du auf die gesuchte Anzahl hoch, also mal.' },
  HI: { t: 'Umgekehrter Dreisatz: Mehr bedeutet hier weniger! Rechne zuerst das Ganze aus (Anzahl · Wert) und teile dann.',
    s: 'Umgekehrter Dreisatz: Mehr bedeutet hier weniger! Rechne zuerst das Ganze aus, also Anzahl mal Wert, und teile dann.' },
  HDF: { t: 'Rechne zuerst auf 1 ganze Einheit. Durch einen Bruch teilen heisst: mit dem Kehrwert malnehmen.',
    s: 'Rechne zuerst auf eine ganze Einheit. Durch einen Bruch teilen heisst: mit dem Kehrwert malnehmen.' },
  HZD: { t: 'Zusammengesetzter Dreisatz: Gehe Schritt für Schritt und rechne immer zuerst auf 1 herunter.',
    s: 'Zusammengesetzter Dreisatz: Gehe Schritt für Schritt und rechne immer zuerst auf eins herunter.' },
  zusammen_teilen: 'Zuerst alles zusammenzählen, dann durch die Anzahl teilen.',
  menge_tage: { t: 'Menge ÷ Anzahl Tage.', s: 'Rechne die Menge geteilt durch die Anzahl Tage.' },
  menge_gefaesse: { t: 'Menge ÷ Anzahl Gefässe.', s: 'Rechne die Menge geteilt durch die Anzahl Gefässe.' },
  menge_faesser: { t: 'Menge ÷ Anzahl Fässer.', s: 'Rechne die Menge geteilt durch die Anzahl Fässer.' },
  laenge_stuecke: { t: 'Länge ÷ Anzahl Stücke.', s: 'Rechne die Länge geteilt durch die Anzahl Stücke.' },
  menge_becher: { t: 'Gesamtmenge ÷ Anzahl Becher.', s: 'Rechne die ganze Menge geteilt durch die Anzahl Becher.' },
  anteil_pizzen: { t: 'Anteil = Anzahl Pizzen ÷ Anzahl Kinder.', s: 'Der Anteil ist: Anzahl Pizzen geteilt durch Anzahl Kinder.' },
  hl100: { t: '100 l = 1 hl.', s: 'Hundert Liter sind ein Hektoliter.' },
  hl1000dl: { t: '1 hl = 100 l = 1000 dl.', s: 'Ein Hektoliter sind hundert Liter, und das sind tausend Deziliter.' },
};

/* =====================================================================
   BESUCHER: Wer über die Lichtung zieht. Zeichnungen in grafik.js.
     spur     boden (läuft unten) · himmel (fliegt oben) · huegel (Maulwurf)
     zeit     wann er kommt: ['morgen','tag','abend','nacht'] (fehlt = immer)
     monate   in welchen Monaten (1 = Januar; fehlt = das ganze Jahr)
     selten   kommt nur ab und zu
     aepfel   Belohnung beim ersten Entdecken
     saetze   was Pieks sagt, wenn Nea das Tier antippt
     fakten   kleine Fakten zum Tier, für das Album und beim Antippen
   ===================================================================== */
const BESUCHER = {
  fuchs: { name: 'Fuchs', spur: 'boden', aepfel: 5,
    saetze: ['Ein Fuchs! Keine Sorge, wir Igel sind ihm zu pieksig.', 'Der Fuchs macht einen Mäusesprung!'],
    fakten: ['Füchse leben nicht nur im Wald. Auch mitten in Städten wie Zürich wohnen ziemlich viele.',
      'Ein Fuchs kann bis zu 50 Kilometer pro Stunde schnell rennen.'] },
  eichhoernchen: { name: 'Eichhörnchen', spur: 'boden', zeit: ['morgen', 'tag', 'abend'], aepfel: 5,
    saetze: ['Das Eichhörnchen sucht seine Nüsse. Es hat schon wieder vergessen, wo sie sind!', 'Schau, wie flink es ist!'],
    fakten: ['Eichhörnchen bauen hoch oben in den Bäumen kugelrunde Nester aus Zweigen. Diese Nester heissen Kobel.',
      'Beim Springen von Ast zu Ast hält das Eichhörnchen mit seinem buschigen Schwanz das Gleichgewicht.'] },
  dachs: { name: 'Dachs', spur: 'boden', zeit: ['abend', 'nacht'], aepfel: 5,
    saetze: ['Herr Dachs! Er gräbt die besten Höhlen im ganzen Wald.', 'Der Dachs ist ein Ordnungs-Fan. Er wechselt sogar sein Bett aus Laub!'],
    fakten: ['Dachse polstern ihren Bau mit Gras und Laub und tauschen die Polster regelmässig aus.',
      'Manche Dachsbauten werden von vielen Dachs-Generationen bewohnt und sind über hundert Jahre alt.'] },
  schnecke: { name: 'Weinbergschnecke', spur: 'boden', tempo: 0.12, monate: [3, 4, 5, 6, 7, 8, 9, 10], aepfel: 5,
    saetze: ['Die Schnecke ist schon seit Montag unterwegs.', 'Nur keine Eile, liebe Schnecke!'],
    fakten: ['Eine Weinbergschnecke schafft in einer Stunde nur wenige Meter.',
      'Schnecken haben auf ihrer Zunge tausende winzige Zähnchen. Damit raspeln sie Blätter ab.'] },
  igelkind: { name: 'Igel-Cousin Stups', spur: 'boden', aepfel: 5,
    saetze: ['Mein kleiner Cousin Stups! Hallo, Stups!', 'Stups übt Einrollen. Das klappt schon ganz gut.'],
    fakten: ['Junge Igel verlassen ihre Mama schon nach etwa sechs Wochen und gehen dann allein auf Käferjagd.',
      'Ein junger Igel sollte vor dem Winter mindestens 500 Gramm wiegen. Sonst reicht sein Fett nicht für den Winterschlaf.'] },
  maus: { name: 'Waldmaus', spur: 'boden', aepfel: 5,
    saetze: ['Eine Maus! Schnell wie der Blitz.', 'Piep! Die Maus hat es eilig.'],
    fakten: ['Die Nagezähne einer Maus wachsen ihr ganzes Leben lang. Durch das Nagen bleiben sie kurz.',
      'Eine Maus kann sich durch ein Loch quetschen, das nur so dick ist wie ein Bleistift.'] },
  frosch: { name: 'Grasfrosch', spur: 'boden', monate: [3, 4, 5, 6, 7, 8, 9, 10], aepfel: 5,
    saetze: ['Hops! Der Frosch springt davon.', 'Quaak! Ein Frosch auf der Wiese.'],
    fakten: ['Frösche trinken nicht mit dem Mund. Sie nehmen Wasser durch die Haut auf.',
      'Viele Grasfrösche verbringen den Winter im Schlamm am Grund eines Teichs.'] },
  kaefer: { name: 'Hirschkäfer', spur: 'boden', zeit: ['tag', 'abend'], monate: [5, 6, 7, 8, 9, 10], aepfel: 5,
    saetze: ['Mmmh, ein Käfer! Äh, ich meine: Hallo, Herr Käfer!', 'Keine Sorge, Herr Käfer, ich habe schon gegessen.'],
    fakten: ['Das Geweih eines Hirschkäfer-Männchens ist eigentlich ein riesiger Kiefer. Damit ringen die Männchen miteinander.',
      'Hirschkäfer brauchen altes, totes Holz. Weil es davon wenig gibt, sind sie in der Schweiz selten geworden.'] },
  maulwurf: { name: 'Maulwurf', spur: 'huegel', aepfel: 5,
    saetze: ['Huch, der Maulwurf! Er sieht fast nichts, aber er riecht super.', 'Hallo, Maulwurf! Schöner Hügel!'],
    fakten: ['Maulwürfe graben mit ihren schaufelartigen Händen lange Tunnel. Dort fangen sie vor allem Regenwürmer.',
      'Maulwürfe sehen fast nichts. Dafür spüren sie mit Nase und Tasthaaren jede kleine Bewegung.'] },
  eule: { name: 'Waldohreule', spur: 'himmel', zeit: ['abend', 'nacht'], aepfel: 8,
    saetze: ['Huhu! Die Eule ist wach. Genau wie ich!', 'Schau, wie weit sie ihren Kopf drehen kann!'],
    fakten: ['Die Federohren der Waldohreule sind gar keine Ohren, sondern nur Federbüschel.',
      'Bei vielen Eulen sitzen die Ohren nicht gleich hoch am Kopf. So hören sie ganz genau, woher ein Geräusch kommt.'] },
  fledermaus: { name: 'Fledermaus', spur: 'himmel', zeit: ['abend', 'nacht'], monate: [3, 4, 5, 6, 7, 8, 9, 10], aepfel: 8,
    saetze: ['Eine Fledermaus! Sie jagt Mücken im Dunkeln.', 'Hui, die Fledermaus fliegt einen Looping!'],
    fakten: ['Fledermäuse schlafen kopfüber hängend. Zum Losfliegen lassen sie sich einfach fallen.',
      'Eine kleine Zwergfledermaus kann in einer einzigen Nacht hunderte Mücken fangen.'] },
  rotkehlchen: { name: 'Rotkehlchen', spur: 'himmel', zeit: ['morgen', 'tag', 'abend'], aepfel: 5,
    saetze: ['Ein Rotkehlchen! Es singt sogar im Winter.', 'Piep, piep! Hallo, kleiner Vogel!'],
    fakten: ['Rotkehlchen singen auch im Winter. Damit zeigen sie: Das hier ist mein Revier!',
      'Rotkehlchen folgen manchmal Leuten, die im Garten graben. Da kommen nämlich leckere Würmer zum Vorschein.'] },
  marienkaefer: { name: 'Marienkäfer', spur: 'himmel', zeit: ['morgen', 'tag', 'abend'], monate: [3, 4, 5, 6, 7, 8, 9, 10], aepfel: 5,
    saetze: ['Ein Marienkäfer! Der bringt Glück.', 'Flieg, kleiner Marienkäfer!'],
    fakten: ['Ein Marienkäfer frisst in seinem Leben tausende Blattläuse.',
      'Die Punkte eines Marienkäfers verraten nicht sein Alter, sondern zu welcher Art er gehört.'] },
  schmetterling: { name: 'Zitronenfalter', spur: 'himmel', zeit: ['morgen', 'tag'], monate: [3, 4, 5, 6, 7, 8, 9, 10], aepfel: 5,
    saetze: ['Ein Zitronenfalter! Gelb wie eine Zitrone.', 'Der Schmetterling tanzt über die Wiese.'],
    fakten: ['Zitronenfalter überwintern als fertige Schmetterlinge draussen, oft einfach zwischen Blättern im Gebüsch.',
      'Ein Zitronenfalter kann etwa ein Jahr alt werden. Für einen Schmetterling ist das uralt.'] },
  gaense: { name: 'Wildgänse', spur: 'himmel', zeit: ['morgen', 'tag', 'abend'], monate: [2, 3, 4, 9, 10, 11], aepfel: 8,
    saetze: ['Wildgänse! Sie fliegen in den Süden.', 'Schau, die Gänse fliegen in V-Form!'],
    fakten: ['Gänse fliegen in V-Form, weil jede im Windschatten der anderen Kraft spart.',
      'Bei den Wildgänsen wechselt sich die Gans an der Spitze ab. So wird keine zu müde.'] },
  gluehwuermchen: { name: 'Glühwürmchen', spur: 'himmel', zeit: ['abend', 'nacht'], monate: [6, 7, 8], aepfel: 10,
    saetze: ['Glühwürmchen! Wie kleine Laternen.', 'Schau, wie sie leuchten!'],
    fakten: ['Glühwürmchen-Larven fressen am liebsten Schnecken.',
      'In der Schweiz sieht man Glühwürmchen vor allem in warmen Sommernächten im Juni und Juli.'] },
  drache: { name: 'Drachen', spur: 'himmel', zeit: ['tag'], monate: [9, 10, 11], aepfel: 8,
    saetze: ['Ein Drachen! Im Herbst ist der Wind perfekt dafür.', 'Der Drachen tanzt im Wind!'],
    fakten: ['Drachen gibt es schon seit über zweitausend Jahren. Erfunden wurden sie wahrscheinlich in China.'] },
  goldkaefer: { name: 'Goldkäfer', spur: 'boden', selten: true, aepfel: 25,
    saetze: ['Ein goldener Käfer! So einen sieht man fast nie. Extra-Äpfel für dich!', 'Wow, der glänzt wie ein Schatz!'],
    fakten: ['Der Rosenkäfer glänzt golden-grün. Seine Farbe kommt von winzigen Strukturen auf dem Panzer, nicht von Farbstoff.'] },
  ufo: { name: 'UFO', spur: 'himmel', selten: true, aepfel: 25,
    saetze: ['Ein UFO?! Hallo, ihr da oben! Könnt ihr Brüche?', 'Die Ausserirdischen winken! Wink zurück!'],
    fakten: ['Die Raumsonde Voyager 1 fliegt seit 1977 durchs All. Sie ist weiter weg als alles andere, was Menschen je gebaut haben.'] },
};

/* =====================================================================
   GARDEROBE: Zeichnungen in grafik.js (ITEM_SVG)
   ===================================================================== */
const ITEMS = {
  schleife: { name: 'Schleife', platz: 'kopf', preis: 30, spruch: 'Eine Schleife! Jetzt bin ich der schickste Igel im Wald.' },
  bleistift: { name: 'Bleistift', platz: 'pfote', preis: 40, spruch: 'Ein Bleistift! Jetzt kann ich mitrechnen.' },
  fliege: { name: 'Fliege', platz: 'hals', preis: 50, spruch: 'Eine Fliege! Keine Sorge, die fresse ich nicht.' },
  sonnenbrille: { name: 'Sonnenbrille', platz: 'augen', preis: 60, spruch: 'Sonnenbrille auf! Ich bin jetzt ein ziemlich cooler Igel.' },
  muetze: { name: 'Zipfelmütze', platz: 'kopf', preis: 90, spruch: 'Eine Zipfelmütze! Endlich keine kalten Ohren mehr.' },
  schal: { name: 'Schal', platz: 'hals', preis: 110, spruch: 'Ein Schal! Kuschelig warm für den Herbst.' },
  brille: { name: 'Professorenbrille', platz: 'augen', preis: 120, spruch: 'Mit dieser Brille sehe ich aus wie ein Professor. Professor Pieks!' },
  kranz: { name: 'Blumenkranz', platz: 'kopf', preis: 150, spruch: 'Ein Blumenkranz! Ich fühle mich wie ein Frühlingsigel.' },
  herzbrille: { name: 'Herzchenbrille', platz: 'augen', preis: 170, spruch: 'Eine Herzchenbrille! Jetzt sehe ich alles durch die rosa Brille.' },
  kopfhoerer: { name: 'Kopfhörer', platz: 'kopf', preis: 220, spruch: 'Kopfhörer! Jetzt höre ich Igel-Pop beim Rechnen.' },
  augenklappe: { name: 'Augenklappe', platz: 'augen', preis: 240, spruch: 'Arrr! Mit Augenklappe sehe ich nur noch halb so viel. Aber doppelt so cool.' },
  zauberhut: { name: 'Zauberhut', platz: 'kopf', preis: 300, spruch: 'Ein Zauberhut! Simsalabim, die Aufgabe ist gelöst! Ach nein, das musst ja du machen.' },
  zauberstab: { name: 'Zauberstab', platz: 'pfote', preis: 340, spruch: 'Ein Zauberstab! Hokuspokus, mehr Äpfel! Hm, klappt irgendwie nicht.' },
  piratenhut: { name: 'Piratenhut', platz: 'kopf', preis: 380, spruch: 'Ahoi! Kapitän Pieks sticht in See. Auf zum Schatz der Brüche!' },
  medaille: { name: 'Goldmedaille', platz: 'hals', preis: 420, spruch: 'Eine Goldmedaille! Eigentlich gehört sie dir. Ich trage sie nur für dich.' },
  krone: { name: 'Krone', platz: 'kopf', preis: 500, spruch: 'Eine Krone! Ab heute heisse ich König Pieks der Erste.' },
  astronaut: { name: 'Astronautenhelm', platz: 'kopf', preis: 650, spruch: 'Ein Astronautenhelm! Der erste Igel im Weltall. Drei, zwei, eins, Start!' },
  einhorn: { name: 'Einhorn-Horn', platz: 'kopf', preis: 800, spruch: 'Ein Einhorn-Horn! Bin ich jetzt ein Igelhorn oder ein Einigel?' },
};
const PLAETZE = { kopf: 'Kopf', augen: 'Augen', hals: 'Hals', pfote: 'Pfote' };

/* =====================================================================
   RÄNGE: je mehr Äpfel Nea insgesamt gesammelt hat (ausgegebene zählen mit)
   ===================================================================== */
const RAENGE = [
  { ab: 0, name: 'Laub-Neuling' },
  { ab: 40, name: 'Stachel-Lehrling' },
  { ab: 120, name: 'Pilz-Sammlerin' },
  { ab: 250, name: 'Bruch-Bezwingerin' },
  { ab: 450, name: 'Liter-Logikerin' },
  { ab: 700, name: 'Dreisatz-Detektivin' },
  { ab: 1000, name: 'Wald-Mathematikerin' },
  { ab: 1400, name: 'Stachel-Professorin' },
  { ab: 1900, name: 'Igel-Genie' },
  { ab: 2500, name: 'Rechen-Ritterin' },
  { ab: 3300, name: 'Mathe-Legende' },
  { ab: 4300, name: 'Königin der Lichtung' },
  { ab: 5600, name: 'Galaktische Igel-Meisterin' },
];

/* =====================================================================
   ERFOLGE: Bedingungen stehen in app.js (pruefeErfolge)
   ===================================================================== */
const ERFOLGE = {
  erste: { name: 'Erster Schritt', text: 'Die erste Aufgabe gelöst.', bonus: 5 },
  serie5: { name: 'Heisse Pfote', text: '5 richtig in Folge.', bonus: 10 },
  serie10: { name: 'Feuer-Igel', text: '10 richtig in Folge.', bonus: 20 },
  serie20: { name: 'Unaufhaltsam', text: '20 richtig in Folge.', bonus: 40 },
  auf50: { name: 'Fleissige Biene', text: '50 Aufgaben gelöst.', bonus: 20 },
  auf200: { name: 'Rechen-Marathon', text: '200 Aufgaben gelöst.', bonus: 50 },
  auf500: { name: 'Zahlen-Zauberin', text: '500 Aufgaben gelöst.', bonus: 100 },
  auf1000: { name: 'Tausendfüsslerin', text: '1000 Aufgaben gelöst.', bonus: 200 },
  alle3: { name: 'Allrounderin', text: 'Brüche, Volumen und Dreisätze geübt.', bonus: 15 },
  bruch50: { name: 'Pizza-Profi', text: '50 Brüche richtig.', bonus: 25 },
  liter50: { name: 'Liter-Profi', text: '50 Volumen-Aufgaben richtig.', bonus: 25 },
  drei50: { name: 'Dreisatz-Profi', text: '50 Dreisätze richtig.', bonus: 25 },
  schwer25: { name: 'Harte Nuss', text: '25 schwere Aufgaben richtig.', bonus: 40 },
  durchhalten: { name: 'Nicht aufgeben', text: 'Eine Aufgabe nach zwei Fehlern doch noch gelöst.', bonus: 10 },
  ziel: { name: 'Ziel erreicht', text: 'Das erste Tagesziel geschafft.', bonus: 15 },
  tage3: { name: 'Dranbleiberin', text: '3 Tage in Folge geübt.', bonus: 20 },
  tage7: { name: 'Wochen-Heldin', text: '7 Tage in Folge geübt.', bonus: 50 },
  nachteule: { name: 'Nachteule', text: 'Nach 19 Uhr geübt.', bonus: 10 },
  frueh: { name: 'Frühaufsteherin', text: 'Vor 8 Uhr geübt.', bonus: 10 },
  tiere5: { name: 'Tierfreundin', text: '5 Besucher entdeckt.', bonus: 15 },
  selten: { name: 'Glückspilz', text: 'Einen seltenen Besucher entdeckt.', bonus: 20 },
  tiereAlle: { name: 'Wald-Expertin', text: 'Alle Besucher entdeckt.', bonus: 100 },
  fakten50: { name: 'Fakten-Fan', text: '50 Fakten gesammelt.', bonus: 25 },
  fakten200: { name: 'Wandelndes Lexikon', text: '200 Fakten gesammelt.', bonus: 75 },
  mode: { name: 'Modebewusst', text: 'Das erste Teil für Pieks gekauft.', bonus: 10 },
  modeAlle: { name: 'Mode-Ikone', text: 'Die ganze Garderobe gekauft.', bonus: 0 },
  kitzel: { name: 'Kitzel-Alarm', text: 'Pieks zum Einrollen gebracht.', bonus: 5 },
};

/* =====================================================================
   HILFSFUNKTIONEN (gelten in der App, in make-audio.mjs und in sw.js)
   ===================================================================== */
const anzeigetext = e => (typeof e === 'string' ? e : e.t);

// Die Schweizer Schreibweise hat ss, wo im Hochdeutschen ß steht. Nach langem
// Vokal liest die Stimme ss aber kurz («Grossartig» wie «Ross»). Für die Stimme
// darum ß, angezeigt wird weiter ss. Wörter mit kurzem Vokal (Wasser, dass,
// Fluss, Nuss) bleiben, wie sie sind. Neue Wörter dieser Art hier ergänzen.
const SCHARFES_S = [
  [/([Gg])ross/g, '$1roß'],       // gross, grosse, Grossartig
  [/([Gg])röss/g, '$1röß'],       // grösser, grösste, Grösse
  [/([Ff])üss/g, '$1üß'],         // Füsse, Hinterfüsse
  [/\b([Ff])uss/g, '$1uß'],       // Fuss, Fussball, Fussabdruck
  [/([Ss])pass/g, '$1paß'],       // Spass
  [/([Ss])trass/g, '$1traß'],     // Strasse
  [/([Gg])rüss/g, '$1rüß'],       // Grüsse
  [/\b([Gg])russ/g, '$1ruß'],     // Gruss
  [/([Ss])trauss/g, '$1trauß'],   // Strauss
  [/([Hh])ohlmass/g, '$1ohlmaß'], // Hohlmasse
  [/([Mm])assstab/g, '$1aßstab'], // Massstab
  [/\b([Aa])ussen/g, '$1ußen'],   // aussen
  [/draussen/g, 'draußen'],
  [/([Ss])üss/g, '$1üß'],         // süss, Süssigkeiten
  [/([Gg])efäss/g, '$1efäß'],     // Gefäss
  [/\b([Bb])loss/g, '$1loß'],     // bloss
  [/\b([Ss])toss/g, '$1toß'],     // Stoss, Stosszahn
  [/iess/g, 'ieß'],               // schliessen, giessen, fliessen
  [/eiss/g, 'eiß'],               // heisst, weiss, dreissig, fleissig
  [/([Ää])usserst/g, '$1ußerst'], // äusserst
  [/\b([Aa])usser/g, '$1ußer'],   // ausser, Ausserirdische (nicht: aussehen)
];
const aussprache = s => SCHARFES_S.reduce((t, [muster, ersatz]) => t.replace(muster, ersatz), s);

// Zahlen als Wörter, für die Stimme. Wird nie angezeigt, darum mit ß.
const EINER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun',
  'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const ZEHNER = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
function unterTausend(n) {
  // 1 … 999, «eins» am Ende bleibt (hunderteins), davor «ein» (einundzwanzig)
  let s = '';
  const h = Math.floor(n / 100), r = n % 100;
  if (h) s += (h === 1 ? '' : EINER[h]) + 'hundert';
  if (r) {
    if (r < 20) s += EINER[r];
    else {
      const z = Math.floor(r / 10), e = r % 10;
      s += (e ? (e === 1 ? 'ein' : EINER[e]) + 'und' : '') + ZEHNER[z];
    }
  }
  return s;
}
function zahlwortGross(n) {
  if (n === 0) return 'null';
  const teile = [];
  const mrd = Math.floor(n / 1e9), mio = Math.floor((n % 1e9) / 1e6), tsd = Math.floor((n % 1e6) / 1000), rest = n % 1000;
  if (mrd) teile.push(mrd === 1 ? 'eine Milliarde' : unterTausend(mrd) + ' Milliarden');
  if (mio) teile.push(mio === 1 ? 'eine Million' : unterTausend(mio) + ' Millionen');
  let s = '';
  if (tsd) s += (tsd === 1 ? '' : unterTausend(tsd)) + 'tausend';
  if (rest) s += unterTausend(rest);
  if (s) teile.push(s);
  return teile.join(' ');
}
// Ziffern im gesprochenen Text: 7000 → siebentausend, 1969 → neunzehnhundert…,
// 10'000 → zehntausend, 3,5 → drei Komma fünf, 1 Meter → ein Meter
function zahlenSprechen(s) {
  // «Z3» als «Z drei», nicht «Zdrei»
  return s.replace(/\b([A-Z])(\d)/g, '$1 $2').replace(/\d{1,3}(?:'\d{3})+|\d+(?:,\d+)?/g, (m, pos, ganz) => {
    if (m.includes(',')) {
      const [g, k] = m.split(',');
      return zahlwortGross(parseInt(g, 10)) + ' Komma ' + [...k].map(z => EINER[+z]).join(' ');
    }
    const n = parseInt(m.replace(/'/g, ''), 10);
    if (!m.includes("'") && m.length === 4 && n >= 1100 && n <= 1999) {
      // wie Jahreszahlen: neunzehnhundertneunundsechzig
      return unterTausend(Math.floor(n / 100)) + 'hundert' + (n % 100 ? unterTausend(n % 100) : '');
    }
    // vor einem Nomen «ein Meter», sonst «eins bis zwei»
    if (n === 1 && /^ [A-ZÄÖÜ]/.test(ganz.slice(pos + m.length))) return 'ein';
    return zahlwortGross(n);
  });
}
// Bindestrich-Wörter («Stachel-Wissen», «Mode-Zeit») liest die Stimme wie zwei
// Wörter und betont dann den zweiten Teil. Für die Stimme darum zusammengeschrieben
// («Stachelwissen»), angezeigt wird weiter mit Bindestrich. Nicht bei den Fakten
// (Objekte mit k), dort stehen Namen wie «Berners-Lee» oder «Pi-Tag». Und nicht
// zwischen zwei Vokalen: aus «Mathe-Igel» würde sonst «Matheigel» mit «ei» wie in «Eis».
const zusammenschreiben = s => s.replace(/([a-zäöüß])-([A-ZÄÖÜ])(?=[a-zäöü])/g,
  (m, a, b) => (/[aeiouäöü]/.test(a) && /[AEIOUÄÖÜ]/.test(b) ? m : a + b.toLowerCase()));
const sprechtext = e => {
  let s = (typeof e === 'string' ? e : e.s || e.t).replace(/Nea/g, SPRECHNAME);
  if (!(e && typeof e === 'object' && e.k)) s = zusammenschreiben(s);
  return aussprache(zahlenSprechen(s));
};

// Kennung einer Aufnahme: FNV-1a über den gesprochenen Text
function kennung(s) {
  let h = 0x811c9dc5;
  for (const ch of s.normalize('NFC')) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// Listen, die jubeln und loben (lebhaft); der Rest erklärt und darf ruhiger sein
const LEBHAFT = ['aufwachen', 'gruss_morgen', 'gruss_tag', 'gruss_abend', 'gruss_nacht', 'gruss_wieder', 'gruss_serie', 'gruss_winter',
  'thema_brueche', 'thema_volumen', 'thema_dreisatz', 'thema_mix', 'start_schwer', 'neue_aufgabe',
  'richtig', 'richtig_nachfehler', 'richtig_schwer', 'richtig_nachloesung', 'tagesziel', 'rang_vor', 'erfolg_vor',
  'album_neu', 'kaufen', 'kitzeln', 'einrollen', 'ausrollen', 'stimme_an', 'garderobe_auf', 'erfolge_auf'];

// Wichtig zuerst: was oft gebraucht wird, wird zuerst vertont und geladen
function alleSaetze() {
  const liste = [];
  // Ganz kurze Ausrufe («Prima!», «Super!») hält die Stimme sonst leicht für
  // Italienisch oder Englisch. Ein gedachter deutscher Satz drumherum (nicht
  // mitgesprochen) sagt ihr, welche Sprache gemeint ist.
  const DEUTSCH = ['Nea hat die Aufgabe richtig gelöst, und Pieks, der Igel, ruft begeistert:', 'Das hast du wirklich toll gemacht.'];
  const dazu = (s, gruppe, vorher, nachher, lebhaft) => {
    const kurz = !!lebhaft && !vorher && !nachher && s.split(/\s+/).length <= 3;
    liste.push({ s, gruppe, vorher: kurz ? DEUTSCH[0] : vorher || '', nachher: kurz ? DEUTSCH[1] : nachher || '', lebhaft: !!lebhaft, kurz });
  };
  const umfeld = { tipp_vor: ['', 'Zuerst rechnest du auf eins herunter.'], rang_vor: ['', 'Stachel-Lehrling!'], erfolg_vor: ['', 'Nachteule!'], fakt_vor: ['', 'Igel haben etwa siebentausend Stacheln.'] };
  for (const [name, pool] of Object.entries(TEXTE)) {
    const [vorher, nachher] = umfeld[name] || [];
    for (const e of pool) dazu(sprechtext(e), 'pieks', vorher, nachher, LEBHAFT.includes(name));
  }
  for (const s of Object.values(SERIE)) dazu(sprechtext(s), 'pieks', '', '', true);
  for (const e of Object.values(TIPPS)) dazu(sprechtext(e), 'pieks', 'Tipp:');
  for (const r of RAENGE) dazu(sprechtext(r.name + '!'), 'pieks', 'Neuer Rang! Du bist jetzt:', '', true);
  for (const e of Object.values(ERFOLGE)) dazu(sprechtext(e.name + '!'), 'pieks', 'Neuer Erfolg!', '', true);
  for (const it of Object.values(ITEMS)) dazu(sprechtext(it.spruch), 'pieks', '', '', true);
  for (const b of Object.values(BESUCHER)) {
    for (const s of b.saetze) dazu(sprechtext(s), 'besuch', '', '', true);
    for (const f of b.fakten) dazu(sprechtext(f), 'besuch', 'Wusstest du?');
  }
  if (typeof FAKTEN !== 'undefined') for (const f of FAKTEN) dazu(sprechtext(f), 'fakt', 'Wusstest du?');
  return liste;
}

if (typeof module !== 'undefined') {
  module.exports = { TEXTE, SERIE, TIPPS, BESUCHER, ITEMS, PLAETZE, RAENGE, ERFOLGE, SPRECHNAME,
    anzeigetext, sprechtext, aussprache, zahlenSprechen, zahlwortGross, kennung, alleSaetze, LEBHAFT,
    setFakten: f => { FAKTEN = f; } };
}
// In Node kommen die Fakten über setFakten() herein, im Browser aus fakten.js
var FAKTEN;
