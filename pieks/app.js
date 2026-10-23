'use strict';

/* =====================================================================
   MATHE-IGEL: Ablauf der App
   Aufgaben kommen aus aufgaben.js, alles Gesprochene aus texte.js und
   fakten.js, die Zeichnungen aus grafik.js.
   ===================================================================== */

const $ = id => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const pause = ms => new Promise(res => setTimeout(res, ms));
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const zahlText = x => String(Math.round(x * 1000) / 1000);
const STUFEN = { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer' };
const STUFEN_REIHE = ['easy', 'medium', 'hard'];
const THEMEN = {
  brueche: { name: 'Brüche', icon: 't-brueche', info: '+, −, ·, : und Textaufgaben' },
  volumen: { name: 'Volumen', icon: 't-volumen', info: 'ml, cl, dl, l und hl' },
  dreisatz: { name: 'Dreisätze', icon: 't-dreisatz', info: 'direkt und umgekehrt' },
  mix: { name: 'Wald-Mix', icon: 't-mix', info: 'alles gemischt' },
};

/* =====================================================================
   SPEICHER
   Der Igel-Stand liegt unter «nea.igel.stand». Die Tages-Statistik bleibt
   im alten Format unter «bruchrechnen_stats_v1», damit nichts verloren geht.
   ===================================================================== */
const STAND_KEY = 'nea.igel.stand';
const STATS_KEY = 'bruchrechnen_stats_v1';
const stand = laden();
function laden() {
  const s = {
    aepfel: 0, gesamt: 0,
    stufe: { brueche: 'easy', volumen: 'easy', dreisatz: 'easy', mix: 'easy' },
    geloest: { brueche: 0, volumen: 0, dreisatz: 0 },
    schwer: 0, besterLauf: 0,
    besucher: {}, fakten: [], items: [], an: { kopf: null, augen: null, hals: null, pfote: null },
    erfolge: {}, ton: true, stimme: true, ziel: 10,
    vorgestellt: false, ersteTraining: false, ersterBesuch: false, zuletzt: 0, zielTage: {},
    nachRichtig: 0,
  };
  try {
    const raw = JSON.parse(localStorage.getItem(STAND_KEY) || 'null');
    if (raw && typeof raw === 'object') {
      for (const k of ['aepfel', 'gesamt', 'schwer', 'besterLauf', 'zuletzt', 'nachRichtig']) if (Number.isFinite(raw[k]) && raw[k] >= 0) s[k] = raw[k];
      if ([5, 10, 15, 20, 30].includes(raw.ziel)) s.ziel = raw.ziel;
      for (const k of ['ton', 'stimme', 'vorgestellt', 'ersteTraining', 'ersterBesuch']) if (typeof raw[k] === 'boolean') s[k] = raw[k];
      if (raw.stufe) for (const t in s.stufe) if (STUFEN[raw.stufe[t]]) s.stufe[t] = raw.stufe[t];
      if (raw.geloest) for (const t in s.geloest) if (Number.isInteger(raw.geloest[t])) s.geloest[t] = raw.geloest[t];
      if (raw.besucher && typeof raw.besucher === 'object') for (const k in raw.besucher) if (BESUCHER[k]) s.besucher[k] = raw.besucher[k];
      if (Array.isArray(raw.fakten)) s.fakten = raw.fakten.filter(k => typeof k === 'string').slice(-2000);
      if (Array.isArray(raw.items)) s.items = raw.items.filter(k => ITEMS[k]);
      if (raw.an) for (const p in s.an) if (ITEMS[raw.an[p]] && s.items.includes(raw.an[p])) s.an[p] = raw.an[p];
      if (raw.erfolge && typeof raw.erfolge === 'object') for (const k in raw.erfolge) if (ERFOLGE[k]) s.erfolge[k] = raw.erfolge[k];
      if (raw.zielTage && typeof raw.zielTage === 'object') s.zielTage = raw.zielTage;
    }
  } catch (e) { /* privater Modus o.ä. */ }
  return s;
}
function speichern() {
  try { localStorage.setItem(STAND_KEY, JSON.stringify(stand)); } catch (e) { /* privater Modus o.ä. */ }
}

// Tages-Statistik (gleiches Format wie früher)
function statsLaden() { try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch (e) { return {}; } }
function statsSpeichern(s) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) { /* voll o.ä. */ } }
const dateKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const heuteKey = () => dateKey(new Date());
function ergebnisMerken(richtig, ersterVersuch) {
  const s = statsLaden(), k = heuteKey();
  if (!s[k]) s[k] = { total: 0, correct: 0, firstTry: 0, attempts: 0 };
  s[k].attempts++;
  if (richtig) { s[k].total++; s[k].correct++; if (ersterVersuch) s[k].firstTry++; }
  statsSpeichern(s);
}
const heuteGeloest = () => (statsLaden()[heuteKey()] || {}).total || 0;
const alleGeloest = () => Object.values(statsLaden()).reduce((a, x) => a + (x.total || 0), 0);
// Tage in Folge mit mindestens einer gelösten Aufgabe (heute zählt, sobald gelöst)
function tageSerie() {
  const s = statsLaden(), d = new Date();
  let n = 0;
  if (!((s[dateKey(d)] || {}).total > 0)) d.setDate(d.getDate() - 1);
  while ((s[dateKey(d)] || {}).total > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* =====================================================================
   TAGESZEIT UND JAHRESZEIT
   ===================================================================== */
function saison(d = new Date()) {
  const m = d.getMonth() + 1;
  return m <= 2 || m === 12 ? 'winter' : m <= 5 ? 'fruehling' : m <= 8 ? 'sommer' : 'herbst';
}
function tageszeit(d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60, s = saison(d);
  // Im Winter wird es früher dunkel, im Sommer später
  const [morgen, tag, abend, nacht] = { winter: [7, 10, 16.3, 18], fruehling: [6, 9.5, 18, 20.5], sommer: [5.5, 9, 19.5, 21.5], herbst: [6.5, 10, 17, 19.3] }[s];
  return h < morgen || h >= nacht ? 'nacht' : h < tag ? 'morgen' : h < abend ? 'tag' : 'abend';
}
function zeitAnwenden() {
  const b = document.body.classList;
  ['morgen', 'tag', 'abend', 'nacht', 'fruehling', 'sommer', 'herbst', 'winter'].forEach(k => b.remove(k));
  b.add(tageszeit(), saison());
}

/* =====================================================================
   AUDIO: ein gemeinsamer Kontext für Töne und Stimme. Er darf erst nach
   einem Tipp loslegen; davor bleibt er stumm.
   ===================================================================== */
let audioCtx = null;
function audio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}
// Auf iPad und iPhone sonst stumm, sobald der Lautlos-Schalter an ist
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* älteres Safari */ }

/* TÖNE (selbst erzeugt, keine Dateien) */
const Ton = (() => {
  const ac = () => (stand.ton ? audio() : null);
  function note(f, t0, dur, type = 'sine', vol = 0.12, to = 0) {
    const c = ac();
    if (!c) return;
    const t = c.currentTime + t0;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  const folge = (fs, dt, dur, type, vol) => fs.forEach((f, i) => note(f, i * dt, dur, type, vol));
  return {
    tipp() { note(720, 0, 0.05, 'triangle', 0.05); },
    taste() { note(620, 0, 0.04, 'triangle', 0.04); },
    richtig() { note(784, 0, 0.12, 'triangle', 0.12); note(1175, 0.09, 0.22, 'triangle', 0.1); },
    falsch() { note(330, 0, 0.28, 'sine', 0.13, 210); },
    apfel(i = 0) { note(1320 + i * 90, 0, 0.09, 'sine', 0.07, 1760 + i * 90); },
    serie() { folge([659, 880, 1047, 1319], 0.07, 0.22, 'triangle', 0.09); },
    ziel() { folge([523, 659, 784, 1047, 1319], 0.1, 0.3, 'triangle', 0.1); note(1568, 0.55, 0.6, 'sine', 0.07); },
    rang() { folge([523, 659, 784, 1047], 0.12, 0.35, 'square', 0.035); note(1319, 0.5, 0.7, 'triangle', 0.08); },
    erfolg() { folge([784, 988, 1175, 1568], 0.08, 0.3, 'sine', 0.08); },
    fakt() { folge([1047, 1319], 0.08, 0.25, 'sine', 0.06); },
    kaufen() { note(1568, 0, 0.08, 'square', 0.04); note(2093, 0.08, 0.3, 'triangle', 0.08); },
    aufwachen() { note(260, 0, 0.5, 'sine', 0.08, 520); note(520, 0.5, 0.25, 'triangle', 0.07, 780); },
    kitzeln() { folge([900, 1200, 950, 1300, 1000], 0.06, 0.07, 'sine', 0.06); },
    einrollen() { note(700, 0, 0.35, 'triangle', 0.08, 180); },
    schnueffeln() { [0, 0.12, 0.24].forEach(t => note(2400, t, 0.05, 'sawtooth', 0.012, 1800)); },
    // Tierlaute
    klaeff() { note(700, 0, 0.09, 'sawtooth', 0.05, 1100); note(650, 0.13, 0.1, 'sawtooth', 0.05, 1000); },
    keckern() { for (let i = 0; i < 6; i++) note(1400 + (i % 2) * 300, i * 0.05, 0.04, 'square', 0.025); },
    grunz() { note(140, 0, 0.18, 'sawtooth', 0.06, 100); note(130, 0.22, 0.16, 'sawtooth', 0.05, 95); },
    plopp() { note(520, 0, 0.12, 'sine', 0.12, 180); },
    quiek() { note(1250, 0, 0.09, 'sine', 0.1, 1700); note(1350, 0.12, 0.12, 'sine', 0.09, 1900); },
    piepsen() { folge([2600, 2900, 2700], 0.07, 0.05, 'sine', 0.05); },
    quaak() { note(170, 0, 0.12, 'square', 0.05, 140); note(200, 0.16, 0.18, 'square', 0.05, 150); },
    brumm() { note(110, 0, 0.5, 'sawtooth', 0.03, 130); },
    huhu() { note(420, 0, 0.3, 'sine', 0.1, 380); note(400, 0.42, 0.45, 'sine', 0.09, 360); },
    fiep() { note(3200, 0, 0.05, 'sine', 0.04, 4000); note(3400, 0.08, 0.05, 'sine', 0.04, 4200); },
    zwitscher() { for (let i = 0; i < 4; i++) note(2400 + i * 200, i * 0.07, 0.06, 'sine', 0.05, 3000 + i * 200); },
    summ() { note(220, 0, 0.6, 'sawtooth', 0.02, 240); },
    glitzer() { folge([1568, 2093, 2637, 3136], 0.06, 0.25, 'sine', 0.05); },
    hupen() { note(330, 0, 0.18, 'square', 0.04, 300); note(330, 0.25, 0.18, 'square', 0.04, 300); },
    wusch() { note(300, 0, 0.4, 'triangle', 0.05, 900); },
    schatz() { folge([1047, 1319, 1568, 2093, 2637], 0.07, 0.3, 'triangle', 0.08); },
    ufo() { for (let i = 0; i < 3; i++) note(500, i * 0.25, 0.22, 'sine', 0.06, 1500); },
  };
})();

/* =====================================================================
   STIMME: Pieks spricht. Jeder Satz liegt als audio/<kennung>.mp3 bereit
   (siehe texte.js und make-audio.mjs). Mehrere Sätze werden nahtlos
   aneinandergehängt. Eine neue Ansage unterbricht immer die laufende.
   Ein Analyser misst die Lautstärke, damit Pieks' Mund mitgeht.
   ===================================================================== */
const Stimme = (() => {
  const roh = new Map(), fertig = new Map();
  let laeuft = [], nummer = 0, wecker = null, letzte = [], analyser = null, mundFrame = 0;
  let aktiv = false;     // spricht Pieks gerade (oder wartet die Lesezeit ab)?
  let mundZiel = null;   // das <svg> von Pieks, das gerade spricht

  function holen(satz) {
    const id = kennung(satz);
    if (!roh.has(id)) roh.set(id, fetch('audio/' + id + '.mp3').then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null));
    return roh.get(id);
  }
  // Stille am Anfang und Ende abschneiden, damit Teile ohne Lücke klingen
  function trimmen(c, buf) {
    const d = buf.getChannelData(0), n = d.length, rand = Math.floor(buf.sampleRate * 0.025);
    let a = 0, b = n - 1;
    while (a < n && Math.abs(d[a]) < 0.012) a++;
    while (b > a && Math.abs(d[b]) < 0.012) b--;
    a = Math.max(0, a - rand);
    b = Math.min(n - 1, b + rand);
    if (b <= a || (a === 0 && b === n - 1)) return buf;
    const out = c.createBuffer(buf.numberOfChannels, b - a + 1, buf.sampleRate);
    for (let k = 0; k < buf.numberOfChannels; k++) out.getChannelData(k).set(buf.getChannelData(k).subarray(a, b + 1));
    return out;
  }
  async function dekodieren(c, satz) {
    const id = kennung(satz);
    if (fertig.has(id)) return fertig.get(id);
    const daten = await holen(satz);
    if (!daten) { roh.delete(id); return null; }
    try {
      const buf = await new Promise((ok, nein) => c.decodeAudioData(daten.slice(0), ok, nein));
      const t = trimmen(c, buf);
      fertig.set(id, t);
      return t;
    } catch (e) { return null; }
  }
  function schlafen(ms) {
    return new Promise(res => {
      const t = setTimeout(res, ms);
      wecker = () => { clearTimeout(t); res(); };
    });
  }
  function mundZu() {
    cancelAnimationFrame(mundFrame);
    if (mundZiel) { mundZiel.classList.remove('spricht'); mundZiel.style.removeProperty('--mund'); }
    mundZiel = null;
  }
  function mundLos(svg) {
    mundZu();
    if (!svg || !analyser) return;
    mundZiel = svg;
    svg.classList.add('spricht');
    const daten = new Float32Array(analyser.fftSize);
    let glatt = 0;
    const schritt = () => {
      analyser.getFloatTimeDomainData(daten);
      let q = 0;
      for (let i = 0; i < daten.length; i++) q += daten[i] * daten[i];
      const pegel = Math.sqrt(q / daten.length);
      glatt = glatt * 0.45 + clamp(pegel * 7, 0, 1) * 0.55;
      svg.style.setProperty('--mund', (0.08 + glatt * 0.92).toFixed(2));
      mundFrame = requestAnimationFrame(schritt);
    };
    schritt();
  }
  function stopp() {
    nummer++;
    aktiv = false;
    laeuft.forEach(q => { try { q.stop(); } catch (e) { /* schon zu Ende */ } });
    laeuft = [];
    mundZu();
    if (wecker) { wecker(); wecker = null; }
  }
  // Ungefähre Lesezeit, wenn nichts zu hören ist (Stimme aus, offline …)
  const lesezeit = saetze => clamp(saetze.join(' ').length * 55, 1000, 9000);

  // Spricht die Sätze nacheinander. Erfüllt sich, wenn alles gesagt ist
  // (true) oder eine neuere Ansage dazwischenkam (false).
  async function sprechen(saetze, opt = {}) {
    stopp();
    const meine = nummer;
    aktiv = true;
    try {
      if (!opt.einwurf) letzte = { saetze, svg: opt.svg };
      const c = stand.stimme ? audio() : null;
      const bufs = c ? await Promise.all(saetze.map(s => dekodieren(c, s))) : [];
      if (meine !== nummer) return false;
      if (!c || c.state !== 'running' || !bufs.some(Boolean)) {
        await schlafen((opt.warte || 0) * 1000 + lesezeit(saetze));
        return meine === nummer;
      }
      if (!analyser) {
        analyser = c.createAnalyser();
        analyser.fftSize = 512;
        analyser.connect(c.destination);
      }
      let t = c.currentTime + 0.04 + (opt.warte || 0);
      const start = t;
      bufs.forEach((b, i) => {
        if (!b) return;
        const q = c.createBufferSource();
        q.buffer = b;
        q.connect(analyser);
        q.start(t);
        laeuft.push(q);
        t += b.duration + (i < bufs.length - 1 ? 0.12 : 0);
      });
      setTimeout(() => { if (meine === nummer) mundLos(opt.svg); }, Math.max(0, (start - c.currentTime) * 1000));
      await schlafen((t - c.currentTime) * 1000 + 120);
      if (meine === nummer) mundZu();
      return meine === nummer;
    } finally {
      if (meine === nummer) aktiv = false;
    }
  }
  return {
    sprechen,
    stopp,
    // Automatische Ansagen fragen vorher: nie jemandem ins Wort fallen.
    // Nur was Nea selbst antippt, darf unterbrechen.
    istStill: () => !aktiv,
    vorladen: saetze => saetze.forEach(holen),
    nochmal: () => (letzte.saetze && letzte.saetze.length ? sprechen(letzte.saetze, { svg: letzte.svg }) : null),
    // Zwischenruf (z.B. zu einem Tier): ein Tipp auf die Blase wiederholt danach trotzdem den Blasentext
    einwurf: (saetze, svg) => sprechen(saetze, { einwurf: true, svg }),
  };
})();

/* =====================================================================
   WAS PIEKS SAGT
   Aus jeder Liste in zufälliger Reihenfolge, ohne Wiederholung, bis alle
   einmal dran waren.
   ===================================================================== */
const beutel = {}, zuletzt = {};
function zieh(name) {
  if (!beutel[name] || !beutel[name].length) {
    const b = shuffle(TEXTE[name].slice());
    if (b.length > 1 && b[b.length - 1] === zuletzt[name]) b.unshift(b.pop());
    beutel[name] = b;
  }
  return (zuletzt[name] = beutel[name].pop());
}

// Wohin Pieks gerade spricht: Blase und Zeichnung des sichtbaren Bildschirms
let ziel = { say: null, blase: null, svg: null };
function sprechZiel(blase, svg) { ziel = { blase, say: blase.querySelector('.say'), svg }; }

// Zeigt etwas in der Sprechblase und liest es vor. html ist die Anzeige,
// saetze sind die gesprochenen Teile.
function ansage(html, saetze, opt = {}) {
  if (ziel.say) {
    ziel.say.innerHTML = html;
    ziel.blase.classList.remove('leer');
    ziel.blase.classList.toggle('lang', ziel.say.textContent.length > 90);
    ziel.blase.classList.remove('pop');
    void ziel.blase.offsetWidth;
    ziel.blase.classList.add('pop');
  }
  return Stimme.sprechen(saetze, Object.assign({ svg: ziel.svg }, opt));
}
const sag = (e, opt) => ansage(esc(anzeigetext(e)), [sprechtext(e)], opt);
// Pieks schweigt: Blase ausblenden, Platz bleibt
function blaseLeeren() {
  if (!ziel.say) return;
  ziel.say.innerHTML = '';
  ziel.blase.classList.add('leer');
}
const sagMehr = (teile, opt) => ansage(teile.map(e => esc(anzeigetext(e))).join(' '), teile.map(sprechtext), opt);

/* =====================================================================
   PIEKS ZEICHNEN UND ANZIEHEN
   ===================================================================== */
function pieksEinsetzen(platz) {
  platz.innerHTML = pieksSVG();
  const svg = platz.querySelector('svg');
  anziehen(svg);
  return svg;
}
function anziehen(svg) {
  for (const p of Object.keys(PLAETZE)) {
    const g = svg.querySelector('.slot-' + p);
    if (g) g.innerHTML = stand.an[p] ? ITEM_SVG[stand.an[p]] : '';
  }
}
function alleAnziehen() { document.querySelectorAll('svg.pieks').forEach(anziehen); }
let moodTimer = 0;
function stimmung(svg, m, ms) {
  if (!svg) return;
  svg.classList.remove('froh', 'oops', 'kitzel');
  void svg.getBoundingClientRect();
  clearTimeout(moodTimer);
  if (!m) return;
  svg.classList.add(m);
  if (ms) moodTimer = setTimeout(() => svg.classList.remove(m), ms);
}

/* =====================================================================
   LANDSCHAFT: Sterne, Waldrand, Laub am Boden, fallende Blätter
   ===================================================================== */
function landschaft() {
  // Sterne
  let st = '';
  for (let i = 0; i < 70; i++) {
    st += `<circle cx="${rnd(0, 1000)}" cy="${rnd(0, 380)}" r="${(Math.random() * 1.6 + 0.6).toFixed(1)}" style="animation-delay:-${(Math.random() * 3).toFixed(2)}s"/>`;
  }
  $('sterne').innerHTML = st;
  // Waldrand: Tannen und Laubbäume im Wechsel
  let w = '';
  for (let x = -10; x < 1220; x += rnd(26, 44)) {
    const h = rnd(70, 130), y = 160;
    if (Math.random() < 0.55) {
      w += `<path d="M${x} ${y - h} L${x + h * 0.28} ${y} L${x - h * 0.28} ${y} Z" fill="var(--tanne)" opacity=".85"/>`;
    } else {
      const r = h * 0.3;
      const farbe = pick(['var(--wald2)', 'var(--laub1)', 'var(--laub3)', 'var(--wald2)']);
      w += `<rect x="${x - 3}" y="${y - h * 0.45}" width="6" height="${h * 0.45}" fill="#6B4A2E" opacity=".7"/><circle cx="${x}" cy="${y - h * 0.55}" r="${r}" fill="${farbe}" opacity=".9"/>`;
    }
  }
  $('waldrand').innerHTML = w;
  // Am Boden: Herbstlaub, im Frühling und Sommer Blumen
  const s = saison(), boden = $('bodenLaub');
  boden.innerHTML = '';
  const anzahl = s === 'winter' ? 0 : 16;
  for (let i = 0; i < anzahl; i++) {
    const el = document.createElementNS(SVGNS, 'svg');
    el.setAttribute('viewBox', '0 0 40 40');
    const gr = rnd(14, 26);
    Object.assign(el.style, { left: rnd(0, 98) + '%', top: rnd(4, 92) + '%', width: gr + 'px', height: gr + 'px', transform: `rotate(${rnd(0, 360)}deg)`, opacity: 0.85 });
    if (s === 'herbst') el.innerHTML = `<use href="#${pick(['blatt-ahorn', 'blatt-eiche'])}" color="${pick(['#E8742B', '#D9432F', '#F2B33D', '#C2562A'])}"/>`;
    else el.innerHTML = `<g fill="${pick(['#fff', '#FF9EC4', '#FFD43B', '#B48CFF'])}"><circle cx="20" cy="13" r="6"/><circle cx="27" cy="18" r="6"/><circle cx="24" cy="26" r="6"/><circle cx="16" cy="26" r="6"/><circle cx="13" cy="18" r="6"/></g><circle cx="20" cy="20" r="4.4" fill="#FFC21F"/>`;
    boden.appendChild(el);
  }
  fallen();
}
// Fallende Blätter im Herbst, Schnee im Winter, Blüten im Frühling, Glühwürmchen in Sommernächten
function fallen() {
  const r = $('regen');
  r.innerHTML = '';
  if (reduce) return;
  const s = saison(), z = tageszeit();
  if (s === 'sommer') {
    if (z !== 'nacht' && z !== 'abend') return;
    for (let i = 0; i < 14; i++) {
      const g = document.createElement('i');
      g.className = 'glueh';
      Object.assign(g.style, { left: rnd(2, 98) + '%', top: rnd(55, 92) + '%', animationDelay: -Math.random() * 3 + 's' });
      r.appendChild(g);
      g.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${rnd(-40, 40)}px, ${rnd(-30, 30)}px)` }, { transform: 'translate(0,0)' }],
        { duration: rnd(5000, 9000), iterations: Infinity, easing: 'ease-in-out' });
    }
    return;
  }
  const n = s === 'winter' ? 34 : 9;
  for (let i = 0; i < n; i++) {
    const el = document.createElementNS(SVGNS, 'svg');
    el.setAttribute('class', 'teil');
    el.setAttribute('viewBox', '0 0 40 40');
    let gr;
    if (s === 'winter') { gr = rnd(5, 11); el.innerHTML = '<circle cx="20" cy="20" r="18" fill="#fff" opacity=".9"/>'; }
    else if (s === 'fruehling') { gr = rnd(10, 16); el.innerHTML = '<path d="M20 4 C30 10 30 26 20 36 C10 26 10 10 20 4 Z" fill="#FFC2D9"/>'; }
    else { gr = rnd(16, 26); el.innerHTML = `<use href="#${pick(['blatt-ahorn', 'blatt-eiche'])}" color="${pick(['#E8742B', '#D9432F', '#F2B33D', '#C2562A'])}"/>`; }
    el.style.width = el.style.height = gr + 'px';
    el.style.left = rnd(0, 100) + 'vw';
    r.appendChild(el);
    const dauer = s === 'winter' ? rnd(9000, 16000) : rnd(11000, 19000);
    const seit = rnd(-80, 80), dreh = s === 'winter' ? 0 : rnd(-540, 540);
    el.animate([
      { transform: 'translate(0, -40px) rotate(0deg)' },
      { transform: `translate(${seit}px, 50vh) rotate(${dreh / 2}deg)`, offset: 0.5 },
      { transform: `translate(${-seit / 2}px, calc(100vh + 40px)) rotate(${dreh}deg)` },
    ], { duration: dauer, delay: -Math.random() * dauer, iterations: Infinity, easing: 'linear' });
  }
}

/* =====================================================================
   OBERFLÄCHE: Lichtung und Training
   ===================================================================== */
let bildschirm = 'lichtung';
let heldSVG = null, dockSVG = null;
const sitzung = { thema: 'brueche', stufe: 'easy', nr: 0 };

function zeigeBildschirm(name) {
  bildschirm = name;
  $('lichtung').hidden = name !== 'lichtung';
  $('training').hidden = name !== 'training';
  document.body.classList.toggle('auf-lichtung', name === 'lichtung');
  document.body.classList.toggle('im-training', name === 'training');
  if (name === 'lichtung') sprechZiel($('blaseHome'), heldSVG);
  else sprechZiel($('blase'), dockSVG);
  Besuch.platzWechsel();
}

function themenZeichnen() {
  const box = $('themen');
  box.innerHTML = '';
  for (const [id, th] of Object.entries(THEMEN)) {
    const gel = id === 'mix' ? null : stand.geloest[id];
    const el = document.createElement('div');
    el.className = 'thema';
    el.innerHTML = `
      <button type="button" class="thema-start" data-thema="${id}" aria-label="${th.name} üben">
        <svg viewBox="0 0 80 80" aria-hidden="true"><use href="#${th.icon}"/></svg>
        <span class="t-name">${th.name}</span>
        <span class="t-info">${gel ? gel + ' gelöst · ' : ''}${th.info}</span>
        <span class="los-pfeil" aria-hidden="true"><svg viewBox="0 0 32 32"><use href="#i-weiter"/></svg></span>
      </button>
      <div class="stufen" role="radiogroup" aria-label="Schwierigkeit">
        ${STUFEN_REIHE.map(s => `<button type="button" class="stufe-btn${stand.stufe[id] === s ? ' an' : ''}" data-thema="${id}" data-stufe="${s}" role="radio" aria-checked="${stand.stufe[id] === s}">${STUFEN[s]}</button>`).join('')}
      </div>`;
    box.appendChild(el);
  }
}
$('themen').addEventListener('click', e => {
  const sb = e.target.closest('.stufe-btn');
  if (sb) {
    stand.stufe[sb.dataset.thema] = sb.dataset.stufe;
    speichern();
    Ton.tipp();
    themenZeichnen();
    return;
  }
  const st = e.target.closest('.thema-start');
  if (st) trainingStarten(st.dataset.thema, stand.stufe[st.dataset.thema]);
});

function trainingStarten(thema, stufe, still) {
  audio();
  const gleich = A && A.thema === thema && A.stufe === stufe && !A.geloest;
  sitzung.thema = thema;
  sitzung.stufe = stufe;
  stand.stufe[thema] = stufe;
  speichern();
  zeigeBildschirm('training');
  kopfZeigen();
  if (gleich) {
    // dieselbe offene Aufgabe weiterrechnen
    sag(zieh('neue_aufgabe'));
    return;
  }
  sitzung.nr = 0;
  serie = 0;
  vorschlagGemacht = { hoch: false, runter: false };
  hochZaehler = 0; runterZaehler = 0;
  neueAufgabe(true);
  if (still) return;
  const teile = [zieh('thema_' + thema)];
  if (stufe === 'hard' && Math.random() < 0.6) teile.push(zieh('start_schwer'));
  if (!stand.ersteTraining) { teile.push(TEXTE.erstes_training[0]); stand.ersteTraining = true; speichern(); }
  sagMehr(teile);
}

function zurLichtung() {
  Stimme.stopp();
  notizZu();
  $('stufenMenue').hidden = true;
  zeigeBildschirm('lichtung');
  themenZeichnen();
  kopfZeigen();
  sag(zieh('lichtung'));
}

/* ---------- Kopfzeile ---------- */
function kopfZeigen() {
  $('aepfelN').textContent = stand.aepfel;
  if ($('kasseN')) $('kasseN').textContent = stand.aepfel;
  const h = heuteGeloest(), z = stand.ziel;
  $('zielN').textContent = Math.min(h, z) + '/' + z;
  $('zielRing').style.strokeDashoffset = (88 * (1 - Math.min(1, h / z))).toFixed(1);
  $('ziel').classList.toggle('geschafft', h >= z);
  $('ziel').title = `Tagesziel: ${z} Aufgaben (heute ${h} gelöst)`;
  const r = rangVon(stand.gesamt), nr = RAENGE.indexOf(r), naechster = RAENGE[nr + 1];
  $('rangNr').textContent = nr + 1;
  $('rangName').textContent = r.name;
  $('rangBalken').style.width = (naechster ? clamp((stand.gesamt - r.ab) / (naechster.ab - r.ab), 0, 1) * 100 : 100) + '%';
  $('rang').setAttribute('aria-label', `Rang ${nr + 1}: ${r.name}`);
  const th = THEMEN[sitzung.thema];
  $('themaIcon').querySelector('use').setAttribute('href', '#' + th.icon);
  $('themaName').textContent = th.name;
  $('stufeName').textContent = STUFEN[sitzung.stufe];
  serieZeigen();
  $('albumNeu').hidden = !neuImAlbum;
  const leistbar = Object.entries(ITEMS).some(([k, it]) => !stand.items.includes(k) && it.preis <= stand.aepfel);
  $('garderobeNeu').hidden = !leistbar;
}
function serieZeigen() {
  $('serie').hidden = serie < 2 || bildschirm !== 'training';
  $('serieN').textContent = serie;
  $('serie').classList.toggle('heiss', serie >= 5);
}
const rangVon = gesamt => RAENGE.filter(r => gesamt >= r.ab).pop();
function zaehlerHuepft(id) {
  const k = $(id);
  k.classList.remove('bump');
  void k.offsetWidth;
  k.classList.add('bump');
}

/* =====================================================================
   TRAINING: eine Aufgabe nach der anderen
   ===================================================================== */
let A = null;           // die aktuelle Aufgabe mit allem, was dazugehört
let serie = 0;          // richtig hintereinander, ohne Fehler
let hochZaehler = 0, runterZaehler = 0, vorschlagGemacht = { hoch: false, runter: false };
let warteTimer = 0;
let neuImAlbum = false;
const BASIS = { easy: 3, medium: 4, hard: 5 };

function neueAufgabe(ersteDerRunde) {
  const t = Aufgaben.neue(sitzung.thema, sitzung.stufe);
  sitzung.nr++;
  A = {
    t, thema: sitzung.thema, stufe: sitzung.stufe,
    felder: t.answerType === 'fraction' ? [{ wert: '' }, { wert: '' }] : [{ wert: '' }],
    aktiv: 0, ueber: false,
    fehler: 0, tipps: 0, schritte: 0, loesungGezeigt: false, geloest: false, gewartet: false,
  };
  $('dock').classList.remove('fertig');
  $('loesungBtn').hidden = true;
  $('faktKarte').hidden = true;
  $('loesungsweg').hidden = true;
  $('loesungsweg').innerHTML = '';
  $('aufgabeNr').textContent = 'Aufgabe ' + sitzung.nr;
  notizLeeren();
  aufgabeZeichnen();
  belohnungZeigen();
  tastenZeigen();
  wachHalten();
  $('karte').scrollTop = 0;
  if (!ersteDerRunde && Math.random() < 0.3) sag(zieh('neue_aufgabe'));
  else if (!ersteDerRunde) blaseLeeren();
  // Was gleich gebraucht wird, schon mal holen
  if (TIPPS[t.hint]) Stimme.vorladen([sprechtext(TIPPS[t.hint])]);
}

function aufgabeZeichnen() {
  const t = A.t;
  $('frage').innerHTML = t.text || '';
  const feld = i => `<span class="feld" data-i="${i}" role="button" tabindex="0" aria-label="${A.t.answerType === 'fraction' ? (i ? 'Nenner' : 'Zähler') : 'Antwort'}"><span class="wert"></span><i class="caret"></i></span>`;
  let w;
  if (t.answerType === 'fraction') w = `<span class="antwort bruch" id="antwort"><span class="bruchfeld">${feld(0)}<span class="strich"></span>${feld(1)}</span></span>`;
  else w = `<span class="antwort" id="antwort">${feld(0)}${t.correctUnit ? `<span class="einheit">${esc(t.correctUnit)}</span>` : ''}</span>`;
  $('rechnung').innerHTML = (t.equation ? t.equation + ' ' : '<span class="antwort-label">Antwort:</span>') + w;
  felderZeigen();
}
function felderZeigen() {
  const box = $('antwort');
  if (!box) return;
  box.querySelectorAll('.feld').forEach((f, i) => {
    f.querySelector('.wert').textContent = A.felder[i].wert;
    f.classList.toggle('aktiv', i === A.aktiv && !A.geloest);
  });
}
function belohnungZeigen() {
  const n = belohnung();
  $('belohnungN').textContent = '+' + n;
  $('belohnung').classList.toggle('weniger', n < BASIS[A.stufe]);
}
// So viele Äpfel gibt die Aufgabe gerade: weniger mit Fehlern und Tipps, mindestens 1
function belohnung() {
  if (A.loesungGezeigt) return 1;
  return Math.max(1, BASIS[A.stufe] - A.fehler - A.tipps);
}
function tastenZeigen() {
  const bruch = A.t.answerType === 'fraction';
  document.querySelector('.taste.punkt').disabled = bruch;
  const b = document.querySelector('.taste.bruch');
  b.disabled = !bruch;
  const unten = bruch && A.aktiv === 1;
  b.querySelector('use').setAttribute('href', unten ? '#i-zaehler' : '#i-nenner');
  b.querySelector('span').textContent = unten ? 'Zähler' : 'Nenner';
  b.setAttribute('aria-label', unten ? 'Zum Zähler' : 'Zum Nenner');
}

/* ---------- Eingabe ---------- */
function ziffer(d) {
  if (!A || A.geloest) return;
  const f = A.felder[A.aktiv], bruch = A.t.answerType === 'fraction';
  if (A.ueber) { A.felder.forEach(x => { x.wert = ''; }); A.ueber = false; $('antwort').classList.remove('falsch'); }
  if (d === '.') {
    if (bruch || f.wert.includes('.')) return;
    f.wert = (f.wert || '0') + '.';
  } else {
    if (f.wert.replace('.', '').length >= (bruch ? 4 : 8)) return;
    if (f.wert === '0') f.wert = '';
    f.wert += d;
  }
  Ton.taste();
  felderZeigen();
  wachHalten();
}
function loeschen() {
  if (!A || A.geloest) return;
  if (A.ueber) { A.felder.forEach(x => { x.wert = ''; }); A.ueber = false; $('antwort').classList.remove('falsch'); felderZeigen(); return; }
  const f = A.felder[A.aktiv];
  if (!f.wert && A.aktiv === 1) { A.aktiv = 0; tastenZeigen(); felderZeigen(); return; }
  f.wert = f.wert.slice(0, -1);
  Ton.taste();
  felderZeigen();
}
function feldWechseln(i) {
  if (!A || A.geloest || A.t.answerType !== 'fraction') return;
  A.aktiv = i === undefined ? 1 - A.aktiv : i;
  if (A.ueber) { A.ueber = false; A.felder.forEach(x => { x.wert = ''; }); $('antwort').classList.remove('falsch'); }
  Ton.tipp();
  tastenZeigen();
  felderZeigen();
}

/* ---------- Prüfen ---------- */
function bewerten() {
  const t = A.t;
  if (t.answerType === 'fraction') {
    const zs = A.felder[0].wert, ns = A.felder[1].wert;
    const [cn, cd] = Aufgaben.simplify(t.correctNum, t.correctDen);
    if (!zs && !ns) return { art: 'leer' };
    if (!zs) return { art: 'zaehler_fehlt' };
    const z = parseInt(zs, 10);
    if (!ns) {
      // Ganze Zahl als Antwort ist erlaubt, wenn das Ergebnis ganz ist
      if (cd === 1) return z === cn ? { art: 'richtig' } : { art: 'falsch', z, n: 1 };
      return { art: 'nenner_fehlt' };
    }
    const n = parseInt(ns, 10);
    if (n === 0) return { art: 'nenner_null' };
    if (z * t.correctDen === t.correctNum * n) return Aufgaben.gcd(z, n) !== 1 ? { art: 'kuerzen', z, n } : { art: 'richtig' };
    return { art: 'falsch', z, n };
  }
  const ws = A.felder[0].wert;
  if (!ws || ws === '0.') return { art: 'leer' };
  const v = parseFloat(ws);
  return Math.abs(v - t.correctValue) < 0.005 ? { art: 'richtig' } : { art: 'falsch', v };
}
// Typische Verwechslungen gezielt ansprechen
function diagnose(r) {
  const t = A.t, d = t.diag || {};
  if (t.answerType === 'fraction' && r.n) {
    if ((t.kind === 'addDiff' || t.kind === 'addSame') && r.z === d.a + d.b && r.n === d.d1 + d.d2) return 'falsch_nenner_addiert';
    if (t.kind === 'divFrac' && r.z * d.d1 * d.d2 === d.a * d.b * r.n) return 'falsch_kehrwert';
    return null;
  }
  if (r.v === undefined) return null;
  const c = t.correctValue, nah = x => Math.abs(x - c) <= 1e-9 + 0.0005 * c;
  if ([10, 100, 1000].some(f => nah(r.v * f) || nah(r.v / f))) return 'falsch_einheit';
  if ((c >= 10 && Math.abs(r.v - c) <= 1) || Math.abs(r.v - c) / c <= 0.03) return 'falsch_knapp';
  return null;
}
function pruefen() {
  if (!A || A.geloest) return;
  const r = bewerten();
  const box = $('antwort');
  const hinweis = (name, feldNr) => {
    box.classList.remove('wackelt');
    void box.offsetWidth;
    box.classList.add('wackelt');
    if (feldNr !== undefined) { A.aktiv = feldNr; tastenZeigen(); felderZeigen(); }
    sag(zieh(name));
  };
  if (r.art === 'leer') return hinweis('falsch_leer', 0);
  if (r.art === 'zaehler_fehlt') return hinweis('falsch_zaehler_fehlt', 0);
  if (r.art === 'nenner_fehlt') return hinweis('falsch_nenner_fehlt', 1);
  if (r.art === 'nenner_null') return hinweis('nenner_null', 1);
  if (r.art === 'richtig') return geloest();

  // falsch (oder noch nicht gekürzt)
  A.fehler++;
  serie = 0;
  hochZaehler = 0;
  serieZeigen();
  ergebnisMerken(false, false);
  Ton.falsch();
  stimmung(dockSVG, 'oops', 1400);
  box.classList.remove('wackelt', 'pop');
  void box.offsetWidth;
  box.classList.add('wackelt', 'falsch');
  A.ueber = true;           // die nächste Ziffer ersetzt die falsche Antwort
  A.aktiv = 0;
  tastenZeigen();
  felderZeigen();
  belohnungZeigen();
  if (A.loesungGezeigt) { sag(zieh('falsch')); return; }
  if (r.art === 'kuerzen') { sag(zieh('falsch_kuerzen')); return; }
  if (A.fehler >= 3) { loesungZeigen(); return; }
  if (A.fehler === 2) $('loesungBtn').hidden = false;
  const diag = diagnose(r);
  if (diag) sag(zieh(diag));
  else sag(zieh(A.fehler === 1 || A.tipps > 0 ? 'falsch' : 'falsch_zweimal'));
}

/* ---------- Tipps und Lösungsweg ---------- */
function tipp() {
  if (!A || A.geloest) return;
  Ton.tipp();
  const steps = A.t.steps || [];
  if (A.tipps === 0 || (!steps.length && !A.loesungGezeigt)) {
    // Erster Tipp: was Pieks dazu weiss
    const tp = TIPPS[A.t.hint] || TIPPS.HD;
    if (A.tipps === 0) A.tipps = 1;
    belohnungZeigen();
    if (A.thema === 'volumen' || ['vUmrechnen', 'vMisch', 'volumenText'].includes(A.t.kind)) treppeZeigen();
    sagMehr([zieh('tipp_vor'), tp]);
    return;
  }
  // Weitere Tipps: ein Schritt des Lösungswegs mehr, aber nie das Ergebnis
  if (A.schritte < steps.length - 1 && !A.loesungGezeigt) {
    A.schritte++;
    A.tipps++;
    belohnungZeigen();
    wegZeigen(A.schritte, false);
    sag(zieh('tipp_schritt'));
    return;
  }
  sag(zieh('tipp_genug'));
}
function treppeZeigen() {
  const w = $('loesungsweg');
  if (w.querySelector('.liter-treppe')) return;
  const t = document.createElement('div');
  t.innerHTML = `<h3>Die Liter-Treppe</h3><div class="liter-treppe">
    <span class="stufe">hl</span><span class="pfeil">· 100 →</span><span class="stufe">l</span><span class="pfeil">· 10 →</span>
    <span class="stufe">dl</span><span class="pfeil">· 10 →</span><span class="stufe">cl</span><span class="pfeil">· 10 →</span><span class="stufe">ml</span></div>
    <div class="klein">Nach rechts (kleinere Einheit) mal, nach links durch.</div>`;
  w.prepend(t);
  w.hidden = false;
}
// Zeigt die ersten n Schritte; mitLoesung hängt das Ergebnis an
function wegZeigen(n, mitLoesung) {
  const w = $('loesungsweg'), steps = A.t.steps || [];
  w.querySelectorAll('.weg').forEach(x => x.remove());
  const box = document.createElement('div');
  box.className = 'weg';
  let html = `<h3>${mitLoesung ? (steps.length ? 'Lösungsweg' : 'Lösung') : n === 1 ? 'Erster Schritt' : 'Die ersten Schritte'}</h3>`;
  steps.slice(0, n).forEach(s => { html += `<div class="schritt"><span class="txt">${s.txt}</span><span class="math">${s.math}</span></div>`; });
  if (mitLoesung) html += `<div class="loesung-zeile">${steps.length ? 'Lösung: ' : ''}${loesungHTML()}</div>`;
  box.innerHTML = html;
  w.appendChild(box);
  w.hidden = false;
  if (mitLoesung) w.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
}
function loesungHTML() {
  const t = A.t;
  if (t.answerType === 'fraction') {
    const [n, d] = Aufgaben.simplify(t.correctNum, t.correctDen);
    return d === 1 ? String(n) : Aufgaben.fracHTML(n, d);
  }
  return zahlText(t.correctValue) + (t.correctUnit ? ' ' + esc(t.correctUnit) : '');
}
function loesungZeigen() {
  if (!A || A.geloest) return;
  A.loesungGezeigt = true;
  $('loesungBtn').hidden = true;
  runterZaehler++;
  belohnungZeigen();
  wegZeigen((A.t.steps || []).length, true);
  A.felder.forEach(x => { x.wert = ''; });
  A.ueber = false;
  A.aktiv = 0;
  $('antwort').classList.remove('falsch');
  tastenZeigen();
  felderZeigen();
  const gesagt = sag(zieh('loesung'));
  // Nach zwei Lösungen hintereinander eine leichtere Stufe anbieten, aber erst
  // wenn Pieks den Lösungsweg fertig angesagt hat
  if (runterZaehler >= 2 && sitzung.stufe !== 'easy' && !vorschlagGemacht.runter) {
    vorschlagGemacht.runter = true;
    const diese = A;
    gesagt.then(ganz => { if (ganz && A === diese && !A.geloest) stufeVorschlagen(-1); });
  }
}

// Nach einer Weile ohne Tippen bietet Pieks Hilfe an
function wachHalten() {
  clearTimeout(warteTimer);
  if (!A || A.geloest || A.gewartet || bildschirm !== 'training') return;
  warteTimer = setTimeout(function nachfragen() {
    if (!A || A.geloest || bildschirm !== 'training' || !$('fenster').hidden) return;
    // Erzählt Pieks gerade etwas, später nochmal schauen
    if (!Stimme.istStill()) { warteTimer = setTimeout(nachfragen, 5000); return; }
    A.gewartet = true;
    sag(zieh('warten'));
  }, 75000);
}

/* ---------- Geschafft ---------- */
function geloest() {
  const diese = A;
  A.geloest = true;
  clearTimeout(warteTimer);
  const ersterVersuch = A.fehler === 0 && !A.loesungGezeigt;
  ergebnisMerken(true, ersterVersuch);
  const box = $('antwort');
  box.classList.remove('wackelt', 'falsch');
  box.classList.add('richtig');
  void box.offsetWidth;
  box.classList.add('pop');
  felderZeigen();
  Ton.richtig();
  stimmung(dockSVG, 'froh', 1600);
  $('loesungBtn').hidden = true;

  // Zählen
  const vorher = { rang: rangVon(stand.gesamt), heute: heuteGeloest() - 1 };
  const aepfel = belohnung();
  stand.geloest[A.t.topic] = (stand.geloest[A.t.topic] || 0) + 1;
  if (A.stufe === 'hard') stand.schwer++;
  if (ersterVersuch) { serie++; if (A.tipps === 0) hochZaehler++; runterZaehler = 0; } else { serie = 0; hochZaehler = 0; }
  if (!A.loesungGezeigt && A.fehler < 3) runterZaehler = 0;
  stand.besterLauf = Math.max(stand.besterLauf, serie);
  const serieBonus = { 5: 5, 10: 10, 15: 10, 20: 15, 25: 15, 30: 20, 40: 25, 50: 30 }[serie] || 0;
  const zielJetzt = vorher.heute < stand.ziel && vorher.heute + 1 >= stand.ziel;
  stand.nachRichtig++;
  const erfolgsKontext = { durchhalten: A.fehler >= 2 && !A.loesungGezeigt, stunde: new Date().getHours(), ziel: zielJetzt };
  if (zielJetzt) stand.zielTage[heuteKey()] = true;
  apfelDazu(aepfel + serieBonus + (zielJetzt ? 15 : 0), box);
  const neueErfolge = pruefeErfolge(erfolgsKontext);
  const rangNeu = rangVon(stand.gesamt) !== vorher.rang;
  speichern();
  serieZeigen();

  // «Weiter» erst nach einem Moment, damit ein Doppeltipp die Feier nicht überspringt
  setTimeout(() => { if (A === diese) $('dock').classList.add('fertig'); }, 450);
  feiern(diese, { ersterVersuch, serieBonus, zielJetzt, rangNeu, neueErfolge });
}

// Nacheinander: Lob, Serie, Tagesziel, Rang, Erfolge, Vorschlag, Fakt.
// Geht es vorher weiter, hört die Feier einfach auf.
async function feiern(diese, f) {
  const gilt = () => A === diese && bildschirm === 'training';
  let lob;
  if (diese.loesungGezeigt) lob = zieh('richtig_nachloesung');
  else if (diese.fehler > 0) lob = zieh('richtig_nachfehler');
  else if (diese.stufe === 'hard' && Math.random() < 0.3) lob = zieh('richtig_schwer');
  else lob = zieh('richtig');
  if (!(await sag(lob)) || !gilt()) return;
  if (SERIE[serie]) {
    Ton.serie();
    if (!(await meldung(symbolHTML('flamme'), serie + ' in Folge!', f.serieBonus ? `+${f.serieBonus} Bonus-Äpfel` : 'Weiter so!', [sprechtext(SERIE[serie])])) || !gilt()) return;
  }
  if (f.zielJetzt) {
    Ton.ziel();
    konfetti();
    if (!(await meldung(symbolHTML('pokal'), 'Tagesziel geschafft!', '+15 Äpfel', [sprechtext(zieh('tagesziel'))])) || !gilt()) return;
  }
  if (f.rangNeu) {
    if (!(await rangMelden()) || !gilt()) return;
  }
  for (const id of f.neueErfolge) {
    if (!(await erfolgMelden(id)) || !gilt()) return;
  }
  // Zu leicht? Dann die nächste Stufe anbieten
  if (hochZaehler >= 8 && sitzung.stufe !== 'hard' && !vorschlagGemacht.hoch) {
    vorschlagGemacht.hoch = true;
    await stufeVorschlagen(1);
    return;
  }
  if (stand.nachRichtig >= 3) {
    stand.nachRichtig = 0;
    speichern();
    await pause(250);
    if (!gilt()) return;
    faktErzaehlen();
  }
}

function weiter() {
  if (!A || !A.geloest || !$('dock').classList.contains('fertig')) return;
  Stimme.stopp();
  neueAufgabe();
}

// Bietet eine andere Stufe an: Knöpfe in der Sprechblase
function stufeVorschlagen(richtung) {
  const neu = STUFEN_REIHE[STUFEN_REIHE.indexOf(sitzung.stufe) + richtung];
  if (!neu) return Promise.resolve(true);
  const e = zieh(richtung > 0 ? 'vorschlag_hoch' : 'vorschlag_runter');
  const html = esc(anzeigetext(e)) + `<span class="knopf-zeile"><button type="button" class="mini" data-stufe="${neu}">Ja, ${STUFEN[neu]}!</button><button type="button" class="mini leise" data-stufe="">Nein, weiter so</button></span>`;
  return ansage(html, [sprechtext(e)]);
}
document.addEventListener('click', e => {
  const b = e.target.closest('.blase .mini');
  if (!b) return;
  e.stopPropagation();
  if (b.dataset.stufe) stufeWechseln(b.dataset.stufe);
  else { Stimme.stopp(); blaseLeeren(); }
}, true);
function stufeWechseln(neu, thema) {
  $('stufenMenue').hidden = true;
  Ton.tipp();
  trainingStarten(thema || sitzung.thema, neu, true);
  sag(zieh('stufe_gewechselt'));
}

/* =====================================================================
   BELOHNUNGEN: Äpfel, Ränge, Erfolge, Fakten
   ===================================================================== */
function apfelDazu(n, von) {
  if (n <= 0) return;
  stand.aepfel += n;
  stand.gesamt += n;
  const zielEl = $('apfelZiel');
  const a = von && von.getBoundingClientRect(), z = zielEl.getBoundingClientRect();
  const anzeigen = () => { $('aepfelN').textContent = stand.aepfel; zaehlerHuepft('aepfel'); kopfZeigen(); };
  if (!a || !a.width || reduce || !z.width) { anzeigen(); return; }
  plusText('+' + n, a.left + a.width / 2, a.top);
  const fliegen = Math.min(n, 6);
  let angekommen = 0;
  for (let i = 0; i < fliegen; i++) {
    const f = document.createElementNS(SVGNS, 'svg');
    f.setAttribute('viewBox', '0 0 40 40');
    f.innerHTML = '<use href="#apfel"/>';
    const x0 = a.left + a.width / 2 - 14 + rnd(-30, 30), y0 = a.top + a.height / 2 - 14 + rnd(-14, 14);
    Object.assign(f.style, { position: 'fixed', left: x0 + 'px', top: y0 + 'px', width: '28px', height: '28px', zIndex: 26, pointerEvents: 'none' });
    document.body.appendChild(f);
    const dx = z.left + z.width / 2 - (x0 + 14), dy = z.top + z.height / 2 - (y0 + 14);
    f.animate([
      { transform: 'translate(0,0) scale(.4)', opacity: 0 },
      { transform: `translate(${dx * 0.2}px, ${dy * 0.2 - 60}px) scale(1.2)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(.8)`, opacity: 1 },
    ], { duration: 800, delay: i * 90, easing: 'ease-in-out', fill: 'both' }).onfinish = () => {
      f.remove();
      Ton.apfel(angekommen++);
      if (angekommen === fliegen) anzeigen();
    };
  }
  setTimeout(anzeigen, 800 + fliegen * 90 + 400);
}
function plusText(t, x, y) {
  if (reduce) return;
  const el = document.createElement('div');
  el.className = 'plus-text';
  el.textContent = t;
  Object.assign(el.style, { left: x + 'px', top: y + 'px' });
  $('fx').appendChild(el);
  el.animate([{ transform: 'translate(-50%, 0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%, -30px) scale(1.15)', opacity: 1, offset: 0.25 }, { transform: 'translate(-50%, -70px)', opacity: 0 }],
    { duration: 1400, easing: 'ease-out', fill: 'both' }).onfinish = () => el.remove();
}
function konfetti() {
  if (reduce) return;
  const fx = $('fx');
  const arten = ['apfel', 'blatt-ahorn', 'blatt-eiche', 'stern', 'apfel'];
  for (let i = 0; i < 34; i++) {
    const s = document.createElementNS(SVGNS, 'svg');
    const art = pick(arten);
    s.setAttribute('viewBox', '0 0 40 40');
    s.innerHTML = `<use href="#${art}" color="${pick(['#E8742B', '#D9432F', '#F2B33D', '#5DAA45'])}"/>`;
    const size = rnd(18, 34);
    s.style.width = s.style.height = size + 'px';
    s.style.left = (Math.random() * 100) + 'vw';
    fx.appendChild(s);
    s.animate([
      { transform: 'translate(0, -60px) rotate(0deg)' },
      { transform: `translate(${rnd(-80, 80)}px, calc(100vh + 60px)) rotate(${rnd(-400, 400)}deg)` },
    ], { duration: rnd(1800, 3200), delay: rnd(0, 500), easing: 'cubic-bezier(.35,.1,.6,1)', fill: 'both' }).onfinish = () => s.remove();
  }
}
const symbolHTML = (id, vb = '0 0 40 40') => `<svg viewBox="${vb}"><use href="#${id}"/></svg>`;

// Kleine Meldung oben, die Pieks vorliest. Erfüllt sich mit false, wenn
// eine andere Ansage dazwischenkam.
let meldungLaeuft = Promise.resolve();
function meldung(icon, titel, text, saetze) {
  const p = meldungLaeuft.then(async () => {
    $('toastIc').innerHTML = icon;
    $('toastT').textContent = titel;
    $('toastS').textContent = text;
    $('toast').classList.add('zeigen');
    const start = Date.now();
    const ganz = await Stimme.sprechen(saetze, { svg: ziel.svg });
    if (ganz) await pause(Math.max(0, 2200 - (Date.now() - start)));
    $('toast').classList.remove('zeigen');
    if (ganz) await pause(400);
    return ganz;
  });
  meldungLaeuft = p.catch(() => {});
  return p;
}
async function rangMelden() {
  const r = rangVon(stand.gesamt);
  Ton.rang();
  konfetti();
  return meldung(symbolHTML('stern'), 'Rang ' + (RAENGE.indexOf(r) + 1) + ': ' + r.name, 'Neuer Rang!', [sprechtext(zieh('rang_vor')), sprechtext(r.name + '!')]);
}
async function erfolgMelden(id) {
  const e = ERFOLGE[id];
  Ton.erfolg();
  return meldung(symbolHTML('pokal'), e.name, e.text + (e.bonus ? ` +${e.bonus} Äpfel` : ''), [sprechtext(zieh('erfolg_vor')), sprechtext(e.name + '!')]);
}

// Prüft alle Erfolge; neue werden gespeichert und bringen Bonus-Äpfel
function pruefeErfolge(k = {}) {
  const neu = [];
  const total = alleGeloest(), tage = tageSerie(), tiere = Object.keys(stand.besucher).length;
  const bed = {
    erste: total >= 1, serie5: serie >= 5, serie10: serie >= 10, serie20: serie >= 20,
    auf50: total >= 50, auf200: total >= 200, auf500: total >= 500, auf1000: total >= 1000,
    alle3: stand.geloest.brueche > 0 && stand.geloest.volumen > 0 && stand.geloest.dreisatz > 0,
    bruch50: stand.geloest.brueche >= 50, liter50: stand.geloest.volumen >= 50, drei50: stand.geloest.dreisatz >= 50,
    schwer25: stand.schwer >= 25, durchhalten: !!k.durchhalten, ziel: !!k.ziel || Object.keys(stand.zielTage).length > 0,
    tage3: tage >= 3, tage7: tage >= 7,
    nachteule: k.stunde !== undefined && k.stunde >= 19, frueh: k.stunde !== undefined && k.stunde < 8,
    tiere5: tiere >= 5, selten: !!(stand.besucher.ufo || stand.besucher.goldkaefer),
    tiereAlle: tiere >= Object.keys(BESUCHER).length,
    fakten50: stand.fakten.length >= 50, fakten200: stand.fakten.length >= 200,
    mode: stand.items.length >= 1, modeAlle: stand.items.length >= Object.keys(ITEMS).length,
    kitzel: !!k.kitzel,
  };
  for (const id of Object.keys(ERFOLGE)) {
    if (stand.erfolge[id] || !bed[id]) continue;
    stand.erfolge[id] = Date.now();
    neu.push(id);
    if (ERFOLGE[id].bonus) { stand.aepfel += ERFOLGE[id].bonus; stand.gesamt += ERFOLGE[id].bonus; }
  }
  if (neu.length) { speichern(); kopfZeigen(); }
  return neu;
}
// Erfolge, die ausserhalb einer Aufgabe passieren (Tiere, Kaufen, Kitzeln).
// Gezählt wird sofort, gemeldet erst, wenn Pieks fertig gesprochen hat.
async function erfolgeNebenbei(k, nach) {
  const neu = pruefeErfolge(k);
  if (!neu.length) return;
  const ganz = nach ? await nach : true;
  if (ganz === false) return;   // unterbrochen: die Meldung kommt nicht mehr, der Erfolg zählt trotzdem
  for (const id of neu) if (!(await erfolgMelden(id))) return;
}

/* ---------- Fakten ---------- */
const FAKT_ID = new Map();   // Fakt → Kennung (über den gesprochenen Text)
const faktId = f => { if (!FAKT_ID.has(f)) FAKT_ID.set(f, kennung(sprechtext(f))); return FAKT_ID.get(f); };
let letzteKat = '';
// Welche Aufnahmen es gibt (make-audio.mjs schreibt die Liste). Solange noch
// nicht alle Fakten vertont sind, kommen zuerst die mit Ton.
let aufnahmen = null;
fetch('audio/vorhanden.json').then(r => (r.ok ? r.json() : null)).then(l => { if (Array.isArray(l)) aufnahmen = new Set(l); }).catch(() => {});
// Keiner doppelt, bis alle erzählt sind; möglichst nicht zweimal dieselbe Kategorie
function naechsterFakt() {
  const gesehen = new Set(stand.fakten);
  let frei = FAKTEN.filter(f => !gesehen.has(faktId(f)));
  if (!frei.length) { stand.fakten = []; frei = FAKTEN.slice(); }
  if (aufnahmen && stand.stimme) {
    const mitTon = frei.filter(f => aufnahmen.has(faktId(f)));
    if (mitTon.length) frei = mitTon;
  }
  const anders = frei.filter(f => f.k !== letzteKat);
  const f = pick(anders.length ? anders : frei);
  letzteKat = f.k;
  stand.fakten.push(faktId(f));
  speichern();
  return f;
}
function faktErzaehlen() {
  const f = naechsterFakt(), vor = zieh('fakt_vor'), kat = FAKT_KAT[f.k] || { name: 'Fakt', icon: '✨' };
  $('faktKat').innerHTML = `<span aria-hidden="true">${kat.icon}</span> ${esc(kat.name)} · ${stand.fakten.length} von ${FAKTEN.length}`;
  $('faktText').innerHTML = esc(anzeigetext(f));
  $('faktNeu').hidden = false;
  $('faktKarte').hidden = false;
  $('faktKarte').onclick = () => Stimme.sprechen([sprechtext(f)], { svg: ziel.svg });
  Ton.fakt();
  neuImAlbum = true;
  kopfZeigen();
  $('faktKarte').scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  ansage(esc(anzeigetext(vor)), [sprechtext(vor), sprechtext(f)]);
}

/* =====================================================================
   NOTIZBLOCK mit Häuschenpapier
   ===================================================================== */
const Notiz = (() => {
  const cv = $('notizCanvas'), ctx = cv.getContext('2d');
  let farbe = '#3A3A48', malt = false, letzter = null, dpr = 1;
  function groesse() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    const alt = cv.width ? ctx.getImageData(0, 0, cv.width, cv.height) : null;
    dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    if (alt) ctx.putImageData(alt, 0, 0);
  }
  const punkt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr }; };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    malt = true;
    letzter = punkt(e);
    strich(letzter, letzter, e);
  });
  cv.addEventListener('pointermove', e => {
    if (!malt) return;
    const p = punkt(e);
    strich(letzter, p, e);
    letzter = p;
  });
  const ende = () => { malt = false; letzter = null; };
  cv.addEventListener('pointerup', ende);
  cv.addEventListener('pointercancel', ende);
  function strich(a, b, e) {
    const radierer = farbe === 'radierer';
    ctx.globalCompositeOperation = radierer ? 'destination-out' : 'source-over';
    ctx.strokeStyle = radierer ? '#000' : farbe;
    const druck = e.pressure && e.pointerType === 'pen' ? 0.6 + e.pressure : 1;
    ctx.lineWidth = (radierer ? 26 : 3.4) * dpr * druck;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x + 0.01, b.y + 0.01);
    ctx.stroke();
  }
  document.querySelectorAll('.stift').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.stift').forEach(x => x.classList.toggle('aktiv', x === b));
    farbe = b.dataset.farbe;
  }));
  return { groesse, leeren: () => ctx.clearRect(0, 0, cv.width, cv.height) };
})();
function notizAuf() {
  $('notiz').hidden = false;
  $('buehne').classList.add('mit-notiz');
  $('notizBtn').classList.add('an');
  requestAnimationFrame(Notiz.groesse);
}
function notizZu() {
  $('notiz').hidden = true;
  $('buehne').classList.remove('mit-notiz');
  $('notizBtn').classList.remove('an');
}
function notizLeeren() { Notiz.leeren(); }

/* =====================================================================
   BESUCH: Ab und zu läuft ein Tier über die Wiese oder fliegt vorbei.
   Tippt Nea es an, reagiert es, und Pieks sagt etwas dazu. Neue Tiere
   kommen ins Album.
   ===================================================================== */
const BESUCHER_TECH = {
  fuchs: { klasse: 'geher', tempo: 1.4, groesse: 1 },
  eichhoernchen: { klasse: 'hopser', tempo: 1.6, groesse: 0.95 },
  dachs: { klasse: 'geher', tempo: 0.8, groesse: 0.85 },
  schnecke: { klasse: 'kriecher', tempo: 0.12, groesse: 0.55 },
  igelkind: { klasse: 'geher', tempo: 0.9, groesse: 0.6 },
  maus: { klasse: 'geher', tempo: 2.4, groesse: 0.42 },
  frosch: { klasse: 'hopser', tempo: 1.1, groesse: 0.55 },
  kaefer: { klasse: 'geher', tempo: 0.5, groesse: 0.4 },
  goldkaefer: { klasse: 'geher', tempo: 0.7, groesse: 0.42 },
  maulwurf: { klasse: 'huegel', groesse: 0.72 },
  eule: { klasse: 'flieger', tempo: 1.2, groesse: 0.9 },
  fledermaus: { klasse: 'flieger', tempo: 1.9, groesse: 0.7 },
  rotkehlchen: { klasse: 'flieger', tempo: 1.6, groesse: 0.5 },
  marienkaefer: { klasse: 'flieger', tempo: 0.7, groesse: 0.36 },
  schmetterling: { klasse: 'flieger flatter-tier', tempo: 0.8, groesse: 0.45 },
  gaense: { klasse: 'flieger', tempo: 1.3, groesse: 1.3 },
  gluehwuermchen: { klasse: 'flieger', tempo: 0.4, groesse: 0.9 },
  drache: { klasse: 'flieger drache', tempo: 0.6, groesse: 1.3 },
  ufo: { klasse: 'flieger ufo', tempo: 2.2, groesse: 0.9 },
};
function besucherMoeglich(id, d = new Date()) {
  const b = BESUCHER[id];
  if (b.zeit && !b.zeit.includes(tageszeit(d))) return false;
  if (b.monate && !b.monate.includes(d.getMonth() + 1)) return false;
  return true;
}
function besucherHinweis(id) {
  const b = BESUCHER[id];
  if (b.selten) return 'Sehr selten! Augen offen halten.';
  const teile = [];
  if (b.zeit) {
    const z = b.zeit;
    if (z.length === 2 && z.includes('abend') && z.includes('nacht')) teile.push('Kommt nur abends und nachts.');
    else if (!z.includes('nacht') && !z.includes('abend')) teile.push('Kommt nur tagsüber.');
    else if (z.length === 1 && z[0] === 'tag') teile.push('Kommt nur tagsüber.');
    else if (!z.includes('nacht')) teile.push('Kommt nicht in der Nacht.');
  }
  if (b.monate) {
    const m = b.monate;
    if (m.join() === '6,7,8') teile.push('Nur im Sommer.');
    else if (m.join() === '9,10,11') teile.push('Nur im Herbst.');
    else if (m.join() === '2,3,4,9,10,11') teile.push('Im Frühling und im Herbst.');
    else teile.push('Nicht im Winter.');
  }
  return teile.join(' ') || 'Kommt ab und zu vorbei.';
}

const Besuch = (() => {
  const himmel = $('besuchHimmel');
  let timer = 0, letzter = '';
  const unterwegs = { boden: null, himmel: null };
  const spurVon = id => (BESUCHER[id].spur === 'himmel' ? 'himmel' : 'boden');
  const boden = () => (bildschirm === 'training' ? $('bodenTraining') : $('bodenHome'));
  // Wie echte Tiere: meist eine Weile nichts, manchmal zwei kurz nacheinander
  const wartezeit = mittel => clamp(-Math.log(1 - Math.random()) * mittel, 4000, 120000);
  function planen(ms) {
    clearTimeout(timer);
    if (reduce) return;
    timer = setTimeout(() => kommen(), ms !== undefined ? ms : wartezeit(38000));
  }
  function kommen(wunsch) {
    if (document.hidden || !$('fenster').hidden || !$('start').hidden || !$('pwOvl').hidden) { planen(wartezeit(12000)); return; }
    const b = boden();
    const bodenOk = b && b.offsetParent && b.clientHeight >= 46;
    const frei = Object.keys(BESUCHER).filter(k => k !== letzter && besucherMoeglich(k) && !unterwegs[spurVon(k)] && (spurVon(k) === 'himmel' || bodenOk));
    // Seltene Besucher nur ab und zu
    const kandidaten = frei.filter(k => !BESUCHER[k].selten || Math.random() < 0.07);
    const id = BESUCHER[wunsch] ? wunsch : kandidaten.length ? pick(kandidaten) : null;
    if (!id) { planen(wartezeit(15000)); return; }
    letzter = id;
    if (BESUCHER[id].spur === 'huegel') huegel(id, b);
    // Im Training verdeckt die Karte den Himmel: dort fliegen sie über der Wiese
    else if (BESUCHER[id].spur === 'himmel') ziehen(id, bildschirm === 'training' && bodenOk ? b : himmel, true);
    else ziehen(id, b, false);
    planen();
    // Beim ersten Tier erklärt Pieks, dass man es antippen kann. Spricht er gerade,
    // wartet der Hinweis aufs nächste Tier, statt ihm ins Wort zu fallen.
    if (!stand.ersterBesuch && !A?.geloest) {
      setTimeout(() => {
        if (stand.ersterBesuch || !Stimme.istStill() || !$('fenster').hidden) return;
        stand.ersterBesuch = true;
        speichern();
        sag(TEXTE.erster_besuch[0]);
      }, 1200);
    }
  }
  function element(id, w, h) {
    const art = BESUCHER_ART[id], tech = BESUCHER_TECH[id];
    const el = document.createElement('div');
    el.className = `besucher ${id} ${tech.klasse}`;
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.innerHTML = `<div class="huepf"><div class="dreh"><svg viewBox="${art.vb}">${art.svg}</svg></div></div>`;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', BESUCHER[id].name);
    return el;
  }
  function ziehen(id, ebene, fliegt) {
    const art = BESUCHER_ART[id], tech = BESUCHER_TECH[id];
    const tempo = (BESUCHER[id].tempo || tech.tempo) * (0.85 + Math.random() * 0.3);
    const [, , vbW, vbH] = art.vb.split(' ').map(Number);
    const W = ebene.clientWidth, H = ebene.clientHeight;
    const imHimmel = ebene === himmel;
    const basis = fliegt ? clamp((imHimmel ? innerHeight : H) * 0.13, 34, 80) : clamp(H * 0.82, 40, 104);
    const h = basis * tech.groesse * (0.9 + Math.random() * 0.12), w = h * vbW / vbH;
    const vonLinks = Math.random() < 0.5;
    const el = element(id, w, h);
    if (!vonLinks) el.classList.add('links');
    // Lichtung: im Himmelsstreifen über den Karten. Training: oben über der Wiese.
    if (imHimmel) el.style.top = Math.round(rnd(9, 20) / 100 * innerHeight) + 'px';
    else if (fliegt) el.style.top = Math.round(Math.max(4, Math.random() * (H * 0.55 - h))) + 'px';
    else el.style.bottom = '4px';
    ebene.appendChild(el);
    const von = vonLinks ? -w - 20 : W + 20, bis = vonLinks ? W + 20 : -w - 20;
    const lauf = el.animate([{ transform: `translateX(${von}px)` }, { transform: `translateX(${bis}px)` }],
      { duration: (W + w + 40) / (tempo * basis) * 1000, easing: 'linear', fill: 'forwards' });
    const spur = fliegt ? 'himmel' : 'boden';
    const b = (unterwegs[spur] = { id, el, lauf, ebene, fliegt, zuletzt: 0, belohnt: false });
    lauf.onfinish = () => { el.remove(); if (unterwegs[spur] === b) unterwegs[spur] = null; };
    el.addEventListener('pointerdown', e => { e.preventDefault(); reagieren(b); });
  }
  // Der Maulwurf läuft nicht, er schaut aus seinem Hügel
  function huegel(id, ebene) {
    const art = BESUCHER_ART[id], tech = BESUCHER_TECH[id];
    const [, , vbW, vbH] = art.vb.split(' ').map(Number);
    const h = clamp(ebene.clientHeight * 0.9, 44, 100) * tech.groesse, w = h * vbW / vbH;
    const el = element(id, w, h);
    el.style.bottom = '0';
    el.style.left = rnd(8, 80) + '%';
    ebene.appendChild(el);
    const b = (unterwegs.boden = { id, el, lauf: null, ebene, fliegt: false, zuletzt: 0, belohnt: false });
    const weg = () => { el.classList.remove('raus'); setTimeout(() => { el.remove(); if (unterwegs.boden === b) unterwegs.boden = null; }, 600); };
    el.animate([{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'scaleY(1)' }], { duration: 500, fill: 'both', easing: 'ease-out' });
    setTimeout(() => el.classList.add('raus'), 700);
    b.weg = weg;
    b.timer = setTimeout(weg, 9000);
    el.addEventListener('pointerdown', e => { e.preventDefault(); reagieren(b); });
  }
  const hops = (ziel, wie, mal = 1, ms = 420) => ziel.animate(
    [{ transform: 'translateY(0)' }, { transform: `translateY(-${wie})`, offset: 0.4 }, { transform: 'translateY(0)' }],
    { duration: ms, iterations: mal, easing: 'ease-out' });
  function reagieren(b) {
    const jetzt = Date.now();
    if (jetzt - b.zuletzt < 1000) return;
    b.zuletzt = jetzt;
    const info = BESUCHER[b.id], neu = !stand.besucher[b.id];
    // Sätze und Fakten im Wechsel
    const pool = info.saetze.concat(info.fakten);
    b.zeile = b.zeile === undefined ? (neu ? 0 : rnd(0, pool.length - 1)) : (b.zeile + 1) % pool.length;
    const satz = pool[b.zeile];
    let plus = 0;
    if (neu) {
      stand.besucher[b.id] = Date.now();
      plus = info.aepfel || 5;
      neuImAlbum = true;
    } else if (!b.belohnt) plus = 1;
    b.belohnt = true;
    const teile = [satz];
    if (neu) teile.push(TEXTE.album_neu[0]);
    const gesagt = sagMehr(teile);
    etikett(b, esc(info.name) + (plus ? ` <span class="plus">+${plus}</span>` : '') + (neu ? ' · Neu!' : ''));
    herzen(b);
    if (plus) apfelDazu(plus, b.el);
    speichern();
    if (neu) { kopfZeigen(); erfolgeNebenbei({}, gesagt); }
    reaktion(b);
  }
  function reaktion(b) {
    const huepf = b.el.querySelector('.huepf'), svg = b.el.querySelector('svg');
    const anhalten = ms => {
      if (!b.lauf) return;
      b.lauf.pause();
      b.el.classList.add('steht');
      setTimeout(() => { b.el.classList.remove('steht'); if (b.lauf.playState === 'paused') b.lauf.play(); }, ms);
    };
    const rate = r => { if (b.lauf) b.lauf.playbackRate = r; };
    switch (b.id) {
      case 'fuchs': Ton.klaeff(); hops(huepf, '70%', 1, 700); break;
      case 'eichhoernchen': Ton.keckern(); anhalten(900); setTimeout(() => rate(3), 900); break;
      case 'dachs': Ton.grunz(); anhalten(1600); break;
      case 'schnecke': Ton.plopp(); b.el.classList.add('versteckt'); anhalten(2600); setTimeout(() => b.el.classList.remove('versteckt'), 2400); break;
      case 'igelkind': Ton.quiek(); hops(huepf, '35%', 2); rate(2); break;
      case 'maus': Ton.piepsen(); hops(huepf, '60%'); rate(2.6); break;
      case 'frosch': Ton.quaak(); hops(huepf, '90%', 1, 650); rate(1.8); break;
      case 'kaefer':
        Ton.brumm(); anhalten(1500);
        svg.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(180deg)', offset: 0.3 }, { transform: 'rotate(180deg)', offset: 0.7 }, { transform: 'rotate(360deg)' }], { duration: 1500, easing: 'ease-in-out' });
        break;
      case 'goldkaefer': Ton.schatz(); konfetti(); rate(2.5); break;
      case 'maulwurf': Ton.plopp(); clearTimeout(b.timer); b.weg(); break;
      case 'eule': Ton.huhu(); b.el.classList.add('dreht-kopf'); setTimeout(() => b.el.classList.remove('dreht-kopf'), 1500); break;
      case 'fledermaus': case 'rotkehlchen':
        (b.id === 'fledermaus' ? Ton.fiep : Ton.zwitscher)();
        svg.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-360deg)' }], { duration: 800, easing: 'ease-in-out' });
        rate(1.6);
        break;
      case 'marienkaefer': Ton.summ(); svg.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(720deg) scale(1.3)' }, { transform: 'rotate(720deg) scale(1)' }], { duration: 1000 }); break;
      case 'schmetterling': case 'gluehwuermchen':
        Ton.glitzer();
        huepf.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-120%)' }], { duration: 1400, easing: 'ease-out', fill: 'forwards' });
        rate(1.6);
        break;
      case 'gaense': Ton.hupen(); hops(huepf, '15%', 2, 500); break;
      case 'drache': Ton.wusch(); svg.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 1200, easing: 'ease-in-out' }); break;
      case 'ufo': {
        Ton.ufo();
        const s = b.el.querySelector('.strahl');
        if (s) s.animate([{ opacity: 0 }, { opacity: 0.8 }, { opacity: 0 }], { duration: 1400 });
        setTimeout(() => rate(6), 1300);
        break;
      }
    }
  }
  function etikett(b, html) {
    b.el.querySelectorAll('.etikett').forEach(x => x.remove());
    const e = document.createElement('div');
    e.className = 'etikett' + (b.fliegt ? ' unten' : '');
    e.innerHTML = html;
    b.el.appendChild(e);
    setTimeout(() => e.remove(), 2300);
  }
  function herzen(b) {
    if (reduce) return;
    const ebene = b.ebene, r = b.el.getBoundingClientRect(), o = ebene.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
      const s = document.createElementNS(SVGNS, 'svg');
      s.setAttribute('viewBox', '0 0 40 40');
      s.innerHTML = '<use href="#apfel"/>';
      Object.assign(s.style, { position: 'absolute', width: '20px', height: '20px', pointerEvents: 'none', left: (r.left - o.left + r.width * (0.3 + 0.2 * i) - 10) + 'px', top: (r.top - o.top) + 'px' });
      ebene.appendChild(s);
      s.animate([
        { transform: 'translateY(0) scale(.5)', opacity: 0 },
        { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: 0.2 },
        { transform: `translate(${rnd(-14, 14)}px, -56px) scale(.9)`, opacity: 0 },
      ], { duration: 1200, delay: i * 120, easing: 'ease-out', fill: 'both' }).onfinish = () => s.remove();
    }
  }
  // Beim Wechsel zwischen Lichtung und Training verschwinden die Läufer
  function platzWechsel() {
    for (const spur of ['boden', 'himmel']) {
      const b = unterwegs[spur];
      if (b && b.ebene !== himmel) { b.el.remove(); unterwegs[spur] = null; }
    }
  }
  return { start: () => planen(wartezeit(14000)), planen, kommen, platzWechsel };
})();

/* =====================================================================
   PIEKS ANTIPPEN: kitzeln, und nach fünfmal rollt er sich ein
   ===================================================================== */
let kitzelZeit = [], eingerollt = false;
function kitzeln(svg) {
  if (eingerollt || !svg) return;
  audio();
  const jetzt = Date.now();
  kitzelZeit = kitzelZeit.filter(t => jetzt - t < 7000).concat(jetzt);
  if (kitzelZeit.length >= 5) { kitzelZeit = []; einrollen(svg); return; }
  Ton.kitzeln();
  stimmung(svg, 'kitzel', 600);
  Stimme.einwurf([sprechtext(zieh('kitzeln'))], svg);
}
async function einrollen(svg) {
  eingerollt = true;
  Ton.einrollen();
  const platz = svg.parentElement, r = platz.getBoundingClientRect();
  const k = document.createElement('div');
  k.className = 'kugel-rollt';
  k.innerHTML = kugelSVG();
  const gr = Math.min(r.width, r.height) * 0.7;
  Object.assign(k.style, { left: r.left + (r.width - gr) / 2 + 'px', top: r.top + r.height - gr + 'px', width: gr + 'px', height: gr + 'px' });
  document.body.appendChild(k);
  svg.style.visibility = 'hidden';
  Stimme.einwurf([sprechtext(TEXTE.einrollen[0])], null);
  if (!reduce) {
    await k.animate([{ transform: 'translateX(0) rotate(0)' }, { transform: `translateX(${gr * 0.8}px) rotate(300deg)`, offset: 0.4 },
      { transform: `translateX(${-gr * 0.5}px) rotate(-120deg)`, offset: 0.75 }, { transform: 'translateX(0) rotate(0)' }], { duration: 2600, easing: 'ease-in-out' }).finished.catch(() => {});
  } else await pause(1500);
  k.remove();
  svg.style.visibility = '';
  stimmung(svg, 'froh', 1200);
  eingerollt = false;
  erfolgeNebenbei({ kitzel: true }, Stimme.einwurf([sprechtext(TEXTE.ausrollen[0])], svg));
}

/* =====================================================================
   FENSTER: Album, Garderobe, Erfolge, Eltern
   ===================================================================== */
let fensterArt = null;
function fensterAuf(art, tab) {
  fensterArt = art;
  $('fenster').hidden = false;
  $('fensterTabs').innerHTML = '';
  ({ album: albumZeigen, garderobe: garderobeZeigen, erfolge: erfolgeZeigen, eltern: elternZeigen })[art](tab);
}
function fensterZu() {
  $('fenster').hidden = true;
  fensterArt = null;
  zeigeBildschirm(bildschirm);
  kopfZeigen();
  if (bildschirm === 'lichtung') themenZeichnen();
}
$('fensterZu').addEventListener('click', () => { Stimme.stopp(); fensterZu(); });
$('fenster').addEventListener('click', e => { if (e.target === $('fenster')) { Stimme.stopp(); fensterZu(); } });
function tabs(liste, an, fn) {
  const box = $('fensterTabs');
  box.innerHTML = liste.map(([id, name]) => `<button type="button" class="tab${id === an ? ' an' : ''}" data-tab="${id}">${name}</button>`).join('');
  box.onclick = e => { const b = e.target.closest('.tab'); if (b) { Ton.tipp(); fn(b.dataset.tab); } };
}

/* ---------- Album ---------- */
const BESUCHER_REIHE = ['fuchs', 'eichhoernchen', 'dachs', 'igelkind', 'maus', 'maulwurf', 'schnecke', 'frosch', 'kaefer',
  'rotkehlchen', 'marienkaefer', 'schmetterling', 'gaense', 'drache', 'eule', 'fledermaus', 'gluehwuermchen', 'goldkaefer', 'ufo'];
function albumZeigen(tab = 'tiere') {
  $('fensterTitel').textContent = 'Sammelalbum';
  if (neuImAlbum) { neuImAlbum = false; kopfZeigen(); }
  const tiere = Object.keys(stand.besucher).length;
  tabs([['tiere', `Besucher ${tiere}/${BESUCHER_REIHE.length}`], ['fakten', `Fakten ${stand.fakten.length}/${FAKTEN.length}`]], tab, albumZeigen);
  const inhalt = $('fensterInhalt');
  if (tab === 'tiere') {
    inhalt.innerHTML = '<div class="raster">' + BESUCHER_REIHE.map(id => {
      const b = BESUCHER[id], art = BESUCHER_ART[id], da = !!stand.besucher[id];
      const nacht = b.zeit && !b.zeit.includes('tag') && !b.zeit.includes('morgen');
      return `<button type="button" class="sammel${da ? ' knopf' : ' zu'}${nacht ? ' nacht' : ''}" data-tier="${id}" ${da ? '' : 'disabled'}>
        ${b.selten ? '<span class="stempel">selten</span>' : ''}
        <span class="bild"><svg viewBox="${art.vb}">${art.svg}</svg></span>
        <span class="name">${da ? esc(b.name) : '???'}</span>
        <span class="info">${da ? 'Antippen zum Hören' : esc(besucherHinweis(id))}</span></button>`;
    }).join('') + '</div>';
    inhalt.onclick = e => {
      const k = e.target.closest('.sammel.knopf');
      if (!k) return;
      const b = BESUCHER[k.dataset.tier];
      Stimme.sprechen([sprechtext(pick(b.fakten))], { svg: null });
      k.querySelector('.info').textContent = anzeigetext(b.fakten[0]) + (b.fakten[1] ? ' ' + anzeigetext(b.fakten[1]) : '');
    };
    if (Math.random() < 0.5) Stimme.sprechen([sprechtext(zieh('album_auf'))], { svg: null });
    return;
  }
  // Fakten nach Kategorien
  const gesehen = new Set(stand.fakten);
  if (tab === 'fakten') {
    inhalt.innerHTML = '<div class="kat-liste">' + Object.entries(FAKT_KAT).map(([k, kat]) => {
      const alle = FAKTEN.filter(f => f.k === k), da = alle.filter(f => gesehen.has(faktId(f))).length;
      return `<button type="button" class="kat" data-kat="${k}"><span class="kat-ic" style="background:${kat.farbe}">${kat.icon}</span>
        <span style="flex:1"><b>${esc(kat.name)}</b><small>${da} von ${alle.length}</small><span class="mini-balken"><i style="width:${alle.length ? da / alle.length * 100 : 0}%"></i></span></span></button>`;
    }).join('') + '</div>';
    inhalt.onclick = e => { const k = e.target.closest('.kat'); if (k) { Ton.tipp(); albumZeigen('kat:' + k.dataset.kat); } };
    return;
  }
  const k = tab.slice(4), kat = FAKT_KAT[k];
  const alle = FAKTEN.filter(f => f.k === k);
  const da = alle.filter(f => gesehen.has(faktId(f)));
  inhalt.innerHTML = `<button type="button" class="zurueck-link" data-zurueck>← Alle Kategorien</button>
    <h3 style="margin:0 0 10px">${kat.icon} ${esc(kat.name)}: ${da.length} von ${alle.length}</h3>
    <div class="fakten-liste">${da.map(f => `<button type="button" class="fakt-eintrag" data-fakt="${FAKTEN.indexOf(f)}"><span class="play"><svg viewBox="0 0 24 24"><use href="#i-ton"/></svg></span><span>${esc(anzeigetext(f))}</span></button>`).join('')}
    ${alle.length - da.length ? `<div class="fakt-eintrag zu"><span>Noch ${alle.length - da.length} Fakten warten auf dich. Pieks erzählt sie nach und nach.</span></div>` : ''}</div>`;
  inhalt.onclick = e => {
    if (e.target.closest('[data-zurueck]')) { albumZeigen('fakten'); return; }
    const b = e.target.closest('.fakt-eintrag[data-fakt]');
    if (b) Stimme.sprechen([sprechtext(FAKTEN[+b.dataset.fakt])], { svg: null });
  };
}

/* ---------- Garderobe ---------- */
let garderobeSVG = null;
function garderobeZeigen() {
  $('fensterTitel').textContent = 'Pieks\' Garderobe';
  const inhalt = $('fensterInhalt');
  const gruppen = Object.keys(PLAETZE).map(p => {
    const waren = Object.entries(ITEMS).filter(([, it]) => it.platz === p);
    return `<div class="slot-titel">${PLAETZE[p]}</div><div class="raster">` + waren.map(([id, it]) => {
      const hat = stand.items.includes(id), traegt = stand.an[p] === id, leistbar = stand.aepfel >= it.preis;
      return `<button type="button" class="sammel knopf ware${traegt ? ' traegt' : ''}" data-item="${id}">
        <span class="bild"><svg viewBox="-10 -34 220 240" class="ware-bild">${ITEM_SVG[id]}</svg></span>
        <span class="name">${esc(it.name)}</span>
        ${hat ? `<span class="status">${traegt ? '✓ Pieks trägt das' : 'Anziehen'}</span>` : `<span class="preis${leistbar ? '' : ' zu-teuer'}"><svg viewBox="0 0 40 40"><use href="#apfel"/></svg>${it.preis}</span>`}
      </button>`;
    }).join('') + '</div>';
  }).join('');
  inhalt.innerHTML = `<div class="garderobe"><div class="vorschau"><div id="garderobePieks" style="width:100%;max-width:240px"></div>
    <div class="blase leer" id="blaseGarderobe" style="width:100%"><span class="say"></span></div>
    <div class="kasse"><svg viewBox="0 0 40 40"><use href="#apfel"/></svg><span id="kasseN">${stand.aepfel}</span> Äpfel</div></div><div>${gruppen}</div></div>`;
  // Jedes Teil ist in Pieks' Koordinaten gezeichnet: Vorschau auf den Inhalt zoomen
  inhalt.querySelectorAll('.ware-bild').forEach(svg => {
    try {
      const bb = svg.getBBox(), rand = Math.max(bb.width, bb.height) * 0.12;
      svg.setAttribute('viewBox', `${bb.x - rand} ${bb.y - rand} ${bb.width + 2 * rand} ${bb.height + 2 * rand}`);
    } catch (e) { /* noch nicht sichtbar */ }
  });
  garderobeSVG = pieksEinsetzen($('garderobePieks'));
  garderobeSVG.addEventListener('pointerdown', () => kitzeln(garderobeSVG));
  sprechZiel($('blaseGarderobe'), garderobeSVG);
  inhalt.onclick = e => {
    const b = e.target.closest('.ware');
    if (b) waehleItem(b.dataset.item);
  };
}
function waehleItem(id) {
  const it = ITEMS[id];
  if (!stand.items.includes(id)) {
    if (stand.aepfel < it.preis) { Ton.falsch(); sag(zieh('zu_teuer')); return; }
    stand.aepfel -= it.preis;
    stand.items.push(id);
    stand.an[it.platz] = id;
    speichern();
    Ton.kaufen();
    garderobeZeigen();
    stimmung(garderobeSVG, 'froh', 1800);
    konfetti();
    erfolgeNebenbei({}, sagMehr([it.spruch]));
    alleAnziehen();
    return;
  }
  Ton.tipp();
  if (stand.an[it.platz] === id) { stand.an[it.platz] = null; speichern(); garderobeZeigen(); sag(zieh('ausziehen')); }
  else { stand.an[it.platz] = id; speichern(); garderobeZeigen(); stimmung(garderobeSVG, 'froh', 1200); sag(zieh('kaufen')); }
  alleAnziehen();
}

/* ---------- Erfolge ---------- */
function erfolgeZeigen() {
  $('fensterTitel').textContent = 'Erfolge';
  const zahl = Object.keys(stand.erfolge).length;
  const total = alleGeloest(), tage = tageSerie(), tiere = Object.keys(stand.besucher).length;
  // Fortschritt für zählbare Erfolge
  const fort = {
    serie5: [stand.besterLauf, 5], serie10: [stand.besterLauf, 10], serie20: [stand.besterLauf, 20],
    auf50: [total, 50], auf200: [total, 200], auf500: [total, 500], auf1000: [total, 1000],
    bruch50: [stand.geloest.brueche, 50], liter50: [stand.geloest.volumen, 50], drei50: [stand.geloest.dreisatz, 50],
    schwer25: [stand.schwer, 25], tage3: [tage, 3], tage7: [tage, 7], tiere5: [tiere, 5], tiereAlle: [tiere, BESUCHER_REIHE.length],
    fakten50: [stand.fakten.length, 50], fakten200: [stand.fakten.length, 200], modeAlle: [stand.items.length, Object.keys(ITEMS).length],
  };
  $('fensterInhalt').innerHTML = `<p class="klein" style="margin-top:0">${zahl} von ${Object.keys(ERFOLGE).length} Erfolgen geschafft. Jeder bringt Bonus-Äpfel.</p><div class="raster">` +
    Object.entries(ERFOLGE).map(([id, e]) => {
      const da = !!stand.erfolge[id], f = fort[id];
      return `<div class="sammel erfolg${da ? '' : ' zu'}"><span class="bild"><svg viewBox="0 0 40 40"><use href="#${da ? 'pokal' : 'stern'}"/></svg></span>
        <span class="name">${esc(e.name)}</span><span class="info">${esc(e.text)}</span>
        ${e.bonus ? `<span class="preis"><svg viewBox="0 0 40 40"><use href="#apfel"/></svg>+${e.bonus}</span>` : ''}
        ${!da && f ? `<span class="fortschritt"><i style="width:${clamp(f[0] / f[1], 0, 1) * 100}%"></i></span>` : ''}
        ${da ? `<span class="info">${new Date(stand.erfolge[id]).toLocaleDateString('de-CH')}</span>` : ''}</div>`;
    }).join('') + '</div>';
  if (Math.random() < 0.5) Stimme.sprechen([sprechtext(zieh('erfolge_auf'))], { svg: null });
}

/* ---------- Als App installieren ----------
   Chrome, Edge und Android melden mit «beforeinstallprompt», dass die App
   installiert werden kann; dann bietet der Elternbereich einen Knopf an.
   Safari auf iPad und iPhone kennt das nicht: dort hilft eine Anleitung. */
let installHinweis = null;
window.addEventListener('beforeinstallprompt', e => { installHinweis = e; if (fensterArt === 'eltern') elternZeigen(); });
window.addEventListener('appinstalled', () => { installHinweis = null; if (fensterArt === 'eltern') elternZeigen(); });
const laeuftAlsApp = () => ['standalone', 'fullscreen', 'minimal-ui'].some(m => matchMedia(`(display-mode: ${m})`).matches) || navigator.standalone === true;
const istIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installHTML() {
  if (laeuftAlsApp()) return '<p class="klein">✓ Der Mathe-Igel läuft hier schon als App.</p>';
  if (installHinweis) return '<button type="button" class="install-knopf" data-install>Als App installieren</button><p class="klein">Danach startet der Mathe-Igel wie eine eigene App, im Vollbild und auch ohne Internet.</p>';
  if (istIOS()) return '<p class="klein">Auf dem iPad oder iPhone: in Safari unten oder oben auf <b>Teilen</b> tippen (Viereck mit Pfeil), dann <b>Zum Home-Bildschirm</b>. Danach startet der Mathe-Igel im Vollbild wie eine eigene App.</p>';
  return '<p class="klein">Im Browser-Menü <b>App installieren</b> oder <b>Zum Startbildschirm hinzufügen</b> wählen (Chrome, Edge, Samsung Internet). In Chrome und Edge am Computer gibt es dafür auch ein Symbol rechts in der Adresszeile.</p>';
}

/* ---------- Eltern: Statistik und Einstellungen ---------- */
let resetScharf = '';
function elternZeigen() {
  $('fensterTitel').textContent = 'Für Eltern';
  const s = statsLaden(), heute = s[heuteKey()] || {};
  const summe = tage => { const c = new Date(); c.setDate(c.getDate() - tage + 1); c.setHours(0, 0, 0, 0); let t = 0; for (const k in s) if (new Date(k + 'T00:00:00') >= c) t += s[k].total || 0; return t; };
  const tage14 = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); tage14.push({ key: dateKey(d), d }); }
  const max = Math.max(1, ...tage14.map(t => (s[t.key] || {}).total || 0));
  const kurz = d => String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
  const lang = k => { if (k === heuteKey()) return 'Heute'; const y = new Date(); y.setDate(y.getDate() - 1); if (k === dateKey(y)) return 'Gestern'; const [yy, mm, dd] = k.split('-'); return `${dd}.${mm}.${yy.slice(2)}`; };
  const verlauf = Object.keys(s).filter(k => s[k].total > 0).sort().reverse().slice(0, 14);
  $('fensterInhalt').innerHTML = `<div class="eltern">
    <h3>Gelöste Aufgaben</h3>
    <div class="agg"><div><b>${heute.total || 0}</b><small>Heute</small></div><div><b>${summe(7)}</b><small>7 Tage</small></div><div><b>${summe(30)}</b><small>30 Tage</small></div><div><b>${alleGeloest()}</b><small>Total</small></div></div>
    <h3>Letzte 14 Tage</h3>
    <div class="chart">${tage14.map(t => { const x = s[t.key], n = (x || {}).total || 0, q = x && x.attempts ? Math.round(x.correct / x.attempts * 100) : 0;
      return `<div class="chart-bar${n ? '' : ' leer'}" style="height:${n ? Math.max(4, n / max * 100) : 3}%" title="${kurz(t.d)}: ${n ? n + ' gelöst, ' + q + '% Quote' : 'keine Aufgaben'}"></div>`; }).join('')}</div>
    <div class="chart-labels">${tage14.map((t, i) => `<div>${i === 0 || i === 13 || i % 2 === 1 ? kurz(t.d) : ''}</div>`).join('')}</div>
    ${verlauf.length ? '<h3>Trefferquote pro Tag</h3>' + verlauf.map(k => { const x = s[k], q = x.attempts ? Math.round(x.correct / x.attempts * 100) : 0;
      return `<div class="verlauf-zeile"><div>${lang(k)} <span class="klein">(${x.total})</span></div><div class="verlauf-balken"><i style="width:${q}%"></i></div><div>${q}%</div></div>`; }).join('') : ''}
    <p class="klein">Quote = richtige Antworten ÷ alle Prüfversuche. Brüche ${stand.geloest.brueche} · Volumen ${stand.geloest.volumen} · Dreisätze ${stand.geloest.dreisatz} · davon schwer ${stand.schwer} · beste Serie ${stand.besterLauf}</p>
    <h3>Einstellungen</h3>
    <div class="einstellung"><span>Tagesziel (Aufgaben)</span><span class="wahl-knoepfe" data-set="ziel">${[5, 10, 15, 20, 30].map(z => `<button type="button" data-wert="${z}" class="${stand.ziel === z ? 'an' : ''}">${z}</button>`).join('')}</span></div>
    <div class="einstellung"><span>Pieks liest vor</span><span class="wahl-knoepfe" data-set="stimme"><button type="button" data-wert="1" class="${stand.stimme ? 'an' : ''}">An</button><button type="button" data-wert="0" class="${stand.stimme ? '' : 'an'}">Aus</button></span></div>
    <div class="einstellung"><span>Geräusche</span><span class="wahl-knoepfe" data-set="ton"><button type="button" data-wert="1" class="${stand.ton ? 'an' : ''}">An</button><button type="button" data-wert="0" class="${stand.ton ? '' : 'an'}">Aus</button></span></div>
    <h3>Als App installieren</h3>
    ${installHTML()}
    <h3>Zurücksetzen</h3>
    <button type="button" class="gefahr" data-reset="stats">${resetScharf === 'stats' ? 'Wirklich? Nochmal tippen.' : 'Statistik löschen'}</button>
    <button type="button" class="gefahr" data-reset="igel">${resetScharf === 'igel' ? 'Wirklich alles? Nochmal tippen.' : 'Äpfel, Album und Garderobe löschen'}</button>
    <p class="klein">Alles wird nur auf diesem Gerät in diesem Browser gespeichert. Äpfel insgesamt: ${stand.gesamt}, Rang ${RAENGE.indexOf(rangVon(stand.gesamt)) + 1} von ${RAENGE.length}.</p>
  </div>`;
  $('fensterInhalt').onclick = async e => {
    if (e.target.closest('[data-install]') && installHinweis) {
      const h = installHinweis;
      installHinweis = null;
      try { await h.prompt(); await h.userChoice; } catch (err) { /* schon gefragt */ }
      elternZeigen();
      return;
    }
    const w = e.target.closest('.wahl-knoepfe button');
    if (w) {
      const art = w.parentElement.dataset.set, v = +w.dataset.wert;
      if (art === 'ziel') stand.ziel = v;
      else stand[art] = !!v;
      speichern();
      tonZeigen();
      kopfZeigen();
      Ton.tipp();
      elternZeigen();
      return;
    }
    const r = e.target.closest('[data-reset]');
    if (!r) return;
    if (resetScharf !== r.dataset.reset) { resetScharf = r.dataset.reset; elternZeigen(); return; }
    resetScharf = '';
    if (r.dataset.reset === 'stats') { try { localStorage.removeItem(STATS_KEY); } catch (err) { /* egal */ } }
    else {
      Object.assign(stand, { aepfel: 0, gesamt: 0, geloest: { brueche: 0, volumen: 0, dreisatz: 0 }, schwer: 0, besterLauf: 0, besucher: {}, fakten: [], items: [], an: { kopf: null, augen: null, hals: null, pfote: null }, erfolge: {}, zielTage: {}, nachRichtig: 0 });
      speichern();
      alleAnziehen();
    }
    kopfZeigen();
    elternZeigen();
  };
}

function tonZeigen() {
  $('tonBtn').querySelector('use').setAttribute('href', stand.ton ? '#i-ton' : '#i-stumm');
  $('tonBtn').setAttribute('aria-label', stand.ton ? 'Geräusche ausschalten' : 'Geräusche einschalten');
  $('stimmeBtn').querySelector('use').setAttribute('href', stand.stimme ? '#i-stimme' : '#i-stimme-aus');
  $('stimmeBtn').setAttribute('aria-label', stand.stimme ? 'Vorlesen ausschalten' : 'Vorlesen einschalten');
}

/* =====================================================================
   STUFEN-MENÜ im Training
   ===================================================================== */
function stufenMenueAuf() {
  const m = $('stufenMenue');
  if (!m.hidden) { m.hidden = true; return; }
  $('popStufen').innerHTML = STUFEN_REIHE.map(s => `<button type="button" class="stufe-btn${s === sitzung.stufe ? ' an' : ''}" data-stufe="${s}">${STUFEN[s]}</button>`).join('');
  $('popThemen').innerHTML = Object.entries(THEMEN).map(([id, th]) => `<button type="button" class="pop-thema${id === sitzung.thema ? ' an' : ''}" data-thema="${id}"><svg viewBox="0 0 80 80"><use href="#${th.icon}"/></svg>${th.name}</button>`).join('');
  const r = $('themaChip').getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(r.left, innerWidth - 290)) + 'px';
  m.style.top = r.bottom + 8 + 'px';
  m.hidden = false;
  Ton.tipp();
}
$('stufenMenue').addEventListener('click', e => {
  const s = e.target.closest('[data-stufe]'), t = e.target.closest('[data-thema]');
  if (s && s.dataset.stufe !== sitzung.stufe) stufeWechseln(s.dataset.stufe);
  else if (t && t.dataset.thema !== sitzung.thema) { $('stufenMenue').hidden = true; trainingStarten(t.dataset.thema, stand.stufe[t.dataset.thema]); }
  else $('stufenMenue').hidden = true;
});
document.addEventListener('pointerdown', e => {
  if (!$('stufenMenue').hidden && !e.target.closest('#stufenMenue') && !e.target.closest('#themaChip')) $('stufenMenue').hidden = true;
}, true);

/* =====================================================================
   START: Passwort, dann Pieks wecken
   ===================================================================== */
const PW_HASH = '692dfc7c3ba3d913cd882cb48c33c54150937ed7af35c77d4da28688a9de442b';
const PW_KEY = 'mathe_pw_unlocked_at';
async function pwSha256(t) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, '0')).join('');
}
function pwOk() {
  try { const t = parseInt(localStorage.getItem(PW_KEY) || '0', 10); return t > 0 && Date.now() - t < 30 * 86400000; } catch (e) { return false; }
}
$('pwForm').addEventListener('submit', async e => {
  e.preventDefault();
  const i = $('pwInput');
  if (!window.crypto || !crypto.subtle) { $('pwErr').textContent = 'Dieser Browser kann das Passwort nicht prüfen.'; return; }
  if ((await pwSha256(i.value)) === PW_HASH) {
    try { localStorage.setItem(PW_KEY, Date.now().toString()); } catch (err) { /* privater Modus */ }
    i.blur();
    $('pwOvl').hidden = true;
    startZeigen();
  } else {
    $('pwErr').textContent = 'Hmm, das war nicht das Zauberwort.';
    i.value = '';
    i.focus();
  }
});

function startZeigen() {
  $('startKugel').innerHTML = kugelSVG();
  $('startText').textContent = tageszeit() === 'nacht' ? 'Pieks ist nachtaktiv, aber gerade döst er.' : 'Pieks hält gerade ein Nickerchen.';
  $('start').hidden = false;
}
async function wecken() {
  if ($('start').classList.contains('aufwachen')) return;
  audio();
  Ton.aufwachen();
  $('start').classList.add('aufwachen');
  await pause(550);
  $('start').hidden = true;
  $('start').classList.remove('aufwachen');
  stimmung(heldSVG, 'froh', 1500);
  const teile = [];
  if (!stand.vorgestellt) {
    teile.push(TEXTE.vorstellen[0]);
    stand.vorgestellt = true;
  } else {
    teile.push(zieh('aufwachen'), gruss());
  }
  stand.zuletzt = Date.now();
  speichern();
  const gesagt = sagMehr(teile);
  // Erfolge von früher (z.B. eine Tages-Serie) nach der Begrüssung nachtragen
  erfolgeNebenbei({}, gesagt);
  // Tiere erst, wenn die Begrüssung fertig ist (oder Nea schon weitergetippt hat):
  // sonst kommt beim ersten Start mitten in Pieks' Vorstellung Besuch
  gesagt.then(() => Besuch.start());
}
function gruss() {
  const tz = tageszeit(), weg = stand.zuletzt ? (Date.now() - stand.zuletzt) / 86400000 : 0;
  if (weg >= 3) return zieh('gruss_wieder');
  if (tageSerie() >= 2 && !heuteGeloest() && Math.random() < 0.4) return zieh('gruss_serie');
  if (saison() === 'winter' && Math.random() < 0.25) return zieh('gruss_winter');
  const h = new Date().getHours();
  if (tz === 'nacht' && (h >= 21 || h < 6)) return zieh('gruss_nacht');
  return zieh(tz === 'nacht' || tz === 'abend' ? 'gruss_abend' : tz === 'morgen' ? 'gruss_morgen' : 'gruss_tag');
}

/* =====================================================================
   EREIGNISSE
   ===================================================================== */
$('pad').addEventListener('click', e => {
  const k = e.target.closest('.taste');
  if (!k || k.disabled) return;
  const v = k.dataset.k;
  if (v === 'back') loeschen();
  else if (v === 'ok') pruefen();
  else if (v === 'bruch') feldWechseln();
  else ziffer(v);
});
$('rechnung').addEventListener('click', e => {
  const f = e.target.closest('.feld');
  if (f && A && A.t.answerType === 'fraction') feldWechseln(+f.dataset.i);
});
$('weiterBtn').addEventListener('click', weiter);
$('tippBtn').addEventListener('click', tipp);
$('loesungBtn').addEventListener('click', loesungZeigen);
$('notizBtn').addEventListener('click', () => {
  if ($('notiz').hidden) { notizAuf(); if (Math.random() < 0.4) sag(zieh('notiz_auf')); } else notizZu();
  Ton.tipp();
});
$('notizZu').addEventListener('click', notizZu);
$('notizLeeren').addEventListener('click', () => { Ton.tipp(); notizLeeren(); });
$('homeBtn').addEventListener('click', () => { Ton.tipp(); zurLichtung(); });
$('themaChip').addEventListener('click', stufenMenueAuf);
$('rang').addEventListener('click', () => { Ton.tipp(); fensterAuf('erfolge'); });
$('albumBtn').addEventListener('click', () => { Ton.tipp(); fensterAuf('album'); });
$('garderobeBtn').addEventListener('click', () => { Ton.tipp(); fensterAuf('garderobe'); if (Math.random() < 0.6) sag(zieh('garderobe_auf')); });
$('erfolgeBtn').addEventListener('click', () => { Ton.tipp(); fensterAuf('erfolge'); });
$('elternBtn').addEventListener('click', () => { Ton.tipp(); resetScharf = ''; fensterAuf('eltern'); });
$('aepfel').addEventListener('click', () => { Ton.tipp(); fensterAuf('garderobe'); });
$('blase').addEventListener('click', () => Stimme.nochmal());
$('blaseHome').addEventListener('click', () => Stimme.nochmal());
$('tonBtn').addEventListener('click', () => { stand.ton = !stand.ton; speichern(); tonZeigen(); if (stand.ton) Ton.richtig(); });
$('stimmeBtn').addEventListener('click', () => {
  stand.stimme = !stand.stimme;
  speichern();
  tonZeigen();
  if (stand.stimme) sag(zieh('stimme_an'));
  else Stimme.stopp();
});
$('weckenBtn').addEventListener('click', wecken);
$('startKugel').addEventListener('click', wecken);

// Tastatur am Computer: Ziffern, Komma, Löschen, Enter, Pfeile für den Bruch
document.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input')) return;
  if (!$('start').hidden) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wecken(); } return; }
  if (e.key === 'Escape') {
    if (!$('fenster').hidden) { Stimme.stopp(); fensterZu(); }
    else if (!$('stufenMenue').hidden) $('stufenMenue').hidden = true;
    return;
  }
  if (!$('fenster').hidden || bildschirm !== 'training' || !A) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (A.geloest) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); weiter(); } return; }
  if (/^[0-9]$/.test(e.key)) { e.preventDefault(); ziffer(e.key); return; }
  if (e.key === '.' || e.key === ',') { e.preventDefault(); ziffer('.'); return; }
  if (e.key === 'Backspace') { e.preventDefault(); loeschen(); return; }
  if (e.key === 'Enter') { e.preventDefault(); pruefen(); return; }
  if (A.t.answerType === 'fraction') {
    if (e.key === '/' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey && A.aktiv === 0)) { e.preventDefault(); feldWechseln(1); return; }
    if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey && A.aktiv === 1)) { e.preventDefault(); feldWechseln(0); }
  }
});
// Jeder Tipp irgendwo zählt als «Nea ist noch da»
document.addEventListener('pointerdown', () => wachHalten(), { passive: true });
window.addEventListener('resize', () => { if (!$('notiz').hidden) Notiz.groesse(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { zeitAnwenden(); kopfZeigen(); } });

/* =====================================================================
   LOS
   ===================================================================== */
document.getElementById('sprite').insertAdjacentHTML('beforeend', PIEKS_DEFS);
zeitAnwenden();
landschaft();
setInterval(() => {
  const vorher = document.body.className;
  zeitAnwenden();
  if (document.body.className !== vorher) fallen();
}, 60000);
heldSVG = pieksEinsetzen($('heldPieks'));
dockSVG = pieksEinsetzen($('dockPieks'));
heldSVG.addEventListener('pointerdown', () => kitzeln(heldSVG));
dockSVG.addEventListener('pointerdown', () => kitzeln(dockSVG));
tonZeigen();
themenZeichnen();
zeigeBildschirm('lichtung');
kopfZeigen();
$('blaseHome').querySelector('.say').textContent = 'Hoi Nea!';
if (pwOk()) startZeigen();
else { $('pwKugel').innerHTML = kugelSVG(); $('pwOvl').hidden = false; setTimeout(() => $('pwInput').focus(), 60); }

// Als App installierbar und ohne Internet nutzbar (siehe sw.js). Danach
// holt der Service Worker im Hintergrund die wichtigsten Aufnahmen.
// Lokal (localhost) auch, damit sich die Installation testen lässt.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(r => r.active && r.active.postMessage('vorladen'))
      .catch(() => {});
  });
}
